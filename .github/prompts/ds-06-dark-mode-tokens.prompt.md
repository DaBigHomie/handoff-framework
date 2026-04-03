---
applyTo: "**"
---
# Dark Mode Tokens

**Priority**: priority:p1
**Status**: ⏳ **NOT STARTED**
**Estimated Time**: 4h
**Revenue Impact**: High
**Dependencies**: `ds-04-baseline-audit`
**Tags**: `priority:p1`, `type:feat`, `scope:ui`, `agent:copilot`, `automation:copilot`, `prompt-spec`, `enhancement`

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
cat docs/DS-REFERENCE.md
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

Implement a complete dark mode token system for `@dabighomie/handoff-framework` based on violations catalogued in `docs/DS-AUDIT-BASELINE.md` (Category 4 — Missing Dark Mode Tokens). Define all semantic CSS custom properties (`--color-bg-surface`, `--color-text-primary`, etc.) with light and dark values, wire them through Tailwind's dark mode config, add `dark:` variants to all components lacking them, and expose a `ThemeProvider` (or equivalent) that persists the user's preference to `localStorage`. Zero hardcoded colors must remain in any component after this task.

---

## Pre-Flight Check

```bash
# Verify prerequisite
test -f docs/DS-AUDIT-BASELINE.md || { echo "FAIL: Run ds-04 first"; exit 1; }

# Check current dark mode setup
cat tailwind.config.ts 2>/dev/null || cat tailwind.config.js 2>/dev/null | head -30
grep -rn "darkMode\|dark:" tailwind.config.* 2>/dev/null

# Check for existing CSS custom properties
grep -rn "\-\-color\|\-\-bg\|\-\-text" src/ --include="*.css" --include="*.tsx" 2>/dev/null | grep -v node_modules | head -20

# Check for theme provider / context
find src/ -name "*[Tt]heme*" -o -name "*[Tt]oken*" 2>/dev/null | grep -v node_modules | head -10

# Count components missing dark: variants (from audit)
grep -c "Missing Dark Mode\|dark:" docs/DS-AUDIT-BASELINE.md 2>/dev/null || echo "Check DS-AUDIT-BASELINE for count"

# Check localStorage usage
grep -rn "localStorage\|theme\|color-scheme" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | head -10
```

---

## Intended Result

The project has a complete semantic dark mode token system:
- `src/styles/tokens.css` defines all `--color-*` custom properties with `:root` (light) and `[data-theme="dark"]` (dark) values
- `tailwind.config.ts` has `darkMode: ["class", "[data-theme='dark']"]`
- A `ThemeProvider` component wraps the app and exposes `useTheme()` hook with `{ theme, toggleTheme }` 
- `localStorage` persists the user's choice under key `"theme"`
- All components identified in `DS-AUDIT-BASELINE.md` Category 4 now have `dark:` Tailwind variants
- Zero components contain hardcoded hex/rgb — all use semantic token classes

---

## Files to Modify/Create

| File | Action | Exists? | Purpose |
|------|--------|---------|---------|
| `src/styles/tokens.css` | CREATE | Verify | All semantic CSS custom properties |
| `tailwind.config.ts` | MODIFY | Verify | Enable class-based dark mode |
| `src/components/ThemeProvider.tsx` | CREATE | Verify | Theme context + localStorage persistence |
| `src/components/ThemeToggle.tsx` | CREATE | Verify | UI control for theme switching |
| `src/components/index.ts` | MODIFY | Verify | Export ThemeProvider, ThemeToggle |
| All Category 4 components (from audit) | MODIFY | Yes | Add dark: variants |
| `docs/DS-AUDIT-BASELINE.md` | MODIFY | Yes | Mark Category 4 as resolved |

---

## data-testid Contracts

| testid | Action | Used By |
|--------|--------|---------|
| `theme-toggle` | ADD | E2E dark mode tests |
| `theme-provider` | ADD | E2E theme persistence tests |

---

## Blast Radius

```bash
# All components affected by dark mode token addition
grep -rn "bg-\|text-\|border-" src/ --include="*.tsx" 2>/dev/null | grep -v "dark:\|node_modules" | awk -F: '{print $1}' | sort -u

# Files importing tailwind config
grep -rn "tailwind.config" . --include="*.ts" --include="*.js" 2>/dev/null | grep -v node_modules

# Files using CSS custom properties
grep -rn "\-\-color\|var(--" src/ --include="*.css" --include="*.tsx" 2>/dev/null | grep -v node_modules | awk -F: '{print $1}' | sort -u
```

---

## A11y Checklist

- [ ] Dark mode colors meet WCAG AA contrast (4.5:1 for text, 3:1 for UI elements)
- [ ] `ThemeToggle` has `aria-label="Toggle dark mode"` and `aria-pressed={isDark}`
- [ ] `color-scheme: dark` meta is set when dark mode is active (improves system UI)
- [ ] Focus rings are visible in both light and dark mode

