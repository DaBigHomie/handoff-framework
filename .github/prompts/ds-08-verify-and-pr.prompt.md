---
applyTo: "**"
---
# Verify + PR

**Priority**: priority:p0
**Status**: ⏳ **NOT STARTED**
**Estimated Time**: 2h
**Revenue Impact**: High
**Dependencies**: `ds-07-quality-gates`
**Tags**: `priority:p0`, `type:ci`, `scope:ci`, `agent:copilot`, `automation:copilot`, `prompt-spec`, `prompt-chain`

---

## Agent Bootstrap

> ⚠️ The agent executing this prompt MUST load these files first:

```bash
# 1. Repo instructions (mandatory)
cat .github/copilot-instructions.md
cat AGENTS.md

# 2. Path-specific instructions (load all matching)
ls .github/instructions/*.instructions.md

# 3. All DS docs (final verification — all must exist and be complete)
cat docs/DS-REFERENCE.md
cat docs/DS-WORKFLOW.md
cat docs/DS-AUDIT-BASELINE.md

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

This is the final task in the DS chain. Run the complete verification suite across all DS deliverables from `ds-01` through `ds-07`, confirm all quality gates pass, resolve any remaining violations, and open a consolidated Pull Request that captures the full Design System implementation. The PR description must include: a summary of all changes by wave, the audit results (before/after violation counts), links to all DS docs created, and the PR checklist confirming every merge gate passes.

---

## Pre-Flight Check

```bash
# Verify ALL prerequisites exist
echo "=== Checking DS Chain Deliverables ==="
test -f docs/DS-REFERENCE.md && echo "✅ ds-01: DS-REFERENCE.md" || echo "❌ ds-01: MISSING"
test -f templates/ds-safety-block.md && echo "✅ ds-02: ds-safety-block.md" || echo "❌ ds-02: MISSING"
test -f docs/DS-WORKFLOW.md && echo "✅ ds-03: DS-WORKFLOW.md" || echo "❌ ds-03: MISSING"
test -f docs/DS-AUDIT-BASELINE.md && echo "✅ ds-04: DS-AUDIT-BASELINE.md" || echo "❌ ds-04: MISSING"
find src/ -name "SmartButton.tsx" 2>/dev/null | grep -v node_modules && echo "✅ ds-05: SmartButton.tsx" || echo "❌ ds-05: MISSING"
find src/ -name "ThemeProvider.tsx" 2>/dev/null | grep -v node_modules && echo "✅ ds-06: ThemeProvider.tsx" || echo "❌ ds-06: MISSING"
test -f scripts/ds-lint.sh && echo "✅ ds-07: ds-lint.sh" || echo "❌ ds-07: MISSING"
test -f scripts/ds-token-coverage.mts && echo "✅ ds-07: ds-token-coverage.mts" || echo "❌ ds-07: MISSING"

# Run full quality gate suite
echo ""
echo "=== Running Quality Gates ==="
bash scripts/ds-lint.sh 2>/dev/null && echo "✅ DS lint: PASS" || echo "❌ DS lint: FAIL"
npx tsc --noEmit 2>/dev/null && echo "✅ TypeScript: PASS" || echo "❌ TypeScript: FAIL"
npm run lint 2>/dev/null && echo "✅ ESLint: PASS" || echo "❌ ESLint: FAIL"
npm run build 2>/dev/null && echo "✅ Build: PASS" || echo "❌ Build: FAIL"

