---
tags: []
topic: ""
created: "{{DATE}}"
sequence: 8
category: "findings"
---
# Route Audit — {{PROJECT_NAME}}

**Project**: {{PROJECT_NAME}}
**Framework**: @dabighomie/handoff-framework v{{FRAMEWORK_VERSION}}
**Last Updated**: {{DATE}}

---

## Purpose

Complete inventory of all discovered routes — categorized, validated, and tagged for revenue criticality.

---

## Discovery Method

| Method | Script | Routes Found |
|--------|--------|-------------|
| AST Parse | `scripts/e2e/discover-routes.mts` | [count] |
| Runtime Crawl | `scripts/e2e/crawl-routes.mts` | [count] |
| Manual | (visual inspection) | [count] |
| **Total Unique** | | **[count]** |

---

## Route Summary

| Category | Count | Revenue-Critical | Examples |
|----------|-------|-----------------|----------|
| Homepage | [count] | ✅ | `/` |
| Services | [count] | ✅ | `/services/web-development` |
| Products | [count] | ✅ | `/shop`, `/products/[id]` |
| Checkout | [count] | ✅ | `/checkout`, `/cart` |
| Personas | [count] | ✅ | `/who-we-serve/startups` |
| Auth | [count] | | `/auth`, `/login` |
| Admin | [count] | | `/admin/*` |
| Content | [count] | | `/about`, `/blog/*` |
| **TOTAL** | **[count]** | **[count]** | |

---

## Revenue-Critical Routes

> These routes are on the path to conversion. Test coverage is MANDATORY.

| # | Route | Category | Has E2E Test | Has test-ids | Status |
|---|-------|----------|-------------|-------------|--------|
| 1 | `/` | Homepage | ✅/❌ | ✅/❌ | [status] |
| 2 | `/services/*` | Services | ✅/❌ | ✅/❌ | [status] |
| 3 | `/checkout` | Checkout | ✅/❌ | ✅/❌ | [status] |
| <!-- INVESTIGATE: Complete list --> |

---

## Route Details

### Dynamic Routes

| Pattern | Param | Source | Example URLs |
|---------|-------|--------|-------------|
| `/services/:slug` | slug | Database/static | `/services/web-development` |
| `/products/:id` | id | Database | `/products/123` |
| <!-- INVESTIGATE --> |

### Protected Routes (Auth Required)

| Route | Role Required | Redirects To |
|-------|-------------|-------------|
| `/admin/*` | admin | `/auth` |
| `/account/*` | user | `/auth` |
| <!-- INVESTIGATE --> |

### Fallback / Error Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/404` | Not found | <!-- INVESTIGATE --> |
| `/*` | Catch-all | <!-- INVESTIGATE --> |

---

## Route Health Check

```bash
# Discover routes from source code
npx tsx scripts/e2e/discover-routes.mts

# Crawl routes at runtime
npx tsx scripts/e2e/crawl-routes.mts

# Validate all routes return 200
npx tsx scripts/e2e/validate-routes.mts
```

---

## Route Changes Log

| Date | Change | Routes Added | Routes Removed | Reason |
|------|--------|-------------|---------------|--------|
| {{DATE}} | Initial audit | [count] | 0 | First discovery |

---

**Framework**: @dabighomie/handoff-framework v{{FRAMEWORK_VERSION}}
**Generated**: {{DATE}}