---

## Design System Safety

> ⚠️ Read `docs/DS-REFERENCE.md` before making ANY token change.

**Forbidden patterns** (agent must refuse):
- Hardcoded hex colors anywhere in component files
- Using `dark:text-gray-100` instead of semantic `dark:text-content-primary`
- Raw `localStorage` access outside `ThemeProvider`

```bash
# Verify no hardcoded hex after migration
grep -rn "#[0-9a-fA-F]\{3,6\}" src/ --include="*.tsx" --include="*.css" 2>/dev/null | grep -v node_modules && echo "FAIL: hardcoded hex remains" || echo "PASS"
```

---

## Success Criteria

`src/styles/tokens.css` exists with light and dark values for all token categories (color, bg, border, shadow). `tailwind.config.ts` uses `darkMode: ["class", "[data-theme='dark']"]`. `ThemeProvider` works — toggling via `ThemeToggle` switches theme, `localStorage` persists across page reloads. All Category 4 components from the audit have `dark:` variants. Zero hardcoded colors remain in any migrated file.

---

## Testing Checklist

```bash
#!/bin/bash
# Verify tokens.css exists
test -f src/styles/tokens.css || { echo "FAIL: tokens.css missing"; exit 1; }

# Verify dark mode values present
grep -q "\[data-theme.*dark\]\|\.dark " src/styles/tokens.css || grep -q "darkMode" tailwind.config.ts 2>/dev/null || { echo "FAIL: Dark mode tokens missing"; exit 1; }

# Verify ThemeProvider exists
THEME_FILE=$(find src/ -name "ThemeProvider.tsx" 2>/dev/null | grep -v node_modules | head -1)
test -n "$THEME_FILE" || { echo "FAIL: ThemeProvider.tsx missing"; exit 1; }

# Verify no hardcoded hex remains in migrated files
HEX_COUNT=$(grep -rn "#[0-9a-fA-F]\{6\}" src/ --include="*.tsx" --include="*.css" 2>/dev/null | grep -v node_modules | wc -l)
echo "Remaining hardcoded hex values: $HEX_COUNT"

echo "PASS: Dark mode token system complete"
npx tsc --noEmit || exit 1
npm run lint || exit 1
npm run build || exit 1
```

---

## Implementation

```css
/* src/styles/tokens.css */
:root {
  /* Backgrounds */
  --color-bg-surface: #ffffff;
  --color-bg-surface-secondary: #f8f9fa;
  --color-bg-surface-hover: #f1f3f5;

  /* Text */
  --color-text-primary: #0f0f0f;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;

  /* Brand */
  --color-brand-primary: #6366f1;
  --color-brand-primary-hover: #4f46e5;

  /* Borders */
  --color-border-default: #e5e7eb;

  /* Danger */
  --color-danger: #ef4444;
}

[data-theme="dark"] {
  --color-bg-surface: #0f0f0f;
  --color-bg-surface-secondary: #1a1a1a;
  --color-bg-surface-hover: #262626;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-text-muted: #6b7280;
  --color-brand-primary: #818cf8;
  --color-brand-primary-hover: #6366f1;
  --color-border-default: #374151;
  --color-danger: #f87171;
}
```

```tsx
// src/components/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light"
    return (localStorage.getItem("theme") as Theme) ?? "light"
  })

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(t => t === "light" ? "dark" : "light") }}>
      <div data-testid="theme-provider">{children}</div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
```

---

## Reference Implementation

```bash
# Check how other projects handle dark mode in this codebase
grep -rn "dark:\|theme\|color-scheme" src/ --include="*.tsx" --include="*.css" 2>/dev/null | grep -v node_modules | head -20
```

---

## Environment

- **Framework**: Node.js / TypeScript / React
- **Dependencies**: `react`, `react-dom` (existing), `tailwindcss` (verify version)
- **FSD Layer**: `src/styles/` (tokens), `src/components/` (ThemeProvider, ThemeToggle)

---

## Database / Supabase

No DB changes. User theme preference stored in `localStorage` only.

---

## Routes Affected

All routes that render UI components — dark mode applies globally via `[data-theme]` on `<html>`.

---

## Blocking Gate

```bash
test -f docs/DS-AUDIT-BASELINE.md || { echo "BLOCKED: ds-04 (Baseline Audit) must complete first"; exit 1; }
grep -q "Missing Dark Mode\|Category 4" docs/DS-AUDIT-BASELINE.md 2>/dev/null || echo "WARN: No Category 4 violations in audit — verify scope"
echo "PASS: Ready for dark mode token implementation"
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
3. `copilot-chain-advance.yml` activates next wave (unblocks `ds-07` alongside `ds-05`)
4. Branch auto-deleted

**E2E Tests to Run**:
- `e2e/specs/route-health.spec.ts` — smoke
- `e2e/specs/dark-mode.spec.ts` — theme toggle + persistence
