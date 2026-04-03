---
applyTo: "**"
---
# Update DS-WORKFLOW (GSAP Rules)

**Priority**: priority:p1
**Status**: ⏳ **NOT STARTED**
**Estimated Time**: 2h
**Revenue Impact**: Medium
**Dependencies**: `ds-01-create-ds-reference-doc`
**Tags**: `priority:p1`, `type:chore`, `scope:ui`, `agent:copilot`, `automation:copilot`, `prompt-spec`, `documentation`

---

## Agent Bootstrap

> ⚠️ The agent executing this prompt MUST load these files first:

```bash
# 1. Repo instructions (mandatory)
cat .github/copilot-instructions.md
cat AGENTS.md

# 2. Path-specific instructions (load all matching)
ls .github/instructions/*.instructions.md

# 3. DS Reference (prerequisite — must exist)
cat docs/DESIGN-SYSTEM-REFERENCE.md

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

Locate the DS-WORKFLOW document (or equivalent workflow file governing Design System usage in this repo) and update it with comprehensive **GSAP rules** derived from `docs/DESIGN-SYSTEM-REFERENCE.md`. The GSAP rules must specify: approved GSAP plugins, version pinning strategy, performance budget per animation, forbidden usage patterns (e.g., animating layout properties), required `will-change` cleanup, and how GSAP integrates with the dark mode token system. This ensures every agent working on animations uses a consistent, performant, and accessible approach.

---

## Pre-Flight Check

```bash
# Find the DS-WORKFLOW document
find . -name "*DS-WORKFLOW*" -o -name "*ds-workflow*" -o -name "*design-system-workflow*" 2>/dev/null | grep -v node_modules

# Find any existing GSAP references
grep -rn "gsap\|GSAP\|GreenSock\|ScrollTrigger\|gsap.to\|gsap.from" . --include="*.md" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | head -30

# Check docs directory structure
ls -la docs/ 2>/dev/null
find docs/ -name "*.md" 2>/dev/null | head -20

# Verify prerequisite
test -f docs/DESIGN-SYSTEM-REFERENCE.md && echo "PASS: DS-REFERENCE.md exists" || echo "FAIL: Run ds-01 first"
```

---

## Intended Result

A `docs/DS-WORKFLOW.md` file exists (created if absent, updated if present) with a dedicated **GSAP Rules** section containing:
- Approved GSAP version (`^3.x.x`) and plugin whitelist
- Performance budget: max animation duration, max concurrent tweens
- Forbidden patterns: animating `width`, `height`, `top`, `left` (use `transform` only)
- Required cleanup: `ctx.revert()` in React `useEffect` cleanup
- Dark mode integration: how to swap GSAP targets when theme changes
- Accessibility: `prefers-reduced-motion` detection and fallback pattern
- Code examples for each rule

---

## Files to Modify/Create

| File | Action | Exists? | Purpose |
|------|--------|---------|---------|
| `docs/DS-WORKFLOW.md` | CREATE or MODIFY | Verify | Add/update GSAP rules section |
| `docs/DESIGN-SYSTEM-REFERENCE.md` | READ ONLY | Yes (ds-01) | Source rules for GSAP section |

---

## data-testid Contracts

| testid | Action | Used By |
|--------|--------|---------|
| N/A | — | Doc-only task |

---

## Blast Radius

```bash
# Find all files referencing DS-WORKFLOW
grep -rn "DS-WORKFLOW\|ds-workflow" . --include="*.md" --include="*.ts" 2>/dev/null | grep -v node_modules

