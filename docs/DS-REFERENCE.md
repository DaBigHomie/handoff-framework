# Design System Reference

**Version**: 1.0.0
**Updated**: 2026-04-03
**Repo**: @dabighomie/handoff-framework
**Purpose**: Canonical reference for Design System conventions used in target projects documented by this framework

---

## 1. Token Registry

### Colors

| Token | Light Value | Dark Value | Usage |
|-------|------------|------------|-------|
| `--color-bg-surface` | `#ffffff` | `#0f0f0f` | Page backgrounds |
| `--color-bg-surface-secondary` | `#f8f9fa` | `#1a1a1a` | Card/section backgrounds |
| `--color-bg-surface-hover` | `#f1f3f5` | `#262626` | Hover states |
| `--color-text-primary` | `#0f0f0f` | `#f9fafb` | Body text |
| `--color-text-secondary` | `#6b7280` | `#9ca3af` | Muted/supporting text |
| `--color-text-muted` | `#9ca3af` | `#6b7280` | Disabled/placeholder text |
| `--color-brand-primary` | `#6366f1` | `#818cf8` | Primary CTA, links |
| `--color-brand-primary-hover` | `#4f46e5` | `#6366f1` | Hover on brand primary |
| `--color-on-brand` | `#ffffff` | `#ffffff` | Text on brand backgrounds |
| `--color-border-default` | `#e5e7eb` | `#374151` | Default borders |
| `--color-danger` | `#ef4444` | `#f87171` | Destructive actions |
| `--color-danger-hover` | `#dc2626` | `#ef4444` | Hover on danger |
| `--color-on-danger` | `#ffffff` | `#ffffff` | Text on danger backgrounds |
| `--color-success` | `#22c55e` | `#4ade80` | Success states |
| `--color-warning` | `#f59e0b` | `#fbbf24` | Warning states |

### Tailwind Mapping

| Semantic Class | CSS Variable | Usage |
|---------------|-------------|-------|
| `bg-surface` | `var(--color-bg-surface)` | Page background |
| `bg-surface-secondary` | `var(--color-bg-surface-secondary)` | Elevated surfaces |
| `text-content-primary` | `var(--color-text-primary)` | Body text |
| `text-content-secondary` | `var(--color-text-secondary)` | Supporting text |
| `bg-brand-primary` | `var(--color-brand-primary)` | Primary buttons |
| `border-default` | `var(--color-border-default)` | Borders |

### Spacing

| Token | Value | Tailwind Class |
|-------|-------|----------------|
| `--space-xs` | `0.25rem` (4px) | `p-1`, `m-1` |
| `--space-sm` | `0.5rem` (8px) | `p-2`, `m-2` |
| `--space-md` | `1rem` (16px) | `p-4`, `m-4` |
| `--space-lg` | `1.5rem` (24px) | `p-6`, `m-6` |
| `--space-xl` | `2rem` (32px) | `p-8`, `m-8` |
| `--space-2xl` | `3rem` (48px) | `p-12`, `m-12` |

### Typography

| Token | Size | Weight | Line Height | Tailwind |
|-------|------|--------|-------------|----------|
| `--text-xs` | `0.75rem` | 400 | 1rem | `text-xs` |
| `--text-sm` | `0.875rem` | 400 | 1.25rem | `text-sm` |
| `--text-base` | `1rem` | 400 | 1.5rem | `text-base` |
| `--text-lg` | `1.125rem` | 500 | 1.75rem | `text-lg font-medium` |
| `--text-xl` | `1.25rem` | 600 | 1.75rem | `text-xl font-semibold` |
| `--text-2xl` | `1.5rem` | 700 | 2rem | `text-2xl font-bold` |
| `--text-3xl` | `1.875rem` | 700 | 2.25rem | `text-3xl font-bold` |

### Shadows

| Token | Value | Tailwind |
|-------|-------|----------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | `shadow-sm` |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | `shadow-md` |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | `shadow-lg` |

---

## 2. Component Inventory

> This framework is a CLI documentation tool. The component inventory below is a **reference template** for target projects using this framework.

