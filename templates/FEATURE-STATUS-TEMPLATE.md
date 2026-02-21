# Feature Status — What's Built vs Missing

**Last Updated**: [Date]  
**Est. Reading**: 800 lines, 2,000 tokens, 3 minutes

---

## Purpose

**Comprehensive inventory** of all features: what's built, what's missing, what's broken, what's planned. Read this when:
- Planning next sprint
- Deciding what to build
- Checking deployment readiness
- Onboarding to project

**Related Docs**:
- [00-MASTER-INDEX](./00-MASTER-INDEX.md) — Navigation
- [01-PROJECT-STATE](./01-PROJECT-STATE.md) — Current metrics
- [XX-GAP-ANALYSIS](./XX-GAP-ANALYSIS.md) — Deployment blockers

---

## Feature Status Legend

- ✅ **Production** — Deployed, tested, working in production
- 🎯 **Staging** — Built, tested, deployed to staging
- 🔄 **In Progress** — Active development, not deployed
- 🧪 **Testing** — Built, awaiting QA/validation
- ⏸️ **Paused** — Started but deprioritized
- ⏳ **Planned** — Designed, not started
- ❌ **Blocked** — Cannot proceed due to dependency/issue
- 🚫 **Cancelled** — Will not build

---

## Feature Inventory

### Homepage

| Feature | Status | Routes | Components | Quality Gates | Blockers |
|---------|--------|--------|------------|---------------|----------|
| Hero section | ✅ Production | `/` | 3 | All passing | None |
| Value propositions | ✅ Production | `/` | 5 | All passing | None |
| Social proof | 🔄 In Progress | `/` | 2 | ⏭️ Not tested | Design approval |
| CTA buttons | ✅ Production | `/` | 1 | All passing | None |
| Newsletter signup | ⏳ Planned | `/` | 0 | ⏭️ Not started | API integration |

**Overall Progress**: 60% complete (3/5 features in production)

---

### Authentication

| Feature | Status | Routes | Components | Quality Gates | Blockers |
|---------|--------|--------|------------|---------------|----------|
| Email/password login | ✅ Production | `/login` | 4 | All passing | None |
| Social login (Google) | 🔄 In Progress | `/login` | 2 | ⚠️ OAuth config | Credentials |
| Password reset | ✅ Production | `/reset-password` | 3 | All passing | None |
| Email verification | 🧪 Testing | `/verify` | 2 | ⚠️ Email delivery | SMTP setup |
| 2FA | ⏳ Planned | - | 0 | ⏭️ Not started | None |
| Magic link | ❌ Blocked | - | 0 | ⏭️ Not started | Supabase config |

**Overall Progress**: 50% complete (2/6 features in production)

**Blockers**:
- Social login: Need Google OAuth credentials from client
- Email verification: SMTP not configured in production
- Magic link: Supabase email templates not approved

---

### Service Pages

| Feature | Status | Routes | Components | Quality Gates | Blockers |
|---------|--------|--------|------------|---------------|----------|
| Service listing | ✅ Production | `/services` | 6 | All passing | None |
| Category pages | ✅ Production | `/services/:category` | 8 | All passing | None |
| Individual service | 🔄 In Progress | `/services/:category/:service` | 12 | ❌ 3 CTA gaps | Quality gates |
| Dynamic pricing | 🔄 In Progress | - | 4 | ⚠️ Stripe integration | Testing |
| Add to cart | 🔄 In Progress | - | 2 | ❌ Cart sync | Cart system |
| Service comparison | ⏳ Planned | `/services/compare` | 0 | ⏭️ Not started | None |
| Booking calendar | ⏳ Planned | - | 0 | ⏭️ Not started | Calendar API |

**Overall Progress**: 29% complete (2/7 features in production)

**Quality Gate Details**:
- CTA gaps: 3 revenue pages missing cart integration → `reports/cta-gap-analysis.json`
- Cart sync: `useUnifiedCart` not integrated on 5 service pages

---

### Shopping Cart

| Feature | Status | Routes | Components | Quality Gates | Blockers |
|---------|--------|--------|------------|---------------|----------|
| Cart drawer | 🔄 In Progress | - | 5 | ⚠️ 2 integration issues | Testing |
| Add/remove items | 🔄 In Progress | - | 3 | ⚠️ State sync | Cart context |
| Quantity adjustment | 🔄 In Progress | - | 2 | ✅ Passing | None |
| Cart persistence | 🧪 Testing | - | 1 | ⚠️ LocalStorage | Race conditions |
| Mini cart indicator | ⏳ Planned | - | 0 | ⏭️ Not started | None |
| Cart abandonment | ❌ Blocked | - | 0 | ⏭️ Not started | Email automation |

