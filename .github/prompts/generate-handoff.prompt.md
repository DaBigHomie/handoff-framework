# Generate 20x Handoff Docs

> Single-prompt shortcut for generating all handoff documentation for a project.

## Context

You are using the `@dabighomie/handoff-framework` v2.0.0 — a portable FSD-based handoff documentation system with 15 categorized templates.

**Framework location**: `.handoff-framework/` (relative to workspace root)
**Template location**: `.handoff-framework/templates/v2/`
**Output location**: `docs/handoff/` (in the target project)

## Instructions

1. **Identify the target project** (ask user if unclear)
2. **Run the init script** to scaffold all template files:
   ```bash
   cd .handoff-framework && npx tsx src/init-project.mts <PROJECT_NAME>
   ```
3. **Run the state generator** to auto-populate CO-01:
   ```bash
   npx tsx src/generate-state.mts <PROJECT_NAME>
   ```
4. **Fill in templates** by auditing the project:
   - CO-00: Update document status table
   - CO-02: Discover gotchas, failed commands, issues
   - CO-03: Locate & consolidate all todo/scoreboard/status files
   - AR-01: Map system architecture
   - AR-02: Map component → hook interactions
   - OP-01: Document deployment steps
   - OP-02: Log session work (completed/skipped/outdated)
   - OP-03: Catalog all scripts
   - QA-01: Audit test-ids and testing conventions
   - QA-02: Run comprehensive gap analysis
   - RF-01: Build file/feature reference map
   - RF-02: Discover and categorize all routes
   - RF-03: Write audit prompts for next agent
   - RF-04: Document improvement suggestions
5. **Validate** all docs pass naming conventions:
   ```bash
   npx tsx src/validate-naming.mts <PROJECT_NAME>
   ```
6. **Validate** docs quality:
   ```bash
   npx tsx src/validate-docs.mts <PROJECT_NAME>
   ```

## FSD Naming Convention

All files follow: `{PREFIX}-{SEQ}-{SLUG}_{YYYY-MM-DD}.md`

| Prefix | Category | Required | Templates |
|--------|----------|----------|-----------|
| CO | Core | CO-00, CO-01, CO-02, CO-03 | 4 required |
| AR | Architecture | — | AR-01, AR-02 |
| OP | Operations | OP-01 | OP-01 required, OP-02, OP-03 |
| QA | Quality | QA-01 | QA-01 required, QA-02 |
| RF | Reference | — | RF-01, RF-02, RF-03, RF-04 |

## Required Templates (6) — Every Project

1. **CO-00-MASTER_INDEX** — Navigation hub (read first)
2. **CO-01-PROJECT_STATE** — Auto-generated metrics snapshot
3. **CO-02-CRITICAL_CONTEXT** — Gotchas, failed commands, issues
4. **CO-03-TASK_TRACKER** — Unified todo/scoreboard integration
5. **OP-01-DEPLOYMENT_ROADMAP** — Deployment steps & checklist
6. **QA-01-TESTID_FRAMEWORK** — Test-id conventions & coverage

## Recommended Templates (9) — As Needed

7. **AR-01-SYSTEM_ARCHITECTURE** — System design & data flows
8. **AR-02-COMPONENT_MAP** — Component → hook interaction map
9. **OP-02-SESSION_LOG** — Completed/skipped/outdated/failed
10. **OP-03-SCRIPTS_REFERENCE** — Scripts catalog
11. **QA-02-GAP_ANALYSIS** — Comprehensive 20x audit
12. **RF-01-REFERENCE_MAP** — Quick file/feature lookup
13. **RF-02-ROUTE_AUDIT** — Routes discovered & categorized
14. **RF-03-AUDIT_PROMPTS** — Pre-built prompts for next agent
15. **RF-04-IMPROVEMENTS** — Instruction files, AGENTS.md, CI/CD

## Token Budget

Target: ~30,000 tokens total across all docs.
Each template has a suggested token budget in the framework's `types.ts`.

## Quality Gates

After generating all docs:
```bash
npx tsc --noEmit          # TypeScript: 0 errors (framework)
node --import tsx --test tests/*.spec.ts  # Tests: all pass
npx tsx src/validate-naming.mts <PROJECT_NAME>  # Naming: valid
npx tsx src/validate-docs.mts <PROJECT_NAME>    # Quality: ≥80%
```
