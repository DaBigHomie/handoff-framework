---
tags: []
topic: ""
created: "{{DATE}}"
sequence: 1
category: "context"
---
# Project State — {{PROJECT_NAME}}

**Category**: Core (CO)  
**Document**: 01  
**Version**: 2.0.0  
**Created**: {{DATE}}  
**Last Updated**: {{DATE}}  
**Auto-generated**: Yes — via `npx tsx .handoff-framework/scripts/generate-state.mts`

---

## Purpose

Auto-generated snapshot of current project state. Read this when joining a project to understand what exists, what works, and what's broken.

```bash
# Regenerate this document
npx tsx .handoff-framework/scripts/generate-state.mts {{PROJECT_NAME}}
```

---

## Project Metrics

| Metric | Value | Last Changed |
|--------|-------|--------------|
| **Total LOC** | {{LOC}} | {{DATE}} |
| **Components** | {{COMPONENTS}} | {{DATE}} |
| **Pages/Routes** | {{PAGES}} | {{DATE}} |
| **Custom Hooks** | {{HOOKS}} | {{DATE}} |
| **Test Files** | {{TESTS}} | {{DATE}} |
| **Deployment Status** | {{DEPLOY_STATUS}} | {{DATE}} |
| **Open Issues** | {{ISSUES}} | {{DATE}} |
| **Open PRs** | {{PRS}} | {{DATE}} |

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | {{FRONTEND_STACK}} |
| **Styling** | {{STYLING_STACK}} |
| **State** | {{STATE_STACK}} |
| **Routing** | {{ROUTING_STACK}} |
| **Backend** | {{BACKEND_STACK}} |
| **Payments** | {{PAYMENTS_STACK}} |
| **Auth** | {{AUTH_STACK}} |
| **Testing** | {{TESTING_STACK}} |

---

## Quality Gate Status

| Gate | Command | Status | Errors | Artifact |
|------|---------|--------|--------|----------|
| TypeScript | `npx tsc --noEmit` | {{TS_STATUS}} | {{TS_ERRORS}} | — |
| ESLint | `npm run lint` | {{LINT_STATUS}} | {{LINT_ERRORS}} | — |
| Build | `npm run build` | {{BUILD_STATUS}} | — | — |
| Route Discovery | `npm run discover:routes` | {{ROUTE_STATUS}} | — | `e2e/fixtures/route-manifest.json` |
| CTA Gaps | `npm run audit:cta` | {{CTA_STATUS}} | — | `reports/cta-gap-analysis.json` |
| Accessibility | `npm run audit:a11y` | {{A11Y_STATUS}} | — | `reports/a11y-audit.json` |
| Performance | `npm run audit:performance` | {{PERF_STATUS}} | — | `reports/performance-audit.json` |

### Deployment Blockers

{{BLOCKERS}}

---

## File Structure Snapshot

```
{{PROJECT_NAME}}/
├── src/
│   ├── features/         ({{FEATURE_COUNT}} features)
│   ├── entities/         ({{ENTITY_COUNT}} entities)
│   ├── shared/           ({{SHARED_COUNT}} modules)
│   ├── lib/              ({{LIB_COUNT}} helpers)
│   ├── components/       ({{COMPONENT_COUNT}} components)
│   ├── pages/            ({{PAGE_COUNT}} pages)
│   └── hooks/            ({{HOOK_COUNT}} hooks)
├── e2e/
│   ├── scripts/          ({{E2E_SCRIPT_COUNT}} .mts discovery scripts)
│   ├── specs/            ({{E2E_SPEC_COUNT}} .spec.ts test files)
│   └── fixtures/         (route-manifest.json + shared data)
├── reports/              (auto-generated QA artifacts)
├── docs/
│   └── handoff/          ({{HANDOFF_COUNT}} handoff docs)
└── supabase/
    └── migrations/       ({{MIGRATION_COUNT}} migrations)
```

---

## Recent Changes

```bash
{{RECENT_COMMITS}}
```

---

## Handoff Notes

{{HANDOFF_NOTES}}

---

**Framework**: Handoff v2.0 | **Auto-generated**: {{TIMESTAMP}}
