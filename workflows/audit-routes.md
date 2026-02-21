# Workflow: Audit Routes

**Purpose**: Discover all routes in the project and generate the route manifest.  
**Gate Type**: Layer 1 — Discovery  
**Output**: `e2e/fixtures/route-manifest.json`

---

## When to Run

- After adding new pages or routes
- After modifying `App.tsx` or router configuration
- After a WordPress migration
- When an agent needs to know all available routes

---

## Command

```bash
# AST-based (preferred — parses App.tsx directly)
npm run discover:routes

# Crawler-based (fallback — follows links at runtime, requires dev server)
npm run discover:routes:crawl
```

**Runner**: `npx tsx scripts/e2e/discover-routes.mts`  
**NOT a test** — produces a JSON artifact.

---

## Subagent Prompt

```
Run `npm run discover:routes` in the damieus-com-migration project.

Read the output at `e2e/fixtures/route-manifest.json`.

Return:
1. Total route count
2. Routes by category (service, persona, admin, static)
3. Any routes that failed to parse
4. The raw JSON if < 500 lines, otherwise a summary
```

---

## Expected Output

```json
{
  "generated": "2026-02-14T...",
  "totalRoutes": 186,
  "routes": [
    {
      "path": "/",
      "component": "Index",
      "category": "static",
      "revenue": false
    },
    {
      "path": "/services/tax-preparation",
      "component": "ServiceCategoryPage",
      "category": "service",
      "revenue": true
    }
  ]
}
```

---

## Handoff Integration

After running this gate, include in handoff:

```markdown
**Quality Gates Run**:
- ✅ Route Discovery: 186 routes in manifest → `e2e/fixtures/route-manifest.json`

**Gate Artifacts for Next Agent**:
- `e2e/fixtures/route-manifest.json` — Single source of truth for all routes
```

---

## Failure Modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| 0 routes found | `App.tsx` path wrong | Pass `--app-file src/App.tsx` |
| Missing lazy routes | Dynamic imports not parsed | Use `crawl-routes.mts` instead |
| Script crashes | Missing `@babel/parser` dep | `npm install -D @babel/parser @babel/traverse` |
