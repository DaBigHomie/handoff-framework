# 20x E2E Framework — Implementation & Handoff Plan

**Version**: 1.0.0  
**Created**: February 14, 2026  
**Status**: Ready for Execution  
**Target Project**: damieus-com-migration (primary), workspace-wide (secondary)

---

## 📋 Executive Summary

Integrate the 20x E2E Testing Framework into the agent handoff protocol so that:

1. **Quality gates** run automatically between pipeline stages (discovery → validation → regression)
2. **Handoff messages** always reference JSON artifacts, never raw source files
3. **All automation is TypeScript** — zero `.sh` scripts in handoffs
4. **Route manifest** (`route-manifest.json`) is the single source of truth consumed by all specs

**Current State**: Framework exists at `~/Downloads/e2e-20x/` (standalone). Handoff protocol exists at `.handoff-framework/`. damieus-com-migration has 20 handoff docs + 9 specs + existing e2e infrastructure. These three systems need to be **unified**.

---

## 🗺️ What Exists Today

### Source A: 20x E2E Framework (`~/Downloads/e2e-20x/`)

| Asset | Count | Status |
|-------|-------|--------|
| Layer 1 scripts (`.mts`) | 7 | ✅ Complete |
| Layer 2 specs (validation) | 4 | ✅ Complete |
| Layer 3 specs (regression) | 4 | ✅ Complete |
| Shared fixtures | 4 files | ✅ Complete |
| `package.json` npm scripts | 18 | ✅ Complete |
| `playwright.config.ts` | 1 | ✅ Complete |

### Source B: Handoff Framework (`.handoff-framework/`)

| Asset | Count | Status |
|-------|-------|--------|
| `HANDOFF_PROTOCOL.md` | 500 lines | ✅ Has quality gate section |
| `README.md` | 395 lines | ✅ Has subagent workflows |
| Templates | 5 files | ✅ Complete |
| Workflows | 0 files | ❌ Empty |
| Scripts | 0 files | ❌ Empty |
| Examples | 0 files | ❌ Empty |

### Source C: damieus-com-migration E2E (`damieus-com-migration/e2e/`)

| Asset | Count | Status |
|-------|-------|--------|
| Specs in `e2e/specs/` | 9 | ✅ Active |
| Fixtures in `e2e/fixtures/` | 3 files | ✅ Active |
| Handoff docs in `docs/handoff-20x/` | 20 files | ✅ Active |
| `data-testid` attributes | 112 | ⚠️ 5 missing (3 components) |
| Route manifest | 0 | ❌ Not yet generated |

---

## 🏗️ Implementation Phases

### Phase 1: Copy Framework Into damieus-com-migration (1-2 hours)

**Goal**: Make the 20x framework available inside the target project.

**Why**: The standalone `e2e-20x/` directory has scripts that damieus-com-migration needs. The project already has an `e2e/` directory with active specs — we merge, not replace.

#### Step 1.1: Copy Layer 1 Scripts

```bash
cd ~/management-git/damieus-com-migration

# Create scripts directory if it doesn't exist
mkdir -p scripts/e2e

# Copy Layer 1 discovery/audit scripts
cp ~/Downloads/e2e-20x/scripts/*.mts scripts/e2e/
```

**Files created**:
- `scripts/e2e/discover-routes.mts`
- `scripts/e2e/crawl-routes.mts`
- `scripts/e2e/audit-cta-gaps.mts`
- `scripts/e2e/audit-a11y.mts`
- `scripts/e2e/audit-performance.mts`
- `scripts/e2e/capture-screenshots.mts`
- `scripts/e2e/merge-reports.mts`

#### Step 1.2: Merge Fixtures

The project already has `e2e/fixtures/test-data.ts` with the `sel` object. Copy the missing files:

```bash
# Copy types (if not already present)
cp ~/Downloads/e2e-20x/e2e/fixtures/types.ts e2e/fixtures/types.ts

# Copy helpers (if not already present)
cp ~/Downloads/e2e-20x/e2e/fixtures/helpers.ts e2e/fixtures/helpers.ts

# Copy route manifest template
cp ~/Downloads/e2e-20x/e2e/fixtures/route-manifest.json e2e/fixtures/route-manifest.json
```

