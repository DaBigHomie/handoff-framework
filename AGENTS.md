# AGENTS.md — handoff-framework is EXECUTE-ONLY

This repository is a **framework**. Agents **EXECUTE** its scripts; agents do **NOT**
edit them. Treat all framework source as read-only.

## Contract

- **Allowed:** run the scripts below (they are automatable, deterministic, and
  mostly read-only or dry-run by default).
- **Not allowed (agents):** modifying `src/`, `workflows/`, `package.json`,
  `tsconfig.json`, or any framework logic. Changes to the framework itself go
  through a **human / GOV** review — never an autonomous agent edit.
- Handoff *content* (manifests, CORTEX rows) is written to the target repos and
  CORTEX — never back into this framework tree.

## Execute-only entry points

```bash
# Formatted, READ-ONLY task list (Sunset 3.0 execution DAG)
npx tsx src/cli.mts tasklist --repos="$REPOS" --from-session=<id>

# READ-ONLY guard — fails if framework source was edited
npx tsx src/cli.mts verify-integrity --strict

# Validate handoff manifests (read-only gate)
npx tsx src/cli.mts validate-manifests --repos="$REPOS"

# Scaffold / finalize (write to TARGET repos + CORTEX, not this framework)
npx tsx src/cli.mts scaffold-sunset --from-session=<id> --repos="$REPOS" --scope=sunset
npx tsx src/cli.mts finalize --repo=<slug> --project=<dir> --from-session=<id> --session=<slug>
```

`--repos` is always a **variable** (comma-separated touched-repo list).
`--session-path` optionally overrides the derived `docs/session-manifests/` dir.

## Enforcement

- **Guard:** `src/verify-framework-integrity.mts` (read-only) asserts no local
  edits to the guarded surface; run at orchestrator boot / before dispatch.
- **Governance rule:** `documentation-standards/.cursor/rules/handoff-framework-execute-only.mdc`
  and the workspace-root mirror declare this repo execute-only for agents.
- **Skill:** `documentation-standards/skills/handoff-sunset-v30/SKILL.md` — the
  execution workflow. It points here; it does not grant edit rights.

## Why

The framework is shared infrastructure across every repo's session handoffs. An
autonomous edit to it silently changes behavior for all downstream sessions.
Execute-only keeps the framework a stable, reviewed control surface while agents
remain free to run it as often as needed.
