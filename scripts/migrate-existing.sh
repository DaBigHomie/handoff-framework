#!/bin/bash

# migrate-existing.sh — Migrate Existing Project to Handoff Framework
#
# Purpose: Migrate a project that already has docs to the new framework structure
# Usage: bash .handoff-framework/scripts/migrate-existing.sh <project-name>
# Example: bash .handoff-framework/scripts/migrate-existing.sh damieus-com-migration

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
  echo "Usage: bash .handoff-framework/scripts/migrate-existing.sh <project-name>"
  echo ""
  echo "Example:"
  echo "  bash .handoff-framework/scripts/migrate-existing.sh damieus-com-migration"
  exit 1
fi

PROJECT_NAME="$1"
FRAMEWORK_DIR="$(dirname "$0")/.."  # .handoff-framework/
PROJECT_DIR="../$PROJECT_NAME"  # ../damieus-com-migration/
HANDOFF_DOCS_DIR="$PROJECT_DIR/docs/.handoff"

print_info "Migrating existing project: $PROJECT_NAME"
echo ""

# Step 1: Verify project exists
if [ ! -d "$PROJECT_DIR" ]; then
  print_error "Project directory not found: $PROJECT_DIR"
  exit 1
fi

print_success "Found project directory: $PROJECT_DIR"

# Step 2: Find existing handoff docs
print_info "Searching for existing handoff documentation..."

EXISTING_DOCS=()

# Check common doc locations
if [ -d "$PROJECT_DIR/docs/handoff" ]; then
  EXISTING_DOCS+=("$PROJECT_DIR/docs/handoff")
  print_success "Found: docs/handoff/"
fi

if [ -d "$PROJECT_DIR/docs/agent-prompts" ]; then
  EXISTING_DOCS+=("$PROJECT_DIR/docs/agent-prompts")
  print_success "Found: docs/agent-prompts/"
fi

# Find individual handoff documents (not in a folder)
if [ -d "$PROJECT_DIR/docs" ]; then
  HANDOFF_FILES=$(find "$PROJECT_DIR/docs" -maxdepth 1 -name "*-HANDOFF*.md" -o -name "*handoff*.md" -o -name "AGENTS.md" 2>/dev/null)
  if [ -n "$HANDOFF_FILES" ]; then
    echo "$HANDOFF_FILES" | while read -r file; do
      EXISTING_DOCS+=("$file")
      print_success "Found: $(basename "$file")"
    done
  fi
fi

