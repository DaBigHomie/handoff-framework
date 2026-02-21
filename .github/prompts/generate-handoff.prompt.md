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

## Step 2: Suggest Tags (MANDATORY — Do Not Skip)

Before scaffolding, **analyze the conversation and codebase** to suggest tags:

1. **Scan context**: Review what this session worked on — features, bugs, refactors, systems, tools, integrations.
2. **Check existing tags**: If `docs/HANDOFF_TAG_INDEX.md` exists, read it. **Reuse existing tags** before inventing new ones to keep the index consistent.
3. **Propose 3-5 tags**: Pick the most specific, meaningful tags. Prefer existing tags from the index when they match.
4. **Ask the user to confirm**:

   > I suggest these session tags: `tag-a`, `tag-b`, `tag-c`
   >
   > These will be applied to all handoff docs for cross-session discovery.
   > Want to adjust, add, or remove any before I scaffold?

5. **Wait for confirmation** before proceeding to Step 3.

**Tag format**: kebab-case, 2-50 chars (e.g., `checkout-flow`, `supabase`, `e2e-tests`)

### How to Pick Good Tags

| Signal in Conversation | Suggested Tag |
|------------------------|---------------|
| Worked on checkout/cart | `checkout-flow`, `cart` |
| Database migrations ran | `db-migration` |
| E2E or unit tests written | `e2e-tests`, `unit-tests` |
| Supabase queries/types | `supabase` |
| Bug fix for specific feature | `bugfix`, `{feature-name}` |
| New component or page added | `ui-components`, `{page-name}` |
| CI/CD or workflow changes | `ci-cd`, `github-actions` |
| Stripe/payment integration | `stripe`, `payments` |
| Refactor or architecture | `refactor`, `architecture` |
| Documentation updates | `docs`, `handoff` |

## Step 3: Scaffold

```bash
cd .handoff-framework
npx tsx src/init-project.mts <PROJECT_PATH> --session <slug> --tags <csv>
```

Generates a `docs/handoff-{slug}/` folder with template stubs.
The `--session` slug should describe the work (e.g., `checkout-refactor`, `20x-e2e-integration`).
The `--tags` flag applies the **user-confirmed tags** from Step 2 to YAML frontmatter in every doc (e.g., `--tags checkout,stripe,db-migration`).

### Tag Refinement After Scaffolding

Tags set via `--tags` are session-wide defaults. After filling docs, **update individual doc frontmatter** if a doc is more specific to one topic than others.

**Generate cross-session index** (run after all docs are filled):
```bash
npx tsx src/tag-index.mts <PROJECT_PATH>
# Output: <PROJECT_PATH>/docs/HANDOFF_TAG_INDEX.md
```

## Step 4: Auto-Generate Project State

```bash
npx tsx src/generate-state.mts <PROJECT_PATH> --session <slug>
```

Populates `01-PROJECT_STATE` with file counts, dependency list, TypeScript status, etc.

## Step 5: Fill Docs by Investigating (NOT Copying Templates)

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

## Step 6: Validate & Index

```bash
npx tsx src/validate-naming.mts <PROJECT_PATH> --session <slug>
npx tsx src/validate-docs.mts <PROJECT_PATH> --session <slug>
node scripts/validate-quality.js <PROJECT_PATH>/docs/handoff-<slug>/  # Handoff quality: target 75%+
npx tsx src/tag-index.mts <PROJECT_PATH>                              # Regenerate tag index (if using tags)
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
