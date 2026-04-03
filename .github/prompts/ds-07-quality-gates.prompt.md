---
applyTo: "**"
---
# Quality Gates

**Priority**: priority:p0
**Status**: ⏳ **NOT STARTED**
**Estimated Time**: 3h
**Revenue Impact**: High
**Dependencies**: `ds-05-smart-button-migration`, `ds-06-dark-mode-tokens`
**Tags**: `priority:p0`, `type:ci`, `scope:ci`, `agent:copilot`, `automation:copilot`, `prompt-spec`, `infrastructure`

---

## Agent Bootstrap

> ⚠️ The agent executing this prompt MUST load these files first:

```bash
# 1. Repo instructions (mandatory)
cat .github/copilot-instructions.md
cat AGENTS.md

# 2. Path-specific instructions (load all matching)
ls .github/instructions/*.instructions.md

# 3. DS authority docs (all must exist)
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

Implement automated quality gates that prevent DS violations from being re-introduced into the codebase after the migrations in `ds-05` and `ds-06`. Quality gates must run on every PR via CI: (1) a **DS lint script** that greps for forbidden patterns (hardcoded hex, hardcoded px, unapproved GSAP usage) and fails the build if any are found; (2) a **token coverage check** that validates every component file uses at least one DS token class; (3) a **dark mode coverage check** that validates UI components have `dark:` variants. These gates are added to the existing CI workflow and optionally as a pre-commit hook.

---

## Pre-Flight Check

```bash
# Verify prerequisites
test -f docs/DS-AUDIT-BASELINE.md || { echo "FAIL: Run ds-04 first"; exit 1; }
find src/ -name "SmartButton.tsx" 2>/dev/null | grep -v node_modules && echo "PASS: ds-05 done" || echo "WARN: SmartButton not found"
find src/ -name "ThemeProvider.tsx" 2>/dev/null | grep -v node_modules && echo "PASS: ds-06 done" || echo "WARN: ThemeProvider not found"

# Check existing CI workflows
ls .github/workflows/ 2>/dev/null
cat .github/workflows/ci.yml 2>/dev/null | head -40

# Check existing scripts
cat package.json | python3 -c "import json,sys; d=json.load(sys.stdin); [print(k,'→',v) for k,v in d.get('scripts',{}).items()]" 2>/dev/null

# Check for existing lint/quality scripts
find scripts/ -name "*.sh" -o -name "*.mts" -o -name "*.ts" 2>/dev/null | grep -v node_modules | head -10
```

---

## Intended Result

Three new quality gate mechanisms exist and are integrated into CI:

1. **`scripts/ds-lint.sh`** — bash script that:
   - Greps `src/` for hardcoded hex (`#[0-9a-fA-F]{3,6}`) and fails with exit code 1 if found
   - Greps `src/` for hardcoded px values and fails if found
   - Greps `src/` for GSAP usage without `ctx.revert` cleanup and warns
   - Outputs a clear violation report with file:line references

2. **`scripts/ds-token-coverage.mts`** — TypeScript script that:
   - Scans all `.tsx` files in `src/components/`
   - Verifies each uses at least one token class or CSS custom property
   - Reports uncovered components and fails if any exist

3. **`.github/workflows/ci.yml`** — updated to include a `ds-gates` job that runs both scripts before the merge gate

4. **`.husky/pre-commit`** (optional, if husky exists) — runs `ds-lint.sh` locally

---

## Files to Modify/Create

| File | Action | Exists? | Purpose |
|------|--------|---------|---------|
| `scripts/ds-lint.sh` | CREATE | No | Forbidden pattern detector |
| `scripts/ds-token-coverage.mts` | CREATE | No | Token coverage validator |
| `.github/workflows/ci.yml` | MODIFY | Verify | Add ds-gates job |
| `package.json` | MODIFY | Yes | Add `ds:lint` and `ds:coverage` scripts |
| `.husky/pre-commit` | MODIFY | Verify | Add ds-lint to pre-commit hook |

