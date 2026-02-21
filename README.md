# @dabighomie/handoff-framework

**Version**: 2.0.0  
**Created**: February 14, 2026  
**Updated**: February 20, 2026  
**Purpose**: Portable, standards-enforced agent-to-agent handoff documentation system

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

### 2. Initialize a project

```bash
# Creates docs/handoff/ with all required templates
npx tsx src/init-project.mts my-project-name
```

### 3. Generate state snapshot

```bash
npx tsx src/generate-state.mts my-project-name
```

### 4. Validate docs

```bash
npx tsx src/validate-docs.mts my-project-name
```

### 5. Validate naming conventions

```bash
npx tsx src/validate-naming.mts ./docs/handoff
```

### CLI Wrapper

```bash
# After npm link or direct execution
node bin/handoff.mjs init my-project
node bin/handoff.mjs generate my-project
node bin/handoff.mjs validate my-project
node bin/handoff.mjs validate:naming
node bin/handoff.mjs version
```

---

## FSD Template System

15 templates organized into 5 categories using Feature-Sliced Design:

### Categories

| Prefix | Category | Purpose |
|--------|----------|---------|
| **CO** | Core | Essential context every agent needs |
| **AR** | Architecture | System design & component relationships |
| **OP** | Operations | Deployment, sessions, scripts |
| **QA** | Quality | Testing frameworks & gap analysis |
| **RF** | Reference | Lookup tables, routes, prompts, improvements |

### Required Templates (6)

| ID | Template | Purpose |
|----|----------|---------|
| CO-00 | MASTER_INDEX | Navigation hub — read first |
| CO-01 | PROJECT_STATE | Build status, metrics, quality gates |
| CO-02 | CRITICAL_CONTEXT | Tech stack, failed commands, issues |
| CO-03 | TASK_TRACKER | Unified todo: scoreboard, status.json, action items |
| OP-01 | DEPLOYMENT_ROADMAP | Phased deployment plan |
| QA-01 | TESTID_FRAMEWORK | Test ID naming conventions & coverage |

### Recommended Templates (9)

| ID | Template | Purpose |
|----|----------|---------|
| AR-01 | SYSTEM_ARCHITECTURE | Tech stack, data flows, decisions |
| AR-02 | COMPONENT_MAP | Hook dependencies, interaction map |
| OP-02 | SESSION_LOG | Completed/skipped/outdated, failed commands, token loss prevention |
| OP-03 | SCRIPTS_REFERENCE | Scripts inventory with categories |
| QA-02 | GAP_ANALYSIS | 10-section comprehensive audit |
| RF-01 | REFERENCE_MAP | File lookup, key paths |
| RF-02 | ROUTE_AUDIT | Route discovery, revenue-critical paths |
| RF-03 | AUDIT_PROMPTS | Pre-built copy-paste prompts P0-P3 |
| RF-04 | IMPROVEMENTS | Instruction files, AGENTS.md, CI/CD, automation |

### Naming Convention

```
{PREFIX}-{SEQ}-{SLUG}_{YYYY-MM-DD}.md

Examples:
  CO-00-MASTER_INDEX_2026-02-20.md
  QA-02-GAP_ANALYSIS_2026-02-20.md
  RF-03-AUDIT_PROMPTS_2026-02-20.md
```

**Regex**: `^(CO|AR|OP|QA|RF)-(\d{2})-([A-Z][A-Z0-9_]+)_(\d{4}-\d{2}-\d{2})\.md$`

---

## Project Structure

```
.handoff-framework/
├── bin/
│   └── handoff.mjs          # CLI wrapper
├── src/
│   ├── types.ts              # FSD categories, templates, types
│   ├── utils.ts              # Shared utilities
│   ├── version.ts            # Version management
│   ├── cli.mts               # CLI entry point
│   ├── init-project.mts      # Initialize project handoff docs
│   ├── generate-state.mts    # Generate state snapshot
│   ├── validate-docs.mts     # 7-point quality validation
│   ├── validate-naming.mts   # FSD naming validation
│   ├── migrate-existing.mts  # v1 → v2 migration
│   └── version-bump.mts      # Semver bumping
├── templates/
│   ├── v2/                   # 15 FSD templates (active)
│   └── v1/                   # Legacy templates (preserved)
├── tests/
│   ├── validate-naming.spec.ts  # 32 tests
│   ├── version.spec.ts          # 7 tests
│   └── types.spec.ts            # 24 tests
├── .github/
│   └── prompts/
│       └── generate-handoff.prompt.md  # Single-prompt agent shortcut
├── package.json
├── tsconfig.json
└── CHANGELOG.md
```

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

# All tests (63 total)
node --import tsx --test tests/*.spec.ts
```

---

## For Agents (Single Prompt)

Use the prompt shortcut at `.github/prompts/generate-handoff.prompt.md` to generate all 15 handoff documents for any project in a single prompt.

---

## Portability

This framework is designed to work with **any** project:

1. Clone `.handoff-framework/` into your workspace root
2. Run `init-project.mts` with your project name
3. Templates are created in `your-project/docs/handoff/`
4. Each project gets its own `.handoff.config.json`

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
