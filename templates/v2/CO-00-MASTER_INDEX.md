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
| CO-00 | `CO-00-MASTER_INDEX_{{DATE}}.md` | ~1,500 | Navigation hub (this doc) |
| CO-01 | `CO-01-PROJECT_STATE_{{DATE}}.md` | ~2,000 | Auto-generated state snapshot |
| CO-02 | `CO-02-CRITICAL_CONTEXT_{{DATE}}.md` | ~2,000 | Must-know gotchas, failed commands, issues |
| CO-03 | `CO-03-TASK_TRACKER_{{DATE}}.md` | ~2,500 | **Unified todo list** — scoreboard, status.json, action items |

### Architecture (AR) — Read When Modifying a System

| Doc | File | Tokens | Purpose |
|-----|------|--------|---------|
| AR-01 | `AR-01-SYSTEM_ARCHITECTURE_{{DATE}}.md` | ~2,500 | System design & data flows |
| AR-02 | `AR-02-COMPONENT_MAP_{{DATE}}.md` | ~2,500 | Component → hook interaction map |

### Operations (OP) — Read When Deploying, Logging, or Automating

| Doc | File | Tokens | Purpose |
|-----|------|--------|---------|
| OP-01 | `OP-01-DEPLOYMENT_ROADMAP_{{DATE}}.md` | ~2,500 | Deployment steps & checklist |
| OP-02 | `OP-02-SESSION_LOG_{{DATE}}.md` | ~2,500 | Completed/skipped/outdated/failed commands |
| OP-03 | `OP-03-SCRIPTS_REFERENCE_{{DATE}}.md` | ~1,500 | All scripts — purpose, usage, status |

### Quality Assurance (QA) — Read When Testing or Auditing

| Doc | File | Tokens | Purpose |
|-----|------|--------|---------|
| QA-01 | `QA-01-TESTID_FRAMEWORK_{{DATE}}.md` | ~2,000 | data-testid naming & coverage |
| QA-02 | `QA-02-GAP_ANALYSIS_{{DATE}}.md` | ~3,000 | Comprehensive 20x audit results |

### Reference (RF) — Quick Lookups & Agent Prompts

| Doc | File | Tokens | Purpose |
|-----|------|--------|---------|
| RF-01 | `RF-01-REFERENCE_MAP_{{DATE}}.md` | ~2,000 | Where everything lives |
| RF-02 | `RF-02-ROUTE_AUDIT_{{DATE}}.md` | ~2,000 | All routes categorized |
| RF-03 | `RF-03-AUDIT_PROMPTS_{{DATE}}.md` | ~2,000 | 20x audit prompts for next agent |
| RF-04 | `RF-04-IMPROVEMENTS_{{DATE}}.md` | ~2,000 | Instruction files, AGENTS.md, CI/CD, automation |

---

## Document Status

| Doc | Status | Last Verified | Notes |
|-----|--------|---------------|-------|
| CO-00 | ✅ Current | {{DATE}} | |
| CO-01 | ✅ Current | {{DATE}} | Auto-generated |
| CO-02 | ✅ Current | {{DATE}} | |
| CO-03 | ✅ Current | {{DATE}} | |
| AR-01 | [TODO] | | |
| AR-02 | [TODO] | | |
| OP-01 | [TODO] | | |
| OP-02 | ✅ Current | {{DATE}} | Updated each session |
| OP-03 | [TODO] | | |
| QA-01 | [TODO] | | |
| QA-02 | [TODO] | | |
| RF-01 | [TODO] | | |
| RF-02 | [TODO] | | |
| RF-03 | [TODO] | | |
| RF-04 | [TODO] | | |

**Status values**: ✅ Current | ⚠️ Outdated | ❌ Missing | 🔄 In Progress

---

## Find By Question

| Question | Read This |
|----------|-----------|
| "What's the current state?" | CO-01 PROJECT_STATE |
| "What should I know before I start?" | CO-02 CRITICAL_CONTEXT |
| "What's on the todo list?" | CO-03 TASK_TRACKER |
| "How does [system] work?" | AR-{nn} for that system |
| "How do components connect?" | AR-02 COMPONENT_MAP |
| "What features are done vs missing?" | QA-02 GAP_ANALYSIS |
| "How do I test this?" | QA-01 TESTID_FRAMEWORK |
| "How do I deploy?" | OP-01 DEPLOYMENT_ROADMAP |
| "What happened last session?" | OP-02 SESSION_LOG |
| "What scripts exist?" | OP-03 SCRIPTS_REFERENCE |
| "What are the routes?" | RF-02 ROUTE_AUDIT |
| "Where is file X?" | RF-01 REFERENCE_MAP |
| "What prompts should next agent run?" | RF-03 AUDIT_PROMPTS |
| "What improvements are suggested?" | RF-04 IMPROVEMENTS |
| "What commands failed?" | CO-02 CRITICAL_CONTEXT (failed commands) + OP-02 SESSION_LOG |

---

## Task-Based Reading Paths

### Fix a Bug (~3 min reading, ~3,000 tokens)

1. CO-02 CRITICAL_CONTEXT → gotchas, failed commands, issues
2. AR-{nn} for affected system → architecture & data flow
3. AR-02 COMPONENT_MAP → blast radius analysis
4. Fix bug, run quality gates
5. Update OP-02 SESSION_LOG with what you did

### Add Feature (~5 min reading, ~5,000 tokens)

1. CO-03 TASK_TRACKER → verify feature isn't already done
2. CO-01 PROJECT_STATE → current metrics
3. QA-02 GAP_ANALYSIS → what's built vs missing
4. QA-01 TESTID_FRAMEWORK → testing standards
5. Implement feature, run quality gates
6. Update CO-03 & QA-02 with status

### Deploy to Production (~4 min reading, ~4,000 tokens)

1. CO-02 CRITICAL_CONTEXT → constraints to remember
2. OP-01 DEPLOYMENT_ROADMAP → steps & checklist
3. QA-02 GAP_ANALYSIS → deployment decision matrix
4. Run all quality gates, deploy
5. Update OP-02 SESSION_LOG

### Continue Previous Agent's Work (~5 min reading, ~6,000 tokens)

1. CO-00 MASTER_INDEX → Document Status table (skip outdated docs)
2. CO-03 TASK_TRACKER → what's pending, blocked, completed
3. OP-02 SESSION_LOG → what was done, skipped, failed
4. RF-03 AUDIT_PROMPTS → pre-built prompts for your task
5. Continue work, run quality gates
6. Update CO-03 + OP-02 with session results

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
