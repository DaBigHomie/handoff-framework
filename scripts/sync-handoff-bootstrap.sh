#!/usr/bin/env bash
# sync-handoff-bootstrap.sh — Inject handoff framework bootstrap into repo AGENTS.md files
#
# Reads the AGENTS_BOOTSTRAP.md template, substitutes {{PROJECT_NAME}},
# and appends/replaces the section in each repo's AGENTS.md.
#
# Usage:
#   ./scripts/sync-handoff-bootstrap.sh                # Sync all repos in registry
#   ./scripts/sync-handoff-bootstrap.sh damieus-com-migration  # Sync one repo
#
# Requires: repo-registry.json from documentation-standards

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRAMEWORK_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_ROOT="$(cd "$FRAMEWORK_ROOT/.." && pwd)"

BOOTSTRAP_TEMPLATE="$FRAMEWORK_ROOT/templates/AGENTS_BOOTSTRAP.md"
REGISTRY="$WORKSPACE_ROOT/documentation-standards/workspace-rules/repo-registry.json"

# Markers for idempotent injection
MARKER_START="<!-- HANDOFF-FRAMEWORK-BOOTSTRAP-START -->"
MARKER_END="<!-- HANDOFF-FRAMEWORK-BOOTSTRAP-END -->"

if [[ ! -f "$BOOTSTRAP_TEMPLATE" ]]; then
  echo "❌ Bootstrap template not found: $BOOTSTRAP_TEMPLATE"
  exit 1
fi

# Read repo list from registry or use CLI arg
if [[ $# -gt 0 ]]; then
  REPOS=("$@")
else
  if [[ ! -f "$REGISTRY" ]]; then
    echo "❌ Repo registry not found: $REGISTRY"
    echo "   Provide repo names as arguments or create the registry file."
    exit 1
  fi
  # Parse repo names from JSON (simple grep, no jq dependency)
  mapfile -t REPOS < <(grep '"name"' "$REGISTRY" | sed 's/.*"name": *"\([^"]*\)".*/\1/')
fi

echo "═══ Syncing Handoff Bootstrap to ${#REPOS[@]} repos ═══"
echo ""

SUCCESS=0
SKIPPED=0
FAILED=0

for REPO in "${REPOS[@]}"; do
  AGENTS_FILE="$WORKSPACE_ROOT/$REPO/AGENTS.md"

  if [[ ! -f "$AGENTS_FILE" ]]; then
    echo "⚠️  Skipped $REPO — no AGENTS.md found"
    ((SKIPPED++))
    continue
  fi

  # Substitute project name in template
  BOOTSTRAP_CONTENT=$(sed "s/{{PROJECT_NAME}}/$REPO/g" "$BOOTSTRAP_TEMPLATE")

  # Build the full injection block
  INJECTION="${MARKER_START}
${BOOTSTRAP_CONTENT}
${MARKER_END}"

  # Check if markers already exist
  if grep -q "$MARKER_START" "$AGENTS_FILE" 2>/dev/null; then
    # Replace existing block (between markers)
    # Use awk for multi-line replacement
    awk -v start="$MARKER_START" -v end="$MARKER_END" -v new="$INJECTION" '
      $0 == start { skip=1; printed=0 }
      $0 == end { skip=0; if(!printed) { print new; printed=1 }; next }
      !skip { print }
    ' "$AGENTS_FILE" > "${AGENTS_FILE}.tmp"
    mv "${AGENTS_FILE}.tmp" "$AGENTS_FILE"
    echo "✅ Updated $REPO/AGENTS.md (replaced existing section)"
  else
    # Append to end of file
    printf '\n%s\n' "$INJECTION" >> "$AGENTS_FILE"
    echo "✅ Updated $REPO/AGENTS.md (appended new section)"
  fi
  ((SUCCESS++))
done

echo ""
echo "═══ Results: $SUCCESS synced, $SKIPPED skipped, $FAILED failed ═══"
