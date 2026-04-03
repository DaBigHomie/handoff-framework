---
applyTo: "**"
---
# Smart Button Migration

**Priority**: priority:p1
**Status**: ⏳ **NOT STARTED**
**Estimated Time**: 4h
**Revenue Impact**: High
**Dependencies**: `ds-04-baseline-audit`
**Tags**: `priority:p1`, `type:refactor`, `scope:ui`, `agent:copilot`, `automation:copilot`, `prompt-spec`, `enhancement`

---

## Agent Bootstrap

> ⚠️ The agent executing this prompt MUST load these files first:

```bash
# 1. Repo instructions (mandatory)
cat .github/copilot-instructions.md
cat AGENTS.md

# 2. Path-specific instructions (load all matching)
ls .github/instructions/*.instructions.md

# 3. DS authority docs (all must exist)
cat docs/DESIGN-SYSTEM-REFERENCE.md
cat docs/DS-WORKFLOW.md
cat docs/DS-AUDIT-BASELINE.md

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

Migrate all button components identified in `docs/DS-AUDIT-BASELINE.md` (Category 1 — hardcoded colors, and any button-specific violations) to use a unified, token-based `SmartButton` component. The `SmartButton` must: consume only DS tokens (no hardcoded hex/px), support all existing button variants (primary, secondary, ghost, destructive), include GSAP-powered hover/press micro-interactions that respect `prefers-reduced-motion`, and expose consistent `data-testid` contracts for E2E testing. All existing button usages across the codebase must be updated to use `SmartButton`.

---

## Pre-Flight Check

```bash
# Verify prerequisite
test -f docs/DS-AUDIT-BASELINE.md || { echo "FAIL: Run ds-04 first"; exit 1; }

# Find all existing button implementations
find src/ -name "*[Bb]utton*" -o -name "*[Bb]tn*" 2>/dev/null | grep -v node_modules
grep -rn "button\|Button" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules\|\.test\." | grep "import\|export" | head -20

# Find all button usages that need migration
grep -rn "<[Bb]utton\|<[Bb]tn" src/ --include="*.tsx" 2>/dev/null | grep -v node_modules | wc -l

# Check existing variant patterns
grep -rn "variant\|primary\|secondary\|ghost\|destructive" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -i "button" | head -20

# Check for existing GSAP in button files
grep -rn "gsap\|hover\|onMouseEnter" src/ --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -i "button" | head -10
```

---

## Intended Result

A `SmartButton` component exists at the path discovered by Pre-Flight (or `src/components/SmartButton.tsx` if none exists). It:
- Accepts `variant: 'primary' | 'secondary' | 'ghost' | 'destructive'` prop
- Uses only DS token Tailwind classes — zero hardcoded colors or px values
- Has GSAP hover animation (scale + shadow) that skips if `prefers-reduced-motion` is set
- Has `data-testid="smart-button"` and `data-variant={variant}` attributes
- Is exported from a barrel file
- Is used everywhere the old button was used (all old button imports replaced)
- TypeScript types are fully defined with no `any`

---

## Files to Modify/Create

| File | Action | Exists? | Purpose |
|------|--------|---------|---------|
| `src/components/SmartButton.tsx` | CREATE | Verify (Pre-Flight) | Unified token-based button component |
| `src/components/index.ts` | MODIFY | Verify | Export SmartButton from barrel |
| `src/components/SmartButton.test.tsx` | CREATE | No | Unit tests for SmartButton |
| All files using old `<Button>` | MODIFY | Yes | Replace with `<SmartButton>` |
| `docs/DS-AUDIT-BASELINE.md` | MODIFY | Yes | Mark button violations as resolved |

---

## data-testid Contracts

| testid | Action | Used By |
|--------|--------|---------|
| `smart-button` | ADD | All E2E tests clicking buttons |
| `smart-button-primary` | ADD | Primary CTA E2E tests |
| `smart-button-secondary` | ADD | Secondary action E2E tests |
| `smart-button-ghost` | ADD | Ghost/tertiary action tests |
| `smart-button-destructive` | ADD | Delete/danger action tests |

---

## Blast Radius

```bash
# Find all files that import or render Button (will need migration)
grep -rn "import.*[Bb]utton\|from.*[Bb]utton\|<[Bb]utton" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | awk -F: '{print $1}' | sort -u

# Verify no hardcoded colors remain in button files after migration
grep -rn "#[0-9a-fA-F]\{3,6\}" src/ --include="*.tsx" 2>/dev/null | grep -i "button\|btn" | grep -v node_modules
```

---

## A11y Checklist

- [ ] `SmartButton` has `type="button"` by default (prevents accidental form submission)
- [ ] `aria-disabled` used when button is disabled (not just `disabled` attribute alone)
- [ ] GSAP animation does NOT affect button text readability
- [ ] Focus ring is visible and uses DS token color (not browser default)
- [ ] `role="button"` not needed (it's a native `<button>`)

---

## Design System Safety

> ⚠️ Read `docs/DESIGN-SYSTEM-REFERENCE.md` before making ANY styling change.

**Forbidden patterns** (agent must refuse):
- Hardcoded hex colors: `#fff`, `#1a2b3c`, `rgb(...)`, `rgba(...)`
- Hardcoded pixel values: `16px`, `margin: 8px`
- GSAP animations not listed in DS-WORKFLOW.md § GSAP Rules

