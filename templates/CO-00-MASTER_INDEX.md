# Master Index — {{PROJECT_NAME}}

**Category**: Core (CO)  
**Document**: CO-00  
**Version**: 2.0.0  
**Created**: {{DATE}}  
**Last Updated**: {{DATE}}  
**Framework**: [Handoff Framework v2.0](https://github.com/DaBigHomie/management-git/.handoff-framework)

---

## Purpose

Navigation hub — tells agents which doc answers which question.  
**Read this FIRST. Total onboarding: 10-15 minutes.**

---

## Quick Start

1. **Read this index** (5 min) — Understand what docs exist
2. **Read [CO-02-CRITICAL_CONTEXT](./CO-02-CRITICAL_CONTEXT_{{DATE}}.md)** (3 min) — Must-know gotchas
3. **Find your task below** → read that doc (2-5 min)

```bash
# Verify project health before starting work
npx tsc --noEmit && npm run lint && npm run build
```

---

## Project Overview

| Metric | Value |
|--------|-------|
| **Project** | {{PROJECT_NAME}} |
| **Tech Stack** | {{TECH_STACK}} |
| **Status** | {{STATUS}} |
| **Handoff Docs** | {{DOC_COUNT}} (~{{TOKEN_ESTIMATE}} tokens) |
| **Last Deploy** | {{LAST_DEPLOY}} |

---

## Document Index

### Core (CO) — Read First

| Doc | File | Tokens | Purpose |
|-----|------|--------|---------|
| CO-00 | `CO-00-MASTER_INDEX_{{DATE}}.md` | ~1,250 | Navigation hub (this doc) |
| CO-01 | `CO-01-PROJECT_STATE_{{DATE}}.md` | ~2,000 | Auto-generated state snapshot |
| CO-02 | `CO-02-CRITICAL_CONTEXT_{{DATE}}.md` | ~1,500 | Must-know gotchas & decisions |

### Architecture (AR) — Read When Modifying a System

| Doc | File | Tokens | Purpose |
|-----|------|--------|---------|
| AR-01 | `AR-01-{{SYSTEM_1}}_{{DATE}}.md` | ~2,500 | {{SYSTEM_1_DESC}} |
| AR-02 | `AR-02-{{SYSTEM_2}}_{{DATE}}.md` | ~2,500 | {{SYSTEM_2_DESC}} |

### Operations (OP) — Read When Deploying or Automating

| Doc | File | Tokens | Purpose |
|-----|------|--------|---------|
| OP-01 | `OP-01-DEPLOYMENT_ROADMAP_{{DATE}}.md` | ~2,500 | Deployment steps & checklist |
| OP-02 | `OP-02-PRIORITY_MATRIX_{{DATE}}.md` | ~2,000 | Task priority breakdown |

### Quality Assurance (QA) — Read When Testing or Auditing

| Doc | File | Tokens | Purpose |
|-----|------|--------|---------|
| QA-01 | `QA-01-TESTID_FRAMEWORK_{{DATE}}.md` | ~2,000 | data-testid naming & coverage |
| QA-02 | `QA-02-GAP_ANALYSIS_{{DATE}}.md` | ~3,000 | Comprehensive audit results |

### Reference (RF) — Quick Lookups

| Doc | File | Tokens | Purpose |
|-----|------|--------|---------|
| RF-01 | `RF-01-ROUTE_AUDIT_{{DATE}}.md` | ~2,000 | All routes categorized |
| RF-02 | `RF-02-FILE_REFERENCE_MAP_{{DATE}}.md` | ~1,500 | Where everything lives |

---

## Find By Question

| Question | Read This |
|----------|-----------|
| "What's the current state?" | CO-01 PROJECT_STATE |
| "What should I know before I start?" | CO-02 CRITICAL_CONTEXT |
| "How does [system] work?" | AR-{nn} for that system |
| "What features are done vs missing?" | QA-02 GAP_ANALYSIS |
| "How do I test this?" | QA-01 TESTID_FRAMEWORK |
| "How do I deploy?" | OP-01 DEPLOYMENT_ROADMAP |
| "What are the routes?" | RF-01 ROUTE_AUDIT |
| "Where is file X?" | RF-02 FILE_REFERENCE_MAP |

---

## Task-Based Reading Paths

### Fix a Bug (~3 min reading, ~3,000 tokens)

1. CO-02 CRITICAL_CONTEXT → system overview & gotchas
2. AR-{nn} for affected system → architecture & data flow
3. Fix bug, run quality gates
4. Update AR doc if behavior changed

### Add Feature (~5 min reading, ~5,000 tokens)

1. CO-01 PROJECT_STATE → what exists
2. QA-02 GAP_ANALYSIS → what's built vs missing
3. QA-01 TESTID_FRAMEWORK → testing standards
4. Implement feature, run quality gates
5. Update QA-02 & feature status

### Deploy to Production (~4 min reading, ~4,000 tokens)

1. CO-02 CRITICAL_CONTEXT → critical constraints
2. OP-01 DEPLOYMENT_ROADMAP → steps & checklist
3. QA-02 GAP_ANALYSIS → deployment decision matrix
4. Run all quality gates, deploy

---

## Quality Gates

```bash
# Required (must pass before ANY commit)
npx tsc --noEmit          # TypeScript: 0 errors
npm run lint              # ESLint: 0 errors
npm run build             # Build: success

# Recommended (run before deployment)
npm run discover:routes   # Route discovery → route-manifest.json
npm run audit:cta         # CTA gaps → cta-gap-analysis.json
npm run audit:a11y        # Accessibility → a11y-audit.json
npm run audit:performance # Performance → performance-audit.json
```

---

## Naming Convention

All handoff docs follow FSD naming: `{PREFIX}-{SEQ}-{SLUG}_{YYYY-MM-DD}.md`

| Prefix | Category | Purpose |
|--------|----------|---------|
| `CO` | Core | Project state, context, index |
| `AR` | Architecture | System design, data flows |
| `OP` | Operations | Deploy, CI/CD, automation |
| `QA` | Quality | Testing, audits, gaps |
| `RF` | Reference | Routes, files, lookups |

See [NAMING_CONVENTION.md](../../../.handoff-framework/NAMING_CONVENTION.md) for details.

---

**Framework**: Handoff v2.0 | **Validation**: `npx tsx .handoff-framework/scripts/validate-naming.mts {{PROJECT_NAME}}`