# Find all existing GSAP usage that these rules will govern
grep -rn "gsap\|GSAP" src/ 2>/dev/null | grep -v node_modules | head -20
```

---

## A11y Checklist

- [ ] GSAP rules include mandatory `prefers-reduced-motion` check pattern
- [ ] Reduced-motion fallback examples are documented with code snippets
- [ ] No animations on `opacity: 0` content that would hide from screen readers

---

## Design System

- [ ] GSAP rules specify use of CSS custom properties (design tokens) as tween targets, not raw hex
- [ ] Dark mode token swapping during animations is documented
- [ ] `will-change` usage rules prevent GPU memory leaks

---

## Success Criteria

`docs/DS-WORKFLOW.md` contains a GSAP Rules section with all eight sub-sections: approved plugins, version pinning, performance budget, forbidden patterns, cleanup requirements, dark mode integration, accessibility requirements, and code examples. Every rule has at least one correct and one incorrect example. The document cross-references `docs/DESIGN-SYSTEM-REFERENCE.md` for token authority.

---

## Testing Checklist

```bash
#!/bin/bash
# Verify DS-WORKFLOW exists
test -f docs/DS-WORKFLOW.md || { echo "FAIL: DS-WORKFLOW.md missing"; exit 1; }

# Verify GSAP Rules section exists
grep -q "GSAP Rules\|gsap.rules\|GSAP rules" docs/DS-WORKFLOW.md || { echo "FAIL: GSAP Rules section missing"; exit 1; }

# Verify prefers-reduced-motion is documented
grep -q "prefers-reduced-motion" docs/DS-WORKFLOW.md || { echo "FAIL: Accessibility motion rule missing"; exit 1; }

# Verify cleanup pattern is documented
grep -q "revert\|cleanup\|useEffect" docs/DS-WORKFLOW.md || { echo "FAIL: Cleanup pattern missing"; exit 1; }

echo "PASS: DS-WORKFLOW GSAP rules complete"
npx tsc --noEmit || exit 1
npm run lint || exit 1
npm run build || exit 1
```

---

## Implementation

```markdown
## GSAP Rules (DS-WORKFLOW.md section)

### Approved GSAP Plugins
- `gsap` core — always allowed
- `ScrollTrigger` — allowed with cleanup requirement
- `Flip` — allowed for layout animations only
- `SplitText` — allowed for text reveals

### Forbidden Plugins
- `MorphSVG` — license required, not bundled
- `DrawSVG` — license required, not bundled

### Performance Budget
- Max animation duration: 800ms (300ms for micro-interactions)
- Max concurrent tweens: 10
- GPU layer budget: call `gsap.set(el, { willChange: "transform" })` only when animation starts; revert with `willChange: "auto"` when done

### Forbidden Animation Properties
```ts
// ❌ Never animate layout properties
gsap.to(el, { width: "200px", left: "50px" }) 

// ✅ Animate transform only
gsap.to(el, { x: 50, scaleX: 1.2 })
```

### Required Cleanup (React)
```ts
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.to(ref.current, { x: 100 })
  })
  return () => ctx.revert() // REQUIRED — no exceptions
}, [])
```

### Accessibility — prefers-reduced-motion
```ts
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
if (!prefersReduced) {
  gsap.to(el, { y: -20, duration: 0.4 })
}
```
```

---

## Reference Implementation

```bash
# Find existing GSAP patterns in codebase to document as reference
grep -rn "gsap.context\|ctx.revert\|ScrollTrigger" src/ 2>/dev/null | grep -v node_modules
grep -rn "prefers-reduced-motion" src/ 2>/dev/null | grep -v node_modules
```

---

## Environment

- **Framework**: Node.js / TypeScript
- **Dependencies**: `gsap ^3.x.x` (document version used)
- **FSD Layer**: `docs/` — documentation layer

---

## Database / Supabase

No DB changes. Documentation task only.

---

## Routes Affected

None.

---

## Blocking Gate

```bash
# ds-01 must be complete
test -f docs/DESIGN-SYSTEM-REFERENCE.md || { echo "BLOCKED: ds-01 (Create DS reference doc) must complete first"; exit 1; }
echo "PASS: Prerequisite satisfied"
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
3. `copilot-chain-advance.yml` activates next wave (unblocks `ds-04` alongside `ds-02`)
4. Branch auto-deleted

**E2E Tests to Run**:
- `e2e/specs/route-health.spec.ts` — smoke
- N/A (doc task)
