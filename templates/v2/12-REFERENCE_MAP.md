# Reference Map — {{PROJECT_NAME}}

**Category**: Reference (RF)  
**Document**: 12  
**Version**: 2.0.0  
**Created**: {{DATE}}  
**Last Updated**: {{DATE}}

---

## Purpose

Quick-lookup tables for routes, files, features, and status. Use this for fast answers during implementation — no narrative, just data.

```bash
# Regenerate route data
npx tsx e2e/scripts/discover-routes.mts
```

---

## Route Map

| Route | Page Component | Auth | Status |
|-------|---------------|------|--------|
| {{ROUTE_MAP}} |

**Total routes**: {{ROUTE_TOTAL}}  
**Healthy (200)**: {{ROUTE_HEALTHY}}  
**Broken**: {{ROUTE_BROKEN}}

---

## Feature Status

| Feature | Status | Priority | Issue # | Notes |
|---------|--------|----------|---------|-------|
| {{FEATURE_STATUS}} |

**Legend**: ✅ Complete | 🔄 In Progress | ⏳ Planned | ❌ Blocked

---

## File Reference

### Key Entry Points

| File | Purpose |
|------|---------|
| {{KEY_FILES}} |

### Component Inventory

| Directory | Count | Examples |
|-----------|-------|---------|
| {{COMPONENT_INVENTORY}} |

---

## Hook Reference

| Hook | Returns | Used By |
|------|---------|---------|
| {{HOOKS}} |

---

## Database Quick Reference

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| {{DB_QUICK_REF}} |

---

## Environment Variable Reference

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| {{ENV_REF}} |

---

## Script Reference

| Script | Command | Purpose |
|--------|---------|---------|
| {{SCRIPTS}} |

---

## Token Budget Summary

| Document | Tokens | Category |
|----------|--------|----------|
| {{TOKEN_BUDGET}} |

**Total**: {{TOTAL_TOKENS}} tokens  
**Budget**: {{TOKEN_BUDGET_TARGET}} target / {{TOKEN_BUDGET_WARNING}} warning / {{TOKEN_BUDGET_CRITICAL}} critical

---

## Related Documents

- [00-MASTER_INDEX](./00-MASTER_INDEX_{{DATE}}.md) — Full navigation hub
- [06-ARCHITECTURE](./06-ARCHITECTURE_{{DATE}}.md) — System details
- [10-TEST_FRAMEWORK](./10-TEST_FRAMEWORK_{{DATE}}.md) — Test conventions

---

**Framework**: Handoff v2.0 | **Category**: Reference
