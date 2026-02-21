#!/bin/bash

# validate-docs.sh — Validate Handoff Documentation Standards
#
# Purpose: Check documentation compliance with framework standards
# Usage: bash .handoff-framework/scripts/validate-docs.sh <project-name>
# Example: bash .handoff-framework/scripts/validate-docs.sh damieus-com-migration

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
  echo "Usage: bash .handoff-framework/scripts/validate-docs.sh <project-name>"
  echo ""
  echo "Example:"
  echo "  bash .handoff-framework/scripts/validate-docs.sh damieus-com-migration"
  exit 1
fi

PROJECT_NAME="$1"
PROJECT_DIR="../$PROJECT_NAME"
HANDOFF_DOCS_DIR="$PROJECT_DIR/docs/.handoff"

print_info "Validating handoff documentation for: $PROJECT_NAME"
echo ""

# Step 1: Verify project exists
if [ ! -d "$PROJECT_DIR" ]; then
  print_error "Project directory not found: $PROJECT_DIR"
  exit 1
fi

print_success "Found project directory: $PROJECT_DIR"

# Step 2: Verify .handoff/ directory exists
if [ ! -d "$HANDOFF_DOCS_DIR" ]; then
  print_error "Handoff docs directory not found: $HANDOFF_DOCS_DIR"
  print_warning "Run init-project.sh or migrate-existing.sh first"
  exit 1
fi

print_success "Found handoff docs: $HANDOFF_DOCS_DIR"
echo ""

# Initialize validation results
ERRORS=0
WARNINGS=0
SUGGESTIONS=0

# Header
print_info "===================================="
print_info "  FRAMEWORK STANDARDS VALIDATION"
print_info "===================================="
echo ""

# ============================================
# SECTION 1: Required Documents
# ============================================
print_info "1. Required Documents"
echo ""

