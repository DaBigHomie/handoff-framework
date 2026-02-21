# 02 — Critical Context

**Status**: [Active]  
**Last Updated**: [Date]  
**Manually Curated**: Yes  
**Est. Reading**: 600 lines, 1,500 tokens, 2 minutes

---

## Purpose

**Must-know information** that cannot be auto-generated. Read this SECOND (after Project State) to understand the project's critical constraints, gotchas, and decisions.

**Update frequency**: When critical decisions are made or gotchas are discovered

---

## 🚨 Critical Gotchas

### Import Rules

```typescript
// ✅ CORRECT — Primary Supabase client (standalone project)
import { supabase } from '@/lib/supabase';

// ❌ WRONG — Lovable Cloud client (different schema, wrong project)
import { supabase } from '@/integrations/supabase/client';
```

**Why**: This project has TWO Supabase clients. Always use `@/lib/supabase` for all production code. The `@/integrations/supabase/client` connects to a different Supabase project with a different schema. Using it causes 37+ TypeScript errors.

### Database Migration Safety

**NEVER without explicit user approval:**
- `npx supabase db reset` (destructive)
- `DROP TABLE`, `TRUNCATE`, `DELETE FROM` (destructive)
- Pushing migrations to production without local testing

**Required workflow:**
1. Check schema: `npx supabase db diff`
2. Verify migration order: `ls -la supabase/migrations/`
3. Use safe SQL: `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE IF EXISTS`
4. Show user what will execute, get approval
5. Apply migration via REST API (bypasses Copilot firewall):
   ```bash
   export SUPABASE_URL="https://[project-id].supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="[key]"
   node scripts/apply-migration-via-rest.cjs supabase/migrations/[file].sql
   ```
6. **ALWAYS regenerate types** after migrations:
   ```bash
   npx supabase gen types typescript --project-id [id] > src/integrations/supabase/types.ts
   ```
7. Type check: `npx tsc --noEmit` (must pass)

### TypeScript Build Gotchas

**Dev server (Vite) does NOT type-check.** It uses esbuild which skips TypeScript validation.

```bash
# ❌ FALSE POSITIVE — Dev server runs even with TS errors
npm run dev

# ✅ REAL VALIDATION — Must run before committing
npx tsc --noEmit && npm run lint && npm run build
```

**CRITICAL**: Always run `npx tsc --noEmit` before committing. Build errors caught in CI are too late.

### Component Prop Mismatches

Always verify component prop interfaces before using them. Common mistakes:

| Component | Wrong Prop | Correct Prop |
|-----------|-----------|--------------|
| DataList | `id` | `label` |
| Select | `value` | `selected` |
| Autocomplete | `suggestions` | `options` |

**Fix**: Read the component's TypeScript interface in `src/components/ui/[component].tsx` before using.

### Hook Return Type Mismatches

Check hook return types before consuming them:

```typescript
// ✅ CORRECT
const { fetchSuggestions, isLoading, suggestions } = useAISuggestions();
const loading = isLoading.audience; // Record<string, boolean>

// ❌ WRONG — outdated interface
aiSuggestions.getSuggestion(...)  // doesn't exist
aiSuggestions.isLoading           // not a simple boolean
```

**Fix**: Read the hook's return type in its source file before using.

### JSONB Type Casting

Always cast JSONB fields through `unknown` first:

```typescript
// ✅ CORRECT
features: row.features as unknown as TierFeature[],

// ❌ WRONG — direct cast fails
features: row.features as TierFeature[],
```

### Framer Motion + React Event Conflicts

Destructure and discard conflicting drag/animation handlers:

```typescript
const { onDragStart, onDrag, onDragEnd, onAnimationStart, onAnimationEnd, ...safeProps } = props;
<motion.input {...safeProps} />
```

### Workflow File Syntax (GitHub Actions)

**CRITICAL**: Workflow files must NEVER contain `${{ }}` syntax in comments:

```yaml
# ❌ WRONG - GitHub Actions tries to parse this
# Example: [[ "${{ expression }}" == "true" ]]

# ✅ CORRECT - Avoid ${{ }} in comments entirely
# Example: Check if condition equals true in bash
```

