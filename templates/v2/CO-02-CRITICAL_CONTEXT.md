# Critical Context — {{PROJECT_NAME}}

**Category**: Core (CO)  
**Document**: CO-02  
**Version**: 2.0.0  
**Created**: {{DATE}}  
**Last Updated**: {{DATE}}

---

## Purpose

Must-know information for any agent working on this project. Read this **before writing any code**. Contains gotchas, critical decisions, and patterns that prevent wasted work.

```bash
# Verify you understand the project before starting
cat docs/handoff/CO-02-CRITICAL_CONTEXT_{{DATE}}.md
```

---

## Supabase Client Rule

```typescript
// ✅ CORRECT — Always use this import
import { supabase } from '{{SUPABASE_IMPORT_PATH}}';

// ❌ WRONG — {{WRONG_IMPORT_REASON}}
import { supabase } from '{{WRONG_IMPORT_PATH}}';
```

**Why**: {{SUPABASE_REASON}}

---

## Database Column Gotchas

| Wrong (Code) | Correct (Database) | Table |
|--------------|-------------------|-------|
| {{COLUMN_GOTCHAS}} |

**Rule**: Always verify column names against `{{TYPES_PATH}}` before writing queries.

```typescript
// JSONB fields — always cast through unknown first
const data = row.jsonb_field as unknown as TargetType[];

// Supabase insert/upsert type conflicts — use as never
await supabase.from('table').insert({ ...data } as never);
```

---

## Import Rules

```
{{IMPORT_HIERARCHY}}
```

**Never** import upward in the dependency chain.

---

## Known Bugs & Workarounds

| Bug | Workaround | Status |
|-----|-----------|--------|
| {{KNOWN_BUGS}} |

---

## Critical Environment Variables

```bash
{{ENV_VARS}}
```

**Never** commit `.env` files. Use `.env.example` as reference.

---

## Build & Deploy Constraints

```bash
# MUST run before every commit (in this order)
npx tsc --noEmit          # TypeScript (0 errors required)
npm run lint              # ESLint (0 errors required)
npm run build             # Build (must succeed)
{{EXTRA_GATES}}
```

**Dev server does NOT type-check** — `npm run dev` uses esbuild which skips TypeScript. Always run `npx tsc --noEmit` separately.

---

## Architecture Decisions (ADRs)

| # | Decision | Date | Rationale |
|---|----------|------|-----------|
| {{ADRS}} |

---

## Anti-Patterns (Don't Do This)

| Pattern | Why It Fails | Do This Instead |
|---------|-------------|----------------|
| {{ANTI_PATTERNS}} |

---

## Component Prop Gotchas

```typescript
// Always verify prop interfaces before using components
// Common mistakes in this project:
{{PROP_GOTCHAS}}
```

---

## Related Documents

- [CO-00-MASTER_INDEX](./CO-00-MASTER_INDEX_{{DATE}}.md) — Navigation hub
- [CO-01-PROJECT_STATE](./CO-01-PROJECT_STATE_{{DATE}}.md) — Current metrics
- [CO-03-TASK_TRACKER](./CO-03-TASK_TRACKER_{{DATE}}.md) — Unified todo list
- [AR-01-SYSTEM_ARCHITECTURE](./AR-01-SYSTEM_ARCHITECTURE_{{DATE}}.md) — System design

---

## Failed Commands & Recovery

> Commands that consistently fail in this project. **Check this section BEFORE running any command to prevent token waste.**

| Command | Error | Root Cause | Solution | Tokens Saved |
|---------|-------|------------|----------|-------------|
| {{FAILED_COMMANDS}} |

### Persistent Failures (Always Fail in CI/Agent Context)

| Command | Why It Fails | Use Instead |
|---------|-------------|-------------|
| {{PERSISTENT_FAILURES}} |

---

## Issues Encountered + Solutions

> Problems solved during development. Prevents re-discovery.

| # | Issue | Discovered | Root Cause | Solution | Affected Files |
|---|-------|-----------|------------|----------|---------------|
| {{ISSUES_SOLUTIONS}} |

---

## Token Loss Prevention Checklist

Before running commands, verify:

- [ ] Command not in "Failed Commands" table above
- [ ] Correct directory (`pwd` — workspace root is NOT a git repo)
- [ ] Dependencies installed (`npm ls`)
- [ ] Correct project ID for Supabase/Stripe/etc.
- [ ] File exists before `create_file` (use edit tools for existing)
- [ ] Dev server running before E2E tests

---

**Framework**: Handoff v2.0 | **Category**: Core