---

## data-testid Contracts

| testid | Action | Used By |
|--------|--------|---------|
| N/A | — | CI/scripts task |

---

## Blast Radius

```bash
# All workflows that may be affected
ls .github/workflows/ 2>/dev/null

# All components the coverage script will scan
find src/components/ -name "*.tsx" 2>/dev/null | grep -v node_modules | wc -l

# All scripts in scripts/
ls scripts/ 2>/dev/null
```

---

## A11y Checklist

- [ ] CI failure messages are human-readable with file:line context
- [ ] Script output distinguishes errors (exit 1) from warnings (exit 0 + message)

---

## Design System Safety

> ⚠️ Read `docs/DS-REFERENCE.md` before modifying lint patterns.

**Gate must catch**:
- `#[0-9a-fA-F]{3,6}` — hardcoded hex colors
- `[0-9]+px[^-a-zA-Z]` — hardcoded pixel values
- `rgb(\|rgba(` — raw color functions
- `style={{ color:` — inline style color assignments

---

## Success Criteria

Running `npm run ds:lint` exits 0 on a clean codebase and exits 1 with violation details when forbidden patterns exist. Running `npm run ds:coverage` reports all components and exits 1 if any lack token usage. CI `ds-gates` job runs and passes on the current main branch. Pre-commit hook (if applicable) blocks commits with DS violations. No regression: TypeScript, lint, and build all still pass.

---

## Testing Checklist

```bash
#!/bin/bash
# Verify scripts exist
test -f scripts/ds-lint.sh || { echo "FAIL: ds-lint.sh missing"; exit 1; }
test -f scripts/ds-token-coverage.mts || { echo "FAIL: ds-token-coverage.mts missing"; exit 1; }

# Verify scripts are executable
test -x scripts/ds-lint.sh || chmod +x scripts/ds-lint.sh

# Run ds-lint on clean codebase — should exit 0
bash scripts/ds-lint.sh && echo "PASS: ds-lint clean" || echo "FAIL: ds-lint found violations"

# Verify package.json has scripts
node -e "const p=require('./package.json'); console.assert(p.scripts['ds:lint'], 'FAIL: ds:lint missing'); console.assert(p.scripts['ds:coverage'], 'FAIL: ds:coverage missing'); console.log('PASS: scripts registered')"

# Verify CI workflow references ds-gates
grep -q "ds.lint\|ds.gates\|ds-lint" .github/workflows/ci.yml 2>/dev/null && echo "PASS: CI gates registered" || echo "FAIL: CI not updated"

echo "PASS: Quality gates complete"
npx tsc --noEmit || exit 1
npm run lint || exit 1
npm run build || exit 1
```

---

## Implementation

```bash
#!/bin/bash
# scripts/ds-lint.sh
set -euo pipefail

echo "=== DS Lint: Checking for forbidden patterns ==="

VIOLATIONS=0

# Check hardcoded hex
HEX=$(grep -rn "#[0-9a-fA-F]\{3,6\}\b" src/ --include="*.tsx" --include="*.ts" --include="*.css" 2>/dev/null | grep -v "node_modules\|\.test\.\|ds-reference")
if [ -n "$HEX" ]; then
  echo "❌ HARDCODED HEX COLORS found:"
  echo "$HEX"
  VIOLATIONS=$((VIOLATIONS+1))
else
  echo "✅ No hardcoded hex colors"
fi

# Check hardcoded px
PX=$(grep -rn "[0-9]\+px[^-a-zA-Z%]" src/ --include="*.tsx" --include="*.ts" --include="*.css" 2>/dev/null | grep -v "node_modules\|\.test\.")
if [ -n "$PX" ]; then
  echo "❌ HARDCODED PX VALUES found:"
  echo "$PX"
  VIOLATIONS=$((VIOLATIONS+1))
else
  echo "✅ No hardcoded px values"
fi

# Check GSAP without cleanup
GSAP_NO_CLEANUP=$(grep -rn "gsap\." src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules\|ctx\.revert\|\.test\." | grep "useEffect\|componentDidMount")
if [ -n "$GSAP_NO_CLEANUP" ]; then
  echo "⚠️  GSAP usage may be missing ctx.revert cleanup:"
  echo "$GSAP_NO_CLEANUP"
fi

if [ "$VIOLATIONS" -gt 0 ]; then
  echo ""
  echo "❌ DS LINT FAILED: $VIOLATIONS violation type(s) found"
  echo "   Fix violations before merging. See docs/DS-REFERENCE.md for guidance."
  exit 1
fi

echo ""
echo "✅ DS Lint passed"
```