**Pre-commit validation**:
```bash
grep -n '${{.*}}' .github/workflows/*.yml | grep '#' && echo "⚠️ Found ${{}} in comments" || echo "✅ No workflow syntax issues"
```

---

## 🏗️ Architectural Decisions

### FSD (Feature-Sliced Design)

```
src/
├── features/     # Business features (isolated)
├── entities/     # Business entities (shared models)
├── shared/       # Shared utilities, constants, types
└── lib/          # External API wrappers (Supabase, Stripe, etc.)
```

**Import Rules (One-Way Dependencies)**:

```
features/ → entities/ → shared/ → lib/
  ↓ can import from →
```

- `features/` can import from `entities/`, `shared/`, `lib/`
- `entities/` can import from `shared/`, `lib/`
- `shared/` can import from `lib/` only
- **NEVER import `features/` into `shared/`**

### Routing Strategy

**React Router v6** with lazy loading:

```typescript
const LazyServicePage = lazy(() => import('./pages/ServicePage'));

<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/services/:category/:service" element={<LazyServicePage />} />
</Routes>
```

**Route Discovery**: Use `npm run discover:routes` to auto-generate `route-manifest.json` (Layer 1 of 20x E2E framework).

### State Management

- **Server state**: React Query + Supabase realtime subscriptions
- **Client state**: React Context for cart, auth, theme
- **Form state**: React Hook Form + Zod validation

**NEVER use Redux** unless explicitly approved.

### Styling Conventions

```typescript
// ✅ CORRECT — Tailwind utility classes
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm">

// ❌ AVOID — Inline styles (except for dynamic values)
<div style={{ display: 'flex', padding: '24px' }}>

// ✅ OK — Dynamic styles
<div style={{ backgroundColor: dynamicColor }}>
```

**Component library**: shadcn/ui (copy-paste, not npm package)

---

## 🔐 Authentication & Permissions

### Supabase Auth

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Logout
await supabase.auth.signOut();
```

### Row-Level Security (RLS)

All Supabase tables have RLS enabled. Policies are defined in migrations.

**Common policy patterns**:
- `users` table: Users can read/update their own row
- `orders` table: Users can read their own orders, admins can read all
- `products` table: Public read, admin-only write

---

## 💳 Payment Flow

### Stripe Integration

```typescript
// Create checkout session
const { data, error } = await supabase.functions.invoke('create-checkout-session', {
  body: { priceId: 'price_xxx', quantity: 1 }
});

// Redirect to Stripe
window.location.href = data.url;
```

**Test cards** (from `e2e/fixtures/test-data.ts`):
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

---

## 🧪 Testing Strategy (20x E2E Framework)

### Three-Layer Architecture

**Layer 1 — Discovery** (`.mts` scripts):
- `npm run discover:routes` → `route-manifest.json`
- `npm run audit:cta` → `cta-gap-analysis.json`
- `npm run audit:a11y` → `a11y-audit.json`
- **Purpose**: Generate artifacts, audit project state
- **When**: After implementation, before validation

**Layer 2 — Validation** (`.spec.ts` thin tests):
- `npm run test:health` → Route health checks
- Consumes `route-manifest.json`
- **Purpose**: Binary pass/fail gates
- **When**: Every PR in CI

**Layer 3 — Regression** (`.spec.ts` journey tests):
- `npm run test:checkout` → Checkout flow
- `npm run test:cart` → Cart operations
- **Purpose**: Critical path validation
- **When**: Pre-deploy

**CRITICAL RULE**: NO `.sh` scripts in handoffs. All automation is TypeScript.

### Pre-Commit Checklist

```bash
# 1. Type check (MUST pass)
npx tsc --noEmit

# 2. Lint (MUST pass)
npm run lint

# 3. Build (MUST succeed)
npm run build

