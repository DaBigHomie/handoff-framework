#!/bin/bash

# generate-state.sh — Auto-Generate Project State Document
#
# Purpose: Scan project, collect metrics, run quality gates, generate 01-PROJECT-STATE.md
# Usage: bash .handoff-framework/scripts/generate-state.sh <project-name>
# Example: bash .handoff-framework/scripts/generate-state.sh damieus-com-migration

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Check if project name provided
if [ -z "$1" ]; then
  print_error "Project name required"
  echo ""
  echo "Usage: bash .handoff-framework/scripts/generate-state.sh <project-name>"
  echo ""
  echo "Example:"
  echo "  bash .handoff-framework/scripts/generate-state.sh damieus-com-migration"
  exit 1
fi

PROJECT_NAME="$1"
FRAMEWORK_DIR="$(dirname "$0")/.."  # .handoff-framework/
PROJECT_DIR="../$PROJECT_NAME"  # ../damieus-com-migration/
CONFIG_FILE="$PROJECT_DIR/.handoff.config.json"
OUTPUT_FILE="$PROJECT_DIR/docs/.handoff/01-PROJECT-STATE.md"

print_info "Generating project state for: $PROJECT_NAME"
echo ""

# Step 1: Verify project exists
if [ ! -d "$PROJECT_DIR" ]; then
  print_error "Project directory not found: $PROJECT_DIR"
  exit 1
fi

print_success "Found project directory: $PROJECT_DIR"

# Step 2: Verify config file exists
if [ ! -f "$CONFIG_FILE" ]; then
  print_error "Config file not found: $CONFIG_FILE"
  print_info "Run init-project.sh first:"
  print_info "  bash .handoff-framework/scripts/init-project.sh $PROJECT_NAME"
  exit 1
fi

print_success "Found config file"

# Step 3: Change to project directory
cd "$PROJECT_DIR" || exit

# Step 4: Collect project metrics
print_info "Collecting project metrics..."