```typescript
// scripts/ds-token-coverage.mts
import { readdir, readFile } from "fs/promises"
import { join } from "path"

const TOKEN_PATTERN = /\b(bg-|text-|border-|shadow-|ring-|dark:)/

async function checkCoverage(dir: string): Promise<{ file: string; covered: boolean }[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const results: { file: string; covered: boolean }[] = []
  for (const entry of entries) {
    if (!entry.name.endsWith(".tsx") || entry.name.includes(".test.")) continue
    const content = await readFile(join(dir, entry.name), "utf-8")
    results.push({ file: entry.name, covered: TOKEN_PATTERN.test(content) })
  }
  return results
}

const results = await checkCoverage("src/components")
const uncovered = results.filter(r => !r.covered)
console.table(results)
if (uncovered.length > 0) {
  console.error(`\n❌ ${uncovered.length} component(s) have no DS token coverage:`)
  uncovered.forEach(r => console.error(`   - ${r.file}`))
  process.exit(1)
}
console.log("\n✅ Token coverage: all components pass")
```

---

## Reference Implementation

```bash
# Check how existing CI workflows are structured
cat .github/workflows/ci.yml 2>/dev/null

# Check if husky is configured
cat .husky/pre-commit 2>/dev/null || echo "No pre-commit hook"
cat package.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('scripts',{}))" 2>/dev/null
```

---

## Environment

- **Framework**: Node.js / TypeScript
- **Dependencies**: Node.js built-ins only (no new deps required)
- **FSD Layer**: `scripts/` — tooling layer; `.github/workflows/` — CI layer

---

## Database / Supabase

No DB changes.

---

## Routes Affected

None. CI/scripts only.

---

## Blocking Gate

```bash
# Check ds-05 and ds-06 are done
find src/ -name "SmartButton.tsx" 2>/dev/null | grep -v node_modules || { echo "BLOCKED: ds-05 (SmartButton migration) must complete first"; exit 1; }
find src/ -name "ThemeProvider.tsx" 2>/dev/null | grep -v node_modules || { echo "BLOCKED: ds-06 (Dark mode tokens) must complete first"; exit 1; }
echo "PASS: Prerequisites satisfied"
```

---

## Merge Gate

```bash
npx tsc --noEmit
npm run lint
npm run build
bash scripts/ds-lint.sh
```

---

## Workflow & Lifecycle

**CI Validation**: `ci.yml` — tsc + lint + build + test + **ds-gates**
**PR Promotion**: `copilot-pr-promote.yml` — labels, milestone, reviewer
**PR Validation**: `copilot-pr-validate.yml` — quality gates + blast radius
**Chain Advance**: `copilot-chain-advance.yml` — closes → next issue

**Post-Merge Steps** (automated):
1. PR merged → `copilot-pr-merged.yml` adds `automation:completed`
2. Linked chain issue auto-closes
3. `copilot-chain-advance.yml` activates next wave (`ds-08`)
4. Branch auto-deleted

**E2E Tests to Run**:
- `e2e/specs/route-health.spec.ts` — smoke
- N/A (scripts/CI task)
