# Handoff Documentation Naming Convention

**Version**: 2.0.0  
**Created**: February 20, 2026  
**Last Updated**: February 20, 2026  
**Status**: Active — Canonical Standard

---

## Purpose

Standardize all handoff doc filenames across every project in the workspace. Agents use this as the single source of truth for naming, categorization, and file placement.

---

## FSD Document Categories

All handoff docs are organized into **5 FSD categories**. Each category has a **2-letter prefix** and a **sequence number**.

```
docs/handoff/
├── core/        # CO — Project-level context (read first)
├── arch/        # AR — Architecture & system design
├── ops/         # OP — Operations, deployment, CI/CD
├── qa/          # QA — Testing, auditing, quality gates
└── ref/         # RF — Reference lookups, indexes, maps
```

### Category Definitions

| Prefix | Category | Purpose | Read When |
|--------|----------|---------|-----------|
| `CO` | **Core** | Project state, critical context, master index | Always (first 3 docs) |
| `AR` | **Architecture** | System design, data flows, component maps | Modifying a system |
| `OP` | **Operations** | Deployment, CI/CD, automation, scripts | Deploying or automating |
| `QA` | **Quality** | Testing framework, test-IDs, gap analysis | Writing tests or auditing |
| `RF` | **Reference** | Route maps, feature status, file lookups | Quick lookups during work |

---

## Filename Pattern

```
{PREFIX}-{SEQ}-{SLUG}_{YYYY-MM-DD}.md
```

### Components

| Part | Format | Example | Description |
|------|--------|---------|-------------|
| `PREFIX` | 2 uppercase letters | `CO` | FSD category (see table above) |
| `SEQ` | 2 digits, zero-padded | `01` | Sequence within category |
| `SLUG` | UPPER_SNAKE_CASE | `MASTER_INDEX` | Descriptive name |
| `YYYY-MM-DD` | ISO date | `2026-02-20` | Date created or last major revision |

### Examples

```
CO-00-MASTER_INDEX_2026-02-20.md
CO-01-PROJECT_STATE_2026-02-20.md
CO-02-CRITICAL_CONTEXT_2026-02-20.md
AR-01-CART_SYSTEMS_2026-02-14.md
AR-02-CHECKOUT_FLOW_2026-02-15.md
AR-03-COMPONENT_INTERACTION_MAP_2026-02-13.md
OP-01-DEPLOYMENT_ROADMAP_2026-02-20.md
OP-02-CI_CD_PIPELINE_2026-02-13.md
OP-03-SCRIPTS_REFERENCE_2026-02-13.md
QA-01-TESTID_FRAMEWORK_2026-02-13.md
QA-02-GAP_ANALYSIS_2026-02-14.md
QA-03-ECOMMERCE_STATUS_2026-02-13.md
RF-01-ROUTE_AUDIT_2026-02-13.md
RF-02-FILE_REFERENCE_MAP_2026-02-20.md
RF-03-TOKEN_EFFICIENCY_2026-02-13.md
```

---

## Required Documents (Every Project)

### Core (CO) — Always Required

| File | Purpose | Max Lines | Token Budget |
|------|---------|-----------|--------------|
| `CO-00-MASTER_INDEX_{date}.md` | Navigation hub | 500 | 1,250 |
| `CO-01-PROJECT_STATE_{date}.md` | Current snapshot (auto-generated) | 800 | 2,000 |
| `CO-02-CRITICAL_CONTEXT_{date}.md` | Must-know gotchas | 600 | 1,500 |

### Architecture (AR) — 1+ Required Per System

| File | Purpose | Max Lines | Token Budget |
|------|---------|-----------|--------------|
| `AR-{nn}-{SYSTEM_NAME}_{date}.md` | System architecture | 1,000 | 2,500 |

### Operations (OP) — At Least 1 Required

| File | Purpose | Max Lines | Token Budget |
|------|---------|-----------|--------------|
| `OP-01-DEPLOYMENT_ROADMAP_{date}.md` | How to deploy | 1,000 | 2,500 |

### Quality (QA) — At Least 1 Required

| File | Purpose | Max Lines | Token Budget |
|------|---------|-----------|--------------|
| `QA-01-TESTID_FRAMEWORK_{date}.md` | Testing standards | 800 | 2,000 |

### Reference (RF) — Optional but Recommended

| File | Purpose | Max Lines | Token Budget |
|------|---------|-----------|--------------|
| `RF-{nn}-{TOPIC}_{date}.md` | Quick lookup tables | 800 | 2,000 |

---

## Migration from Legacy Naming

### one4three-co-next-app (XX-NAME.md → FSD)

