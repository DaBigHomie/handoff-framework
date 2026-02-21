# Example Handoff: Multi-Agent Ecommerce Deploy

**Context**: 4-agent pipeline deploying ecommerce features. Each agent runs quality gates and passes artifacts to the next.

---

## Agent 1: Research Agent (Subagent)

**Task**: Audit ecommerce feature readiness

**Command Run**:
```bash
npm run audit:all
```

**Output**:
- `e2e/fixtures/route-manifest.json` — 191 routes
- `reports/cta-gap-analysis.json` — 3 revenue pages missing CTAs
- `reports/a11y-audit.json` — 8 moderate violations

**Handoff to Agent 2**:
```markdown
Ecommerce audit complete. 3 revenue pages missing cart CTAs.

Read: reports/cta-gap-analysis.json (Section: critical)
Action: Fix 3 pages, then re-run `npm run audit:cta`
```

**Tokens**: 5,000

---

## Agent 2: Implementation Agent (Main)

**Task**: Fix CTA gaps on 3 revenue pages

**Files Changed**:
- `src/pages/services/TaxPreparationPage.tsx` (+15 lines)
- `src/pages/services/BusinessFormationPage.tsx` (+12 lines)
- `src/pages/services/EstatePlanningPage.tsx` (+18 lines)

**Quality Gates Run**:
- ✅ CTA Gaps: 0 critical issues (was 3)
- ✅ Route Health: 191/191
- ✅ TypeScript: 0 errors
- ✅ Build: Successful

**Handoff to Agent 3**:
```markdown
CTA gaps fixed on 3 revenue pages.

Quality Gates:
- ✅ CTA Gaps: 0 critical → reports/cta-gap-analysis.json
- ✅ Route Health: 191/191

Read: reports/a11y-audit.json (Section: violations)
Action: Fix 8 moderate a11y violations before deploy
```

**Tokens**: 8,000

---

## Agent 3: QA Agent (Subagent)

**Task**: Fix accessibility violations

**Files Changed**:
- 6 component files (added aria-labels, alt text, focus states)

**Quality Gates Run**:
- ✅ A11y: 0 serious violations (was 8 moderate → 0)
- ✅ All Layer 2 tests passing

**Handoff to Agent 4**:
```markdown
A11y violations fixed. All quality gates green.

Quality Gates:
- ✅ Route Discovery: 191 routes
- ✅ CTA Gaps: 0 critical
- ✅ A11y: 0 violations
- ✅ All tests passing

Action: Run `npm run test:pre-deploy` and deploy to Vercel
```

**Tokens**: 6,000

---

## Agent 4: Deploy Agent (Main)

**Task**: Pre-deploy validation + deploy

**Commands Run**:
```bash
npm run test:pre-deploy    # Layer 1 + Layer 2 + Layer 3 (@critical)
npm run build              # Production build
# Deploy to Vercel
```

**Quality Gates Run**:
- ✅ Pre-Deploy: All @critical tests passing
- ✅ Build: Successful
- ✅ Deploy: Live at production URL

**Final Handoff**:
```markdown
Ecommerce deploy complete.

Quality Gates (all green):
- ✅ Routes: 191/191 healthy
- ✅ CTAs: 0 gaps on revenue pages
- ✅ A11y: 0 violations
- ✅ Pre-deploy: All critical tests passing
- ✅ Build + Deploy: Successful

State files committed:
- e2e/fixtures/route-manifest.json
- reports/cta-gap-analysis.json
- reports/a11y-audit.json
```

**Tokens**: 3,000

---

## Pipeline Summary

| Agent | Role | Tokens | Gates Run | Result |
|-------|------|--------|-----------|--------|
| 1 | Research | 5,000 | audit:all | Found 3 CTA gaps |
| 2 | Implementation | 8,000 | audit:cta, test:health | Fixed gaps |
| 3 | QA | 6,000 | audit:a11y | Fixed a11y |
| 4 | Deploy | 3,000 | test:pre-deploy | Deployed |
| **Total** | | **22,000** | 7 gates | **All green** |

**Without framework**: ~300,000 tokens (each agent reads entire codebase)  
**With framework**: 22,000 tokens = **14x reduction**
