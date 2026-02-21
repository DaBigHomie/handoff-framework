# Task Tracker — {{PROJECT_NAME}}

**Project**: {{PROJECT_NAME}}
**Framework**: @dabighomie/handoff-framework v{{FRAMEWORK_VERSION}}
**Last Updated**: {{DATE}}

---

## Purpose

Single source of truth for ALL task tracking across the project. Consolidates scoreboard, status.json, implementation-plan, markdown checklists, and in-session todo lists into one navigable document.

---

## Tracking Sources

| Source | Path | Format | Scope | Auto-Updated |
|--------|------|--------|-------|--------------|
| **Scoreboard** | `docs/SCOREBOARD.json` | JSON | Canonical unified tracker | Yes (via scripts) |
| **Status** | `docs/unifiedCheckoutsalesfunnel/status.json` | JSON | Checkout funnel detail | Yes |
| **Implementation Plan** | `scripts/ecommerce-automation/implementation-plan.json` | JSON | Issue generation source | No (snapshot) |
| **ACTION_ITEMS.md** | `ACTION_ITEMS.md` | Markdown | Production blockers | Manual |
| **TODO.md** | `TODO.md` | Markdown | General dev tasks | Manual |
| **GitHub Issues** | `gh issue list` | API | Issue-level tracking | Yes |
| **Session Todo** | `manage_todo_list` tool | Chat UI | In-session progress | Session-scoped |

---

## SCOREBOARD Summary

**Source**: `docs/SCOREBOARD.json`

| Category | Total | Done | Partial | Missing | % |
|----------|-------|------|---------|---------|---|
| Ecommerce Features | {{ECOM_TOTAL}} | {{ECOM_DONE}} | {{ECOM_PARTIAL}} | {{ECOM_MISSING}} | {{ECOM_PCT}} |
| Checkout Funnel | {{CHECKOUT_TOTAL}} | {{CHECKOUT_DONE}} | {{CHECKOUT_PARTIAL}} | {{CHECKOUT_MISSING}} | {{CHECKOUT_PCT}} |
| CTA Components | {{CTA_TOTAL}} | {{CTA_DONE}} | {{CTA_PARTIAL}} | {{CTA_MISSING}} | {{CTA_PCT}} |
| Quality Gates | {{GATE_TOTAL}} | {{GATE_PASS}} | — | {{GATE_FAIL}} | {{GATE_PCT}} |

### Feature Status by Phase

| Phase | Features | Completed | Effort (days) | Status |
|-------|----------|-----------|---------------|--------|
| P1 | [TODO] | [TODO] | [TODO] | [TODO] |
| P2 | [TODO] | [TODO] | [TODO] | [TODO] |
| P3 | [TODO] | [TODO] | [TODO] | [TODO] |
| P4 | [TODO] | [TODO] | [TODO] | [TODO] |

---

## Implementation Plan Tracker

**Source**: `scripts/ecommerce-automation/implementation-plan.json`

| # | Feature | Phase | Effort | Has DB | GitHub Issue | Status |
|---|---------|-------|--------|--------|-------------|--------|
| [TODO: Auto-populate from implementation-plan.json] |||||

**How to sync**: Run `npx tsx src/generate-state.mts {{PROJECT_NAME}}` to refresh.

---

## Active Blockers

**Source**: ACTION_ITEMS.md critical section

| # | Blocker | Impact | Effort | Owner |
|---|---------|--------|--------|-------|
| 1 | [TODO] | [TODO] | [TODO] | [TODO] |
| 2 | [TODO] | [TODO] | [TODO] | [TODO] |
| 3 | [TODO] | [TODO] | [TODO] | [TODO] |

---

## In-Session Todo (Agent Work)

> Update this section at the START and END of every agent session.

### Current Session: {{DATE}}

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | [TODO] | not-started | |
| 2 | [TODO] | not-started | |
| 3 | [TODO] | not-started | |

**Status values**: `not-started` | `in-progress` | `completed` | `blocked` | `skipped`

### Previous Sessions

<details>
<summary>Session YYYY-MM-DD (click to expand)</summary>

| # | Task | Status | Notes |
|---|------|--------|-------|
| — | — | — | — |

</details>

---

## Todo List Deduplication

> Multiple todo files exist in this project. This section maps them to prevent drift.

| File | Scope | Active Items | Last Sync |
|------|-------|-------------|-----------|
| ACTION_ITEMS.md | Production blockers | [TODO] | {{DATE}} |
| TODO.md | General dev tasks | [TODO] | {{DATE}} |
| docs/SCOREBOARD.json | Feature tracker | [TODO] | {{DATE}} |
| [Additional files] | [scope] | [count] | [date] |

**Rule**: The SCOREBOARD.json is canonical. If ACTION_ITEMS.md conflicts with SCOREBOARD.json, SCOREBOARD wins.

---

## Integration Commands

```bash
# Refresh scoreboard from current project state
npx tsx src/generate-state.mts {{PROJECT_NAME}}

# View scoreboard summary
cat docs/SCOREBOARD.json | jq '.overview'

# View implementation plan status
cat scripts/ecommerce-automation/implementation-plan.json | jq '.phases | to_entries[] | {phase: .key, count: (.value | length)}'

# List open GitHub issues
gh issue list --state open --label "ecommerce" --limit 30

# Check checkout funnel status
cat docs/unifiedCheckoutsalesfunnel/status.json | jq '.overallProgress'
```

---

**Framework**: @dabighomie/handoff-framework v{{FRAMEWORK_VERSION}}
**Generated**: {{DATE}}
