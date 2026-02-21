# 01 — Project State

**Status**: [Status name]  
**Last Updated**: [Date]  
**Auto-generated**: Yes (via `bash ../.handoff-framework/scripts/generate-state.sh`)  
**Est. Reading**: 800 lines, 2,000 tokens, 3 minutes

---

## Purpose

**Auto-generated snapshot** of current project state. Read this FIRST when joining a project to understand what exists, what works, and what's broken.

**Auto-generation frequency**: After every major change (new feature, bug fix, refactor)

---

## Project Metrics

| Metric | Value | Last Changed |
|--------|-------|--------------|
| Total Lines of Code | [X] | [Date] |
| Components | [X] | [Date] |
| Pages/Routes | [X] | [Date] |
| Active Features | [X of Y] | [Date] |
| TypeScript Errors | [X] | [Date] |
| ESLint Errors | [X] | [Date] |
| Test Coverage | [X%] | [Date] |
| Deployment Status | [Production/Staging/Dev] | [Date] |
| Last Deploy | [Date] | - |
| Open Issues | [X] | [Date] |
| Open PRs | [X] | [Date] |

---

## Quality Gate Status

**(From 20x E2E Testing Framework)**

| Gate | Last Run | Status | Artifact | Critical Issues |
|------|----------|--------|----------|-----------------|
| TypeScript | [Date] | ✅/❌ | - | [X errors] |
| ESLint | [Date] | ✅/❌ | - | [X errors] |
| Build | [Date] | ✅/❌ | - | [reason if failed] |
| Route Discovery | [Date] | ✅/❌ | `e2e/fixtures/route-manifest.json` | [X routes] |
| Route Health | [Date] | ✅/❌ | - | [X broken routes] |
| CTA Gaps | [Date] | ✅/❌ | `reports/cta-gap-analysis.json` | [X revenue pages missing cart] |
| Accessibility | [Date] | ✅/❌ | `reports/a11y-audit.json` | [X WCAG violations] |
| Performance | [Date] | ✅/❌/⏭️ | `reports/performance-audit.json` | [X pages >2.5s LCP] |
| Cart Integration | [Date] | ✅/❌ | - | [issues] |
| Checkout Flow | [Date] | ✅/❌ | - | [issues] |

**Deployment Blockers** (gates that must pass before deploy):
- [ ] [Gate name] — [issue description]
- [ ] [Gate name] — [issue description]

---

## File Structure Snapshot

```
[project-name]/
├── src/
│   ├── features/ ([X features])
│   │   ├── [feature-1]/ ([X files])
│   │   ├── [feature-2]/ ([X files])
│   │   └── ...
│   ├── entities/ ([X entities])
│   ├── shared/ ([X components])
│   ├── lib/ ([X helpers])
│   ├── components/ ([X components])
│   ├── pages/ ([X pages])
│   └── hooks/ ([X hooks])
├── e2e/ (20x testing framework)
│   ├── scripts/ ([X .mts discovery scripts])
│   ├── specs/ ([X .spec.ts test files])
│   └── fixtures/ (route-manifest.json + shared data)
├── reports/ (auto-generated QA artifacts)
│   ├── cta-gap-analysis.json
│   ├── a11y-audit.json
│   ├── performance-audit.json
│   └── DASHBOARD.md
├── docs/
│   └── handoff/ ([X handoff docs])
└── [other folders]
```

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | [React 18, TypeScript, Vite] |
| **Styling** | [Tailwind CSS, shadcn/ui] |
| **State** | [React Query, Context API] |
| **Routing** | [React Router v6] |
| **Backend** | [Supabase, PostgreSQL] |
| **Payments** | [Stripe] |
| **Auth** | [Supabase Auth] |
| **Deployment** | [Vercel, Netlify] |
| **Testing** | [Playwright, Vitest, tsx] |
| **CI/CD** | [GitHub Actions] |

---

## Active Features

| Feature | Status | Routes | Components | Quality Gates |
|---------|--------|--------|------------|---------------|
| Homepage | ✅ Production | `/` | 12 | ✅ All passing |
| Service Pages | 🔄 In Progress | `/services/*` | 24 | ❌ 3 CTA gaps |
| Cart | 🔄 In Progress | - | 8 | ⚠️ 2 integration issues |
| Checkout | ⏳ Planned | `/checkout` | 0 | ⏭️ Not started |
| User Dashboard | ⏳ Planned | `/dashboard` | 0 | ⏭️ Not started |
| Admin Portal | ⏳ Planned | `/admin` | 0 | ⏭️ Not started |

