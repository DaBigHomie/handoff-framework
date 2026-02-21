# Workflow: Audit CTA Gaps

**Purpose**: Scan all revenue pages for missing cart CTAs, pricing widgets, and conversion elements.  
**Gate Type**: Layer 1 — Discovery  
**Output**: `reports/cta-gap-analysis.json` + `reports/CTA_GAP_ANALYSIS.md`

---

## When to Run

- After completing service/revenue page implementations
- After modifying cart integration on any page
- Before deploying to production
- When an agent needs to verify revenue page coverage

---

## Command

```bash
npm run audit:cta
```

**Runner**: `npx tsx scripts/e2e/audit-cta-gaps.mts`  
**Consumes**: `e2e/fixtures/route-manifest.json` (run `npm run discover:routes` first)  
**NOT a test** — produces JSON + Markdown report artifacts.

---

## Subagent Prompt

```
Run `npm run audit:cta` in the damieus-com-migration project.

Prerequisite: Ensure `e2e/fixtures/route-manifest.json` exists.
If not, run `npm run discover:routes` first.

Read the output at `reports/cta-gap-analysis.json`.

Return:
1. Summary: total pages scanned, pages with CTAs, pages missing CTAs
2. Critical issues (revenue pages without cart integration)
3. Top 5 highest-priority fixes
4. The raw JSON summary section
```

---

## Expected Output

```json
{
  "summary": {
    "totalScanned": 54,
    "withCTA": 48,
    "missingCTA": 6,
    "criticalIssues": 3
  },
  "critical": [
    {
      "route": "/services/tax-preparation",
      "issue": "No cart button or quote widget found",
      "selectors_checked": ["[data-testid='service-quote-widget']", "[data-testid='funnel-cta']"]
    }
  ]
}
```

---

## Handoff Integration

```markdown
**Quality Gates Run**:
- ✅ CTA Gaps: 0 critical issues → `reports/cta-gap-analysis.json`
  OR
- ❌ CTA Gaps: 3 critical issues → `reports/cta-gap-analysis.json` (Section: critical)

**Blocked by**: CTA gap gate. Next agent must add cart CTAs to 3 revenue pages.
```

---

## Failure Modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| "No route manifest" error | `route-manifest.json` missing | Run `npm run discover:routes` first |
| Timeout on pages | Dev server not running | Start `npm run dev` before audit |
| False positives | CTA uses non-standard selector | Update `test-data.ts` sel object |
