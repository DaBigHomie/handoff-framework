---
tags: []
topic: ""
created: "{{DATE}}"
sequence: 6
category: "findings"
---
# System Architecture — {{PROJECT_NAME}}

**Category**: Architecture (AR)  
**Document**: 06  
**Version**: 2.0.0  
**Created**: {{DATE}}  
**Last Updated**: {{DATE}}

---

## Purpose

System-level architecture reference. Read this when modifying any system boundary, data flow, or component interaction. Covers the full stack from frontend to database.

```bash
# Check current architecture health
npx tsc --noEmit && npm run build
```

---

## Stack Overview

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Frontend** | {{FRONTEND}} | {{FRONTEND_VER}} | {{FRONTEND_NOTES}} |
| **Styling** | {{STYLING}} | — | {{STYLING_NOTES}} |
| **State** | {{STATE}} | — | {{STATE_NOTES}} |
| **Routing** | {{ROUTING}} | — | {{ROUTING_NOTES}} |
| **Backend** | {{BACKEND}} | — | {{BACKEND_NOTES}} |
| **Database** | {{DATABASE}} | — | {{DATABASE_NOTES}} |
| **Auth** | {{AUTH}} | — | {{AUTH_NOTES}} |
| **Payments** | {{PAYMENTS}} | — | {{PAYMENTS_NOTES}} |
| **Testing** | {{TESTING}} | — | {{TESTING_NOTES}} |

---

## Directory Structure (numeric)

```
src/
├── features/              # Business features (isolated)
│   {{FEATURES_LIST}}
│
├── entities/              # Business entities (shared models)
│   {{ENTITIES_LIST}}
│
├── shared/                # Shared utilities & hooks
│   {{SHARED_LIST}}
│
├── lib/                   # External API wrappers
│   {{LIB_LIST}}
│
├── components/            # Shared UI components
│   {{COMPONENTS_LIST}}
│
├── pages/                 # Route pages
│   {{PAGES_LIST}}
│
└── hooks/                 # Global hooks
    {{HOOKS_LIST}}
```

---

## Data Flow Diagram

```
┌─────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Router  │────▶│   Page   │
└─────────┘     └──────────┘     └────┬─────┘
                                      │
                              ┌───────▼───────┐
                              │  Feature Hook  │
                              └───────┬───────┘
                                      │
                    ┌─────────────────┼──────────────────┐
                    ▼                 ▼                   ▼
             ┌────────────┐   ┌────────────┐   ┌──────────────┐
             │  Supabase  │   │   Stripe   │   │  Local State │
             │  (REST)    │   │   (API)    │   │  (Zustand)   │
             └────────────┘   └────────────┘   └──────────────┘
```

---

## Key Systems

### {{SYSTEM_1_NAME}}

**Purpose**: {{SYSTEM_1_PURPOSE}}  
**Entry Point**: `{{SYSTEM_1_ENTRY}}`  
**Key Files**:
```
{{SYSTEM_1_FILES}}
```

**Data Flow**:
1. {{SYSTEM_1_FLOW}}

---

### {{SYSTEM_2_NAME}}

**Purpose**: {{SYSTEM_2_PURPOSE}}  
**Entry Point**: `{{SYSTEM_2_ENTRY}}`  
**Key Files**:
```
{{SYSTEM_2_FILES}}
```

---

## API Integrations

| Service | Purpose | Auth | Base URL |
|---------|---------|------|----------|
| {{API_INTEGRATIONS}} |

---

## Database Schema (Key Tables)

| Table | Purpose | Rows | Key Relations |
|-------|---------|------|--------------|
| {{DB_TABLES}} |

**Migrations**: `supabase/migrations/` ({{MIGRATION_COUNT}} files)

```bash
# Check migration status
ls supabase/migrations/ | wc -l
npx supabase db diff
```

---

## Authentication Flow

```
{{AUTH_FLOW}}
```

---

## Performance Considerations

| Concern | Strategy | Implementation |
|---------|----------|---------------|
| {{PERFORMANCE}} |

---

## Related Documents

- [02-CRITICAL_CONTEXT](./02-CRITICAL_CONTEXT_{{DATE}}.md) — Gotchas affecting architecture
- [10-TEST_FRAMEWORK](./10-TEST_FRAMEWORK_{{DATE}}.md) — Testing conventions
- [05-NEXT_STEPS](./05-NEXT_STEPS_{{DATE}}.md) — Deploy pipeline

---

**Framework**: Handoff v2.0 | **Category**: Architecture