REQUIRED_DOCS=(
  "00-MASTER-INDEX.md"
  "01-PROJECT-STATE.md"
  "02-CRITICAL-CONTEXT.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
  doc_path="$HANDOFF_DOCS_DIR/$doc"
  if [ -f "$doc_path" ]; then
    print_success "  Found: $doc"
  else
    print_error "  Missing: $doc (REQUIRED)"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""

# ============================================
# SECTION 2: Recommended Documents
# ============================================
print_info "2. Recommended Documents"
echo ""

RECOMMENDED_DOCS=(
  "ARCHITECTURE.md"
  "FEATURE-STATUS.md"
  "TESTID-FRAMEWORK.md"
  "GAP-ANALYSIS.md"
  "DEPLOYMENT-ROADMAP.md"
)

for doc in "${RECOMMENDED_DOCS[@]}"; do
  doc_path="$HANDOFF_DOCS_DIR/$doc"
  if [ -f "$doc_path" ]; then
    print_success "  Found: $doc"
  else
    print_warning "  Missing: $doc (recommended)"
    WARNINGS=$((WARNINGS + 1))
  fi
done

echo ""

# ============================================
# SECTION 3: Document Structure Validation
# ============================================
print_info "3. Document Structure Validation"
echo ""

# Check 00-MASTER-INDEX.md
if [ -f "$HANDOFF_DOCS_DIR/00-MASTER-INDEX.md" ]; then
  print_info "  Checking 00-MASTER-INDEX.md..."
  
  # Token estimate section
  if grep -q "Token Estimates" "$HANDOFF_DOCS_DIR/00-MASTER-INDEX.md"; then
    print_success "    ✓ Has token estimates section"
  else
    print_warning "    Missing 'Token Estimates' section"
    WARNINGS=$((WARNINGS + 1))
  fi
  
  # Quick Start section
  if grep -q "Quick Start" "$HANDOFF_DOCS_DIR/00-MASTER-INDEX.md"; then
    print_success "    ✓ Has quick start section"
  else
    print_error "    Missing 'Quick Start' section (REQUIRED)"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Document index
  if grep -q "Document Index" "$HANDOFF_DOCS_DIR/00-MASTER-INDEX.md" || grep -q "Navigation" "$HANDOFF_DOCS_DIR/00-MASTER-INDEX.md"; then
    print_success "    ✓ Has document index/navigation"
  else
    print_error "    Missing 'Document Index' section (REQUIRED)"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Check for TODO placeholders
  TODO_COUNT=$(grep -c "\[TODO" "$HANDOFF_DOCS_DIR/00-MASTER-INDEX.md" || echo 0)
  if [ "$TODO_COUNT" -gt 0 ]; then
    print_warning "    Found $TODO_COUNT [TODO] placeholders"
    WARNINGS=$((WARNINGS + 1))
  fi
fi

echo ""

# Check 01-PROJECT-STATE.md
if [ -f "$HANDOFF_DOCS_DIR/01-PROJECT-STATE.md" ]; then
  print_info "  Checking 01-PROJECT-STATE.md..."
  
  # Quality gates section
  if grep -q "Quality Gates" "$HANDOFF_DOCS_DIR/01-PROJECT-STATE.md"; then
    print_success "    ✓ Has quality gates section"
  else
    print_error "    Missing 'Quality Gates' section (REQUIRED)"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Deployment blockers
  if grep -q "Deployment Blockers" "$HANDOFF_DOCS_DIR/01-PROJECT-STATE.md"; then
    print_success "    ✓ Has deployment blockers section"
  else
    print_warning "    Missing 'Deployment Blockers' section"
    WARNINGS=$((WARNINGS + 1))
  fi
  
  # Recent changes/git history
  if grep -q "Recent Changes" "$HANDOFF_DOCS_DIR/01-PROJECT-STATE.md" || grep -q "Git History" "$HANDOFF_DOCS_DIR/01-PROJECT-STATE.md"; then
    print_success "    ✓ Has recent changes section"
  else
    print_warning "    Missing 'Recent Changes' section"
    SUGGESTIONS=$((SUGGESTIONS + 1))
  fi
  
  # Check for auto-generation timestamp
  if grep -q "Auto-generated" "$HANDOFF_DOCS_DIR/01-PROJECT-STATE.md" || grep -q "Last updated" "$HANDOFF_DOCS_DIR/01-PROJECT-STATE.md"; then
    print_success "    ✓ Has timestamp/generation metadata"
  else
    print_warning "    Missing timestamp (run generate-state.sh)"
    SUGGESTIONS=$((SUGGESTIONS + 1))
  fi
fi

echo ""

# Check 02-CRITICAL-CONTEXT.md
if [ -f "$HANDOFF_DOCS_DIR/02-CRITICAL-CONTEXT.md" ]; then
  print_info "  Checking 02-CRITICAL-CONTEXT.md..."
  
  # Known issues section
  if grep -q "Known Issues" "$HANDOFF_DOCS_DIR/02-CRITICAL-CONTEXT.md" || grep -q "Gotchas" "$HANDOFF_DOCS_DIR/02-CRITICAL-CONTEXT.md"; then
    print_success "    ✓ Has known issues/gotchas section"
  else
    print_warning "    Missing 'Known Issues' or 'Gotchas' section"
    WARNINGS=$((WARNINGS + 1))
  fi
  
  # Decision log
  if grep -q "Decision" "$HANDOFF_DOCS_DIR/02-CRITICAL-CONTEXT.md" || grep -q "ADR" "$HANDOFF_DOCS_DIR/02-CRITICAL-CONTEXT.md"; then
    print_success "    ✓ Has decision log/ADRs"
  else
    print_warning "    Missing decision log (architectural decisions)"
    SUGGESTIONS=$((SUGGESTIONS + 1))
  fi
  
  # Environment-specific context
  if grep -q "Environment" "$HANDOFF_DOCS_DIR/02-CRITICAL-CONTEXT.md" || grep -q "Supabase" "$HANDOFF_DOCS_DIR/02-CRITICAL-CONTEXT.md"; then
    print_success "    ✓ Has environment/config context"
  else
    print_warning "    Missing environment-specific context"
    SUGGESTIONS=$((SUGGESTIONS + 1))
  fi
fi

echo ""

# ============================================
# SECTION 4: Quality Gate Integration
# ============================================
print_info "4. Quality Gate Integration"
echo ""

CONFIG_FILE="$PROJECT_DIR/.handoff.config.json"

if [ -f "$CONFIG_FILE" ]; then
  print_success "  Found .handoff.config.json"
  
  # Check for quality gates config
  if grep -q "qualityGates" "$CONFIG_FILE"; then
    print_success "    ✓ Has quality gates configuration"
    
    # Count enabled gates
    ENABLED_GATES=$(grep -c '"enabled": true' "$CONFIG_FILE" || echo 0)
    print_info "    Enabled gates: $ENABLED_GATES"
    
    if [ "$ENABLED_GATES" -lt 3 ]; then
      print_warning "    Only $ENABLED_GATES gates enabled (recommend at least 3)"
      WARNINGS=$((WARNINGS + 1))
    fi
  else
    print_error "    Missing quality gates configuration"
    ERRORS=$((ERRORS + 1))
  fi
  
  # Check for deployment config
  if grep -q "deployment" "$CONFIG_FILE"; then
    print_success "    ✓ Has deployment configuration"
  else
    print_warning "    Missing deployment configuration"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  print_error "  Missing .handoff.config.json (REQUIRED)"
  ERRORS=$((ERRORS + 1))
fi

echo ""

# ============================================
# SECTION 5: Artifact References
# ============================================
print_info "5. Quality Gate Artifacts"
echo ""

ARTIFACTS=(
  "e2e/fixtures/route-manifest.json"
  "reports/cta-gap-analysis.json"
  "reports/a11y-audit.json"
  "reports/performance-audit.json"
)

FOUND_ARTIFACTS=0

for artifact in "${ARTIFACTS[@]}"; do
  artifact_path="$PROJECT_DIR/$artifact"
  artifact_name=$(basename "$artifact")
  
  if [ -f "$artifact_path" ]; then
    print_success "  Found: $artifact_name"
    FOUND_ARTIFACTS=$((FOUND_ARTIFACTS + 1))
    
    # Check if artifact is referenced in docs
    if grep -rq "$artifact_name" "$HANDOFF_DOCS_DIR"; then
      print_success "    ✓ Referenced in handoff docs"
    else
      print_warning "    Not referenced in handoff docs (recommend adding to 01-PROJECT-STATE.md)"
      SUGGESTIONS=$((SUGGESTIONS + 1))
    fi
  else
    print_warning "  Missing: $artifact (run quality gates)"
    SUGGESTIONS=$((SUGGESTIONS + 1))
  fi
done

if [ "$FOUND_ARTIFACTS" -eq 0 ]; then
  print_warning "  No quality gate artifacts found"
  print_info "  Run quality gates to generate artifacts:"
  print_info "    npm run discover:routes"
  print_info "    npm run audit:cta"
  print_info "    npm run audit:a11y"
  print_info "    npm run audit:performance"
  WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# SECTION 6: Token Budget Validation
# ============================================
print_info "6. Token Budget Validation"
echo ""

# Estimate token counts for each document
estimate_tokens() {
  local file="$1"
  if [ -f "$file" ]; then
    # Rough estimate: ~4 chars per token
    local chars=$(wc -c < "$file")
    echo $((chars / 4))
  else
    echo 0
  fi
}

TOTAL_TOKENS=0

for doc in "$HANDOFF_DOCS_DIR"/*.md; do
  if [ -f "$doc" ]; then
    doc_name=$(basename "$doc")
    doc_tokens=$(estimate_tokens "$doc")
    TOTAL_TOKENS=$((TOTAL_TOKENS + doc_tokens))
    
    if [ "$doc_tokens" -gt 10000 ]; then
      print_warning "  $doc_name: ~$doc_tokens tokens (very large, consider splitting)"
      WARNINGS=$((WARNINGS + 1))
    elif [ "$doc_tokens" -gt 5000 ]; then
      print_info "  $doc_name: ~$doc_tokens tokens"
    else
      print_success "  $doc_name: ~$doc_tokens tokens"
    fi
  fi
done

print_info "  Total estimated tokens: ~$TOTAL_TOKENS"

if [ "$TOTAL_TOKENS" -gt 50000 ]; then
  print_error "  Total tokens exceed 50K (consider using subagent workflows)"
  ERRORS=$((ERRORS + 1))
elif [ "$TOTAL_TOKENS" -gt 30000 ]; then
  print_warning "  Total tokens > 30K (recommend using subagent workflows for some sections)"
  WARNINGS=$((WARNINGS + 1))
else
  print_success "  Token budget is reasonable"
fi

echo ""

# ============================================
# SECTION 7: Workflow References
# ============================================
print_info "7. Subagent Workflow References"
echo ""

FRAMEWORK_DIR="$(dirname "$0")/.."
WORKFLOWS_DIR="$FRAMEWORK_DIR/workflows"

if [ -d "$WORKFLOWS_DIR" ]; then
  # Count workflow references in docs
  WORKFLOW_REFS=$(grep -rh "audit-.*\.md\|\.handoff-framework/workflows" "$HANDOFF_DOCS_DIR" 2>/dev/null | wc -l)
  
  if [ "$WORKFLOW_REFS" -gt 0 ]; then
    print_success "  Found $WORKFLOW_REFS workflow references in docs"
  else
    print_warning "  No workflow references found"
    print_info "  Consider delegating large audits to subagent workflows:"
    print_info "    - audit-cart-systems.md (9x token reduction)"
    print_info "    - audit-database.md (7.6x token reduction)"
    print_info "    - audit-routes.md (12x token reduction)"
    print_info "    - audit-cta-gaps.md (17x token reduction)"
    SUGGESTIONS=$((SUGGESTIONS + 1))
  fi
else
  print_warning "  Framework workflows directory not found"
  print_info "  Install framework: https://github.com/DaBigHomie/management-git/.handoff-framework"
fi

echo ""

# ============================================
# SECTION 8: Final Report
# ============================================
print_info "===================================="
print_info "  VALIDATION SUMMARY"
print_info "===================================="
echo ""

print_info "Project: $PROJECT_NAME"
print_info "Docs location: $HANDOFF_DOCS_DIR"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  print_success "✅ ALL CHECKS PASSED!"
  echo ""
  print_success "Documentation is fully compliant with framework standards."
  exit 0
elif [ $ERRORS -eq 0 ]; then
  print_warning "⚠️  PASSED WITH WARNINGS"
  echo ""
  print_info "Errors: $ERRORS"
  print_warning "Warnings: $WARNINGS"
  print_info "Suggestions: $SUGGESTIONS"
  echo ""
  print_info "Documentation is functional but could be improved."
  print_info "Review warnings above and fix if applicable."
  exit 0
else
  print_error "❌ VALIDATION FAILED"
  echo ""
  print_error "Errors: $ERRORS (MUST FIX)"
  print_warning "Warnings: $WARNINGS"
  print_info "Suggestions: $SUGGESTIONS"
  echo ""
  print_error "Fix all errors before deploying."
  print_info "Run this script again after making changes."
  exit 1
fi
