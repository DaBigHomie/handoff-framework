---
applyTo: "**"
---
# Baseline Audit

**Priority**: priority:p1
**Status**: ⏳ **NOT STARTED**
**Estimated Time**: 3h
**Revenue Impact**: Medium
**Dependencies**: `ds-02-update-ds-prompts-safety-rules`, `ds-03-update-ds-workflow-gsap-rules`
**Tags**: `priority:p1`, `type:chore`, `scope:ui`, `agent:copilot`, `automation:copilot`, `prompt-spec`

---

## Agent Bootstrap

> ⚠️ The agent executing this prompt MUST load these files first:

```bash
# 1. Repo instructions (mandatory)
cat .github/copilot-instructions.md
cat AGENTS.md

# 2. Path-specific instructions (load all matching)
ls .github/instructions/*.instructions.md

# 3. DS authority docs (prerequisites — both must exist)
cat docs/DESIGN-SYSTEM-REFERENCE.md
cat docs/DS-WORKFLOW.md

# 4. Active sprint context
cat docs/active/INDEX.md 2>/dev/null || echo "No active index"
```

**Instruction files to load** (based on task scope):
- `commit-quality.instructions.md` — always
- `core-directives.instructions.md` — always
- `typescript.instructions.md` — any code change
- `regression-prevention.instructions.md` — any UI change

---

## Objective

Conduct a full baseline audit of the codebase against the Design System rules established in `docs/DESIGN-SYSTEM-REFERENCE.md` and `docs/DS-WORKFLOW.md`. Produce an audit report `docs/DS-AUDIT-BASELINE.md` that catalogues every violation across four categories: (1) hardcoded hex/rgb color values, (2) hardcoded pixel dimensions, (3) GSAP rule violations, (4) missing dark mode tokens. This report becomes the input for `ds-05` (button migration) and `ds-06` (dark mode tokens) — it must be exhaustive and prioritized by blast radius.

---

## Pre-Flight Check

```bash
# Verify prerequisites
test -f docs/DESIGN-SYSTEM-REFERENCE.md && echo "PASS: DESIGN-SYSTEM-REFERENCE.md" || echo "FAIL: Run ds-01"
test -f docs/DS-WORKFLOW.md && echo "PASS: DS-WORKFLOW.md" || echo "FAIL: Run ds-03"

# Count hardcoded hex violations
echo "=== Hardcoded hex colors ==="
grep -rn "#[0-9a-fA-F]\{3,6\}\b" src/ --include="*.tsx" --include="*.ts" --include="*.css" 2>/dev/null | grep -v "node_modules\|\.test\." | wc -l

# Count hardcoded px violations
echo "=== Hardcoded px values ==="
grep -rn "[0-9]\+px[^-a-zA-Z]" src/ --include="*.tsx" --include="*.ts" --include="*.css" 2>/dev/null | grep -v "node_modules\|\.test\." | wc -l

# Count GSAP violations (missing cleanup)
echo "=== GSAP without ctx.revert ==="
grep -rn "gsap\." src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules\|ctx.revert\|\.test\." | wc -l

# Find button components for ds-05
echo "=== Button components ==="
find src/ -name "*[Bb]utton*" -o -name "*[Bb]tn*" 2>/dev/null | grep -v node_modules
```

---

## Intended Result

`docs/DS-AUDIT-BASELINE.md` exists containing:
- **Executive Summary**: total violation count by category
- **Category 1 — Hardcoded Colors**: file:line references, severity (P0/P1/P2), suggested token replacement
- **Category 2 — Hardcoded Dimensions**: file:line references, severity, suggested Tailwind class
- **Category 3 — GSAP Violations**: file:line references, which rule was violated
- **Category 4 — Missing Dark Mode Tokens**: components that have no dark: variant
- **Priority Matrix**: which files to fix first (highest blast radius first)
- **Scope for ds-05 and ds-06**: explicit list of files/components each downstream task must handle

---

## Files to Modify/Create

| File | Action | Exists? | Purpose |
|------|--------|---------|---------|
| `docs/DS-AUDIT-BASELINE.md` | CREATE | No | Audit report — input for ds-05, ds-06 |
| `docs/DESIGN-SYSTEM-REFERENCE.md` | READ ONLY | Yes | Rule authority |
| `docs/DS-WORKFLOW.md` | READ ONLY | Yes | GSAP rule authority |

---

## data-testid Contracts

| testid | Action | Used By |
|--------|--------|---------|
| N/A | — | Doc-only task |

---

## Blast Radius

```bash
# Find all files that will need changes based on audit
grep -rn "#[0-9a-fA-F]\{3,6\}\b" src/ --include="*.tsx" --include="*.ts" --include="*.css" 2>/dev/null | grep -v "node_modules" | awk -F: '{print $1}' | sort -u

grep -rn "[0-9]\+px[^-a-zA-Z]" src/ --include="*.tsx" --include="*.ts" --include="*.css" 2>/dev/null | grep -v "node_modules" | awk -F: '{print $1}' | sort -u
```

---

## A11y Checklist

- [ ] Audit includes check for missing `aria-label` on interactive elements
- [ ] Audit flags any color contrast failures (compare against WCAG AA in DESIGN-SYSTEM-REFERENCE)
- [ ] Heading hierarchy violations noted in audit report

---

## Design System