| Old | New |
|-----|-----|
| `00-MASTER-HANDOFF-INDEX.md` | `CO-00-MASTER_INDEX_{date}.md` |
| `01-STRATEGIC-OVERVIEW.md` | `CO-02-CRITICAL_CONTEXT_{date}.md` |
| `02-INFRASTRUCTURE-FORK.md` | `AR-01-INFRASTRUCTURE_{date}.md` |
| `03-BRAND-TRANSFORMATION.md` | `AR-02-BRAND_SYSTEM_{date}.md` |
| `04-FSD-ARCHITECTURE.md` | `AR-03-FSD_ARCHITECTURE_{date}.md` |
| `05-COMPONENT-INVENTORY.md` | `RF-01-COMPONENT_INVENTORY_{date}.md` |
| `06-PAGE-ROUTES.md` | `RF-02-PAGE_ROUTES_{date}.md` |
| `07-ANIMATION-CONSTANTS.md` | `AR-04-ANIMATION_SYSTEM_{date}.md` |
| `08-DATABASE-SCHEMA.md` | `AR-05-DATABASE_SCHEMA_{date}.md` |
| `09-API-INTEGRATIONS.md` | `AR-06-API_INTEGRATIONS_{date}.md` |
| `10-VALIDATION-SCRIPTS.md` | `QA-01-VALIDATION_SCRIPTS_{date}.md` |
| `11-TODO-PRIORITY-MATRIX.md` | `OP-01-PRIORITY_MATRIX_{date}.md` |
| `12-NOT-TODO-CONSTRAINTS.md` | `RF-03-CONSTRAINTS_{date}.md` |
| `13-FILE-REFERENCE-MAP.md` | `RF-04-FILE_REFERENCE_MAP_{date}.md` |
| `14-PROMPT-EXECUTION-ORDER.md` | `OP-02-PROMPT_EXECUTION_{date}.md` |
| `15-TESTING-REQUIREMENTS.md` | `QA-02-TESTING_REQUIREMENTS_{date}.md` |
| `16-DEPLOYMENT-PIPELINE.md` | `OP-03-DEPLOYMENT_PIPELINE_{date}.md` |
| `17-AGENTS-MD-TEMPLATE.md` | `RF-05-AGENTS_TEMPLATE_{date}.md` |
| `18-COPILOT-INSTRUCTIONS.md` | `RF-06-COPILOT_INSTRUCTIONS_{date}.md` |
| `19-INSTRUCTION-FILES.md` | `RF-07-INSTRUCTION_FILES_{date}.md` |
| `20-QUICK-START-COMMANDS.md` | `OP-04-QUICK_START_{date}.md` |

### damieus-com-migration (XX-NAME.md → FSD)

| Old | New |
|-----|-----|
| `00-MASTER-HANDOFF-INDEX.md` | `CO-00-MASTER_INDEX_{date}.md` |
| `02-DATA-TESTID-STATUS.md` | `QA-02-TESTID_STATUS_{date}.md` |
| `03-ROUTE-AUDIT-RESULTS.md` | `RF-01-ROUTE_AUDIT_{date}.md` |
| `15-CART-SYSTEMS-ARCHITECTURE.md` | `AR-01-CART_SYSTEMS_{date}.md` |
| `16-TESTID-COMPREHENSIVE-PLAN.md` | `QA-03-TESTID_PLAN_{date}.md` |
| `19-COMPREHENSIVE-GAP-ANALYSIS.md` | `QA-04-GAP_ANALYSIS_{date}.md` |
| `20-TESTID-FRAMEWORK.md` | `QA-01-TESTID_FRAMEWORK_{date}.md` |

---

## Validation Rules

1. **Filename must match regex**: `^(CO|AR|OP|QA|RF)-\d{2}-[A-Z][A-Z0-9_]+_\d{4}-\d{2}-\d{2}\.md$`
2. **Date must be valid ISO 8601**: `YYYY-MM-DD`
3. **Sequence numbers are per-category**: CO-00, CO-01, CO-02; AR-01, AR-02
4. **CO-00 always exists** (master index)
5. **Max 99 docs per category** (00-99)
6. **No gaps in sequence** within a category
7. **Slug uses UPPER_SNAKE_CASE** only (A-Z, 0-9, underscore)

---

## Directory Structure (Canonical)

```
{project}/docs/handoff/
├── CO-00-MASTER_INDEX_{date}.md          # READ FIRST
├── CO-01-PROJECT_STATE_{date}.md         # Auto-generated
├── CO-02-CRITICAL_CONTEXT_{date}.md      # Manually curated
├── AR-01-{SYSTEM}_{date}.md             # Architecture docs
├── AR-02-{SYSTEM}_{date}.md
├── OP-01-DEPLOYMENT_ROADMAP_{date}.md   # Operations
├── OP-02-{TOPIC}_{date}.md
├── QA-01-TESTID_FRAMEWORK_{date}.md     # Quality assurance
├── QA-02-{TOPIC}_{date}.md
├── RF-01-{TOPIC}_{date}.md             # Reference
└── RF-02-{TOPIC}_{date}.md
```

**Standardized path**: Always `docs/handoff/` (not `docs/.handoff/`, not `docs/handoff-20x-e2e-integration/`)
