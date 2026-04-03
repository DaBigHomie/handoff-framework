# Design System Workflow

**Version**: 1.0.0
**Updated**: 2026-04-03
**Authority**: `docs/DS-REFERENCE.md`

---

## Overview

This document governs the workflow for making Design System changes in projects documented by the handoff framework. It covers GSAP animation rules, component authoring flow, token management, and review gates.

---

## GSAP Rules

### 1. Approved Plugins

| Plugin | Status | Notes |
|--------|--------|-------|
| `gsap` (core) | ✅ Approved | Always available |
| `ScrollTrigger` | ✅ Approved | Requires cleanup via `ScrollTrigger.kill()` |
| `Flip` | ✅ Approved | Layout animations only |
| `SplitText` | ✅ Approved | Text reveal animations |
| `MorphSVG` | ❌ Forbidden | Club GreenSock license required |
| `DrawSVG` | ❌ Forbidden | Club GreenSock license required |
| `MotionPath` | ⚠️ Restricted | Needs team approval before use |

### 2. Version Pinning

```json
{
  "gsap": "^3.12.0"
}
```

- **Pin to major `3.x`** — do not upgrade to 4.x without team review
- Lock file must include exact resolved version
- Update only via dedicated dependency PR, never bundled with feature work

### 3. Performance Budget

| Metric | Limit | Enforcement |
|--------|-------|-------------|
| Max animation duration | 800ms | Code review + ds-lint |
| Max micro-interaction | 300ms | Code review |
| Max concurrent tweens | 10 | Runtime monitoring |
| GPU layers (`will-change`) | 5 per page | ds-lint warning |

**`will-change` lifecycle**:
```typescript
// ✅ Correct — set on animation start, clear on complete
gsap.set(el, { willChange: "transform" })
gsap.to(el, {
  x: 100,
  onComplete: () => gsap.set(el, { willChange: "auto" })
})

// ❌ Wrong — permanent will-change in CSS
.animated { will-change: transform; } /* GPU memory leak */
```

### 4. Forbidden Animation Properties

```typescript
// ❌ NEVER animate layout properties — triggers expensive reflow
gsap.to(el, { width: "200px" })       // ❌
gsap.to(el, { height: "100px" })      // ❌
gsap.to(el, { top: "50px" })          // ❌
gsap.to(el, { left: "100px" })        // ❌
gsap.to(el, { margin: "20px" })       // ❌
gsap.to(el, { padding: "10px" })      // ❌

// ✅ ALWAYS use transform properties — GPU-accelerated, no reflow
gsap.to(el, { x: 100 })               // ✅ translateX
gsap.to(el, { y: -20 })               // ✅ translateY
gsap.to(el, { scale: 1.1 })           // ✅ scale
gsap.to(el, { rotation: 45 })         // ✅ rotate
gsap.to(el, { opacity: 0.5 })         // ✅ opacity (composited)
gsap.to(el, { clipPath: "inset(0)" }) // ✅ clip-path
```

### 5. Required Cleanup (React)

Every GSAP animation in a React component **MUST** use `gsap.context()` and call `ctx.revert()` in the cleanup function. No exceptions.

```typescript
// ✅ Correct cleanup pattern
import { useEffect, useRef } from "react"
import gsap from "gsap"

function AnimatedComponent() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(ref.current, { x: 100, duration: 0.5 })
    })
    return () => ctx.revert() // MANDATORY cleanup
  }, [])

  return <div ref={ref}>Animated</div>
}

// ❌ Missing cleanup — memory leak, zombie animations
useEffect(() => {
  gsap.to(ref.current, { x: 100 }) // NO ctx, NO cleanup
}, [])
```

**ScrollTrigger cleanup**:
```typescript
useEffect(() => {
  const ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: ref.current,
      start: "top center",
      onEnter: () => gsap.to(ref.current, { opacity: 1 })
    })
  })
  return () => ctx.revert() // kills ScrollTrigger instances too
}, [])
```

### 6. Dark Mode Integration

When animating color-related properties, use CSS custom property values from `tokens.css` so theme changes apply automatically:

```typescript
// ✅ Animate to token value — respects current theme
gsap.to(el, {
  backgroundColor: "var(--color-bg-surface-secondary)",
  color: "var(--color-text-primary)",
  duration: 0.3
})

// ❌ Hardcoded color — breaks in dark mode
gsap.to(el, {
  backgroundColor: "#f8f9fa",  // only correct in light mode
  duration: 0.3
})
```

**Theme change during animation**: If the user toggles theme mid-animation, the CSS custom property values update automatically. No special handling needed for transform-based animations.

### 7. Accessibility — prefers-reduced-motion

**Every animation** must check for the user's motion preference. This is a WCAG 2.1 Level AA requirement.

```typescript
// ✅ Correct — respect user preference
function useAnimateIn(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReduced) {
      // Skip animation, show final state immediately
      gsap.set(ref.current, { opacity: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.from(ref.current, { opacity: 0, y: 20, duration: 0.5 })
    })
    return () => ctx.revert()
  }, [])
}

// ❌ Wrong — ignores user preference
useEffect(() => {
  gsap.from(ref.current, { opacity: 0, y: 20 }) // runs regardless
}, [])
```

**Reduced-motion fallback strategy**:
- **Fade-in**: Replace with instant `opacity: 1`
- **Slide-in**: Replace with instant position set
- **Hover micro-interactions**: Disable completely
- **Loading spinners**: Keep (functional, not decorative)
- **ScrollTrigger reveals**: Replace with visible-by-default

### 8. Code Examples Summary

| Pattern | Correct | Incorrect |
|---------|---------|-----------|
| Cleanup | `ctx.revert()` in useEffect cleanup | No cleanup function |
| Properties | `x`, `y`, `scale`, `opacity` | `width`, `height`, `top` |
| Colors | `var(--color-brand-primary)` | `#6366f1` |
| Duration | `≤ 800ms` | `> 800ms` |
| Motion pref | Check `prefers-reduced-motion` | Animate unconditionally |
| GPU | Set/unset `willChange` per animation | Permanent CSS `will-change` |
| Plugins | `ScrollTrigger`, `Flip` | `MorphSVG`, `DrawSVG` |

---

## Component Authoring Workflow

### New Component Checklist

1. Create file in `src/components/ComponentName.tsx`
2. Define TypeScript interface for all props
3. Use only semantic token classes (see `docs/DS-REFERENCE.md` § Token Registry)
4. Add `data-testid` attribute with kebab-case name
5. Add `aria-label` to interactive elements
6. Check `prefers-reduced-motion` if animated
7. Clean up GSAP with `ctx.revert()` if animated
8. Export from barrel `src/components/index.ts`
9. Write tests covering all variants
10. Update Component Inventory in DS-REFERENCE.md

### Token Change Workflow

1. Add variable to `src/styles/tokens.css` (both `:root` and `[data-theme="dark"]`)
2. Map in `tailwind.config.ts` → `theme.extend.colors`
3. Update Token Registry in `docs/DS-REFERENCE.md`
4. Run `npm run ds:lint` to verify
5. Commit with `type:refactor` or `type:feat` label

---

## Review Gates

| Gate | When | Checks |
|------|------|--------|
| `ds-lint.sh` | Pre-commit + CI | Hardcoded hex, px, GSAP violations |
| `ds-token-coverage.mts` | CI | All components use token classes |
| Code review | PR | GSAP cleanup, a11y, dark mode |
| Visual review | PR | Screenshots in both themes |
