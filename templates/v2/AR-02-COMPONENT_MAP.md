# Component Interaction Map — {{PROJECT_NAME}}

**Project**: {{PROJECT_NAME}}
**Framework**: @dabighomie/handoff-framework v{{FRAMEWORK_VERSION}}
**Last Updated**: {{DATE}}

---

## Purpose

Document component → hook dependencies, data flows, and system interactions. Prevents agents from making changes without understanding what breaks.

---

## System Overview

```
[TODO: High-level architecture diagram in ASCII or Mermaid]

Example:
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Pages   │───▶│Components│───▶│  Hooks   │
└──────────┘    └──────────┘    └──────────┘
                                     │
                                     ▼
                               ┌──────────┐
                               │ Services │
                               │(Supabase)│
                               └──────────┘
```

---

## Hook Dependency Map

### Primary Hooks

| Hook | Purpose | Used By (Components) | Depends On |
|------|---------|---------------------|-----------|
| [TODO] | [purpose] | [component list] | [other hooks/services] |

### Hook → Component Matrix

| Component | Hook 1 | Hook 2 | Hook 3 | Hook 4 |
|-----------|--------|--------|--------|--------|
| [Component A] | ✅ | | ✅ | |
| [Component B] | | ✅ | | ✅ |

---

## Data Flow Diagrams

### Flow 1: [Name] (e.g., Service Purchase)

```
[Page] → [Component] → [Hook] → [API/DB]
  │         │              │         │
  │         │              │         ▼
  │         │              │    [Supabase Table]
  │         │              ▼
  │         │         [State Update]
  │         ▼
  │    [UI Re-render]
  ▼
[Navigation to Next Page]
```

**Steps**:
1. [TODO: Step-by-step description]

### Flow 2: [Name]

```
[TODO]
```

---

## Cart/State System Decision Tree

```
User wants to purchase something
├── Is it a SERVICE?
│   └── Use [Hook A] → [Storage A] → [Checkout A]
├── Is it a PRODUCT?
│   └── Use [Hook B] → [Storage B] → [Checkout B]
└── Is it a one-time purchase?
    └── Use [Direct Checkout]
```

---

## Cross-Component Dependencies

### Shared State

| State | Provider | Consumers | Storage |
|-------|----------|-----------|---------|
| [TODO] | [context/hook] | [component list] | localStorage / Supabase / memory |

### Event Chains

| Trigger | Source | Affects | Side Effects |
|---------|--------|---------|-------------|
| [TODO] | [component] | [components] | [what happens] |

---

## Common Patterns

### Pattern 1: Container/Presentational

```
[Container Component] (has hooks, state)
  └── [Presentational Component] (pure, props only)
```

### Pattern 2: Combined State

```
[Header Component]
  ├── useHookA() → itemCount: 3
  ├── useHookB() → itemCount: 2
  └── Display: "Cart (5)" // combined
```

---

## Known Issues & Gotchas

| # | Issue | Components Affected | Workaround |
|---|-------|-------------------|-----------|
| 1 | [TODO] | [components] | [workaround] |

---

## Impact Analysis Template

> Use this when modifying a component to understand blast radius.

**Changing**: [Component/Hook Name]

| What Changes | Direct Impact | Indirect Impact |
|-------------|--------------|----------------|
| Props interface | [consumers] | [their consumers] |
| Return type | [consumers] | [their consumers] |
| State logic | [UI behavior] | [E2E tests] |
| API call | [loading states] | [error handling] |

---

**Framework**: @dabighomie/handoff-framework v{{FRAMEWORK_VERSION}}
**Generated**: {{DATE}}
