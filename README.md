# @dabighomie/handoff-framework

**Version**: 3.0.0  
**Created**: February 14, 2026  
**Updated**: February 21, 2026  
**Purpose**: Portable, session-aware agent-to-agent handoff documentation system

---

## Problem

Agents waste 80-90% of tokens re-reading entire codebases, docs, and chat histories.  
This framework gives every agent exactly the context it needs — nothing more.

| Metric | Before | After |
|--------|--------|-------|
| Context tokens | ~50,000 | ~1,250 |
| Research time | 10 min | 15 sec |
| Sprint continuity | Lost between sessions | Fully preserved |

---

## Quick Start

### 1. Install

```bash
# Clone into your workspace
git clone https://github.com/DaBigHomie/handoff-framework.git .handoff-framework

# Install dependencies
cd .handoff-framework && npm install
```

### 2. Initialize a project session

```bash
# Creates docs/handoff-{slug}/ with required template stubs
npx tsx src/init-project.mts my-project --session checkout-refactor
```

### 3. Generate state snapshot

```bash
npx tsx src/generate-state.mts my-project --session checkout-refactor
```

### 4. Validate docs

```bash
npx tsx src/validate-docs.mts my-project --session checkout-refactor
```

### 5. Validate naming conventions

```bash
npx tsx src/validate-naming.mts my-project --session checkout-refactor
```

### CLI Wrapper

```bash
node bin/handoff.mjs init my-project --session my-session
node bin/handoff.mjs generate my-project --session my-session
node bin/handoff.mjs validate my-project --session my-session
node bin/handoff.mjs validate:naming
node bin/handoff.mjs version
```

---

## Session-Named Folders

Each handoff session creates a named folder describing the work:

```
my-project/
├── docs/
│   ├── handoff-checkout-refactor/    # Session 1
│   │   ├── 00-MASTER_INDEX_2026-02-20.md
│   │   ├── 01-PROJECT_STATE_2026-02-20.md
│   │   └── ...
│   ├── handoff-20x-e2e-integration/  # Session 2
│   │   └── ...
│   └── handoff/                      # Default (no session slug)
│       └── ...
```

## Template System

15 templates ordered by numeric sequence, grouped into 4 categories:

### Categories

| Range | Category | Purpose |
|-------|----------|---------|
| 00-02 | Context | Essential knowledge every agent reads first |
| 03-05 | Session | What happened, what's next |
| 06-11 | Findings | Architecture, routes, gaps, tests discovered |
| 12-14 | Reference | Lookups, prompts, improvements |

### Required Templates (6) — Every Session

| Seq | Template | Purpose |
|-----|----------|---------|
| 00 | MASTER_INDEX | Navigation hub — read first |
| 01 | PROJECT_STATE | Build status, metrics, quality gates |
| 02 | CRITICAL_CONTEXT | Gotchas, failed commands, blockers |
| 03 | TASK_TRACKER | Unified todo: scoreboard, action items |
| 04 | SESSION_LOG | What was done, skipped, failed |
| 05 | NEXT_STEPS | Prioritized actions + deployment roadmap |

### Recommended Templates (9) — As Needed

| Seq | Template | Purpose |
|-----|----------|---------|
| 06 | ARCHITECTURE | System design, data flows, decisions |
| 07 | COMPONENT_MAP | Component → hook interactions |
| 08 | ROUTE_AUDIT | Routes discovered & categorized |
| 09 | GAP_ANALYSIS | Comprehensive audit |
| 10 | TEST_FRAMEWORK | Test-ID conventions & coverage |
| 11 | SCRIPTS_REFERENCE | Scripts inventory |
| 12 | REFERENCE_MAP | File/feature lookup tables |
| 13 | AUDIT_PROMPTS | Pre-built prompts for next agent |
| 14 | IMPROVEMENTS | AGENTS.md, CI/CD, automation suggestions |

### Naming Convention

```
{NN}-{SLUG}_{YYYY-MM-DD}.md

Examples:
  00-MASTER_INDEX_2026-02-20.md
  09-GAP_ANALYSIS_2026-02-20.md
  13-AUDIT_PROMPTS_2026-02-20.md
```

