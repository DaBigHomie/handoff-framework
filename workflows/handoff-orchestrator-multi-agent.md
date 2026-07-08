# Handoff orchestrator — multi-agent workflow

Use this workflow when closing a session that needs **detailed handoffs** with CORTEX SSOT +
handoff-framework v3 docs + operational manifest. Route lanes via
`multi-model-task-assignment` before dispatch.

**Automation entry:**

```bash
export MGMT_ROOT=~/Management\ Git   # or ~/management-git

cd "$MGMT_ROOT/handoff-framework"
npx tsx src/finalize-session-handoff.mts \
  --repo=<primary-repo-slug> \
  --project=<folder-under-MGMT_ROOT> \
  --from-session=<cortex_session_id> \
  --session=<handoff-v3-slug> \
  --tags=handoff,cortex,prime \
  --goal="One-line session outcome"
```

**After pipeline:** review `.handoff-work/<session>/handoff.json`, then re-run with `--cortex-apply`.

---

## Agent reference table

| Wave | Lane ID | Agent | Role | Model | Read-only | Skill / prompt |
|------|---------|-------|------|-------|-----------|----------------|
| 0 | th-markers | **181** | Integration Orchestrator | haiku / Explore | yes | `session-chapter-index` |
| 1 | th-handoff-v3 | **180** | Integration / handoff author | sonnet / Task | no | `PROMPT-SESSION-HANDOFF-MANIFEST.md` |
| 1 | th-cortex-knowledge | **590** | Knowledge archivist | sonnet / Task | no | `PROMPT-CORTEX-KNOWLEDGE-ARTIFACT.md` |
| 2 | th-validate | **594** | Validate / QA | haiku / Task | yes | `validate-docs.mts` + `validate-naming.mts` |
| 3 | th-cortex-write | **181** | Orchestrator CORTEX write | Fable / direct | no | `handoff-cloud-direct` + `build-cortex-payload.mts` |
| 4* | th-40x-panel | **5, 81, 84, 161, 180** | Review panel | sonnet | yes | `review-40x-panel` skill |

\* Wave 4 only when `risk = high | critical` (schema, auth, RLS, cross-repo infra).

**Orchestrator rule:** Dispatch wave-1 lanes **in one message** — disjoint `write_targets`. Never
let one agent own markers + handoff author + CORTEX write (workstream-fork anti-pattern).

---

## Step-by-step (manual or scripted)

### 0 — Route (orchestrator, Agent 181)

Read: `$MGMT_ROOT/documentation-standards/skills/multi-model-task-assignment/SKILL.md`

```bash
# Blast radius + git ground truth
cd "$MGMT_ROOT/<primary-repo>"
git fetch origin -q && git status -sb && git worktree list
```

Emit agent dispatch brief:

```bash
cd "$MGMT_ROOT/handoff-framework"
npx tsx src/emit-agent-dispatch.mts \
  --repo=<slug> \
  --from-session=<session_id> \
  --project=<folder> \
  --session=<handoff-slug> \
  --risk=medium \
  --out=./handoff-agent-dispatch.json \
  --markdown=./handoff-agent-dispatch.md
```

### 1 — Markers (Wave 0, Explore subagent)

**Brief:** Run `session-chapter-index` methodology read-only. Output chapters, threads,
cross-refs, desyncs, handoff seed. Do NOT author manifest files.

**Skill:** `$MGMT_ROOT/documentation-standards/skills/session-chapter-index/SKILL.md`

### 2 — Parallel fill (Wave 1, two Task subagents)

**Lane A — th-handoff-v3 (Agent 180):**

```bash
cd "$MGMT_ROOT/handoff-framework"
npx tsx src/init-project.mts <project> --session <slug> --tags <csv>
npx tsx src/generate-state.mts <project> --session <slug>
```

Fill docs 00–05 using prompt:
`$MGMT_ROOT/documentation-standards/templates/handoff/PROMPT-SESSION-HANDOFF-MANIFEST.md`

Write manifest mirror:
`$MGMT_ROOT/<repo>/docs/context-manifests/SESSION-<repo>-<slug>-<YYYYMMDD>.md`

**Lane B — th-cortex-knowledge (Agent 590):**

Only if strategic decisions / 50x logic / debt exist. Prompt:
`$MGMT_ROOT/documentation-standards/templates/handoff/PROMPT-CORTEX-KNOWLEDGE-ARTIFACT.md`

