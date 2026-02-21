#!/bin/bash

# init-project.sh — Initialize Handoff Framework for a Project
#
# Purpose: Copy framework templates to project, create config, initialize docs
# Usage: bash .handoff-framework/scripts/init-project.sh <project-name>
# Example: bash .handoff-framework/scripts/init-project.sh damieus-com-migration

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo "ℹ️  $1"; }

# Check if project name provided
if [ -z "$1" ]; then
  print_error "Project name required"
  echo ""
  echo "Usage: bash .handoff-framework/scripts/init-project.sh <project-name>"
  echo ""
  echo "Example:"
  echo "  bash .handoff-framework/scripts/init-project.sh damieus-com-migration"
  exit 1
fi

PROJECT_NAME="$1"
FRAMEWORK_DIR="$(dirname "$0")/.."  # .handoff-framework/
PROJECT_DIR="../$PROJECT_NAME"  # ../damieus-com-migration/

print_info "Initializing handoff framework for project: $PROJECT_NAME"
echo ""

# Step 1: Verify framework directory exists
if [ ! -d "$FRAMEWORK_DIR" ]; then
  print_error "Framework directory not found: $FRAMEWORK_DIR"
  print_info "Are you running this from the workspace root?"
  exit 1
fi

print_success "Found framework directory: $FRAMEWORK_DIR"

# Step 2: Verify project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
  print_error "Project directory not found: $PROJECT_DIR"
  print_info "Expected path: $PROJECT_DIR"
  print_info "Available projects:"
  ls -d ../*/ | grep -v ".handoff-framework" | sed 's|.*/||' | sed 's|/||'
  exit 1
fi

print_success "Found project directory: $PROJECT_DIR"
echo ""

# Step 3: Create docs/.handoff/ directory
HANDOFF_DOCS_DIR="$PROJECT_DIR/docs/.handoff"

if [ -d "$HANDOFF_DOCS_DIR" ]; then
  print_warning "docs/.handoff/ directory already exists"
  read -p "Overwrite existing handoff docs? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Aborted. No changes made."
    exit 0
  fi
  rm -rf "$HANDOFF_DOCS_DIR"
fi

mkdir -p "$HANDOFF_DOCS_DIR"
print_success "Created docs/.handoff/ directory"

# Step 4: Copy templates
print_info "Copying templates..."

TEMPLATES_DIR="$FRAMEWORK_DIR/templates"
TEMPLATE_COUNT=0