**Legend**:
- ✅ Production — Deployed, all tests passing
- 🔄 In Progress — Development active, some issues
- ⏳ Planned — Design/planning phase
- ❌ Blocked — Cannot proceed without fixes

---

## Known Issues

### Critical (Deployment Blockers)

1. **[Issue #X]** — [description]
   - **Impact**: Blocks [feature/deploy]
   - **Quality Gate**: ❌ [gate name]
   - **Artifact**: `[path to JSON report]` (Section: [section])
   - **Fix Required By**: [Date]
   - **Assigned To**: [Agent/Person]

2. **[Issue #Y]** — [description]
   - **Impact**: Blocks [feature/deploy]
   - **Quality Gate**: ❌ [gate name]
   - **Artifact**: `[path to JSON report]` (Section: [section])
   - **Fix Required By**: [Date]
   - **Assigned To**: [Agent/Person]

### High Priority (Not Blocking)

1. **[Issue]** — [description]
2. **[Issue]** — [description]

### Medium/Low Priority

1. **[Issue]** — [description]
2. **[Issue]** — [description]

---

## Recent Changes (Last 7 Days)

| Date | Change | Agent | Files | Quality Gates |
|------|--------|-------|-------|---------------|
| [Date] | [description] | [Agent name] | +X/-Y | ✅ All passing |
| [Date] | [description] | [Agent name] | +X/-Y | ❌ 3 a11y violations |
| [Date] | [description] | [Agent name] | +X/-Y | ✅ All passing |

---

## Dependencies Status

| Category | Package | Version | Status | CVEs |
|----------|---------|---------|--------|------|
| Production | react | [X.Y.Z] | ✅ Current | 0 |
| Production | typescript | [X.Y.Z] | ⚠️ Update available | 0 |
| Production | @supabase/supabase-js | [X.Y.Z] | ✅ Current | 0 |
| Dev | playwright | [X.Y.Z] | ✅ Current | 0 |
| Dev | vite | [X.Y.Z] | ⚠️ Update available | 0 |

**Outdated Packages**: [X]  
**Security Vulnerabilities**: [X critical, X high, X medium]

---

## Database State

| Table | Rows | Last Migration | Schema Version |
|-------|------|----------------|----------------|
| users | [X] | [Date] | [X] |
| products | [X] | [Date] | [X] |
| orders | [X] | [Date] | [X] |
| [table] | [X] | [Date] | [X] |

**Pending Migrations**: [X]  
**Migration Blockers**: [None / description]

---

## Environment Status

| Environment | URL | Last Deploy | Status |
|-------------|-----|-------------|--------|
| Production | [URL] | [Date] | ✅ Healthy |
| Staging | [URL] | [Date] | ⚠️ [issue] |
| Development | localhost:5173 | - | ✅ Running |

---

## Agent Handoff Context

**If you're the next agent reading this:**

1. **Start here** — You've already read the right doc
2. **Check quality gates** — See "Quality Gate Status" section above
   - If ❌ gates exist, read the artifact before coding
   - Example: `reports/a11y-audit.json` (Section: violations)
3. **Check deployment blockers** — See "Deployment Blockers" section
4. **Read critical context** — See `02-CRITICAL-CONTEXT.md` for must-know info
5. **Find your task** — Read master index to find task-specific doc

**Estimated token cost to onboard**: 3,500 tokens (this doc + critical context, 5 min)

---

## Auto-Generation Instructions

**DO NOT EDIT THIS FILE MANUALLY**. It is auto-generated by:

```bash
cd [project-root]
bash ../.handoff-framework/scripts/generate-state.sh
```

**When to regenerate**:
- After completing a feature
- After fixing critical issues
- After running quality gates
- Before handing off to next agent
- Daily (via cron job)

**What gets auto-extracted**:
- File counts via `find` + `wc -l`
- TypeScript errors via `npx tsc --noEmit`
- ESLint errors via `npm run lint`
- Quality gate results from `reports/*.json`
- Git metrics via `git log` + `git status`
- Dependency status via `npm outdated`
- Route count from `e2e/fixtures/route-manifest.json`

---

**Max Lines**: 800 (enforced by generator script)  
**Format**: Markdown tables for scannability  
**Frequency**: Regenerate after every major change  
**Token Cost**: ~2,000 tokens per read
