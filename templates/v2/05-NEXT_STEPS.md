# Deployment Roadmap — {{PROJECT_NAME}}

**Category**: Operations (OP)  
**Document**: 05  
**Version**: 2.0.0  
**Created**: {{DATE}}  
**Last Updated**: {{DATE}}

---

## Purpose

Complete deployment reference — how to build, test, deploy, and roll back this project. Read before any production deployment or CI/CD modification.

```bash
# Quick deploy check — run all gates
npx tsc --noEmit && npm run lint && npm run build
```

---

## Deployment Pipeline

```
Local Dev ──▶ Quality Gates ──▶ Preview Deploy ──▶ Production
   │              │                   │                │
   │         ┌────┴────┐             │           ┌────┴────┐
   │         │ tsc     │             │           │ Vercel  │
   │         │ eslint  │             │           │ Netlify │
   │         │ build   │             │           │ AWS     │
   │         │ tests   │             │           └─────────┘
   │         └─────────┘             │
   │                          {{PREVIEW_URL}}
   └── npm run dev
       (localhost:{{DEV_PORT}})
```

---

## Quality Gates (Pre-Deploy)

| # | Gate | Command | Required | Status |
|---|------|---------|----------|--------|
| 1 | TypeScript | `npx tsc --noEmit` | ✅ Yes | {{TS_STATUS}} |
| 2 | ESLint | `npm run lint` | ✅ Yes | {{LINT_STATUS}} |
| 3 | Build | `npm run build` | ✅ Yes | {{BUILD_STATUS}} |
| 4 | Unit Tests | `npm test -- --run` | {{UNIT_REQ}} | {{UNIT_STATUS}} |
| 5 | E2E Tests | `npx playwright test` | {{E2E_REQ}} | {{E2E_STATUS}} |
| 6 | Browser DevTools | `npm run test:devtools` | {{DEVTOOLS_REQ}} | {{DEVTOOLS_STATUS}} |

```bash
# Run all gates in sequence
npx tsc --noEmit && npm run lint && npm run build && npm test -- --run
```

**NEVER deploy if any required gate fails.**

---

## Environment Configuration

### Required Variables

```bash
# {{PROJECT_NAME}} Environment
{{ENV_REQUIRED}}
```

### Optional Variables

```bash
{{ENV_OPTIONAL}}
```

**Secrets management**: {{SECRETS_LOCATION}}

---

## Deploy Commands

### Production

```bash
{{DEPLOY_PROD_COMMANDS}}
```

### Preview / Staging

```bash
{{DEPLOY_STAGING_COMMANDS}}
```

### Rollback

```bash
{{ROLLBACK_COMMANDS}}
```

---

## Database Migrations

```bash
# Check pending migrations
npx supabase db diff

# Apply migration (via REST API if direct connection blocked)
{{MIGRATION_APPLY_COMMAND}}

# Regenerate types after migration
{{TYPES_REGEN_COMMAND}}

# Verify migration
npx tsc --noEmit
```

**Safety Rules**:
- Never run `npx supabase db reset` without user approval
- Never `DROP TABLE` or `TRUNCATE` without explicit confirmation
- Always use `IF NOT EXISTS` / `IF EXISTS` guards
- Always regenerate types after schema changes

---

## CI/CD Workflows

| Workflow | Trigger | Purpose | File |
|----------|---------|---------|------|
| {{CI_WORKFLOWS}} |

---

## Monitoring & Alerts

| Service | What It Monitors | Dashboard URL |
|---------|-----------------|---------------|
| {{MONITORING}} |

---

## Post-Deploy Checklist

- [ ] Quality gates passed (TypeScript, ESLint, Build)
- [ ] Preview deployment verified
- [ ] Production deployment completed
- [ ] Smoke test: homepage loads
- [ ] Smoke test: key user flow works
- [ ] Database migrations applied (if any)
- [ ] Environment variables correct
- [ ] No console errors in browser DevTools
- [ ] Mobile viewport tested (375x667)

---

## Incident Response

```bash
# Quick rollback
{{QUICK_ROLLBACK}}

# Check recent deploys
{{CHECK_DEPLOYS}}

# Check error logs
{{CHECK_LOGS}}
```

---

## Related Documents

- [01-PROJECT_STATE](./01-PROJECT_STATE_{{DATE}}.md) — Current gate status
- [02-CRITICAL_CONTEXT](./02-CRITICAL_CONTEXT_{{DATE}}.md) — Deploy constraints
- [10-TEST_FRAMEWORK](./10-TEST_FRAMEWORK_{{DATE}}.md) — Test coverage

---

**Framework**: Handoff v2.0 | **Category**: Operations