**Do NOT overwrite**: `e2e/fixtures/test-data.ts` — it has project-specific selectors.

#### Step 1.3: Reconcile Specs

Compare existing specs against framework specs. Keep whichever is more complete:

| Framework Spec | Project Spec | Action |
|---------------|-------------|--------|
| `route-health.spec.ts` | `route-health.spec.ts` | Compare, keep fuller version |
| `browser-devtools.spec.ts` | `browser-devtools.spec.ts` | Compare, keep fuller version |
| `accessibility.spec.ts` | `accessibility.spec.ts` | Compare, keep fuller version |
| `navigation.spec.ts` | `navigation.spec.ts` | Compare, keep fuller version |
| `cart.spec.ts` | `cart.spec.ts` + `cart-flow.spec.ts` | Keep both project specs |
| `checkout-flow.spec.ts` | `checkout-flow.spec.ts` | Compare, keep fuller version |
| `service-conversion.spec.ts` | `service-conversion.spec.ts` | Compare, keep fuller version |
| `questionnaire.spec.ts` | `questionnaire.spec.ts` | Compare, keep fuller version |

**Decision rule**: If the project spec has more test cases, keep it. If the framework spec consumes `route-manifest.json` and the project spec doesn't, update the project spec to consume it.

#### Step 1.4: Add npm Scripts

Add these to `damieus-com-migration/package.json` scripts:

```json
{
  "discover:routes": "tsx scripts/e2e/discover-routes.mts",
  "discover:routes:crawl": "tsx scripts/e2e/crawl-routes.mts",
  "audit:cta": "tsx scripts/e2e/audit-cta-gaps.mts",
  "audit:a11y": "tsx scripts/e2e/audit-a11y.mts",
  "audit:performance": "tsx scripts/e2e/audit-performance.mts",
  "audit:screenshots": "tsx scripts/e2e/capture-screenshots.mts",
  "audit:all": "npm run discover:routes && npm run audit:cta && npm run audit:a11y",
  "test:health": "npx playwright test e2e/specs/route-health.spec.ts",
  "test:cart": "npx playwright test e2e/specs/cart.spec.ts e2e/specs/cart-flow.spec.ts",
  "test:checkout": "npx playwright test e2e/specs/checkout-flow.spec.ts",
  "test:ci": "npm run discover:routes && npx playwright test e2e/specs/ --reporter=html",
  "test:pre-deploy": "npm run discover:routes && npx playwright test e2e/specs/ --grep @critical",
  "report:merge": "tsx scripts/e2e/merge-reports.mts"
}
```

#### Step 1.5: Install Missing Dependencies

```bash
cd ~/management-git/damieus-com-migration
npm install -D @babel/parser @babel/traverse @babel/types fast-glob chalk commander ora cli-table3 tsx
```

**Already installed** (verify): `@playwright/test`, `@axe-core/playwright`, `typescript`

#### Step 1.6: Verify

```bash
# Should list all 7 scripts
ls scripts/e2e/*.mts

# Should show new npm scripts
npm run --list | grep -E "discover|audit|report"

# TypeScript check (MUST pass)
npx tsc --noEmit
```

---

### Phase 2: Generate Route Manifest (30 minutes)

**Goal**: Create the single source of truth consumed by all specs.

#### Step 2.1: Configure Route Discovery

The `discover-routes.mts` script needs to know where `App.tsx` (or router config) lives. Update the script's config section or pass flags:

```bash
npm run discover:routes -- --app-file src/App.tsx --output e2e/fixtures/route-manifest.json
```

#### Step 2.2: Validate Output

```bash
# Check route count (expect ~186 based on previous audit)
cat e2e/fixtures/route-manifest.json | npx tsx -e "
  import { readFileSync } from 'fs';
  const manifest = JSON.parse(readFileSync('e2e/fixtures/route-manifest.json', 'utf8'));
  console.log('Routes:', manifest.routes?.length ?? Object.keys(manifest).length);
"
```

