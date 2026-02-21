# Master Index — Minimal Project Example

**Project**: minimal-project (example)
**Purpose**: Demonstrate bare minimum handoff framework setup
**Framework Version**: 1.0.0
**Last Updated**: 2026-02-10

---

## Overview

This is a **minimal example** showing the smallest viable handoff framework adoption. It contains only the 3 required documents:

- `00-MASTER-INDEX.md` (this file) — Navigation hub
- `01-PROJECT-STATE.md` — Current state, metrics, quality gates
- `02-CRITICAL-CONTEXT.md` — Gotchas, known issues, critical decisions

**Use case**: Small projects, prototypes, or projects with simple requirements

---

## Quick Start

**For new agent joining this project**:

1. **Read this file first** — Get overview and navigation
2. **Read 01-PROJECT-STATE.md** — Understand current state, quality gates
3. **Read 02-CRITICAL-CONTEXT.md** — Learn gotchas and critical constraints
4. **Start working** — You now have enough context

**Estimated read time**: 5-10 minutes  
**Total token count**: ~3,000 tokens (under budget)

---

## Project Context

**Tech Stack**:
- React 18
- TypeScript
- Vite
- No database (static site)

**Team Size**: 1-2 developers

**Deployment**: Vercel (static hosting)

**Status**: ✅ Production (minimal feature set)

---

## Document Index

| Document | Purpose | Tokens | Priority |
|----------|---------|--------|----------|
| [00-MASTER-INDEX.md](00-MASTER-INDEX.md) | Navigation hub, quick start | ~1,000 | 🔴 MUST READ |
| [01-PROJECT-STATE.md](01-PROJECT-STATE.md) | Current state, quality gates | ~1,500 | 🔴 MUST READ |
| [02-CRITICAL-CONTEXT.md](02-CRITICAL-CONTEXT.md) | Gotchas, known issues | ~500 | 🔴 MUST READ |

**Total**: ~3,000 tokens

---

## Quality Gates

**Required gates** (must pass before deployment):

1. ✅ **TypeScript**: `npx tsc --noEmit` → 0 errors
2. ✅ **ESLint**: `npm run lint` → 0 errors
3. ✅ **Build**: `npm run build` → Success

**Status**: All gates passing

**Last checked**: 2026-02-10 14:30 UTC

---

## Deployment Checklist

- [ ] All quality gates passing (TypeScript, ESLint, build)
- [ ] No console errors in browser
- [ ] Mobile responsive (test 375x667)
- [ ] Performance Lighthouse score ≥ 90
- [ ] Deploy to Vercel

---

## Handoff Protocol

**When handing off to another agent**:

1. **Agent reads** all 3 documents (5-10 min)
2. **Agent verifies** quality gates passing
3. **Agent acknowledges** critical context understood
4. **Handoff complete** — New agent can proceed

**No artifacts required** for this minimal project (no complex state to track)

---

## Key Constraints

- **No backend** — Static site only
- **No authentication** — Public pages only
- **No database** — All data is hardcoded or fetched from public APIs
- **Single developer** — Assume solo work, no team coordination needed

---

## Success Metrics

**Token Efficiency**:
- Traditional handoff: ~15,000 tokens (full codebase read)
- Framework handoff: ~3,000 tokens (docs only)
- **Reduction**: 5x (15K → 3K)

**Time Efficiency**:
- Traditional handoff: ~30 min (explore codebase)
- Framework handoff: ~5 min (read docs)
- **Reduction**: 6x (30 min → 5 min)

**Goals met**: ✅ Exceeds 40x target (combined 30x for minimal project)

---

## Framework Notes

**Why minimal?**

This example demonstrates that even **small projects benefit** from the handoff framework. The 3 required documents provide:

- **Quick orientation** (MASTER-INDEX)
- **Current state** (PROJECT-STATE with quality gates)
- **Critical knowledge** (CRITICAL-CONTEXT with gotchas)

**When to expand?**

Add recommended documents when:
- Project grows beyond 10K LOC → Add `ARCHITECTURE.md`
- Multiple features/roadmap → Add `FEATURE-STATUS.md`
- Complex testing strategy → Add `TESTID-FRAMEWORK.md`
- Migration or gaps → Add `GAP-ANALYSIS.md`
- Deployment orchestration → Add `DEPLOYMENT-ROADMAP.md`

**Framework scalability**: Start minimal, grow as needed

---

## Reference Documents

**Framework documentation**:
- [.handoff-framework/README.md](../../README.md)
- [.handoff-framework/HANDOFF_PROTOCOL.md](../../HANDOFF_PROTOCOL.md)
- [.handoff-framework/workflows/WORKFLOW_LIBRARY.md](../../workflows/WORKFLOW_LIBRARY.md)

**Setup scripts**:
- Init project: `bash .handoff-framework/scripts/init-project.sh <project-name>`
- Generate state: `bash .handoff-framework/scripts/generate-state.sh <project-name>`
- Validate docs: `bash .handoff-framework/scripts/validate-docs.sh <project-name>`

---

**Framework Version**: 1.0.0  
**Example Type**: Minimal (3 docs)  
**Token Count**: ~1,000 tokens
