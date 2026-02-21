# Master Index — {{PROJECT_NAME}}

**Category**: Core (CO)  
**Document**: 00-MASTER_INDEX  
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
2. **Read [02-CRITICAL_CONTEXT](./02-CRITICAL_CONTEXT_{{DATE}}.md)** (3 min) — Must-know gotchas
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
| 00 | `00-MASTER_INDEX_{{DATE}}.md` | ~1,500 | Navigation hub (this doc) |
| 01 | `01-PROJECT_STATE_{{DATE}}.md` | ~2,000 | Auto-generated state snapshot |
| 02 | `02-CRITICAL_CONTEXT_{{DATE}}.md` | ~2,000 | Must-know gotchas, failed commands, issues |
| 03 | `03-TASK_TRACKER_{{DATE}}.md` | ~2,500 | **Unified todo list** — scoreboard, status.json, action items |

### Architecture (AR) — Read When Modifying a System

| Doc | File | Tokens | Purpose |
|-----|------|--------|---------|
| 06 | `06-ARCHITECTURE_{{DATE}}.md` | ~2,500 | System design & data flows |
| 07 | `07-COMPONENT_MAP_{{DATE}}.md` | ~2,500 | Component → hook interaction map |

### Operations (OP) — Read When Deploying, Logging, or Automating

| Doc | File | Tokens | Purpose |
|-----|------|--------|---------|
| 05 | `05-NEXT_STEPS_{{DATE}}.md` | ~2,500 | Deployment steps & checklist |
| 04 | `04-SESSION_LOG_{{DATE}}.md` | ~2,500 | Completed/skipped/outdated/failed commands |
| 11 | `11-SCRIPTS_REFERENCE_{{DATE}}.md` | ~1,500 | All scripts — purpose, usage, status |

### Quality Assurance (QA) — Read When Testing or Auditing

| Doc | File | Tokens | Purpose |
|-----|------|--------|---------|
| 10 | `10-TEST_FRAMEWORK_{{DATE}}.md` | ~2,000 | data-testid naming & coverage |
| 09 | `09-GAP_ANALYSIS_{{DATE}}.md` | ~3,000 | Comprehensive 20x audit results |

### Reference (RF) — Quick Lookups & Agent Prompts

| Doc | File | Tokens | Purpose |
|-----|------|--------|---------|
| 12 | `12-REFERENCE_MAP_{{DATE}}.md` | ~2,000 | Where everything lives |
| 08 | `08-ROUTE_AUDIT_{{DATE}}.md` | ~2,000 | All routes categorized |
| 13 | `13-AUDIT_PROMPTS_{{DATE}}.md` | ~2,000 | 20x audit prompts for next agent |
| 14 | `14-IMPROVEMENTS_{{DATE}}.md` | ~2,000 | Instruction files, AGENTS.md, CI/CD, automation |

---

## Document Status

| Doc | Status | Last Verified | Notes |
|-----|--------|---------------|-------|
| 00 | ✅ Current | {{DATE}} | |
| 01 | ✅ Current | {{DATE}} | Auto-generated |
| 02 | ✅ Current | {{DATE}} | |
| 03 | ✅ Current | {{DATE}} | |
| 06 | <!-- INVESTIGATE --> | | |
| 07 | <!-- INVESTIGATE --> | | |
| 05 | <!-- INVESTIGATE --> | | |
| 04 | ✅ Current | {{DATE}} | Updated each session |
| 11 | <!-- INVESTIGATE --> | | |
| 10 | <!-- INVESTIGATE --> | | |
| 09 | <!-- INVESTIGATE --> | | |
| 12 | <!-- INVESTIGATE --> | | |
| 08 | <!-- INVESTIGATE --> | | |
| 13 | <!-- INVESTIGATE --> | | |
| 14 | <!-- INVESTIGATE --> | | |

**Status values**: ✅ Current | ⚠️ Outdated | ❌ Missing | 🔄 In Progress

---

## Find By Question

| Question | Read This |
|----------|-----------|
| "What's the current state?" | 01 PROJECT_STATE |
| "What should I know before I start?" | 02 CRITICAL_CONTEXT |
| "What's on the todo list?" | 03 TASK_TRACKER |
| "How does [system] work?" | AR-{nn} for that system |
| "How do components connect?" | 07 COMPONENT_MAP |
| "What features are done vs missing?" | 09 GAP_ANALYSIS |
| "How do I test this?" | 10 TESTID_FRAMEWORK |
| "How do I deploy?" | 05 DEPLOYMENT_ROADMAP |
| "What happened last session?" | 04 SESSION_LOG |
| "What scripts exist?" | 11 SCRIPTS_REFERENCE |
| "What are the routes?" | 08 ROUTE_AUDIT |
| "Where is file X?" | 12 REFERENCE_MAP |
| "What prompts should next agent run?" | 13 AUDIT_PROMPTS |
| "What improvements are suggested?" | 14 IMPROVEMENTS |
| "What commands failed?" | 02 CRITICAL_CONTEXT (failed commands) + 04 SESSION_LOG |

---

## Task-Based Reading Paths

### Fix a Bug (~3 min reading, ~3,000 tokens)

1. 02 CRITICAL_CONTEXT → gotchas, failed commands, issues
2. AR-{nn} for affected system → architecture & data flow
3. 07 COMPONENT_MAP → blast radius analysis
4. Fix bug, run quality gates
5. Update 04 SESSION_LOG with what you did

### Add Feature (~5 min reading, ~5,000 tokens)

1. 03 TASK_TRACKER → verify feature isn't already done
2. 01 PROJECT_STATE → current metrics
3. 09 GAP_ANALYSIS → what's built vs missing
4. 10 TESTID_FRAMEWORK → testing standards
5. Implement feature, run quality gates
6. Update 03 & 09 with status

### Deploy to Production (~4 min reading, ~4,000 tokens)

1. 02 CRITICAL_CONTEXT → constraints to remember
2. 05 DEPLOYMENT_ROADMAP → steps & checklist
3. 09 GAP_ANALYSIS → deployment decision matrix
4. Run all quality gates, deploy
5. Update 04 SESSION_LOG

### Continue Previous Agent's Work (~5 min reading, ~6,000 tokens)

1. 00-MASTER_INDEX MASTER_INDEX → Document Status table (skip outdated docs)
2. 03 TASK_TRACKER → what's pending, blocked, completed
3. 04 SESSION_LOG → what was done, skipped, failed
4. 13 AUDIT_PROMPTS → pre-built prompts for your task
5. Continue work, run quality gates
6. Update 03 + 04 with session results

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

All handoff docs follow numeric naming: `{NN}-{SLUG}_{YYYY-MM-DD}.md`

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