# 4. Quality gates (if UI/code changed)
npm run discover:routes     # Auto-generate route manifest
npm run audit:cta           # Check revenue pages
npm run audit:a11y          # WCAG violations
```

---

## 🚀 Deployment

### Environments

| Environment | URL | Branch | Auto-Deploy |
|-------------|-----|--------|-------------|
| Production | [URL] | `main` | ✅ On push |
| Staging | [URL] | `develop` | ✅ On push |
| Preview | [URL] | PR branches | ✅ On PR |

### Pre-Deploy Quality Gates

**MUST pass before production deploy:**

- ✅ TypeScript: 0 errors (`npx tsc --noEmit`)
- ✅ ESLint: 0 errors (`npm run lint`)
- ✅ Build: Success (`npm run build`)
- ✅ Route Health: All routes load (`npm run test:health`)
- ✅ Accessibility: <5 critical WCAG violations (`npm run audit:a11y`)
- ✅ Performance: LCP <2.5s on key pages (`npm run audit:performance`)
- ✅ Critical Paths: Checkout + cart flows pass (`npm run test:pre-deploy`)

**Deployment blocker**: If ANY gate fails, deployment is blocked.

---

## 💾 Data Backup & Recovery

### Supabase Backups

- **Automatic**: Daily backups (7-day retention on free tier)
- **Manual**: Supabase Dashboard → Database → Backups
- **Point-in-time recovery**: Pro plan only

### Local Development Data

```bash
# Dump local database
npx supabase db dump > backup.sql

# Restore from dump
npx supabase db reset
psql [connection-string] < backup.sql
```

---

## 📚 Documentation Standards

### Handoff Documents (this folder)

**Naming**: `[number]-[NAME]` (e.g., `01-PROJECT-STATE.md`)

**Max Lines** (enforced):
- Master Index: 500 lines
- Project State: 800 lines (auto-generated)
- Critical Context: 600 lines (this doc)
- Architecture docs: 1,000 lines
- Feature Status: 800 lines
- Gap Analysis: 5,000 lines (comprehensive audit)

**Mermaid Diagrams**: Always include visual diagrams for complex flows

**Token Estimates**: Include at top of every doc

### Code Comments

```typescript
// ✅ GOOD — Explains WHY, not WHAT
// CRITICAL: Must cast through unknown due to Supabase JSONB type mismatch
const features = row.features as unknown as TierFeature[];

// ❌ BAD — Obvious from code
// Loop through features
features.forEach(f => ...);
```

---

## 🔧 Troubleshooting Guide

### Build Fails After Pull

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### TypeScript Errors After Supabase Changes

```bash
# Regenerate types
npx supabase gen types typescript --project-id [id] > src/integrations/supabase/types.ts

# Type check
npx tsc --noEmit
```

### Quality Gate Failures

```bash
# Re-run discovery (regenerates route-manifest.json)
npm run discover:routes

# Check what changed
git diff e2e/fixtures/route-manifest.json

# Re-run failing gate
npm run audit:cta  # or audit:a11y, test:health, etc.

# Read artifact for details
cat reports/cta-gap-analysis.json
```

### Migration Stuck

```bash
# Check migration status
npx supabase migration list

# If migration failed, rollback locally
npx supabase db reset

# Fix migration SQL, then re-apply
node scripts/apply-migration-via-rest.cjs supabase/migrations/[file].sql
```

---

## 📞 Escalation

**When to escalate to user**:
- Database migrations (always get approval)
- Breaking API changes
- Deployment to production
- Unknown errors (can't determine root cause)
- Security vulnerabilities

**When to investigate first**:
- TypeScript errors (check types.ts)
- Build errors (check dependencies)
- Test failures (check quality gate artifacts)

---

## Agent Handoff Context

**If you're the next agent reading this:**

1. **You've read Project State** — Now you know the current state
2. **Now you know the gotchas** — Don't repeat known mistakes
3. **Next steps**:
   - If fixing a bug → Read the architecture doc for that system
   - If adding a feature → Read the feature status doc
   - If deploying → Read the gap analysis decision matrix
   - Find specific doc in `00-MASTER-INDEX.md`

**Estimated token cost**: 1,500 tokens (this doc, 2 min)

---

**Max Lines**: 600 (manually enforced)  
**Format**: Markdown with code examples  
**Frequency**: Update when critical decisions/gotchas discovered  
**Token Cost**: ~1,500 tokens per read
