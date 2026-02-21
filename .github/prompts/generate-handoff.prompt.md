```prompt
# Generate Handoff Docs

> Single-prompt agent shortcut — generates all handoff documentation for a project session.

## Context

You are using `@dabighomie/handoff-framework` v3.0.0 — a portable, session-aware handoff documentation system with 15 templates ordered by numeric sequence.

**Framework location**: `.handoff-framework/` (relative to workspace root)
**Template location**: `.handoff-framework/templates/v2/`
**Output location**: `docs/handoff-{session-slug}/` (in the target project)

## Your Mission

Create handoff docs for the **current chat session** — what you know, what happened, what's next. These docs are NOT generic project wikis. They capture the conversation's work for the next agent.

## Step 1: Investigate the Project

**Read the codebase first.** Do NOT fill in templates mechanically.

- Read `AGENTS.md`, `package.json`, `tsconfig.json` to understand the project
- Read `src/` structure to understand architecture
- Check git log for recent changes
- Look for existing docs, scripts, test files
- Identify blockers, gotchas, and failed experiments

## Step 2: Scaffold

```bash
cd .handoff-framework
npx tsx src/init-project.mts <PROJECT_PATH> --session <slug>
```

Generates a `docs/handoff-{slug}/` folder with template stubs.
The `--session` slug should describe the work (e.g., `checkout-refactor`, `20x-e2e-integration`).

## Step 3: Auto-Generate Project State

```bash
npx tsx src/generate-state.mts <PROJECT_PATH> --session <slug>
```

Populates `01-PROJECT_STATE` with file counts, dependency list, TypeScript status, etc.

## Step 4: Fill Docs by Investigating (NOT Copying Templates)

Work through docs in reading order. For each, **investigate the codebase** and write what you found.

### Context (00-02) — What does the next agent need to know?

| Seq | Doc | How to Fill |
|-----|-----|-------------|
| 00 | MASTER_INDEX | Update status table as you complete each doc |
| 01 | PROJECT_STATE | Already auto-generated. Review and correct. |
| 02 | CRITICAL_CONTEXT | <!-- INVESTIGATE: Run `git log --oneline -20`, check for .env issues, find TODOs, look for commented-out code, identify any blockers --> |

### Session (03-05) — What happened? What's next?

| Seq | Doc | How to Fill |
|-----|-----|-------------|
| 03 | TASK_TRACKER | <!-- INVESTIGATE: Search for TODO/FIXME/HACK in codebase, check GitHub issues, consolidate all action items --> |
| 04 | SESSION_LOG | Document what this session accomplished, skipped, or failed |
| 05 | NEXT_STEPS | Prioritized P0/P1/P2 tasks for the next session |

### Findings (06-11) — What was discovered?

| Seq | Doc | How to Fill |
|-----|-----|-------------|
| 06 | ARCHITECTURE | <!-- INVESTIGATE: Read entry points, trace data flow, check for design patterns --> |
| 07 | COMPONENT_MAP | <!-- INVESTIGATE: Map component imports, find shared state, identify blast radius --> |
| 08 | ROUTE_AUDIT | <!-- INVESTIGATE: Parse router config, find all page files, check for dead routes --> |
| 09 | GAP_ANALYSIS | <!-- INVESTIGATE: Compare stated features vs actual implementation, check test coverage --> |
| 10 | TEST_FRAMEWORK | <!-- INVESTIGATE: Find test files, check test-id patterns, calculate coverage --> |
| 11 | SCRIPTS_REFERENCE | <!-- INVESTIGATE: Read package.json scripts, find shell scripts, check for automation --> |

### Reference (12-14) — Quick lookups for next agent

| Seq | Doc | How to Fill |
|-----|-----|-------------|
| 12 | REFERENCE_MAP | Build quick-lookup tables: routes → files, features → components |
| 13 | AUDIT_PROMPTS | Write copy-paste prompts the next agent can use |
| 14 | IMPROVEMENTS | Suggest improvements to AGENTS.md, instruction files, CI/CD |

**Not all docs are needed.** Skip findings/reference docs that don't apply to the session's scope. Required: 00-05. Optional: 06-14.

## Step 5: Validate

```bash
npx tsx src/validate-naming.mts <PROJECT_PATH> --session <slug>
npx tsx src/validate-docs.mts <PROJECT_PATH> --session <slug>
node scripts/validate-quality.js <PROJECT_PATH>/docs/handoff-<slug>/  # Handoff quality: target 75%+
```

## Naming Convention

All files follow: `{NN}-{SLUG}_{YYYY-MM-DD}.md`

| Seq | Slug | Category | Required |
|-----|------|----------|----------|
| 00 | MASTER_INDEX | context | Yes |
| 01 | PROJECT_STATE | context | Yes |
| 02 | CRITICAL_CONTEXT | context | Yes |
| 03 | TASK_TRACKER | session | Yes |
| 04 | SESSION_LOG | session | Yes |
| 05 | NEXT_STEPS | session | Yes |
| 06 | ARCHITECTURE | findings | No |
| 07 | COMPONENT_MAP | findings | No |
| 08 | ROUTE_AUDIT | findings | No |
| 09 | GAP_ANALYSIS | findings | No |
| 10 | TEST_FRAMEWORK | findings | No |
| 11 | SCRIPTS_REFERENCE | findings | No |
| 12 | REFERENCE_MAP | reference | No |
| 13 | AUDIT_PROMPTS | reference | No |
| 14 | IMPROVEMENTS | reference | No |

## Token Budget

Target: ~30,000 tokens total. Each template has a suggested budget in `.handoff-framework/src/types.ts`.

## Quality Gates

After generating docs:
```bash
npx tsc --noEmit                                        # TypeScript: 0 errors
node --import tsx --test tests/*.spec.ts                # Tests: all pass
npx tsx src/validate-naming.mts <PROJECT_PATH> --session <slug>   # Naming: valid
npx tsx src/validate-docs.mts <PROJECT_PATH> --session <slug>     # Quality: ≥80%
node scripts/validate-quality.js <PROJECT_PATH>/docs/handoff-<slug>/  # Handoff quality: ≥75%
```

## Commit Rules

- **Only commit files you created, edited, or updated** — never stage unrelated files
- Run `git diff --cached --name-only` to verify before committing
- Use `git add <specific-files>` instead of `git add -A` when working in a shared repo
```