**Regex**: `^(\d{2})-([A-Z][A-Z0-9_]+)_(\d{4}-\d{2}-\d{2})\.md$`

---

## Project Structure

```
.handoff-framework/
├── bin/
│   └── handoff.mjs          # CLI wrapper
├── src/
│   ├── types.ts              # Categories, templates, types
│   ├── utils.ts              # Shared utilities
│   ├── version.ts            # Version management
│   ├── cli.mts               # CLI entry point
│   ├── init-project.mts      # Initialize project handoff docs
│   ├── generate-state.mts    # Generate state snapshot
│   ├── validate-docs.mts     # 7-point quality validation
│   ├── validate-naming.mts   # Numeric naming validation
│   ├── migrate-existing.mts  # v1/v2 → v3 migration
│   └── version-bump.mts      # Semver bumping
├── templates/
│   ├── v2/                   # 15 numeric templates (active)
│   └── v1/                   # Legacy templates (preserved)
├── tests/
│   ├── validate-naming.spec.ts
│   ├── version.spec.ts
│   └── types.spec.ts
├── .github/
│   └── prompts/
│       └── generate-handoff.prompt.md
├── package.json
├── tsconfig.json
└── CHANGELOG.md
```

---

## Migration from v2.0 (FSD)

```bash
npx tsx src/migrate-existing.mts my-project --session my-session
```

The migrate script handles three paths:
- **v1** (`docs/.handoff/`) → v3 numeric naming
- **v2.0 FSD** (`docs/handoff/` with `CO-00-` prefixes) → v3 numeric naming
- **bare files** (unprefixed) → v3 numeric naming

---

## Validation

### 7-Point Quality Scoring

| Criteria | Weight |
|----------|--------|
| Structure | 15% |
| Content | 30% |
| Formatting | 10% |
| Links | 10% |
| Examples | 15% |
| Accessibility | 10% |
| Metadata | 10% |

Minimum passing score: **80%**

### Running Tests

```bash
# TypeScript compilation
npx tsc --noEmit

# All tests
node --import tsx --test tests/*.spec.ts
```

### Handoff Quality Validation

Validate handoff docs created by agents:

```bash
# Validate a single handoff folder
node scripts/validate-quality.js docs/handoff-dedup/

# Validate with detailed recommendations
node scripts/validate-quality.js --detailed docs/handoff-checkout-refactor/

# Scan all handoff folders under a project
node scripts/validate-quality.js --all docs/

# Validate a single file
node scripts/validate-quality.js docs/handoff-dedup/00-MASTER-HANDOFF-INDEX.md
```

Scores handoff docs on 8 criteria tuned for agent handoffs:

| Criteria | Weight |
|----------|--------|
| Naming (numeric NN-SLUG) | 10% |
| Structure (title, sections, tables) | 15% |
| Completeness (depth, not skeleton) | 20% |
| Actionability (EXECUTE, phases, code) | 15% |
| Cross-References (other handoff docs) | 10% |
| Metadata (date, session, status) | 10% |
| Category Coverage (context+session+findings) | 10% |
| Investigation Evidence (specific data, file paths) | 10% |

Minimum passing score: **75%**

---

## Commit Rules

1. **Only commit files you created, edited, or updated** — never stage unrelated files
2. Run `git diff --cached --name-only` to verify before committing
3. Validate before committing:
   ```bash
   npx tsc --noEmit                    # 0 errors
   node --import tsx --test tests/*.spec.ts  # all pass
   ```
4. Commit message format: `feat/fix/docs: [description]`

---

## For Agents (Single Prompt)

Use `.github/prompts/generate-handoff.prompt.md` to generate all handoff docs in a single prompt. The prompt instructs the agent to **investigate the codebase first**, not just fill in templates.

---

## Portability

Works with **any** project:

1. Clone `.handoff-framework/` into your workspace root
2. Run `init-project.mts` with `--session` to describe the work
3. Templates created in `your-project/docs/handoff-{slug}/`
4. Each session gets its own folder

Currently used across:
- damieus-com-migration (React + Vite + Supabase)
- flipflops-sundays-reboot (React + Vite + Supabase)
- one4three-co-next-app (Next.js + Supabase + Stripe)
- And more...

---

## License

MIT

---

**Owner**: DaBigHomie
