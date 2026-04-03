---
applyTo: "**"
---
# Create DS Reference Doc

**Priority**: priority:p1
**Status**: ⏳ **NOT STARTED**
**Estimated Time**: 2h
**Revenue Impact**: Medium
**Dependencies**: None
**Tags**: `priority:p1`, `type:docs`, `scope:ui`, `agent:copilot`, `automation:copilot`, `prompt-spec`, `documentation`

---

## Agent Bootstrap

> ⚠️ The agent executing this prompt MUST load these files first:

```bash
# 1. Repo instructions (mandatory)
cat .github/copilot-instructions.md
cat AGENTS.md

# 2. Path-specific instructions (load all matching)
ls .github/instructions/*.instructions.md

# 3. Active sprint context
cat docs/active/INDEX.md 2>/dev/null || echo "No active index"
```

**Instruction files to load** (based on task scope):
- `commit-quality.instructions.md` — always
- `core-directives.instructions.md` — always
- `typescript.instructions.md` — any code change
- `regression-prevention.instructions.md` — any UI change

---

## Objective

Create a comprehensive Design System (DS) reference document for the `@dabighomie/handoff-framework` project. This document serves as the single source of truth for all design tokens, component patterns, animation rules (GSAP), and theming guidelines used across the framework's UI layer. The doc must cover: token taxonomy, component inventory, spacing/typography scale, and authoring rules. It is the prerequisite for all downstream DS prompt updates (safety rules, GSAP workflow, button migration, dark mode).

---

## Pre-Flight Check

```bash
# Check for existing DS documentation
find . -name "*design-system*" -o -name "*ds-reference*" -o -name "*tokens*" 2>/dev/null | grep -v node_modules
find . -name "*.css" -o -name "*.scss" 2>/dev/null | grep -v node_modules | head -20
grep -rn "design.system\|designSystem\|DS_" src/ 2>/dev/null | head -20
grep -rn "tailwind\|tokens\|dark.mode" . --include="*.json" --include="*.config.*" 2>/dev/null | grep -v node_modules | head -20
ls docs/ 2>/dev/null
```

---

## Intended Result

A file `docs/DESIGN-SYSTEM-REFERENCE.md` exists containing:
- **Token Registry**: All color, spacing, typography, and shadow tokens with semantic names
- **Component Inventory**: List of all UI components in the framework with status (stable/beta/deprecated)
- **Animation Rules**: GSAP usage guidelines, performance constraints, and approved animation patterns
- **Theming Guide**: Light/dark mode token mapping, semantic token naming convention
- **Authoring Rules**: How to add new tokens, how to extend components, what NOT to do
- **Version**: Document version header with last-updated date

Downstream prompts `ds-02` and `ds-03` depend on this document existing and being complete.

---

## Files to Modify/Create

| File | Action | Exists? | Purpose |
|------|--------|---------|---------|
| `docs/DESIGN-SYSTEM-REFERENCE.md` | CREATE | No | Primary DS reference document |
| `docs/active/INDEX.md` | MODIFY | Verify | Add DS reference to active docs index |

---

## data-testid Contracts

| testid | Action | Used By |
|--------|--------|---------|
| N/A | — | Doc-only task, no testids needed |

---

## Blast Radius

```bash
# Check what references docs/
grep -rn "DS-REFERENCE\|ds-reference" . --include="*.md" --include="*.ts" 2>/dev/null | grep -v node_modules
grep -rn "docs/" .github/prompts/ 2>/dev/null
```

---

## A11y Checklist

- [ ] Document uses semantic heading hierarchy (h1 → h2 → h3, no skips)
- [ ] Color contrast examples include WCAG AA pass/fail labels
- [ ] All token names are human-readable and self-documenting

---

## Design System

- [ ] Document captures ALL existing hardcoded hex/rgb values to migrate
- [ ] Spacing scale documented in Tailwind units (not px)
- [ ] Dark mode semantic tokens listed with their light counterparts

---

## Success Criteria

`docs/DESIGN-SYSTEM-REFERENCE.md` exists with all six sections (Token Registry, Component Inventory, Animation Rules, Theming Guide, Authoring Rules, Version header). The document accurately reflects the current codebase state — discovered via Pre-Flight grep, not assumed. Downstream agents can use this doc as the sole reference without reading the entire codebase.

---

## Testing Checklist

```bash
#!/bin/bash
# Validate DS reference doc exists and has required sections
test -f docs/DESIGN-SYSTEM-REFERENCE.md || { echo "FAIL: DESIGN-SYSTEM-REFERENCE.md missing"; exit 1; }
grep -q "Token Registry" docs/DESIGN-SYSTEM-REFERENCE.md || { echo "FAIL: Missing Token Registry section"; exit 1; }
grep -q "Component Inventory" docs/DESIGN-SYSTEM-REFERENCE.md || { echo "FAIL: Missing Component Inventory"; exit 1; }
grep -q "Animation Rules" docs/DESIGN-SYSTEM-REFERENCE.md || { echo "FAIL: Missing Animation Rules"; exit 1; }
grep -q "Theming Guide" docs/DESIGN-SYSTEM-REFERENCE.md || { echo "FAIL: Missing Theming Guide"; exit 1; }
grep -q "Authoring Rules" docs/DESIGN-SYSTEM-REFERENCE.md || { echo "FAIL: Missing Authoring Rules"; exit 1; }
echo "PASS: DESIGN-SYSTEM-REFERENCE.md complete"
npx tsc --noEmit || exit 1
npm run lint || exit 1
npm run build || exit 1
```

---

## Implementation

```markdown
## DS Reference Doc Structure

# Design System Reference

**Version**: 1.0.0
**Updated**: {date}
**Repo**: @dabighomie/handoff-framework

---

## 1. Token Registry
### Colors
| Token | Light Value | Dark Value | Usage |
|-------|------------|------------|-------|
| `bg-surface` | `#ffffff` | `#0f0f0f` | Page backgrounds |
| ...  | ...        | ...        | ...   |

### Spacing
| Token | Value | Tailwind Class |
|-------|-------|----------------|

### Typography
| Token | Size | Weight | Line Height |
|-------|------|--------|-------------|

---

## 2. Component Inventory
| Component | Location | Status | Notes |
|-----------|----------|--------|-------|

---

## 3. Animation Rules (GSAP)
- GSAP version constraint: ...
- Approved easing functions: ...
- Performance rules: ...
- Forbidden patterns: ...

---

## 4. Theming Guide
...

## 5. Authoring Rules
...

## 6. Version History
...
```

---

## Reference Implementation

```bash
# Discover current token usage to populate Token Registry
grep -rn "bg-\|text-\|border-\|shadow-" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | sort | uniq -c | sort -rn | head -40

# Find existing component files
find src/ -name "*.tsx" -o -name "*.ts" 2>/dev/null | grep -v node_modules | grep -i "component\|button\|card\|modal" | head -20
```

---

## Environment

- **Framework**: Node.js / TypeScript
- **Dependencies**: None (doc-only)
- **FSD Layer**: `docs/` — project documentation layer

---

## Database / Supabase

No DB changes. This is a documentation task.

---

## Routes Affected

None. Documentation only.

---

## Blocking Gate

```bash
# Ensure docs/ directory exists
test -d docs/ || { echo "FAIL: docs/ directory missing"; exit 1; }
echo "PASS: Ready to create DESIGN-SYSTEM-REFERENCE.md"
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
3. `copilot-chain-advance.yml` activates next wave (`ds-02`, `ds-03`)
4. Branch auto-deleted

**E2E Tests to Run**:
- `e2e/specs/route-health.spec.ts` — smoke
- N/A (doc-only task)
