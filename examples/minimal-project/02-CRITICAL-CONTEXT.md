# Critical Context — Minimal Project Example

**Project**: minimal-project (example)
**Framework Version**: 1.0.0
**Last Updated**: 2026-02-10

---

## Overview

This document contains **must-know information** for working on this project:
- Gotchas (things that trip up new developers)
- Known issues (bugs, limitations)
- Critical decisions (why things are done this way)
- Environment-specific context (deployment, config)

**Read time**: ~2 minutes  
**Token count**: ~500 tokens

---

## Gotchas

### 1. TypeScript Strict Mode Enabled

**Issue**: `tsconfig.json` has `"strict": true`

**Impact**: All code must have explicit types, no `any` allowed

**Fix**: Always define types for props, state, functions

**Example**:
```typescript
// ❌ WRONG — Type error in strict mode
function greet(name) { return "Hello " + name; }

// ✅ CORRECT
function greet(name: string): string { return "Hello " + name; }
```

---

### 2. No Backend/Database

**Issue**: This is a **static site** — No API, no database, no authentication

**Impact**: All data must be:
- Hardcoded in components
- Fetched from public APIs (if needed)
- Stored in localStorage (client-side only)

**Example**:
```typescript
// ❌ WRONG — No backend to call
fetch('/api/users')

// ✅ CORRECT — Use public API or hardcode
const users = [{ id: 1, name: 'John' }]
// OR
fetch('https://jsonplaceholder.typicode.com/users')
```

---

### 3. Vite Dev Server Port

**Issue**: Vite runs on port `5173` by default (not `3000`)

**Impact**: Always use `http://localhost:5173` in development

**Fix**: Update `.env` if you want a different port:
```bash
# .env
VITE_PORT=3000
```

---

## Known Issues

**NONE** — No open bugs

**Past issues** (resolved):
- Mobile header overflow on 375px → Fixed 2026-02-08
- Theme not persisting → Fixed with useLocalStorage hook 2026-02-07

---

## Critical Decisions

### Decision 1: Why No Backend?

**Context**: This is a minimal example project

**Decision**: Keep it simple — Static site only

**Rationale**:
- Easier to deploy (Vercel free tier)
- No maintenance overhead (no server, no database)
- Demonstrates framework scales down to small projects

**Trade-off**: Can't have user authentication, data persistence, server-side logic

**Date**: 2026-02-06

---

### Decision 2: Why Tailwind CSS?

**Context**: Need a styling solution

**Decision**: Use Tailwind CSS utility classes

**Rationale**:
- Fast development (no custom CSS)
- Consistent design system
- Smaller bundle size than Bootstrap

**Trade-off**: HTML can get verbose with many classes

**Date**: 2026-02-06

---

### Decision 3: Why Client-Side Routing?

**Context**: Multi-page site with navigation

**Decision**: Use React Router (client-side) instead of Next.js (server-side)

**Rationale**:
- Simpler setup (no server required)
- Faster client-side navigation
- Fits static site architecture

**Trade-off**: No SEO benefits of server-side rendering (acceptable for prototype)

**Date**: 2026-02-06

---

## Environment-Specific Context

### Development

```bash
npm install
npm run dev  # Runs on http://localhost:5173
```

**Port**: 5173 (Vite default)

**Hot reload**: Enabled (Vite HMR)

**TypeScript checking**: *Not automatic* — Run `npx tsc --noEmit` manually

---

### Production (Vercel)

**Build command**: `npm run build`

**Output directory**: `dist/`

**Environment variables**: None required

**URL**: https://minimal-project.vercel.app

**Auto-deploy**: Enabled on `main` branch push

---

## Quality Gate Requirements

**Before deploying**:

1. ✅ TypeScript: `npx tsc --noEmit` → 0 errors
2. ✅ ESLint: `npm run lint` → 0 errors
3. ✅ Build: `npm run build` → Success
4. ✅ Manual browser test (no console errors)
5. ✅ Mobile test (375x667 viewport)

**All must pass** — No exceptions

---

## Handoff Constraints

**For new agent joining**:

1. **Read all 3 handoff docs** (you're reading the last one)
2. **Verify quality gates pass** before making changes
3. **Ask user before deploying** (this is a production site)
4. **Test on mobile** (significant portion of users on mobile)

---

## Common Mistakes to Avoid

1. **Assuming there's a backend** — There isn't. Everything is client-side.
2. **Skipping TypeScript check** — Dev server doesn't type-check. Run `npx tsc --noEmit` manually.
3. **Not testing mobile** — Always test at 375px width (iPhone SE).
4. **Deploying without quality gates** — All gates must pass first.

---

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev  # http://localhost:5173

# Quality gates (run before commit)
npx tsc --noEmit  # TypeScript
npm run lint      # ESLint
npm run build     # Build

# Testing
npm run test      # Run all tests
npm run test:ui   # Vitest UI

# Deployment (automatic via Vercel)
git push origin main  # Auto-deploys to production
```

---

## Emergency Rollback

If deployment breaks production:

```bash
# Revert last commit
git revert HEAD
git push origin main  # Auto-deploys rollback

# Or deploy previous version manually in Vercel dashboard
# Settings → Deployments → [Select previous deployment] → Promote to Production
```

---

**Framework Version**: 1.0.0  
**Last Updated**: 2026-02-10  
**Token Count**: ~500 tokens