# Count lines of code
LOC_TOTAL=$(find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")

# Count components
COMPONENT_COUNT=$(find src/components src/features -name "*.tsx" -o -name "*.jsx" 2>/dev/null | wc -l | tr -d ' ')

# Count pages/routes
PAGE_COUNT=$(find src/pages -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ' || echo "0")
if [ "$PAGE_COUNT" == "0" ]; then
  # Try app directory (Next.js)
  PAGE_COUNT=$(find app -name "page.tsx" 2>/dev/null | wc -l | tr -d ' ' || echo "0")
fi

# Count hooks
HOOK_COUNT=$(find src -name "use*.ts" -o -name "use*.tsx" 2>/dev/null | wc -l | tr -d ' ')

# Count tests
TEST_COUNT=$(find . -name "*.spec.ts" -o -name "*.spec.tsx" -o -name "*.test.ts" -o -name "*.test.tsx" | grep -v node_modules | wc -l | tr -d ' ')

# Check migrations
if [ -d "supabase/migrations" ]; then
  MIGRATION_COUNT=$(ls supabase/migrations/*.sql 2>/dev/null | wc -l | tr -d ' ')
elif [ -d "prisma/migrations" ]; then
  MIGRATION_COUNT=$(ls -d prisma/migrations/* 2>/dev/null | wc -l | tr -d ' ')
else
  MIGRATION_COUNT="0"
fi

# Get package.json info
if [ -f "package.json" ]; then
  PROJECT_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
  HAS_REACT=$(grep '"react"' package.json && echo "✅" || echo "❌")
  HAS_TYPESCRIPT=$(grep '"typescript"' package.json && echo "✅" || echo "❌")
  HAS_VITE=$(grep '"vite"' package.json && echo "✅" || echo "❌")
  HAS_NEXT=$(grep '"next"' package.json && echo "✅" || echo "❌")
  HAS_SUPABASE=$(grep '"@supabase/supabase-js"' package.json && echo "✅" || echo "❌")
else
  PROJECT_VERSION="Unknown"
  HAS_REACT="❌"
  HAS_TYPESCRIPT="❌"
  HAS_VITE="❌"
  HAS_NEXT="❌"
  HAS_SUPABASE="❌"
fi

print_success "Collected metrics: LOC=$LOC_TOTAL, Components=$COMPONENT_COUNT, Pages=$PAGE_COUNT"

# Step 5: Run quality gates
print_info "Running quality gates..."
echo ""

TYPESCRIPT_STATUS="⏭️ Skip"
TYPESCRIPT_ERRORS="N/A"
ESLINT_STATUS="⏭️ Skip"
ESLINT_ERRORS="N/A"
BUILD_STATUS="⏭️ Skip"
BUILD_ERRORS="N/A"

# TypeScript check
if command -v npx &> /dev/null && [ -f "tsconfig.json" ]; then
  print_info "Running TypeScript check..."
  if npx tsc --noEmit > /tmp/tsc-output.txt 2>&1; then
    TYPESCRIPT_STATUS="✅ Pass"
    TYPESCRIPT_ERRORS="0"
    print_success "TypeScript: 0 errors"
  else
    TYPESCRIPT_STATUS="❌ Fail"
    TYPESCRIPT_ERRORS=$(grep -c "error TS" /tmp/tsc-output.txt || echo "0")
    print_error "TypeScript: $TYPESCRIPT_ERRORS errors"
  fi
else
  print_warning "TypeScript not installed or tsconfig.json missing — Skipping"
fi

# ESLint check
if command -v npm &> /dev/null && grep -q '"lint"' package.json 2>/dev/null; then
  print_info "Running ESLint..."
  if npm run lint > /tmp/eslint-output.txt 2>&1; then
    ESLINT_STATUS="✅ Pass"
    ESLINT_ERRORS="0"
    print_success "ESLint: 0 errors"
  else
    ESLINT_STATUS="❌ Fail"
    ESLINT_ERRORS=$(grep -c "error" /tmp/eslint-output.txt || echo "0")
    print_error "ESLint: $ESLINT_ERRORS errors"
  fi
else
  print_warning "ESLint not configured — Skipping"
fi

# Build check
if command -v npm &> /dev/null && grep -q '"build"' package.json 2>/dev/null; then
  print_info "Running build..."
  if npm run build > /tmp/build-output.txt 2>&1; then
    BUILD_STATUS="✅ Pass"
    BUILD_ERRORS="N/A"
    print_success "Build: Successful"
  else
    BUILD_STATUS="❌ Fail"
    BUILD_ERRORS="See /tmp/build-output.txt"
    print_error "Build: Failed"
  fi
else
  print_warning "Build script not configured — Skipping"
fi

echo ""

# Step 6: Check quality gate artifacts
print_info "Checking for quality gate artifacts..."

ROUTE_MANIFEST_STATUS="⏭️ Skip"
ROUTE_MANIFEST_PATH=""
if [ -f "e2e/fixtures/route-manifest.json" ]; then
  ROUTE_MANIFEST_STATUS="✅ Found"
  ROUTE_MANIFEST_PATH="e2e/fixtures/route-manifest.json"
  ROUTE_COUNT=$(grep -o '"path"' e2e/fixtures/route-manifest.json | wc -l | tr -d ' ')
  print_success "Route manifest found ($ROUTE_COUNT routes)"
fi

CTA_ARTIFACT_STATUS="⏭️ Skip"
CTA_ARTIFACT_PATH=""
if [ -f "reports/cta-gap-analysis.json" ]; then
  CTA_ARTIFACT_STATUS="✅ Found"
  CTA_ARTIFACT_PATH="reports/cta-gap-analysis.json"
  print_success "CTA gap analysis found"
fi

A11Y_ARTIFACT_STATUS="⏭️ Skip"
A11Y_ARTIFACT_PATH=""
if [ -f "reports/a11y-audit.json" ]; then
  A11Y_ARTIFACT_STATUS="✅ Found"
  A11Y_ARTIFACT_PATH="reports/a11y-audit.json"
  print_success "Accessibility audit found"
fi

PERF_ARTIFACT_STATUS="⏭️ Skip"
PERF_ARTIFACT_PATH=""
if [ -f "reports/performance-audit.json" ]; then
  PERF_ARTIFACT_STATUS="✅ Found"
  PERF_ARTIFACT_PATH="reports/performance-audit.json"
  print_success "Performance audit found"
fi

echo ""

# Step 7: Generate 01-PROJECT-STATE.md
print_info "Generating 01-PROJECT-STATE.md..."

mkdir -p "$(dirname "$OUTPUT_FILE")"

cat > "$OUTPUT_FILE" <<EOF
# Project State — $PROJECT_NAME

**Last Generated**: $(date +"%Y-%m-%d %H:%M:%S")
**Version**: $PROJECT_VERSION
**Est. Reading**: 2,000 tokens, 4 minutes

> Auto-generated project snapshot. Re-generate with:
> \`bash ../.handoff-framework/scripts/generate-state.sh $PROJECT_NAME\`

---

## 📊 Project Metrics

| Metric | Value |
|--------|-------|
| Total Lines of Code | $LOC_TOTAL |
| Components | $COMPONENT_COUNT |
| Pages/Routes | $PAGE_COUNT |
| Custom Hooks | $HOOK_COUNT |
| Test Files | $TEST_COUNT |
| Database Migrations | $MIGRATION_COUNT |
| TypeScript Errors | $TYPESCRIPT_ERRORS |
| ESLint Errors | $ESLINT_ERRORS |

---

## ✅ Quality Gate Status

**Critical Gates** (MUST pass for deployment):

| Gate | Last Run | Status | Artifact | Critical Issues |
|------|----------|--------|----------|-----------------|
| TypeScript | $(date +"%Y-%m-%d %H:%M") | $TYPESCRIPT_STATUS | None | $TYPESCRIPT_ERRORS |
| ESLint | $(date +"%Y-%m-%d %H:%M") | $ESLINT_STATUS | None | $ESLINT_ERRORS |
| Build | $(date +"%Y-%m-%d %H:%M") | $BUILD_STATUS | None | $BUILD_ERRORS |

**Recommended Gates**:

| Gate | Last Run | Status | Artifact | Critical Issues |
|------|----------|--------|----------|-----------------|
| Route Discovery | $(date +"%Y-%m-%d") | $ROUTE_MANIFEST_STATUS | $ROUTE_MANIFEST_PATH | N/A |
| CTA Gaps | $(date +"%Y-%m-%d") | $CTA_ARTIFACT_STATUS | $CTA_ARTIFACT_PATH | N/A |
| Accessibility | $(date +"%Y-%m-%d") | $A11Y_ARTIFACT_STATUS | $A11Y_ARTIFACT_PATH | N/A |
| Performance | $(date +"%Y-%m-%d") | $PERF_ARTIFACT_STATUS | $PERF_ARTIFACT_PATH | N/A |

**Legend**:
- ✅ Pass — Gate passed, no issues
- ❌ Fail — Gate failed, must fix before deployment
- ⚠️ Warn — Gate passed with warnings
- ⏭️ Skip — Gate not run (not applicable or not configured)

---

## 🚨 Deployment Blockers

**Critical issues that MUST be fixed before deployment**:

$(if [ "$TYPESCRIPT_STATUS" == "❌ Fail" ]; then
  echo "- ❌ **TypeScript**: $TYPESCRIPT_ERRORS errors — Run \`npx tsc --noEmit\` to see details"
fi)
$(if [ "$ESLINT_STATUS" == "❌ Fail" ]; then
  echo "- ❌ **ESLint**: $ESLINT_ERRORS errors — Run \`npm run lint\` to see details"
fi)
$(if [ "$BUILD_STATUS" == "❌ Fail" ]; then
  echo "- ❌ **Build**: Failed — See /tmp/build-output.txt for details"
fi)

$(if [ "$TYPESCRIPT_STATUS" != "❌ Fail" ] && [ "$ESLINT_STATUS" != "❌ Fail" ] && [ "$BUILD_STATUS" != "❌ Fail" ]; then
  echo "✅ **No deployment blockers** — All critical gates passing"
fi)

---

## 📁 Project Structure

\`\`\`
$PROJECT_NAME/
├── src/
│   ├── components/ ($COMPONENT_COUNT components)
│   ├── pages/ ($PAGE_COUNT pages)
│   ├── hooks/ ($HOOK_COUNT custom hooks)
│   └── ...
├── docs/
│   └── .handoff/ (Framework docs)
├── package.json (v$PROJECT_VERSION)
$(if [ -d "supabase" ]; then echo "├── supabase/ ($MIGRATION_COUNT migrations)"; fi)
$(if [ -d "e2e" ]; then echo "├── e2e/ ($TEST_COUNT test files)"; fi)
└── ...
\`\`\`

---

## 🛠️ Tech Stack

| Technology | Status | Version | Notes |
|------------|--------|---------|-------|
| React | $HAS_REACT | $(grep '"react"' package.json | sed 's/.*": "\^\?\(.*\)".*/\1/' || echo "N/A") | UI framework |
| TypeScript | $HAS_TYPESCRIPT | $(grep '"typescript"' package.json | sed 's/.*": "\^\?\(.*\)".*/\1/' || echo "N/A") | Type safety |
| Vite | $HAS_VITE | $(grep '"vite"' package.json | sed 's/.*": "\^\?\(.*\)".*/\1/' || echo "N/A") | Build tool |
| Next.js | $HAS_NEXT | $(grep '"next"' package.json | sed 's/.*": "\^\?\(.*\)".*/\1/' || echo "N/A") | Framework |
| Supabase | $HAS_SUPABASE | $(grep '"@supabase/supabase-js"' package.json | sed 's/.*": "\^\?\(.*\)".*/\1/' || echo "N/A") | Backend |

---

## 🎯 Active Features

**Feature inventory** (from FEATURE-STATUS.md):

> Run \`bash ../.handoff-framework/scripts/generate-state.sh $PROJECT_NAME\` to update this section automatically.

[TODO: Add feature status summary from FEATURE-STATUS.md]

---

## 🐛 Known Issues

**From quality gate failures**:

$(if [ "$TYPESCRIPT_STATUS" == "❌ Fail" ]; then
  echo "- TypeScript: $TYPESCRIPT_ERRORS type errors"
fi)
$(if [ "$ESLINT_STATUS" == "❌ Fail" ]; then
  echo "- ESLint: $ESLINT_ERRORS linting errors"
fi)
$(if [ "$BUILD_STATUS" == "❌ Fail" ]; then
  echo "- Build: Failed compilation"
fi)

**From issue tracker** (GitHub/Linear/etc.):

[TODO: Add summary of open issues]

---

## 📝 Recent Changes

**Last 5 commits**:

$(git log -5 --pretty=format:"- %h — %s (%ar)" || echo "[Git not available or no commits]")

---

## 🔗 Dependencies

**Production**:
- $(grep -c '"' package.json | echo "Total: TBD") packages

**Development**:
- $(grep -c '"' package.json | echo "Total: TBD") packages

**Outdated packages**: Run \`npm outdated\` to check

---

## 💾 Database State

$(if [ -d "supabase/migrations" ]; then
  echo "**Migrations**: $MIGRATION_COUNT total"
  echo ""
  echo "**Latest migration**:"
  echo "\`\`\`"
  ls -t supabase/migrations/*.sql | head -1 | xargs basename
  echo "\`\`\`"
fi)

$(if [ ! -d "supabase/migrations" ] && [ ! -d "prisma/migrations" ]; then
  echo "**No database** detected"
fi)

---

## 🌐 Environment Status

| Environment | Status | URL | Last Deploy |
|-------------|--------|-----|-------------|
| Production | [TODO] | [TODO] | [TODO] |
| Staging | [TODO] | [TODO] | [TODO] |
| Development | ✅ Local | http://localhost:5173 | N/A |

---

## 🤖 Agent Handoff Context

**When to read this document**:
- Every handoff (get current state snapshot)
- Before deployment (check quality gates)
- After major changes (verify metrics updated)

**What this document provides**:
- Project metrics (LOC, components, pages)
- Quality gate status (TypeScript, ESLint, build, etc.)
- Deployment blockers (what must be fixed)
- Tech stack inventory
- Recent changes summary

**Estimated token cost**: 2,000 tokens (4 min reading)

**Related docs**:
- [00-MASTER-INDEX.md](./00-MASTER-INDEX.md) — Navigation hub
- [02-CRITICAL-CONTEXT.md](./02-CRITICAL-CONTEXT.md) — Gotchas and decisions
- [FEATURE-STATUS.md](./FEATURE-STATUS.md) — Feature inventory

---

**Auto-generated by**: generate-state.sh  
**Framework version**: 1.0.0  
**Last run**: $(date +"%Y-%m-%d %H:%M:%S")
EOF

print_success "Generated: $OUTPUT_FILE"
echo ""

# Step 8: Print summary
print_success "Project state generated successfully!"
echo ""
print_info "Summary:"
echo "  Lines of Code: $LOC_TOTAL"
echo "  Components: $COMPONENT_COUNT"
echo "  Pages: $PAGE_COUNT"
echo "  Quality Gates:"
echo "    - TypeScript: $TYPESCRIPT_STATUS ($TYPESCRIPT_ERRORS errors)"
echo "    - ESLint: $ESLINT_STATUS ($ESLINT_ERRORS errors)"
echo "    - Build: $BUILD_STATUS"
echo ""
print_info "Document location: $OUTPUT_FILE"
echo ""

# Step 9: Print next steps
if [ "$TYPESCRIPT_STATUS" == "❌ Fail" ] || [ "$ESLINT_STATUS" == "❌ Fail" ] || [ "$BUILD_STATUS" == "❌ Fail" ]; then
  print_warning "Deployment blockers detected!"
  echo ""
  echo "Fix these issues before deploying:"
  if [ "$TYPESCRIPT_STATUS" == "❌ Fail" ]; then
    echo "  1. Run: npx tsc --noEmit"
    echo "     Fix all TypeScript errors"
  fi
  if [ "$ESLINT_STATUS" == "❌ Fail" ]; then
    echo "  2. Run: npm run lint"
    echo "     Fix all ESLint errors"
  fi
  if [ "$BUILD_STATUS" == "❌ Fail" ]; then
    echo "  3. Run: npm run build"
    echo "     Fix build errors (see /tmp/build-output.txt)"
  fi
  echo ""
  echo "After fixes, re-generate state:"
  echo "  bash ../.handoff-framework/scripts/generate-state.sh $PROJECT_NAME"
else
  print_success "No deployment blockers! ✅"
  echo ""
  echo "Optional: Run recommended quality gates:"
  echo "  npm run discover:routes    # Route discovery"
  echo "  npm run test:health         # Route health"
  echo "  npm run audit:cta           # CTA gaps"
  echo "  npm run audit:a11y          # Accessibility"
  echo "  npm run audit:performance   # Performance"
  echo ""
  echo "Then re-generate state to include artifact results."
fi

echo ""
print_success "Done! 🎉"