#### Step 2.3: Commit Route Manifest

```bash
git add e2e/fixtures/route-manifest.json
git commit -m "feat: generate route manifest (single source of truth for E2E)"
```

**This artifact is now the handoff payload** — all specs and audit scripts consume it.

---

### Phase 3: Add Missing data-testid Attributes (1 hour)

**Goal**: Reach 100% alignment between test fixtures (`sel` object) and source components.

From the gap analysis, exactly 3 components need changes (7 edits total):

#### Step 3.1: ServiceQuoteWidget.tsx

```diff
- <Card className={cn(sticky && 'sticky top-24', 'overflow-hidden', className)}>
+ <Card data-testid="service-quote-widget" className={cn(sticky && 'sticky top-24', 'overflow-hidden', className)}>
```

**File**: `src/components/service-cart/ServiceQuoteWidget.tsx` line 127

#### Step 3.2: HeroSection.tsx

```diff
- <section className={cn('relative overflow-hidden', className)}>
+ <section data-testid="hero-section" className={cn('relative overflow-hidden', className)}>
```

**File**: `src/components/sections/HeroSection.tsx` line 25

Plus add `data-testid="hero-primary-cta"` and `data-testid="hero-secondary-cta"` to the two CTA buttons.

#### Step 3.3: FunnelCTA.tsx

Add `data-testid={`funnel-cta-${context}`}` to the outermost element in all 4 variant branches (inline, subtle, secondary, primary).

**File**: `src/components/marketing/FunnelCTA.tsx` (~lines 281, 296, 311, 334)

#### Step 3.4: Verify

```bash
# Count should increase from 112 to ~119+
grep -r "data-testid" src/ --include="*.tsx" --include="*.ts" | sort -u | wc -l

# TypeScript check
npx tsc --noEmit
```

---

### Phase 4: Wire Quality Gates Into Handoff Protocol (1-2 hours)

**Goal**: Update `.handoff-framework/HANDOFF_PROTOCOL.md` and templates so all handoffs include quality gate results.

#### Step 4.1: Create Subagent Workflows

Populate `.handoff-framework/workflows/` with TypeScript-only audit workflows:

| Workflow File | Purpose | Invoked Via |
|--------------|---------|-------------|
| `audit-routes.md` | Discover all routes, generate manifest | `npm run discover:routes` |
| `audit-cta-gaps.md` | Scan revenue pages for missing CTAs | `npm run audit:cta` |
| `audit-accessibility.md` | WCAG AA sweep across all routes | `npm run audit:a11y` |
| `audit-performance.md` | LCP, load times, resource budgets | `npm run audit:performance` |
| `audit-test-coverage.md` | data-testid coverage by component | `npm run audit:all` |

Each workflow file is a markdown agent prompt (not a bash script) that tells a subagent:
1. Which `npm run` command to execute
2. What JSON artifact to read
3. What to include in the handoff report

#### Step 4.2: Update Handoff Templates

Update `templates/00-MASTER-INDEX-TEMPLATE.md` to include a quality gate section:

```markdown
## Quality Gate State Files

| File | Purpose | Auto-generated? | Command |
|------|---------|-----------------|---------|
| `e2e/fixtures/route-manifest.json` | All routes with categories | Yes | `npm run discover:routes` |
| `reports/cta-gap-analysis.json` | CTA coverage per route | Yes | `npm run audit:cta` |
| `reports/a11y-audit.json` | WCAG violations per route | Yes | `npm run audit:a11y` |
| `reports/performance-audit.json` | Load times per route | Yes | `npm run audit:performance` |
```

#### Step 4.3: Add Script Selection Decision Tree

Add to `HANDOFF_PROTOCOL.md`:

```markdown
## Quality Gate Selection

After completing your task, run the appropriate gate:

| What you changed | Gate to run | Blocks if... |
|-----------------|-------------|-------------|
| Any component/page | `npm run discover:routes` | New routes not discoverable |
| Service/revenue pages | `npm run audit:cta` | Revenue page missing cart CTA |
| Any UI component | `npm run audit:a11y` | WCAG AA violations found |
| Performance-sensitive | `npm run audit:performance` | LCP > 2.5s or bundle > budget |
| data-testid attrs | `npm run test:health` | Routes fail to load |
| Cart/checkout | `npm run test:cart` | Cart flow broken |
| Pre-deploy | `npm run test:pre-deploy` | ANY @critical test fails |
```