# Final violation count
echo ""
echo "=== Final Violation Count ==="
echo "Hardcoded hex remaining:"
grep -rn "#[0-9a-fA-F]\{3,6\}\b" src/ --include="*.tsx" --include="*.css" 2>/dev/null | grep -v node_modules | wc -l
echo "Hardcoded px remaining:"
grep -rn "[0-9]\+px[^-a-zA-Z%]" src/ --include="*.tsx" --include="*.css" 2>/dev/null | grep -v node_modules | wc -l
```

---

## Intended Result

All Pre-Flight checks pass with ✅. A Pull Request is opened targeting `main` (or the configured default branch) with:
- **Title**: `feat(ds): Design System implementation — tokens, SmartButton, dark mode, quality gates`
- **Labels**: `type:feat`, `scope:ui`, `automation:copilot`
- **Body**: Contains the PR template filled with DS chain summary, before/after metrics, and passing gate screenshots/logs
- **All checks green**: TypeScript, ESLint, build, DS lint, token coverage
- Zero remaining hardcoded hex/px violations in `src/`

---

## Files to Modify/Create

| File | Action | Exists? | Purpose |
|------|--------|---------|---------|
| `docs/DS-AUDIT-BASELINE.md` | MODIFY | Yes | Mark all violations as resolved |
| `CHANGELOG.md` | MODIFY | Verify | Add DS implementation entry |
| PR description | CREATE | N/A | Consolidated change summary |

---

## data-testid Contracts

| testid | Action | Used By |
|--------|--------|---------|
| N/A | — | Verification + PR task |

---

## Blast Radius

```bash
# Final check — what changed across all DS tasks
git --no-pager diff --stat origin/main 2>/dev/null || git --no-pager diff --stat HEAD~8 2>/dev/null | head -30
git --no-pager log --oneline -10 2>/dev/null
```

---

## A11y Checklist

- [ ] PR description notes any a11y improvements (contrast, focus rings, reduced motion)
- [ ] Final WCAG AA validation run mentioned in PR body
- [ ] Screen reader compatibility noted for SmartButton and ThemeToggle

---

## Design System Safety

> ⚠️ Final safety verification: zero violations must remain.

```bash
# Final pass — must produce 0 lines for PR to open
grep -rn "#[0-9a-fA-F]\{3,6\}\b" src/ --include="*.tsx" --include="*.css" 2>/dev/null | grep -v node_modules
grep -rn "[0-9]\+px[^-a-zA-Z%]" src/ --include="*.tsx" --include="*.css" 2>/dev/null | grep -v node_modules
```

---

## Success Criteria

All eight DS deliverables exist and are complete. All quality gate scripts pass with exit code 0. A PR is open in the repository with title matching the template, all labels applied, and the body containing the DS chain summary. CI checks are green. The PR is ready for human review — no additional changes needed.

---

## Testing Checklist

```bash
#!/bin/bash
set -euo pipefail

echo "=== DS Chain Final Verification ==="

# 1. All deliverables
test -f docs/DS-REFERENCE.md || { echo "FAIL: DS-REFERENCE.md"; exit 1; }
test -f docs/DS-WORKFLOW.md || { echo "FAIL: DS-WORKFLOW.md"; exit 1; }
test -f docs/DS-AUDIT-BASELINE.md || { echo "FAIL: DS-AUDIT-BASELINE.md"; exit 1; }
test -f templates/ds-safety-block.md || { echo "FAIL: ds-safety-block.md"; exit 1; }
find src/ -name "SmartButton.tsx" | grep -v node_modules || { echo "FAIL: SmartButton missing"; exit 1; }
find src/ -name "ThemeProvider.tsx" | grep -v node_modules || { echo "FAIL: ThemeProvider missing"; exit 1; }
test -f scripts/ds-lint.sh || { echo "FAIL: ds-lint.sh missing"; exit 1; }
test -f scripts/ds-token-coverage.mts || { echo "FAIL: ds-token-coverage.mts missing"; exit 1; }

# 2. Quality gates
bash scripts/ds-lint.sh || exit 1
npx tsx scripts/ds-token-coverage.mts || exit 1

# 3. Standard gates
npx tsc --noEmit || exit 1
npm run lint || exit 1
npm run build || exit 1

echo ""
echo "✅ ALL DS CHAIN CHECKS PASSED — Ready to open PR"
```

---

## Implementation

```bash
# PR creation command (after all checks pass)
gh pr create \
  --title "feat(ds): Design System implementation — tokens, SmartButton, dark mode, quality gates" \
  --label "type:feat,scope:ui,automation:copilot" \
  --body "$(cat <<'EOF'
