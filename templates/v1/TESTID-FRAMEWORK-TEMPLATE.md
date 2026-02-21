# Test-ID Framework — [Project Name]

**Last Updated**: [Date]  
**Est. Reading**: 800 lines, 2,000 tokens, 3 minutes

---

## Purpose

Standardized `data-testid` attribute naming conventions, coverage targets, and automation scripts. Read this when:
- Writing new E2E tests
- Adding components that need test coverage
- Auditing test coverage gaps  
- Debugging test failures (wrong selectors)

**Related Docs**:
- [00-MASTER-INDEX](./00-MASTER-INDEX.md) — Navigation
- [01-PROJECT-STATE](./01-PROJECT-STATE.md) — Current metrics
- [FEATURE-STATUS](./FEATURE-STATUS.md) — What's built

---

## Naming Convention

### Pattern: `{component}-{element}-{variant}`

```
data-testid="[component-name]-[element-type]-[optional-variant]"
```

### Examples

| Component | Element | Variant | Result |
|-----------|---------|---------|--------|
| Hero | CTA button | primary | `hero-cta-primary` |
| Cart | item row | - | `cart-item` |
| Checkout | form | shipping | `checkout-form-shipping` |
| Product | card | - | `product-card` |
| Navigation | link | services | `nav-link-services` |

### Reserved Prefixes

| Prefix | Scope | Example |
|--------|-------|---------|
| `page-` | Page-level wrappers | `page-homepage` |
| `section-` | Visual sections | `section-hero` |
| `form-` | Form containers | `form-checkout` |
| `modal-` | Dialog/modal wrappers | `modal-cart` |
| `btn-` | Button elements | `btn-add-to-cart` |

---

## Coverage Targets

### Minimum Coverage (Deploy Blocker)

| Category | Target | Current |
|----------|--------|---------|
| Pages | 100% (all routes) | [X]% |
| CTAs | 100% (all revenue links) | [X]% |
| Forms | 100% (all inputs) | [X]% |
| Navigation | 100% (all links) | [X]% |

### Recommended Coverage

| Category | Target | Current |
|----------|--------|---------|
| Components | 80% (shared + feature) | [X]% |
| Interactive elements | 90% (buttons, inputs, links) | [X]% |
| Data displays | 60% (cards, lists, tables) | [X]% |

---

## Existing Test-IDs

### Pages ([X] total)

| Route | Test-ID | Status |
|-------|---------|--------|
| `/` | `page-homepage` | ✅ |
| `/shop` | `page-shop` | ✅ |
| `/cart` | `page-cart` | ✅ |
| `/checkout` | `page-checkout` | ✅ |
| [Add more routes] | | |

### Interactive Elements ([X] total)

| Element | Test-ID | Component File |
|---------|---------|---------------|
| Add to cart button | `add-to-cart-btn` | `ProductCard.tsx` |
| Cart badge | `cart-badge` | `Header.tsx` |
| Checkout button | `checkout-btn` | `CartDrawer.tsx` |
| [Add more elements] | | |

---

## Missing Test-IDs (Gap Report)

**Run audit**: `npm run audit:testids` or `npx tsx scripts/e2e/audit-testids.mts`

| Component | Missing Element | Priority | Suggested Test-ID |
|-----------|----------------|----------|-------------------|
| [Component] | [Element] | P0/P1/P2 | `[suggested-id]` |

---

## E2E Test Structure

### Layer 1: Discovery Scripts (`.mts`)

```
scripts/e2e/
├── discover-routes.mts        # Crawl routes, generate manifest
├── audit-testids.mts          # Scan source for data-testid attrs
├── audit-cta-gaps.mts         # Find revenue pages missing cart CTAs
└── audit-accessibility.mts    # WCAG AA sweep
```

### Layer 2: Validation Tests (`.spec.ts`)

```
e2e/specs/
├── route-health.spec.ts       # Every route returns 200, no JS errors
├── accessibility.spec.ts      # axe-core audit on all pages
├── navigation.spec.ts         # Header/footer links work
└── service-conversion.spec.ts # CTA → cart → checkout flow
```

### Layer 3: Regression Tests (`.spec.ts`)

```
e2e/specs/
├── cart.spec.ts               # Add/remove/update/persist cart
├── checkout-flow.spec.ts      # Full purchase journey
├── questionnaire.spec.ts      # Form submissions
└── browser-devtools.spec.ts   # Console error detection
```

---

## Fixtures & Shared Data

### test-data.ts — Selectors

```typescript
export const sel = {
  // Cart
  cartBadge: '[data-testid="cart-badge"]',
  cartDrawer: '[data-testid="cart-drawer"]',
  addToCartBtn: '[data-testid="add-to-cart-btn"]',
  removeFromCartBtn: '[data-testid="remove-from-cart-btn"]',
  checkoutBtn: '[data-testid="checkout-btn"]',
  
  // Checkout
  emailInput: '[data-testid="checkout-form-email-input"]',
  firstNameInput: '[data-testid="checkout-form-first-name-input"]',
  lastNameInput: '[data-testid="checkout-form-last-name-input"]',
  continueToPayment: '[data-testid="continue-to-payment"]',
  completeOrder: '[data-testid="complete-order"]',
  orderSuccess: '[data-testid="order-success"]',
  
  // Navigation
  navHome: '[data-testid="nav-link-home"]',
  navServices: '[data-testid="nav-link-services"]',
  // [Add more]
};
```

### helpers.ts — Utilities

```typescript
// Page load (handles SPA hydration + Supabase WebSocket)
waitForPageLoad(page)

// Cart operations
addFirstPackageToCart(page) → boolean
clearCart(page)
openCart(page)
expectCartItems(page, count)

// Checkout
goToCheckout(page)
fillCheckoutForm(page, user?)
fillStripeCard(page, card?)

// Console monitoring
collectConsoleErrors(page) → () => string[]
collectNetworkFailures(page) → () => { url, status }[]
```

---

## Automation Commands

```bash
# Run all tests
npx playwright test

# Run specific layer
npx playwright test route-health            # Layer 2: Validation
npx playwright test cart checkout-flow       # Layer 3: Regression

# Run audit scripts
npx tsx scripts/e2e/discover-routes.mts      # Generate route manifest
npx tsx scripts/e2e/audit-testids.mts        # Check test-ID coverage
npx tsx scripts/e2e/audit-cta-gaps.mts       # Find missing CTAs

# Update test data after new test-IDs added
npx tsx scripts/e2e/sync-selectors.mts       # Sync source → fixtures
```

---

## Adding New Test-IDs

### Checklist

1. Add `data-testid="[name]"` to component JSX
2. Add selector to `e2e/fixtures/test-data.ts`
3. Run `npx tsc --noEmit` (verify no type errors)
4. Run relevant spec: `npx playwright test [spec-name]`
5. Update this doc's "Existing Test-IDs" table
6. Commit with: `feat: add data-testid to [component]`

### Common Patterns

```tsx
// Static test-ID
<button data-testid="add-to-cart-btn">Add to Cart</button>

// Dynamic test-ID (with context)
<div data-testid={`product-card-${product.id}`}>...</div>

// Conditional test-ID
<span data-testid={isActive ? "status-active" : "status-inactive"}>
  {status}
</span>
```

---

**Next Doc**: [FEATURE-STATUS](./FEATURE-STATUS.md) (what's built vs missing)
