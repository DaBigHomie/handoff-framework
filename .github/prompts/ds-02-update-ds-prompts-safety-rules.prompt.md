---
applyTo: "**"
---
# Update DS Prompts (Safety Rules)

**Priority**: priority:p1
**Status**: ⏳ **NOT STARTED**
**Estimated Time**: 2h
**Revenue Impact**: Medium
**Dependencies**: `ds-01-create-ds-reference-doc`
**Tags**: `priority:p1`, `type:chore`, `scope:ui`, `agent:copilot`, `automation:copilot`, `prompt-spec`, `documentation`

---

## Agent Bootstrap

> ⚠️ The agent executing this prompt MUST load these files first:

```bash
# 1. Repo instructions (mandatory)
cat .github/copilot-instructions.md
cat AGENTS.md

# 2. Path-specific instructions (load all matching)
ls .github/instructions/*.instructions.md

# 3. DS Reference (prerequisite — must exist)
cat docs/DESIGN-SYSTEM-REFERENCE.md

# 4. Active sprint context
cat docs/active/INDEX.md 2>/dev/null || echo "No active index"
```

**Instruction files to load** (based on task scope):
- `commit-quality.instructions.md` — always
- `core-directives.instructions.md` — always
- `typescript.instructions.md` — any code change
- `regression-prevention.instructions.md` — any UI change

---

## Objective

Audit all existing `.prompt.md` files in `.github/prompts/` and any prompt templates in `templates/` to add **DS safety rules** derived from `docs/DESIGN-SYSTEM-REFERENCE.md`. Safety rules prevent agents from: using hardcoded hex/rgb values, using hardcoded px units, bypassing the token system, or introducing unapproved animation patterns. Every prompt that touches UI or styling must include an enforceable Design System checklist section referencing the DESIGN-SYSTEM-REFERENCE doc.

---

## Pre-Flight Check

```bash
# Inventory all existing prompts
find .github/prompts/ -name "*.prompt.md" 2>/dev/null
find templates/ -name "*.prompt.md" -o -name "*template*" 2>/dev/null | grep -v node_modules | head -20

# Check for existing DS safety rules in prompts
grep -rn "DESIGN-SYSTEM-REFERENCE\|design.system\|hardcoded.hex\|safety.rule" .github/prompts/ 2>/dev/null
grep -rn "hex\|#[0-9a-fA-F]\{3,6\}\|rgb(" .github/prompts/ 2>/dev/null | grep -v "#[0-9]\{1\}" | head -20

# Verify prerequisite
test -f docs/DESIGN-SYSTEM-REFERENCE.md && echo "PASS: DESIGN-SYSTEM-REFERENCE.md exists" || echo "FAIL: Run ds-01 first"
```

---

## Intended Result

All `.prompt.md` files that contain UI/styling instructions have a **Design System Safety** section that:
- References `docs/DESIGN-SYSTEM-REFERENCE.md` as the authority
- Explicitly forbids hardcoded hex/rgb/px values
- Lists the agent bootstrap step to load `DESIGN-SYSTEM-REFERENCE.md`
- Includes a pre-commit check that greps for forbidden patterns

A new reusable snippet `templates/ds-safety-block.md` exists for easy inclusion in future prompts.

---

## Files to Modify/Create

| File | Action | Exists? | Purpose |
|------|--------|---------|---------|
| `templates/ds-safety-block.md` | CREATE | No | Reusable DS safety rules snippet |
| `.github/prompts/generate-handoff.prompt.md` | MODIFY | Yes | Add DS safety block |
| `templates/prompt-template.prompt.md` | MODIFY | Verify | Embed DS safety reference in base template |
| `docs/DESIGN-SYSTEM-REFERENCE.md` | READ ONLY | Yes (ds-01) | Source of safety rules |

---

## data-testid Contracts

| testid | Action | Used By |
|--------|--------|---------|
| N/A | — | Prompt/doc-only task |

---

## Blast Radius

```bash
# Every prompt that gets the safety block update
find .github/prompts/ -name "*.prompt.md" 2>/dev/null
grep -rn "Design System" .github/prompts/ 2>/dev/null
```

---

## A11y Checklist

- [ ] Heading hierarchy in updated prompts remains valid
- [ ] Safety rule language is unambiguous and actionable

---

## Design System