- [ ] Audit report maps every hardcoded value to its correct DS token equivalent
- [ ] Dark mode gaps identified per component
- [ ] Severity rated: P0 = user-visible contrast failure, P1 = token mismatch, P2 = minor inconsistency

---

## Success Criteria

`docs/DS-AUDIT-BASELINE.md` is created with all four violation categories populated. The Priority Matrix clearly assigns each violation file to either `ds-05` (button/component migration) or `ds-06` (dark mode tokens) or labels it as out-of-scope. Running the blast-radius grep commands above produces output that matches the audit report's file list within ±5 entries.

---

## Testing Checklist

```bash
#!/bin/bash
# Verify audit doc exists
test -f docs/DS-AUDIT-BASELINE.md || { echo "FAIL: DS-AUDIT-BASELINE.md missing"; exit 1; }

# Verify required sections
grep -q "Executive Summary" docs/DS-AUDIT-BASELINE.md || { echo "FAIL: Missing Executive Summary"; exit 1; }
grep -q "Hardcoded Colors\|Category 1" docs/DS-AUDIT-BASELINE.md || { echo "FAIL: Missing color audit"; exit 1; }
grep -q "Dark Mode\|Category 4" docs/DS-AUDIT-BASELINE.md || { echo "FAIL: Missing dark mode audit"; exit 1; }
grep -q "Priority Matrix" docs/DS-AUDIT-BASELINE.md || { echo "FAIL: Missing Priority Matrix"; exit 1; }

echo "PASS: Baseline audit complete"
npx tsc --noEmit || exit 1
npm run lint || exit 1
npm run build || exit 1
```

---

## Implementation

```markdown
## Audit Report Structure (docs/DS-AUDIT-BASELINE.md)

# DS Audit — Baseline Report

**Date**: {date}
**Auditor**: Copilot Coding Agent
**Rules Authority**: docs/DESIGN-SYSTEM-REFERENCE.md, docs/DS-WORKFLOW.md

---

## Executive Summary
| Category | Violations | P0 | P1 | P2 |
|----------|-----------|----|----|-----|
| Hardcoded Colors | N | n | n | n |
| Hardcoded Dimensions | N | n | n | n |
| GSAP Violations | N | n | n | n |
| Missing Dark Mode | N | n | n | n |
| **TOTAL** | **N** | | | |

---

## Category 1 — Hardcoded Colors
| File | Line | Value | Severity | Replace With |
|------|------|-------|----------|--------------|

## Category 2 — Hardcoded Dimensions
| File | Line | Value | Severity | Replace With |
|------|------|-------|----------|--------------|

## Category 3 — GSAP Violations
| File | Line | Rule Violated | Description |
|------|------|--------------|-------------|

## Category 4 — Missing Dark Mode Tokens
| Component | File | Missing Variant | Impact |
|-----------|------|----------------|--------|

---

## Priority Matrix
### → Assign to ds-05 (Button Migration)
...

### → Assign to ds-06 (Dark Mode Tokens)
...
```

---

## Reference Implementation

```bash
# Generate Category 1 raw data
grep -rn "#[0-9a-fA-F]\{3,6\}\b" src/ --include="*.tsx" --include="*.ts" --include="*.css" 2>/dev/null | grep -v node_modules

# Generate Category 2 raw data
grep -rn "[0-9]\+px[^-a-zA-Z]" src/ --include="*.tsx" --include="*.ts" --include="*.css" 2>/dev/null | grep -v node_modules

# Generate Category 3 raw data
grep -rn "gsap\." src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules\|ctx\|\.test\."

# Generate Category 4 raw data — components missing dark: variant
grep -rn "bg-\|text-\|border-" src/ --include="*.tsx" 2>/dev/null | grep -v "dark:" | grep -v node_modules | head -40
```

---

## Environment

- **Framework**: Node.js / TypeScript
- **Dependencies**: None
- **FSD Layer**: `docs/` — documentation / audit layer

---

## Database / Supabase

No DB changes. Audit report generation only.

---

## Routes Affected

None.

---

## Blocking Gate

```bash
test -f docs/DESIGN-SYSTEM-REFERENCE.md || { echo "BLOCKED: ds-01 must complete first"; exit 1; }
test -f docs/DS-WORKFLOW.md || { echo "BLOCKED: ds-03 must complete first"; exit 1; }
# Also check ds-02 safety rules applied
grep -q "DESIGN-SYSTEM-REFERENCE" .github/prompts/*.prompt.md 2>/dev/null && echo "PASS: ds-02 applied" || echo "WARN: ds-02 may not be complete"
echo "PASS: Ready for baseline audit"
```

---

## Merge Gate

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Workflow & Lifecycle

**CI Validation**: `ci.yml` — tsc + lint + build + test
**PR Promotion**: `copilot-pr-promote.yml` — labels, milestone, reviewer
**PR Validation**: `copilot-pr-validate.yml` — quality gates + blast radius
**Chain Advance**: `copilot-chain-advance.yml` — closes → next issue

**Post-Merge Steps** (automated):
1. PR merged → `copilot-pr-merged.yml` adds `automation:completed`
2. Linked chain issue auto-closes
3. `copilot-chain-advance.yml` activates next wave (`ds-05` and `ds-06` in parallel)
4. Branch auto-deleted

**E2E Tests to Run**:
- `e2e/specs/route-health.spec.ts` — smoke
- N/A (doc task)