if [ ${#EXISTING_DOCS[@]} -eq 0 ]; then
  print_warning "No existing handoff docs found"
  print_info "This project may not have handoff documentation yet"
  read -p "Continue with migration anyway? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Aborted. Use init-project.sh instead for new projects."
    exit 0
  fi
fi

echo ""

# Step 3: Create backup
print_info "Creating backup of existing docs..."

BACKUP_DIR="$PROJECT_DIR/docs/.handoff-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

for doc in "${EXISTING_DOCS[@]}"; do
  if [ -f "$doc" ]; then
    cp "$doc" "$BACKUP_DIR/"
    print_success "  Backed up: $(basename "$doc")"
  elif [ -d "$doc" ]; then
    cp -r "$doc" "$BACKUP_DIR/"
    print_success "  Backed up: $(basename "$doc")/ (directory)"
  fi
done

print_success "Backup created: $BACKUP_DIR"
echo ""

# Step 4: Create .handoff/ directory
print_info "Creating docs/.handoff/ directory..."

if [ -d "$HANDOFF_DOCS_DIR" ]; then
  print_warning "docs/.handoff/ already exists"
  read -p "Move existing files to backup and recreate? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    mv "$HANDOFF_DOCS_DIR" "$BACKUP_DIR/existing-handoff-dir"
    print_success "  Moved existing .handoff/ to backup"
  else
    print_info "Keeping existing .handoff/ directory"
  fi
fi

mkdir -p "$HANDOFF_DOCS_DIR"
print_success "Created docs/.handoff/"

# Step 5: Copy framework templates
print_info "Copying framework templates..."

TEMPLATES_DIR="$FRAMEWORK_DIR/templates"
TEMPLATE_COUNT=0

for template in "$TEMPLATES_DIR"/*.md; do
  if [ -f "$template" ]; then
    filename=$(basename "$template")
    # Remove "-TEMPLATE" from filename
    output_filename=$(echo "$filename" | sed 's/-TEMPLATE//')
    
    # Check if file already exists (from existing docs)
    output_path="$HANDOFF_DOCS_DIR/$output_filename"
    if [ -f "$output_path" ]; then
      print_warning "  File exists: $output_filename (keeping existing)"
    else
      cp "$template" "$output_path"
      TEMPLATE_COUNT=$((TEMPLATE_COUNT + 1))
      print_success "  Copied: $output_filename"
    fi
  fi
done

print_success "Copied $TEMPLATE_COUNT new templates"
echo ""

# Step 6: Create migration mapping
print_info "Creating migration mapping..."

MIGRATION_LOG="$HANDOFF_DOCS_DIR/MIGRATION_LOG.md"

cat > "$MIGRATION_LOG" <<EOF
# Migration Log

**Project**: $PROJECT_NAME
**Migration Date**: $(date +"%Y-%m-%d %H:%M:%S")
**Framework Version**: 1.0.0

---

## Migration Summary

**Existing docs found**: ${#EXISTING_DOCS[@]}

**Backup location**: $BACKUP_DIR

**New structure**: docs/.handoff/ (framework templates)

---

## Existing Documentation

EOF

for doc in "${EXISTING_DOCS[@]}"; do
  if [ -f "$doc" ]; then
    echo "- [\`$(basename "$doc")\`]($BACKUP_DIR/$(basename "$doc"))" >> "$MIGRATION_LOG"
  elif [ -d "$doc" ]; then
    echo "- [\`$(basename "$doc")/\`]($BACKUP_DIR/$(basename "$doc")/)" >> "$MIGRATION_LOG"
  fi
done

cat >> "$MIGRATION_LOG" <<EOF

---

## Migration Tasks

**Manual steps required**:

1. **Review existing docs** in backup directory:
   \`$BACKUP_DIR\`

2. **Map content to new templates**:

   | Old Doc | Content to Migrate | New Template |
   |---------|-------------------|--------------|
$(for doc in "${EXISTING_DOCS[@]}"; do
  basename_doc=$(basename "$doc")
  # Guess mapping based on filename
  if [[ "$basename_doc" == *"HANDOFF"* ]] || [[ "$basename_doc" == "AGENTS.md" ]]; then
    echo "   | $basename_doc | Agent instructions, quick start | 00-MASTER-INDEX.md |"
  elif [[ "$basename_doc" == *"state"* ]] || [[ "$basename_doc" == *"STATUS"* ]]; then
    echo "   | $basename_doc | Current state, metrics | 01-PROJECT-STATE.md |"
  elif [[ "$basename_doc" == *"context"* ]] || [[ "$basename_doc" == *"GOTCHAS"* ]]; then
    echo "   | $basename_doc | Critical context, gotchas | 02-CRITICAL-CONTEXT.md |"
  elif [[ "$basename_doc" == *"architecture"* ]] || [[ "$basename_doc" == *"DESIGN"* ]]; then
    echo "   | $basename_doc | Architecture details | ARCHITECTURE.md |"
  elif [[ "$basename_doc" == *"feature"* ]] || [[ "$basename_doc" == *"TODO"* ]]; then
    echo "   | $basename_doc | Feature status, roadmap | FEATURE-STATUS.md |"
  else
    echo "   | $basename_doc | [Review manually] | [Choose template] |"
  fi
done)

3. **Copy relevant content**:
   - Open old doc (from backup)
   - Open new template
   - Copy sections that match template structure
   - Fill in [TODO] placeholders

4. **Verify quality gates**:
   - Review .handoff.config.json
   - Customize gates for your project
   - Run gates: \`npx tsc --noEmit && npm run lint && npm run build\`

5. **Generate project state**:
   \`\`\`bash
   bash ../.handoff-framework/scripts/generate-state.sh $PROJECT_NAME
   \`\`\`

6. **Review and commit**:
   - Verify all templates filled in
   - Delete MIGRATION_LOG.md (or keep for reference)
   - Commit new .handoff/ structure

---

## New Framework Structure

\`\`\`
docs/.handoff/
├── 00-MASTER-INDEX.md       (Navigation hub, quick start)
├── 01-PROJECT-STATE.md      (Auto-generated metrics, quality gates)
├── 02-CRITICAL-CONTEXT.md   (Gotchas, decisions, must-know info)
├── ARCHITECTURE.md          (Deep dive into system architecture)
├── FEATURE-STATUS.md        (Feature inventory, roadmap)
└── MIGRATION_LOG.md         (This file — delete after migration)
\`\`\`

**Old docs preserved in**:
\`$BACKUP_DIR\`

---

## Checklist

- [ ] Review all existing docs in backup
- [ ] Map content to new templates (see table above)
- [ ] Fill in 00-MASTER-INDEX.md
- [ ] Fill in 02-CRITICAL-CONTEXT.md (gotchas)
- [ ] Fill in ARCHITECTURE.md (if applicable)
- [ ] Fill in FEATURE-STATUS.md
- [ ] Run generate-state.sh to create 01-PROJECT-STATE.md
- [ ] Configure quality gates in .handoff.config.json
- [ ] Run quality gates, verify passing
- [ ] Delete or archive MIGRATION_LOG.md
- [ ] Commit new .handoff/ structure
- [ ] Delete backup directory (after verifying migration)

---

**Framework Version**: 1.0.0  
**Migration Script**: migrate-existing.sh
EOF

print_success "Created: MIGRATION_LOG.md"
echo ""

# Step 7: Create .handoff.config.json (if not exists)
CONFIG_FILE="$PROJECT_DIR/.handoff.config.json"

if [ -f "$CONFIG_FILE" ]; then
  print_warning ".handoff.config.json already exists — Skipping"
else
  print_info "Creating .handoff.config.json..."
  
  cat > "$CONFIG_FILE" <<EOF
{
  "projectName": "$PROJECT_NAME",
  "version": "1.0.0",
  "framework": {
    "version": "1.0.0",
    "docsPath": "docs/.handoff",
    "masterIndexPath": "docs/.handoff/00-MASTER-INDEX.md"
  },
  "migration": {
    "date": "$(date +%Y-%m-%d)",
    "backupPath": "$BACKUP_DIR",
    "migrated": false
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
  }
}
EOF
  
  print_success "Created .handoff.config.json"
fi

echo ""

# Step 8: Print summary
print_success "Migration preparation complete!"
echo ""
print_info "Summary:"
echo "  Existing docs found: ${#EXISTING_DOCS[@]}"
echo "  Backup location: $BACKUP_DIR"
echo "  New structure: $HANDOFF_DOCS_DIR"
echo "  Migration guide: $MIGRATION_LOG"
echo ""

print_warning "IMPORTANT: Manual migration steps required!"
echo ""
echo "Next steps:"
echo ""
echo "1. Review MIGRATION_LOG.md:"
echo "   cat $MIGRATION_LOG"
echo ""
echo "2. Open old docs (in backup) and new templates (in docs/.handoff/)"
echo "   - Map content from old docs to new templates"
echo "   - Fill in [TODO] placeholders"
echo ""
echo "3. Generate project state:"
echo "   bash ../.handoff-framework/scripts/generate-state.sh $PROJECT_NAME"
echo ""
echo "4. Verify quality gates pass:"
echo "   cd $PROJECT_NAME"
echo "   npx tsc --noEmit && npm run lint && npm run build"
echo ""
echo "5. Review all .handoff/ docs, then commit:"
echo "   git add docs/.handoff/ .handoff.config.json"
echo "   git commit -m \"docs: migrate to handoff framework v1.0.0\""
echo ""
echo "6. AFTER verifying migration is complete:"
echo "   rm -rf $BACKUP_DIR  # Delete backup"
echo "   rm docs/.handoff/MIGRATION_LOG.md  # Delete migration log"
echo ""
print_success "Done! 🎉"
