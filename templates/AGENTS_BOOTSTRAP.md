## 📋 Handoff Documentation Framework

**Package**: `@dabighomie/handoff-framework` v3.1.0
**Purpose**: Structured agent-to-agent knowledge transfer (15 numbered templates, tag-based cross-session discovery)

### Quick Start (Remote Agents / GitHub Issues / PRs)

```bash
# Install globally or use npx (no tsx dependency needed)
npx @dabighomie/handoff-framework init {{PROJECT_NAME}} --session <slug> --tags <csv>

# Example: Initialize handoff docs for a checkout refactor
npx @dabighomie/handoff-framework init {{PROJECT_NAME}} --session checkout-refactor --tags checkout,stripe,payments

# Validate existing docs
npx @dabighomie/handoff-framework validate {{PROJECT_NAME}} --session <slug>

# Generate project state from codebase analysis
npx @dabighomie/handoff-framework generate {{PROJECT_NAME}} --session <slug>

# View cross-session tag index
npx @dabighomie/handoff-framework tag-index {{PROJECT_NAME}}
```

### When to Create Handoff Docs

Create handoff documentation when:
- Starting a multi-step implementation task
- Handing off work between agents (Copilot → Copilot, human → agent)
- Complex bug investigation requiring context preservation
- Database migrations with multiple dependent steps
- Any work spanning multiple sessions or PRs

### Handoff Doc Structure (15 Templates)

| Seq | Filename | Category | Required |
|-----|----------|----------|----------|
| 00 | MASTER_INDEX | Context | 🔴 Yes |
| 01 | PROJECT_STATE | Context | 🔴 Yes |
| 02 | CRITICAL_CONTEXT | Context | 🔴 Yes |
| 03 | TASK_TRACKER | Session | 🔴 Yes |
| 04 | SESSION_LOG | Session | 🔴 Yes |
| 05 | NEXT_STEPS | Session | 🔴 Yes |
| 06-11 | ARCHITECTURE, COMPONENT_MAP, etc. | Findings | 🟡 Recommended |
| 12-14 | REFERENCE_MAP, AUDIT_PROMPTS, IMPROVEMENTS | Reference | 🟡 Recommended |

### Tag-Based Discovery

Tags enable cross-session discovery. Use `--tags` when initializing:
```bash
# Tags are kebab-case, 2-50 chars
npx @dabighomie/handoff-framework init {{PROJECT_NAME}} --session db-migration --tags db-migration,supabase,schema-change
```

Scan all sessions for a topic:
```bash
npx @dabighomie/handoff-framework tag-index {{PROJECT_NAME}}
```

### Docs Location

Handoff docs live at: `docs/handoff-{session-slug}/`
- Default (no session): `docs/handoff/`
- With session: `docs/handoff-checkout-refactor/`

**Reference**: [handoff-framework README](https://github.com/DaBigHomie/handoff-framework)