for template in "$TEMPLATES_DIR"/*.md; do
  if [ -f "$template" ]; then
    filename=$(basename "$template")
    # Remove "-TEMPLATE" from filename
    output_filename=$(echo "$filename" | sed 's/-TEMPLATE//')
    cp "$template" "$HANDOFF_DOCS_DIR/$output_filename"
    TEMPLATE_COUNT=$((TEMPLATE_COUNT + 1))
    print_success "  Copied: $output_filename"
  fi
done

print_success "Copied $TEMPLATE_COUNT templates to docs/.handoff/"
echo ""

# Step 5: Create .handoff.config.json
CONFIG_FILE="$PROJECT_DIR/.handoff.config.json"

if [ -f "$CONFIG_FILE" ]; then
  print_warning ".handoff.config.json already exists"
  read -p "Overwrite? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Skipping config creation"
  else
    rm "$CONFIG_FILE"
  fi
fi

if [ ! -f "$CONFIG_FILE" ]; then
  cat > "$CONFIG_FILE" <<EOF
{
  "projectName": "$PROJECT_NAME",
  "version": "1.0.0",
  "framework": {
    "version": "1.0.0",
    "docsPath": "docs/.handoff",
    "masterIndexPath": "docs/.handoff/00-MASTER-INDEX.md"
  },
  "qualityGates": {
    "typescript": {
      "enabled": true,
      "command": "npx tsc --noEmit",
      "required": true
    },
    "eslint": {
      "enabled": true,
      "command": "npm run lint",
      "required": true
    },
    "build": {
      "enabled": true,
      "command": "npm run build",
      "required": true
    },
    "routeDiscovery": {
      "enabled": true,
      "command": "npm run discover:routes",
      "artifact": "e2e/fixtures/route-manifest.json",
      "required": false
    },
    "routeHealth": {
      "enabled": true,
      "command": "npm run test:health",
      "required": false
    },
    "ctaGaps": {
      "enabled": true,
      "command": "npm run audit:cta",
      "artifact": "reports/cta-gap-analysis.json",
      "required": false
    },
    "accessibility": {
      "enabled": true,
      "command": "npm run audit:a11y",
      "artifact": "reports/a11y-audit.json",
      "required": false
    },
    "performance": {
      "enabled": true,
      "command": "npm run audit:performance",
      "artifact": "reports/performance-audit.json",
      "required": false
    },
    "devtools": {
      "enabled": true,
      "command": "npm run test:devtools",
      "required": true
    }
  },
  "deployment": {
    "requiredGates": ["typescript", "eslint", "build", "devtools"],
    "recommendedGates": ["routeHealth", "ctaGaps", "accessibility", "performance"]
  },
  "tokenEstimates": {
    "masterIndex": 500,
    "projectState": 2000,
    "criticalContext": 1500,
    "architecture": 2500,
    "featureStatus": 2000,
    "total": 8500
  }
}
EOF
  print_success "Created .handoff.config.json"
  print_info "  Review and customize quality gates in .handoff.config.json"
fi

echo ""

# Step 6: Create initial 00-MASTER-INDEX.md
MASTER_INDEX="$HANDOFF_DOCS_DIR/00-MASTER-INDEX.md"

if [ -f "$MASTER_INDEX" ]; then
  print_warning "00-MASTER-INDEX.md already exists"
else
  # Get basic project info
  PACKAGE_JSON="$PROJECT_DIR/package.json"
  if [ -f "$PACKAGE_JSON" ]; then
    PROJECT_VERSION=$(grep '"version"' "$PACKAGE_JSON" | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
    TECH_STACK=$(grep '"dependencies"' "$PACKAGE_JSON" -A 20 | grep '"react"' && echo "React" || echo "Unknown")
  else
    PROJECT_VERSION="1.0.0"
    TECH_STACK="Unknown"
  fi

  cat > "$MASTER_INDEX" <<EOF
# Handoff Master Index — $PROJECT_NAME

**Project**: $PROJECT_NAME
**Version**: $PROJECT_VERSION
**Last Updated**: $(date +%Y-%m-%d)
**Tech Stack**: $TECH_STACK

> This is the entry point for ALL agent handoffs. Read this first, then navigate to relevant docs.

---

## 🚀 Quick Start (For New Agents)

**If you're just arriving**:
1. Read this index (500 tokens, 1 min)
2. Read [01-PROJECT-STATE.md](./01-PROJECT-STATE.md) (2,000 tokens, 4 min) — Current snapshot
3. Read [02-CRITICAL-CONTEXT.md](./02-CRITICAL-CONTEXT.md) (1,500 tokens, 3 min) — Must-know info

**If you're working on a specific system**:
- Architecture deep dive → [ARCHITECTURE.md](./ARCHITECTURE.md)
- Feature status → [FEATURE-STATUS.md](./FEATURE-STATUS.md)

**Total reading for handoff**: ~8,500 tokens, ~15 minutes

---

## 📚 Documentation Index

| # | Document | Token Cost | When to Read | Status |
|---|----------|------------|--------------|--------|
| 00 | [00-MASTER-INDEX.md](./00-MASTER-INDEX.md) | 500 | Always (you are here) | ✅ |
| 01 | [01-PROJECT-STATE.md](./01-PROJECT-STATE.md) | 2,000 | Every handoff | 🔄 Generate |
| 02 | [02-CRITICAL-CONTEXT.md](./02-CRITICAL-CONTEXT.md) | 1,500 | Every handoff | ⏳ TODO |
| 03 | [ARCHITECTURE.md](./ARCHITECTURE.md) | 2,500 | Debugging, refactoring | ⏳ TODO |
| 04 | [FEATURE-STATUS.md](./FEATURE-STATUS.md) | 2,000 | Planning, deployment | ⏳ TODO |

**Total**: 8,500 tokens (~15 min reading)

---

## 🎯 Project Overview

**Purpose**: [TODO: Add project purpose]

**Tech Stack**:
- [TODO: List key technologies]

**Current Status**:
- Development: [TODO: Active / Paused / Planning]
- Deployment: [TODO: Deployed / Staging / Local only]
- Quality Gates: [TODO: Passing / Failing / Not configured]

---

## 🛠️ Quality Gates

**Pre-Deployment Gates** (from .handoff.config.json):

| Gate | Command | Status | Required | Artifact |
|------|---------|--------|----------|----------|
| TypeScript | \`npx tsc --noEmit\` | ⏳ Unknown | ✅ Yes | None |
| ESLint | \`npm run lint\` | ⏳ Unknown | ✅ Yes | None |
| Build | \`npm run build\` | ⏳ Unknown | ✅ Yes | None |
| DevTools | \`npm run test:devtools\` | ⏳ Unknown | ✅ Yes | None |

**Recommended Gates**:

| Gate | Command | Status | Artifact |
|------|---------|--------|----------|
| Route Health | \`npm run test:health\` | ⏳ Unknown | None |
| CTA Gaps | \`npm run audit:cta\` | ⏳ Unknown | reports/cta-gap-analysis.json |
| Accessibility | \`npm run audit:a11y\` | ⏳ Unknown | reports/a11y-audit.json |
| Performance | \`npm run audit:performance\` | ⏳ Unknown | reports/performance-audit.json |

**How to update**:
Run quality gates, then update status in 01-PROJECT-STATE.md using:
\`\`\`bash
bash ../.handoff-framework/scripts/generate-state.sh $PROJECT_NAME
\`\`\`

---

## 📋 Next Steps

**For Project Setup**:
1. Fill in [02-CRITICAL-CONTEXT.md](./02-CRITICAL-CONTEXT.md) with gotchas, decisions
2. Document architecture in [ARCHITECTURE.md](./ARCHITECTURE.md)
3. List features in [FEATURE-STATUS.md](./FEATURE-STATUS.md)
4. Run quality gates and generate state: \`bash ../.handoff-framework/scripts/generate-state.sh $PROJECT_NAME\`
5. Commit all handoff docs

**For Quality Gates**:
1. Review .handoff.config.json (customize gates for your project)
2. Install 20x E2E Testing Framework (if not already done)
3. Run gates: \`npm run discover:routes && npm run test:health && npm run audit:cta\`
4. Fix failures, regenerate state

---

## 🤖 Agent Handoff Protocol

**When handing off to next agent**:
1. Update 01-PROJECT-STATE.md (or run generate-state.sh)
2. Run quality gates, commit artifacts
3. Create handoff message:
   \`\`\`markdown
   ## 🤝 Handoff to Next Agent

   **Work Completed**: [Description]

   **Quality Gates Run**:
   - TypeScript: ✅ 0 errors
   - ESLint: ✅ 0 errors
   - Build: ✅ Successful
   - [Other gates...]

   **Gate Artifacts**:
   - Route manifest: e2e/fixtures/route-manifest.json (Section: routes)
   - [Other artifacts...]

   **Next Agent Instructions**:
   1. Read 00-MASTER-INDEX.md (this file)
   2. Read 01-PROJECT-STATE.md (current snapshot)
   3. [Specific instructions for next task]

   **Estimated token cost**: 8,500 tokens (full handoff docs), 15 min
   \`\`\`

---

**Framework Version**: 1.0.0  
**Last Generated**: $(date +"%Y-%m-%d %H:%M:%S")  
**Generated by**: init-project.sh
EOF

  print_success "Created 00-MASTER-INDEX.md"
  print_warning "  ⚠️  TODO: Fill in project-specific details (purpose, tech stack, status)"
fi

echo ""

# Step 7: Print next steps
print_success "Framework initialized successfully!"
echo ""
print_info "Next steps:"
echo ""
echo "1. Review .handoff.config.json — Customize quality gates for your project"
echo "2. Fill in docs/.handoff/02-CRITICAL-CONTEXT.md — Add gotchas, decisions"
echo "3. Fill in docs/.handoff/ARCHITECTURE.md — Document system architecture"
echo "4. Fill in docs/.handoff/FEATURE-STATUS.md — List features and status"
echo "5. Generate project state:"
echo "   bash ../.handoff-framework/scripts/generate-state.sh $PROJECT_NAME"
echo "6. Run quality gates:"
echo "   cd $PROJECT_NAME"
echo "   npx tsc --noEmit && npm run lint && npm run build"
echo "7. Commit handoff docs:"
echo "   git add docs/.handoff/ .handoff.config.json"
echo "   git commit -m \"docs: initialize handoff framework\""
echo ""
print_info "Documentation location: $PROJECT_DIR/docs/.handoff/"
print_info "Config file: $PROJECT_DIR/.handoff.config.json"
echo ""
print_success "Done! 🎉"
