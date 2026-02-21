# TestID Framework — {{PROJECT_NAME}}

**Category**: Quality (QA)  
**Document**: 10  
**Version**: 2.0.0  
**Created**: {{DATE}}  
**Last Updated**: {{DATE}}

---

## Purpose

Testing conventions, test-ID standards, and quality assurance strategy. Read before writing any tests or adding `data-testid` attributes.

```bash
# Run all tests
npm test -- --run

# Run E2E tests
npx playwright test

# Check test coverage
npm test -- --coverage
```

---

## Three-Layer Testing Architecture

```
Layer 1: Discovery Scripts (.mts)
     │ Produce JSON artifacts
     ▼
Layer 2: Validation Tests (.spec.ts)
     │ Thin wrappers around artifacts
     ▼
Layer 3: Regression Tests (.spec.ts)
     │ Full user journey tests
     ▼
  Reports/ (auto-generated)
```

### Layer 1 — Discovery Scripts

| Script | Artifact | Purpose |
|--------|----------|---------|
| `e2e/scripts/discover-routes.mts` | `e2e/fixtures/route-manifest.json` | Crawl all routes |
| `e2e/scripts/discover-testids.mts` | `e2e/fixtures/testid-manifest.json` | Find all data-testid |
| `e2e/scripts/discover-cta.mts` | `e2e/fixtures/cta-manifest.json` | Find all CTAs |
| {{EXTRA_DISCOVERY_SCRIPTS}} |

```bash
# Run all discovery scripts
npx tsx e2e/scripts/discover-routes.mts
npx tsx e2e/scripts/discover-testids.mts
```

### Layer 2 — Validation Tests

| Test File | Validates | Expected |
|-----------|----------|----------|
| `e2e/specs/route-health.spec.ts` | All routes return 200 | {{ROUTE_COUNT}} routes |
| `e2e/specs/testid-coverage.spec.ts` | TestID coverage | ≥{{TESTID_COVERAGE}}% |
| `e2e/specs/cta-presence.spec.ts` | CTAs on key pages | {{CTA_COUNT}} CTAs |
| {{EXTRA_VALIDATION_TESTS}} |

### Layer 3 — Regression Tests

| Test File | User Journey | Critical Path |
|-----------|-------------|--------------|
| {{REGRESSION_TESTS}} |

---

## data-testid Convention

### Naming Pattern

```
data-testid="{page}-{component}-{element}"
```

### Examples

```html
<!-- Page-level -->
<main data-testid="home-hero-section">
<nav data-testid="global-nav-header">

<!-- Component-level -->
<button data-testid="cart-checkout-button">
<input data-testid="checkout-email-input">

<!-- List items -->
<div data-testid="shop-product-card-{id}">
```

### Rules

1. **Always kebab-case**: `cart-checkout-button` not `cartCheckoutButton`
2. **Always 3 parts**: `{page}-{component}-{element}`
3. **No dynamic values in first two parts**: only the element suffix can be dynamic
4. **Interactive elements MUST have testid**: buttons, links, inputs, forms
5. **Key content MUST have testid**: prices, titles, status badges

---

## Coverage Targets

| Metric | Target | Current |
|--------|--------|---------|
| Route coverage (200 status) | 100% | {{ROUTE_COVERAGE}}% |
| TestID on interactive elements | ≥90% | {{TESTID_INTERACTIVE}}% |
| TestID on key content | ≥80% | {{TESTID_CONTENT}}% |
| E2E critical path coverage | 100% | {{E2E_COVERAGE}}% |
| Unit test coverage | ≥80% | {{UNIT_COVERAGE}}% |

---

## Test File Organization

```
e2e/
├── scripts/                  # Layer 1: Discovery (.mts)
│   ├── discover-routes.mts
│   ├── discover-testids.mts
│   └── discover-cta.mts
├── specs/                    # Layer 2+3: Tests (.spec.ts)
│   ├── route-health.spec.ts
│   ├── testid-coverage.spec.ts
│   ├── accessibility.spec.ts
│   └── {{PROJECT_SPECS}}
├── fixtures/                 # Shared test data
│   ├── route-manifest.json
│   ├── testid-manifest.json
│   └── cta-manifest.json
└── helpers/                  # Test utilities
    └── test-utils.ts
```

---

## Running Tests

```bash
# Full test suite
npx playwright test

# Specific spec
npx playwright test e2e/specs/route-health.spec.ts

# With UI
npx playwright test --ui

# Debug mode
npx playwright test --debug

# Generate report
npx playwright show-report
```

---

## Quality Gate Integration

Tests feed into the deployment pipeline quality gates:

```bash
# All must pass before deploy
npx tsc --noEmit           # Gate 1: Types
npm run lint               # Gate 2: Lint
npm run build              # Gate 3: Build
npx playwright test        # Gate 4: E2E
```

---

## Related Documents

- [01-PROJECT_STATE](./01-PROJECT_STATE_{{DATE}}.md) — Current test metrics
- [06-ARCHITECTURE](./06-ARCHITECTURE_{{DATE}}.md) — What to test
- [05-NEXT_STEPS](./05-NEXT_STEPS_{{DATE}}.md) — Gate requirements

---

**Framework**: Handoff v2.0 | **Category**: Quality
