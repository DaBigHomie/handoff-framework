# Workflow: Audit Accessibility

**Purpose**: WCAG AA sweep across all routes using axe-core.  
**Gate Type**: Layer 1 — Discovery  
**Output**: `reports/a11y-audit.json` + `reports/A11Y_AUDIT.md`

---

## When to Run

- After any UI component changes
- Before any deployment
- When an agent finishes an implementation task
- As part of `npm run audit:all`

---

## Command

```bash
npm run audit:a11y
```

**Runner**: `npx tsx scripts/e2e/audit-a11y.mts`  
**Consumes**: `e2e/fixtures/route-manifest.json`  
**NOT a test** — produces JSON + Markdown report artifacts.

---

## Subagent Prompt

```
Run `npm run audit:a11y` in the damieus-com-migration project.

Prerequisite: Ensure `e2e/fixtures/route-manifest.json` exists and dev server is running.

Read the output at `reports/a11y-audit.json`.

Return:
1. Total violations by severity (critical, serious, moderate, minor)
2. Top 5 most common violation types
3. Pages with the most violations
4. Whether the gate PASSED (0 critical + serious) or FAILED
```

---

## Gate Logic

- **PASS**: 0 critical violations AND 0 serious violations
- **FAIL**: Any critical or serious violation found
- **WARNING**: Moderate/minor violations (don't block, but report)

---

## Handoff Integration

```markdown
**Quality Gates Run**:
- ✅ A11y: 0 serious violations → `reports/a11y-audit.json`
  OR
- ❌ A11y: 12 serious violations → `reports/a11y-audit.json` (Section: violations)

**Blocked by**: A11y gate. Next agent must resolve 12 violations before deploy.
```