| Component | Expected Location | Status | Variants |
|-----------|------------------|--------|----------|
| SmartButton | `src/components/SmartButton.tsx` | Reference | primary, secondary, ghost, destructive |
| ThemeProvider | `src/components/ThemeProvider.tsx` | Reference | N/A — context provider |
| ThemeToggle | `src/components/ThemeToggle.tsx` | Reference | N/A — UI control |

### Component Authoring Rules

1. **Every component** must accept `data-testid` prop
2. **Every interactive component** must have `aria-label`
3. **Every component** must use semantic token classes, never hardcoded hex/px
4. **Every component** with animation must check `prefers-reduced-motion`

---

## 3. Animation Rules (GSAP)

### Approved Version
- GSAP core: `^3.12.0`
- Approved plugins: `ScrollTrigger`, `Flip`, `SplitText`
- Forbidden plugins: `MorphSVG`, `DrawSVG` (license required)

### Performance Budget
| Constraint | Limit |
|-----------|-------|
| Max animation duration | 800ms |
| Max micro-interaction duration | 300ms |
| Max concurrent tweens | 10 |
| GPU layers per page | 5 simultaneous |

### Approved Properties
```
✅ transform (x, y, scale, rotate)
✅ opacity
✅ clipPath
✅ filter (blur, brightness)

❌ width, height (triggers layout)
❌ top, left, right, bottom (triggers layout)
❌ margin, padding (triggers layout)
```

### Required Cleanup Pattern
```typescript
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.to(ref.current, { x: 100 })
  })
  return () => ctx.revert() // REQUIRED
}, [])
```

### Accessibility — prefers-reduced-motion
```typescript
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
if (!prefersReduced) {
  gsap.to(el, { y: -20, duration: 0.4 })
}
```

---

## 4. Theming Guide

### Strategy: CSS Custom Properties + Tailwind `darkMode: "class"`

Light/dark values defined in `:root` and `[data-theme="dark"]` selectors in `tokens.css`. Tailwind references these via `theme.extend.colors` in `tailwind.config.ts`.

### Token Naming Convention
```
--color-{category}-{variant}

Categories: bg, text, brand, border, danger, success, warning
Variants: primary, secondary, hover, muted, default, on-{bg}
```

### Theme Switching
- `ThemeProvider` wraps app root
- `useTheme()` hook returns `{ theme, toggleTheme }`
- Persisted to `localStorage` under key `"theme"`
- `[data-theme]` attribute set on `<html>` element
- System preference detected via `prefers-color-scheme` media query

### Dark Mode Checklist for New Components
- [ ] Uses semantic `bg-surface*` not `bg-white/bg-gray-*`
- [ ] Uses semantic `text-content-*` not `text-gray-*`
- [ ] Has `dark:` variants OR uses CSS custom property tokens
- [ ] Focus ring visible in both themes
- [ ] Contrast ratio ≥ 4.5:1 (text), ≥ 3:1 (UI elements)

---

## 5. Authoring Rules

### DO ✅
- Use semantic token classes (`bg-surface`, `text-content-primary`)
- Extend tokens in `tokens.css` with both light and dark values
- Add new components to the Component Inventory table above
- Use `data-testid` on every interactive element
- Check `prefers-reduced-motion` before any animation
- Clean up GSAP contexts with `ctx.revert()` in `useEffect` cleanup

### DON'T ❌
- Use hardcoded hex colors (`#fff`, `#1a2b3c`)
- Use hardcoded pixel values (`16px`, `margin: 8px`)
- Use `rgb()` / `rgba()` directly in components
- Use inline `style={{ }}` for colors or spacing
- Animate layout properties (width, height, top, left)
- Skip GSAP cleanup in React components
- Use non-semantic Tailwind classes (`bg-gray-100` instead of `bg-surface`)

### Adding a New Token
1. Add CSS custom property to `src/styles/tokens.css` in both `:root` and `[data-theme="dark"]`
2. Add Tailwind mapping in `tailwind.config.ts` → `theme.extend.colors`
3. Add entry to Token Registry table in this document
4. Run `npm run ds:lint` to verify no regressions

### Adding a New Component
1. Create in `src/components/`
2. Export from `src/components/index.ts` barrel
3. Use only semantic token classes
4. Add `data-testid` attribute
5. Add to Component Inventory table above
6. Write unit test with variant coverage

---

## 6. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-03 | Initial DS reference — tokens, components, GSAP, theming, authoring rules |
