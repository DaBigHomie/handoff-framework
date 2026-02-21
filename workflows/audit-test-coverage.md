# Workflow: Audit Test Coverage

**Purpose**: Scan components for data-testid coverage and identify gaps.  
**Gate Type**: Layer 1 — Discovery  
**Output**: Summary report of testid coverage by component category

---

## When to Run

- After adding new interactive components
- Before writing new E2E specs
- When testid coverage drops below threshold
- As part of a comprehensive project audit

---

## Command

```bash
npm run audit:all
```

This runs discovery + CTA + a11y in sequence. For testid-specific coverage:

```bash
# Manual grep-based coverage check
grep -r "data-testid" src/ --include="*.tsx" --include="*.ts" | sort -u | wc -l
```

---

## Subagent Prompt

```
Audit data-testid coverage in damieus-com-migration.

Tasks:
1. Count all data-testid attributes in src/ (grep for static + dynamic)
2. Compare against the sel object in e2e/fixtures/test-data.ts
3. Identify selectors in test-data.ts that have NO matching source attribute
4. Group coverage by category: cart, checkout, forms, navigation, admin, auth

Return:
1. Total testid count (static + dynamic)
2. Coverage by category (percentage)
3. Missing testids (selectors in tests but not in source)
4. Recommendation: which components to instrument next
```

---

## Coverage Targets

| Category | Current | Target | Priority |
|----------|---------|--------|----------|
| Cart/Checkout | 94% | 100% | P0 |
| Calculators | ~30% | 80% | P1 |
| CTAs (FunnelCTA) | 0% | 100% | P0 |
| Forms/Questionnaire | ~70% | 90% | P1 |
| Navigation | <5% | 80% | P2 |
| Admin | 0% | 60% | P3 |
| Auth | 0% | 60% | P3 |

---

## Handoff Integration

```markdown
**Quality Gates Run**:
- ✅ Test Coverage: 119 testids (94% cart/checkout, 100% CTAs)
  OR
- ⚠️ Test Coverage: 112 testids (5 selectors missing from source)

**Next Agent Instructions**:
1. Read `e2e/fixtures/test-data.ts` (sel object, lines 82-160)
2. Add missing data-testid attributes to flagged components
3. Re-run coverage audit to verify
```