```bash
# Post-migration safety check
grep -rn "#[0-9a-fA-F]\{3,6\}" src/components/SmartButton.tsx 2>/dev/null && echo "FAIL: hardcoded hex" || echo "PASS"
grep -rn "[0-9]\+px[^-a-zA-Z]" src/components/SmartButton.tsx 2>/dev/null && echo "FAIL: hardcoded px" || echo "PASS"
```

---

## Success Criteria

`SmartButton` component exists and passes TypeScript compilation. All `variant` values render with correct DS token classes. GSAP hover animation works and is skipped for `prefers-reduced-motion`. Zero hardcoded hex/px in the component file. All old button usages are migrated. Tests pass. The button violation rows in `DS-AUDIT-BASELINE.md` are marked as resolved.

---

## Testing Checklist

```bash
#!/bin/bash
# Verify SmartButton file exists
BUTTON_FILE=$(find src/ -name "SmartButton.tsx" 2>/dev/null | grep -v node_modules | head -1)
test -n "$BUTTON_FILE" || { echo "FAIL: SmartButton.tsx not found"; exit 1; }

# Verify no hardcoded values in SmartButton
grep -n "#[0-9a-fA-F]\{3,6\}" "$BUTTON_FILE" && { echo "FAIL: hardcoded hex in SmartButton"; exit 1; } || echo "PASS: no hardcoded hex"
grep -n "[0-9]\+px[^-]" "$BUTTON_FILE" && { echo "FAIL: hardcoded px in SmartButton"; exit 1; } || echo "PASS: no hardcoded px"

# Verify data-testid exists
grep -q "data-testid\|smart-button" "$BUTTON_FILE" || { echo "FAIL: Missing data-testid"; exit 1; }

# Verify prefers-reduced-motion handling
grep -q "prefers-reduced-motion" "$BUTTON_FILE" || { echo "FAIL: Missing reduced motion check"; exit 1; }

echo "PASS: SmartButton migration complete"
npx tsc --noEmit || exit 1
npm run lint || exit 1
npm run build || exit 1
npm test -- --testPathPattern="SmartButton" 2>/dev/null || echo "WARN: No SmartButton tests found"
```

---

## Implementation

```tsx
// src/components/SmartButton.tsx
import { useRef, useEffect } from "react"
import gsap from "gsap"

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive"

interface SmartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: React.ReactNode
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-brand-primary text-on-brand hover:bg-brand-primary-hover",
  secondary: "bg-surface-secondary text-content-primary hover:bg-surface-secondary-hover",
  ghost: "bg-transparent text-content-primary hover:bg-surface-hover",
  destructive: "bg-danger text-on-danger hover:bg-danger-hover",
}

export function SmartButton({ variant = "primary", children, ...props }: SmartButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const prefersReduced = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false

  useEffect(() => {
    if (prefersReduced || !ref.current) return
    const ctx = gsap.context(() => {
      const el = ref.current!
      el.addEventListener("mouseenter", () => gsap.to(el, { scale: 1.03, duration: 0.15 }))
      el.addEventListener("mouseleave", () => gsap.to(el, { scale: 1, duration: 0.15 }))
    })
    return () => ctx.revert()
  }, [prefersReduced])

  return (
    <button
      ref={ref}
      type="button"
      data-testid="smart-button"
      data-variant={variant}
      className={`rounded-md px-4 py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:opacity-50 ${VARIANT_CLASSES[variant]}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

---

## Reference Implementation

```bash
# Check how existing buttons are structured for migration reference
find src/ -name "*[Bb]utton*.tsx" 2>/dev/null | grep -v node_modules | xargs head -40 2>/dev/null
```

---

## Environment

- **Framework**: Node.js / TypeScript / React
- **Dependencies**: `gsap ^3.x.x`, `react`, `react-dom`
- **FSD Layer**: `src/components/` — shared UI component layer

---

## Database / Supabase

No DB changes.

---

## Routes Affected

All routes that render button elements — verify with blast-radius grep above.

---

## Blocking Gate

```bash
test -f docs/DS-AUDIT-BASELINE.md || { echo "BLOCKED: ds-04 (Baseline Audit) must complete first"; exit 1; }
grep -q "button\|Button\|btn" docs/DS-AUDIT-BASELINE.md 2>/dev/null || echo "WARN: No button violations in audit — verify scope"
echo "PASS: Ready for SmartButton migration"
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
3. `copilot-chain-advance.yml` activates next wave (unblocks `ds-07` alongside `ds-06`)
4. Branch auto-deleted

**E2E Tests to Run**:
- `e2e/specs/route-health.spec.ts` — smoke
- `e2e/specs/smart-button.spec.ts` — button interaction smoke