## Design System Chain — Complete Implementation

### Summary
This PR implements the full Design System foundation for @dabighomie/handoff-framework:

| Wave | Task | Status |
|------|------|--------|
| ds-01 | Create DS reference doc | ✅ |
| ds-02 | Update DS prompts (safety rules) | ✅ |
| ds-03 | Update DS-WORKFLOW (GSAP rules) | ✅ |
| ds-04 | Baseline audit | ✅ |
| ds-05 | SmartButton migration | ✅ |
| ds-06 | Dark mode tokens | ✅ |
| ds-07 | Quality gates | ✅ |
| ds-08 | Verify + PR | ✅ |

### Before / After
| Metric | Before | After |
|--------|--------|-------|
| Hardcoded hex violations | N | 0 |
| Hardcoded px violations | N | 0 |
| Dark mode coverage | N% | 100% |
| DS lint gate | ❌ None | ✅ Active |
| Token coverage gate | ❌ None | ✅ Active |

### Docs Created
- `docs/DS-REFERENCE.md` — Token registry + component inventory
- `docs/DS-WORKFLOW.md` — GSAP rules + authoring workflow
- `docs/DS-AUDIT-BASELINE.md` — Baseline violation report (all resolved)
- `templates/ds-safety-block.md` — Reusable safety snippet

### Merge Gate
- [x] `npx tsc --noEmit` — passes
- [x] `npm run lint` — passes
- [x] `npm run build` — passes
- [x] `bash scripts/ds-lint.sh` — passes (0 violations)
- [x] `npx tsx scripts/ds-token-coverage.mts` — passes
EOF
)"
```

---

## Reference Implementation

```bash
# Check current branch and PR status
git --no-pager status
git --no-pager log --oneline -10
gh pr list --state open 2>/dev/null | head -10
```

---

## Environment

- **Framework**: Node.js / TypeScript
- **Dependencies**: `gh` CLI (GitHub CLI — for PR creation)
- **FSD Layer**: N/A — cross-cutting verification task

---

## Database / Supabase

No DB changes.

---

## Routes Affected

All routes (final verification ensures nothing regressed).

---

## Blocking Gate

```bash
# All 7 previous DS tasks must be complete
test -f docs/DS-REFERENCE.md || { echo "BLOCKED: ds-01"; exit 1; }
test -f docs/DS-WORKFLOW.md || { echo "BLOCKED: ds-03"; exit 1; }
test -f docs/DS-AUDIT-BASELINE.md || { echo "BLOCKED: ds-04"; exit 1; }
test -f scripts/ds-lint.sh || { echo "BLOCKED: ds-07"; exit 1; }
bash scripts/ds-lint.sh || { echo "BLOCKED: ds-lint still failing"; exit 1; }
echo "PASS: All prerequisites satisfied — ready for final PR"
```

---

## Merge Gate

```bash
npx tsc --noEmit
npm run lint
npm run build
bash scripts/ds-lint.sh
npx tsx scripts/ds-token-coverage.mts
```

---

## Workflow & Lifecycle

**CI Validation**: `ci.yml` — tsc + lint + build + test + ds-gates
**PR Promotion**: `copilot-pr-promote.yml` — labels, milestone, reviewer
**PR Validation**: `copilot-pr-validate.yml` — quality gates + blast radius
**Chain Advance**: `copilot-chain-advance.yml` — closes → final chain issue

**Post-Merge Steps** (automated):
1. PR merged → `copilot-pr-merged.yml` adds `automation:completed`
2. All DS chain issues auto-close
3. `copilot-chain-advance.yml` marks chain as complete
4. Branch auto-deleted

**E2E Tests to Run**:
- `e2e/specs/route-health.spec.ts` — smoke
- `e2e/specs/smart-button.spec.ts` — button interactions
- `e2e/specs/dark-mode.spec.ts` — theme toggle + persistence
