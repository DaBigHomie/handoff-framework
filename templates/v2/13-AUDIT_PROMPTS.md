# 20x Audit Prompts — {{PROJECT_NAME}}

**Project**: {{PROJECT_NAME}}
**Framework**: @dabighomie/handoff-framework v{{FRAMEWORK_VERSION}}
**Last Updated**: {{DATE}}

---

## Purpose

Pre-built prompts for the NEXT agent to continue auditing and implementing. Each prompt is designed for a single focused session. Copy-paste directly into agent chat.

---

## How to Use

1. Pick a prompt matching your priority (P0 → P3)
2. Copy the entire prompt block
3. Paste into a new agent session
4. The agent gets full context without reading 20+ docs

---

## P0 — Critical (Revenue Blocking)

### Prompt 1: [Title]

```
<!-- INVESTIGATE: Complete prompt with context, task, acceptance criteria -->

Context:
- Project: {{PROJECT_NAME}}
- Read: docs/handoff/00-MASTER_INDEX_{{DATE}}.md
- Read: docs/handoff/03-TASK_TRACKER_{{DATE}}.md

Task:
- [specific task]

Acceptance Criteria:
- [ ] [criteria 1]
- [ ] [criteria 2]
- [ ] npx tsc --noEmit (0 errors)
- [ ] npm run build (success)
```

### Prompt 2: [Title]

```
<!-- INVESTIGATE -->
```

---

## P1 — High Priority

### Prompt 3: [Title]

```
<!-- INVESTIGATE -->
```

### Prompt 4: [Title]

```
<!-- INVESTIGATE -->
```

---

## P2 — Medium Priority

### Prompt 5: [Title]

```
<!-- INVESTIGATE -->
```

---

## P3 — Low Priority / Maintenance

### Prompt 6: [Title]

```
<!-- INVESTIGATE -->
```

---

## Prompt Template

> Use this template when creating new audit prompts.

```
Context:
- Project: {{PROJECT_NAME}} ({{TECH_STACK}})
- Read these docs FIRST: [list specific handoff docs]
- Current state: [brief description]
- Failed commands to avoid: [list from 04-SESSION_LOG]

Task:
- [Primary objective]
- [Secondary objective if time allows]

Constraints:
- DO NOT modify [protected files]
- USE [specific patterns/conventions]
- CHECK [specific validation]

Acceptance Criteria:
- [ ] [measurable outcome 1]
- [ ] [measurable outcome 2]
- [ ] npx tsc --noEmit — 0 errors
- [ ] npm run lint — 0 errors
- [ ] npm run build — success
- [ ] Update 03-TASK_TRACKER with session results
- [ ] Update 04-SESSION_LOG with completed/skipped/failed

Token Budget: ~[estimate] tokens for context loading
Estimated Time: [hours]
```

---

## Prompt Categories

| Category | Prompts | Description |
|----------|---------|-------------|
| Revenue Path | [count] | Checkout, payment, cart fixes |
| Test Coverage | [count] | Add test-ids, write E2E specs |
| Database | [count] | Migrations, schema fixes |
| Performance | [count] | Lighthouse, bundle size |
| Documentation | [count] | Update handoff docs |
| Infrastructure | [count] | CI/CD, deploy pipeline |

---

## Immediate Next Steps (Prioritized)

| # | Prompt | Priority | Est. Time | Dependencies |
|---|--------|----------|-----------|-------------|
| 1 | [title] | P0 | [hours] | None |
| 2 | [title] | P0 | [hours] | #1 |
| 3 | [title] | P1 | [hours] | None |
| 4 | [title] | P1 | [hours] | #2 |
| 5 | [title] | P2 | [hours] | None |

---

**Framework**: @dabighomie/handoff-framework v{{FRAMEWORK_VERSION}}
**Generated**: {{DATE}}