**Overall Progress**: 17% complete (0/6 features in production, 4 in progress)

**Integration Issues**:
- Cart drawer: Not syncing with `useShoppingCart` hook → See `CART-SYSTEMS-ARCHITECTURE.md`
- State sync: Three cart implementations (useUnifiedCart, useShoppingCart, CartContext) need consolidation

---

### Checkout Flow

| Feature | Status | Routes | Components | Quality Gates | Blockers |
|---------|--------|--------|------------|---------------|----------|
| Cart review | ⏳ Planned | `/checkout` | 0 | ⏭️ Not started | Cart completion |
| Shipping form | ⏳ Planned | `/checkout/shipping` | 0 | ⏭️ Not started | None |
| Payment (Stripe) | ⏳ Planned | `/checkout/payment` | 0 | ⏭️ Not started | Test mode keys |
| Order confirmation | ⏳ Planned | `/checkout/success` | 0 | ⏭️ Not started | None |
| Order failure handling | ⏳ Planned | `/checkout/failed` | 0 | ⏭️ Not started | None |
| Guest checkout | ❌ Blocked | - | 0 | ⏭️ Not started | Auth redesign |

**Overall Progress**: 0% complete (0/6 features started)

**Blockers**:
- Entire checkout flow blocked by cart system consolidation (Issue #40)
- Guest checkout requires auth system redesign

---

### User Dashboard

| Feature | Status | Routes | Components | Quality Gates | Blockers |
|---------|--------|--------|------------|---------------|----------|
| Dashboard home | ⏳ Planned | `/dashboard` | 0 | ⏭️ Not started | None |
| Order history | ⏳ Planned | `/dashboard/orders` | 0 | ⏭️ Not started | None |
| Profile settings | ⏳ Planned | `/dashboard/profile` | 0 | ⏭️ Not started | None |
| Payment methods | ⏳ Planned | `/dashboard/payments` | 0 | ⏭️ Not started | Stripe setup |
| Saved addresses | ⏳ Planned | `/dashboard/addresses` | 0 | ⏭️ Not started | None |
| Download center | ⏳ Planned | `/dashboard/downloads` | 0 | ⏭️ Not started | File storage |

**Overall Progress**: 0% complete (0/6 features started)

---

### Admin Portal

| Feature | Status | Routes | Components | Quality Gates | Blockers |
|---------|--------|--------|------------|---------------|----------|
| Admin dashboard | ⏳ Planned | `/admin` | 0 | ⏭️ Not started | RLS policies |
| User management | ⏳ Planned | `/admin/users` | 0 | ⏭️ Not started | Admin auth |
| Order management | ⏳ Planned | `/admin/orders` | 0 | ⏭️ Not started | None |
| Product management | ⏳ Planned | `/admin/products` | 0 | ⏭️ Not started | None |
| Analytics | ⏳ Planned | `/admin/analytics` | 0 | ⏭️ Not started | Analytics API |

**Overall Progress**: 0% complete (0/5 features started)

**Blockers**:
- Entire admin portal blocked by RLS policy design + admin role implementation

---

## Overall Project Status

### By Category

| Category | Features | ✅ Prod | 🔄 In Progress | ⏳ Planned | ❌ Blocked |
|----------|----------|---------|---------------|------------|-----------|
| Homepage | 5 | 3 (60%) | 1 (20%) | 1 (20%) | 0 |
| Auth | 6 | 2 (33%) | 1 (17%) | 1 (17%) | 2 (33%) |
| Service Pages | 7 | 2 (29%) | 4 (57%) | 2 (14%) | 0 |
| Cart | 6 | 0 (0%) | 4 (67%) | 1 (17%) | 1 (17%) |
| Checkout | 6 | 0 (0%) | 0 (0%) | 5 (83%) | 1 (17%) |
| Dashboard | 6 | 0 (0%) | 0 (0%) | 6 (100%) | 0 |
| Admin | 5 | 0 (0%) | 0 (0%) | 5 (100%) | 0 |
| **TOTAL** | **41** | **7 (17%)** | **10 (24%)** | **21 (51%)** | **4 (10%)** |

### Time to MVP

**MVP Definition**: Homepage + Service Pages + Cart + Checkout working

**Features Required for MVP**: 24 features (Homepage 5 + Services 7 + Cart 6 + Checkout 6)

**Current Progress**:
- ✅ Complete: 5/24 (21%)
- 🔄 In Progress: 9/24 (38%)
- ⏳ Remaining: 10/24 (42%)

**Estimated Time**: [X weeks] (based on velocity of [Y features/week])

**Critical Path**:
1. Fix CTA gaps on service pages (3 revenue pages) — 2 days
2. Consolidate cart systems (Issue #40) — 5 days
3. Build checkout flow (6 features) — 10 days
4. Run `npm run test:pre-deploy` (all gates must pass) — 1 day
5. Deploy to staging → Production — 1 day

**Blockers on Critical Path**:
- [ ] CTA gaps (blocking service pages)
- [ ] Cart consolidation (blocking checkout)
- [ ] Stripe test keys (blocking payment)

---

## Quality Gate Summary

**(From 01-PROJECT-STATE.md)**

### Gates Passing ✅

- TypeScript: 0 errors
- ESLint: 0 errors
- Build: Success
- Route Discovery: 127/127 routes

### Gates Failing ❌

- **CTA Gaps**: 3 critical revenue pages missing cart integration
  - Artifact: `reports/cta-gap-analysis.json`
  - Affected features: Service Pages
  - Fix required before: Service Pages → Production

- **Accessibility**: 12 serious WCAG violations
  - Artifact: `reports/a11y-audit.json`
  - Affected features: Homepage, Service Pages, Cart
  - Fix required before: Production deploy

- **Cart Integration**: 2 integration issues
  - Cart drawer not syncing with hook
  - Three cart implementations need consolidation
  - Fix required before: Checkout implementation

### Gates Skipped ⏭️

- Performance: Run in staging only
- Checkout Flow: Feature not started yet

---

## Deployment Readiness

### Production Blockers

**Cannot deploy to production until:**

- [ ] All CTA gaps fixed (3 revenue pages need cart buttons)
- [ ] Accessibility violations reduced to <5 critical
- [ ] Cart system consolidated (Issue #40)
- [ ] Checkout flow implemented and tested
- [ ] `npm run test:pre-deploy` passes (all critical paths working)
- [ ] Stripe production keys configured
- [ ] Email SMTP configured

**Estimated time to production-ready**: [X weeks]

### Staging Readiness

**Can deploy to staging when:**

- [x] TypeScript + ESLint passing (currently passing)
- [ ] CTA gaps fixed
- [ ] Cart integration issues resolved

**Estimated time to staging-ready**: [X days]

---

## Feature Prioritization

### P0 (Critical — Blocks MVP)

1. **Fix CTA gaps** — 3 revenue pages missing cart integration
   - Effort: 2 days
   - Blocked by: None
   - Next step: Read `reports/cta-gap-analysis.json`, add cart buttons

2. **Consolidate cart systems** — Issue #40
   - Effort: 5 days
   - Blocked by: Architecture decision (which cart implementation to keep)
   - Next step: Read `CART-SYSTEMS-ARCHITECTURE.md`, propose consolidation plan

3. **Build checkout flow** — 6 features
   - Effort: 10 days
   - Blocked by: Cart consolidation (P0.2)
   - Next step: Wait for cart system to be stable

### P1 (High — Improves UX)

1. **Fix accessibility violations** — 12 serious WCAG issues
   - Effort: 3 days
   - Blocked by: None (can parallelize with P0)
   - Next step: Read `reports/a11y-audit.json`, fix violations

2. **Email verification** — Complete auth flow
   - Effort: 1 day
   - Blocked by: SMTP configuration
   - Next step: Request SMTP credentials from client

### P2 (Medium — Nice to Have)

1. **Service comparison** — Feature for comparing services
2. **Mini cart indicator** — Badge showing cart item count
3. **Dashboard features** — User dashboard home, order history

### P3 (Low — Future Enhancement)

1. **2FA** — Two-factor authentication
2. **Guest checkout** — Requires auth redesign
3. **Admin portal** — All admin features
4. **Cart abandonment** — Email automation

---

## Agent Handoff Context

**If you're planning what to build next**:
1. Read "Feature Prioritization" section (P0 is most critical)
2. Read "Overall Project Status" table (see progress %)
3. Read "Deployment Readiness" (what's blocking deploy)
4. Check `01-PROJECT-STATE.md` for quality gate status

**If you're working on a blocked feature**:
1. Read "Blockers" column for your feature
2. Read blocker description in your category section
3. Check related architecture doc (e.g., `CART-SYSTEMS-ARCHITECTURE.md`)
4. Resolve blocker or escalate to user

**Estimated token cost**: 2,000 tokens (this doc, 3 min)

---

**Max Lines**: 800 (manually enforced)  
**Format**: Markdown tables for scannability  
**Frequency**: Update after every feature completion  
**Token Cost**: ~2,000 tokens per read
