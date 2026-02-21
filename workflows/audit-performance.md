# Workflow: Audit Performance

**Purpose**: Measure LCP, load times, and resource budgets across all routes.  
**Gate Type**: Layer 1 — Discovery  
**Output**: `reports/performance-audit.json`

---

## When to Run

- Before production deploy
- After adding heavy assets (images, videos, fonts)
- After bundle configuration changes
- When performance regression suspected

---

## Command

```bash
npm run audit:performance
```

**Runner**: `npx tsx scripts/e2e/audit-performance.mts`  
**Consumes**: `e2e/fixtures/route-manifest.json`  
**NOT a test** — produces JSON artifact.

---

## Subagent Prompt

```
Run `npm run audit:performance` in the damieus-com-migration project.

Prerequisite: Dev server running, route manifest exists.

Read the output at `reports/performance-audit.json`.

Return:
1. Average LCP across all routes
2. Routes exceeding 2.5s LCP budget
3. Total bundle size
4. Whether gate PASSED or FAILED
```

---

## Gate Logic

- **PASS**: All routes LCP < 2.5s, bundle < budget
- **FAIL**: Any route LCP > 2.5s OR bundle exceeds budget
- **SKIP**: Only run in staging/production (not local dev)

---

## Handoff Integration

```markdown
**Quality Gates Run**:
- ✅ Performance: All routes < 2.5s LCP → `reports/performance-audit.json`
  OR
- ⏭️ Performance: Skipped (local dev only)
```