#### Step 4.4: Create Examples

Populate `.handoff-framework/examples/` with real handoff examples from damieus-com-migration:

- `testid-implementation-handoff.md` — Example of testid fix handoff
- `route-discovery-handoff.md` — Example of route discovery handoff
- `multi-agent-ecommerce-deploy.md` — Example of 4-agent pipeline

---

### Phase 5: CI/CD Integration (1 hour)

**Goal**: Ensure quality gates run automatically in GitHub Actions.

#### Step 5.1: Create CI Workflow

Create `.github/workflows/e2e-quality-gates.yml`:

```yaml
name: E2E Quality Gates

on:
  pull_request:
    branches: [main]
    paths:
      - 'src/**'
      - 'e2e/**'
      - 'scripts/e2e/**'

jobs:
  discover:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run discover:routes
      - uses: actions/upload-artifact@v4
        with:
          name: route-manifest
          path: e2e/fixtures/route-manifest.json

  validate:
    needs: discover
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - uses: actions/download-artifact@v4
        with:
          name: route-manifest
          path: e2e/fixtures/
      - run: npm run test:health
      - run: npm run test:cart

  regress:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - uses: actions/download-artifact@v4
        with:
          name: route-manifest
          path: e2e/fixtures/
      - run: npm run test:checkout
      - run: npm run test:navigation
```

**Layer enforcement**: `validate` depends on `discover`. `regress` depends on `validate`. If Layer 1 finds missing routes, Layer 2+3 don't run.

#### Step 5.2: Add Pre-Deploy Gate

Add to existing deploy workflow:

```yaml
- name: Pre-deploy quality gate
  run: npm run test:pre-deploy
```

---

### Phase 6: Documentation Updates (1 hour)

**Goal**: Update existing handoff docs to reflect the integrated framework.

#### Step 6.1: Update Master Index

Update `docs/handoff-20x/00-MASTER-HANDOFF-INDEX.md`:
- Add quality gate state files table
- Add npm script reference
- Mark docs #02 and #13 as superseded by the live `route-manifest.json`

#### Step 6.2: Update AGENTS.md

Add quality gate section to `damieus-com-migration/AGENTS.md`:

```markdown
### Quality Gates (20x E2E Framework)

All gates are TypeScript. Zero `.sh` scripts.

| Gate | Command | Output | When |
|------|---------|--------|------|
| Route Discovery | `npm run discover:routes` | `e2e/fixtures/route-manifest.json` | After adding pages/routes |
| CTA Audit | `npm run audit:cta` | `reports/cta-gap-analysis.json` | After modifying service pages |
| A11y Audit | `npm run audit:a11y` | `reports/a11y-audit.json` | Before any deploy |
| Performance | `npm run audit:performance` | `reports/performance-audit.json` | Before production deploy |
| Health Check | `npm run test:health` | Pass/fail | Every PR |
| Cart Tests | `npm run test:cart` | Pass/fail | After cart changes |
| Pre-Deploy | `npm run test:pre-deploy` | Pass/fail | Before deploy |
```

#### Step 6.3: Create Handoff Doc #21

Create `docs/handoff-20x/21-QUALITY-GATE-INTEGRATION.md` documenting:
- How gates were integrated
- Which npm scripts exist
- How CI enforces layer ordering
- How handoff messages reference gate artifacts

---

## 🤝 Handoff Message (When Complete)

Use this template after completing all phases:

```markdown
## 🤝 Handoff to Next Agent

**Task Completed**: Integrated 20x E2E Framework into damieus-com-migration + handoff protocol

**Changed Files**:
- scripts/e2e/*.mts (7 discovery/audit scripts)
- e2e/fixtures/types.ts, helpers.ts, route-manifest.json (shared fixtures)
- package.json (18 new npm scripts)
- src/components/ (3 files — 7 data-testid additions)
- .github/workflows/e2e-quality-gates.yml (CI pipeline)
- docs/handoff-20x/21-QUALITY-GATE-INTEGRATION.md

**Quality Gates Run**:
- ✅ Route Discovery: [X] routes in manifest
- ✅ Route Health: [X]/[X] routes loaded
- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 errors
- ✅ Build: Successful

**Gate Artifacts for Next Agent**:
- `e2e/fixtures/route-manifest.json` — Single source of truth (all routes)
- `reports/cta-gap-analysis.json` — Revenue page coverage

**Next Agent Instructions**:
1. Read `docs/handoff-20x/21-QUALITY-GATE-INTEGRATION.md`
2. Run `npm run audit:cta` to verify CTA coverage
3. Fix any critical issues in the report
4. Run `npm run test:pre-deploy` before deploying
```

---

## 📊 Timeline

| Phase | Effort | Dependencies | Outcome |
|-------|--------|-------------|---------|
| **Phase 1**: Copy Framework | 1-2h | None | Scripts + fixtures in project |
| **Phase 2**: Generate Manifest | 30min | Phase 1 | `route-manifest.json` created |
| **Phase 3**: Add data-testid | 1h | None (parallel with 1-2) | 112 → 119+ testids |
| **Phase 4**: Wire Handoff Protocol | 1-2h | Phase 1 | Workflows, templates, examples |
| **Phase 5**: CI/CD Integration | 1h | Phase 1-2 | 3-layer CI pipeline |
| **Phase 6**: Documentation | 1h | Phase 1-5 | Updated AGENTS.md, master index, doc #21 |

**Total**: 5.5-8.5 hours  
**Critical Path**: Phase 1 → Phase 2 → Phase 5 (3-3.5 hours)  
**Parallelizable**: Phase 3 + Phase 4 alongside Phase 1-2

---

## ✅ Definition of Done

- [ ] All 7 `.mts` scripts runnable from `damieus-com-migration/`
- [ ] `route-manifest.json` generated with ~186 routes
- [ ] All data-testid gaps closed (3 components, 7 edits)
- [ ] 18 npm scripts added to `package.json`
- [ ] CI workflow enforces Layer 1 → Layer 2 → Layer 3 ordering
- [ ] Handoff protocol updated with quality gate section
- [ ] Subagent workflows created (5 files in `.handoff-framework/workflows/`)
- [ ] At least 3 handoff examples in `.handoff-framework/examples/`
- [ ] `docs/handoff-20x/21-QUALITY-GATE-INTEGRATION.md` created
- [ ] `AGENTS.md` updated with quality gate table
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 errors
- [ ] Build: Succeeds

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| `.mts` scripts assume different file paths | Scripts fail to find `App.tsx` | Update script config/flags for damieus path structure |
| Route manifest format mismatch | Specs can't consume manifest | Verify `types.ts` interfaces match both script output and spec input |
| npm script name collisions | Existing scripts overwritten | Check `package.json` for conflicts before adding |
| CI timeout on full audit | Pipeline too slow | Use `--concurrency 5` flag on audit scripts |
| `tsx` not in project deps | Scripts won't run | Already in devDeps of e2e-20x, add to project |

---

## 📚 References

- [COPILOT_HANDOFF_INSTRUCTIONS.md](~/Downloads/COPILOT_HANDOFF_INSTRUCTIONS.md) — Hard rules for integration
- [20X-E2E-FRAMEWORK-HANDOFF-REFERENCE.md](~/Downloads/20X-E2E-FRAMEWORK-HANDOFF-REFERENCE.md) — Script catalog and data flow
- [.handoff-framework/HANDOFF_PROTOCOL.md](.handoff-framework/HANDOFF_PROTOCOL.md) — Existing protocol (500 lines)
- [docs/handoff-20x/00-MASTER-HANDOFF-INDEX.md](damieus-com-migration/docs/handoff-20x/00-MASTER-HANDOFF-INDEX.md) — Current handoff state