Mirror:
`$MGMT_ROOT/<repo>/docs/session-artifacts/<session_id>/CORTEX-ARCHIVE-<slug>.md`

### 3 — Validate (Wave 2, Agent 594)

```bash
cd "$MGMT_ROOT/handoff-framework"
npx tsx src/validate-naming.mts <project> --session <slug>
npx tsx src/validate-docs.mts <project> --session <slug>
node scripts/validate-quality.js "$MGMT_ROOT/<project>/docs/handoff-<slug>/"
```

Fixes loop back to **th-handoff-v3** only.

### 4 — CORTEX SSOT (Wave 3, Orchestrator)

```bash
cd "$MGMT_ROOT/handoff-framework"
npx tsx src/build-cortex-payload.mts \
  --repo=<slug> \
  --from-session=<session_id> \
  --project=<folder> \
  --session=<slug> \
  --manifest="$MGMT_ROOT/<repo>/docs/context-manifests/SESSION-....md" \
  --out=./handoff.json

# Dry-run first
npx tsx "$MGMT_ROOT/documentation-standards/scripts/write-handoff-to-cortex.mts" \
  --repo=<slug> \
  --from-session=<session_id> \
  --payload-file=./handoff.json \
  --dry-run

# After human confirm
npx tsx "$MGMT_ROOT/documentation-standards/scripts/write-handoff-to-cortex.mts" \
  --repo=<slug> \
  --from-session=<session_id> \
  --payload-file=./handoff.json \
  --apply
```

**CORTEX key:** `handoff:<repo>:<from_session_id>:<YYYY-MM-DD>`

### 5 — Resume next session

```bash
/prime-orchestration-continue
# or
npx tsx "$MGMT_ROOT/.agent-kb/anvil/prime-gate-boot.mts" --repo=<slug> --agent=181 --json
```

Discovery SQL: `$MGMT_ROOT/documentation-standards/docs/policies/handoff-cortex-ssot.md` §4.1

---

## One-shot pipeline (preferred)

```bash
export MGMT_ROOT=~/Management\ Git
cd "$MGMT_ROOT/handoff-framework"

# Scaffold + validate + payload + dispatch + dry-run (default)
npx tsx src/finalize-session-handoff.mts \
  --repo=documentation-standards \
  --project=documentation-standards \
  --from-session=sess_docstd_20260708 \
  --session=cortex-handoff-suite \
  --tags=handoff,cortex,prime

# Apply CORTEX row after review
npx tsx src/finalize-session-handoff.mts \
  --repo=documentation-standards \
  --project=documentation-standards \
  --from-session=sess_docstd_20260708 \
  --session=cortex-handoff-suite \
  --build-payload --cortex-apply \
  --skip-init --skip-generate
```

Note: `--skip-init` flags are not implemented — for re-apply only, pass explicit step flags:

```bash
npx tsx src/finalize-session-handoff.mts \
  --repo=documentation-standards \
  --project=documentation-standards \
  --from-session=sess_docstd_20260708 \
  --session=cortex-handoff-suite \
  --build-payload --cortex-dry-run --cortex-apply
```

(Omit `--init --generate --validate --agent-dispatch` to run only listed steps.)

---

## Plan paths (reference in handoffs)

| Scope | Path |
|-------|------|
| Owning repo plan | `$MGMT_ROOT/<repo>/docs/plans/<PLAN-NAME>.md` |
| Hub governance plan | `$MGMT_ROOT/documentation-standards/docs/plans/<PLAN-NAME>.md` |

---

## Related skills

| Skill | Path |
|-------|------|
| multi-model-task-assignment | `$MGMT_ROOT/documentation-standards/skills/multi-model-task-assignment/SKILL.md` |
| handoff-cloud-direct | `$MGMT_ROOT/documentation-standards/skills/handoff-cloud-direct/SKILL.md` |
| session-chapter-index | `$MGMT_ROOT/documentation-standards/skills/session-chapter-index/SKILL.md` |
| orchestrator-continuation | `$MGMT_ROOT/documentation-standards/skills/orchestrator-continuation/SKILL.md` |
| workstream-fork | `$MGMT_ROOT/documentation-standards/skills/workstream-fork/SKILL.md` |
| exit | `$MGMT_ROOT/documentation-standards/skills/exit/SKILL.md` |
| review-40x-panel | `~/.cursor/skills/review-40x-panel/SKILL.md` |