- [ ] `templates/ds-safety-block.md` contains all forbidden pattern checks
- [ ] Safety block references `docs/DESIGN-SYSTEM-REFERENCE.md` by exact path
- [ ] Pre-commit grep patterns cover: hex colors, rgb(), hardcoded px values

---

## Success Criteria

All UI-touching `.prompt.md` files include the DS safety block. `templates/ds-safety-block.md` exists as a standalone snippet. Running the blast-radius grep finds zero hardcoded hex/px violations in prompts themselves. The base `prompt-template.prompt.md` includes DS safety in its Design System section.

---

## Testing Checklist

```bash
#!/bin/bash
# Verify ds-safety-block exists
test -f templates/ds-safety-block.md || { echo "FAIL: ds-safety-block.md missing"; exit 1; }

# Verify no raw hex codes slipped into prompt files
HEX_VIOLATIONS=$(grep -rn "#[0-9a-fA-F]\{6\}\|#[0-9a-fA-F]\{3\}" .github/prompts/ 2>/dev/null | grep -v "node_modules\|^Binary" | wc -l)
if [ "$HEX_VIOLATIONS" -gt 0 ]; then
  echo "FAIL: $HEX_VIOLATIONS hardcoded hex values found in prompts"
  exit 1
fi

# Verify DESIGN-SYSTEM-REFERENCE reference exists in updated prompts
grep -l "DESIGN-SYSTEM-REFERENCE" .github/prompts/*.prompt.md 2>/dev/null | wc -l | xargs -I{} test {} -gt 0 || echo "WARN: No prompts reference DESIGN-SYSTEM-REFERENCE"
echo "PASS: DS safety rules applied"
npx tsc --noEmit || exit 1
npm run lint || exit 1
npm run build || exit 1
```

---

## Implementation

```markdown
## DS Safety Block Template (templates/ds-safety-block.md)

## Design System Safety

> ⚠️ Read `docs/DESIGN-SYSTEM-REFERENCE.md` before making ANY styling change.

**Forbidden patterns** (agent must refuse and report these):
- Hardcoded hex colors: `#fff`, `#1a2b3c`, `rgb(...)`, `rgba(...)`
- Hardcoded pixel values: `16px`, `margin: 8px`, `width: 200px`
- Inline styles that bypass the token system
- GSAP animations not listed in DESIGN-SYSTEM-REFERENCE § Animation Rules

**Pre-commit safety check**:
```bash
grep -rn "#[0-9a-fA-F]\{3,6\}\b" src/ --include="*.tsx" --include="*.ts" --include="*.css" && echo "FAIL: hardcoded hex" || echo "PASS"
grep -rn "[0-9]\+px[^-]" src/ --include="*.tsx" --include="*.ts" && echo "FAIL: hardcoded px" || echo "PASS"
```
```

---

## Reference Implementation

```bash
# Find all prompts that need the safety block added
grep -rL "DESIGN-SYSTEM-REFERENCE\|Design System Safety" .github/prompts/*.prompt.md 2>/dev/null
```

---

## Environment

- **Framework**: Node.js / TypeScript
- **Dependencies**: None
- **FSD Layer**: `templates/`, `.github/prompts/` — tooling layer

---

## Database / Supabase

No DB changes. Prompt/template update only.

---

## Routes Affected

None.

---

## Blocking Gate

```bash
# ds-01 must be complete
test -f docs/DESIGN-SYSTEM-REFERENCE.md || { echo "BLOCKED: ds-01 (Create DS reference doc) must complete first"; exit 1; }
echo "PASS: Prerequisite satisfied"
```

---

## Merge Gate

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Workflow & Lifecycle

**CI Validation**: `ci.yml` — tsc + lint + build + test
**PR Promotion**: `copilot-pr-promote.yml` — labels, milestone, reviewer
**PR Validation**: `copilot-pr-validate.yml` — quality gates + blast radius
**Chain Advance**: `copilot-chain-advance.yml` — closes → next issue

**Post-Merge Steps** (automated):
1. PR merged → `copilot-pr-merged.yml` adds `automation:completed`
2. Linked chain issue auto-closes
3. `copilot-chain-advance.yml` activates next wave (unblocks `ds-04` alongside `ds-03`)
4. Branch auto-deleted

**E2E Tests to Run**:
- `e2e/specs/route-health.spec.ts` — smoke
- N/A (prompt/doc task)
