#!/bin/bash
# scripts/ds-lint.sh — Design System quality gate
# Scans src/ and examples/ for forbidden DS patterns.
# Exit 1 if violations found, exit 0 if clean.
#
# @see docs/DS-REFERENCE.md — Authoring Rules
# @see templates/ds-safety-block.md — Full forbidden pattern list

set -euo pipefail

echo "=== DS Lint: Checking for forbidden patterns ==="
echo ""

VIOLATIONS=0

# ── Category 1: Hardcoded hex colors ──
# Exclude: tokens.css (defines hex by design), .test. files, DS docs, prompt specs
HEX=$(grep -rn '#[0-9a-fA-F]\{3,6\}\b' src/ examples/components/ 2>/dev/null \
  | grep -v 'node_modules\|\.test\.\|tokens\.css\|\.prompt\.md\|DS-REFERENCE\|DS-WORKFLOW' \
  || true)

if [ -n "$HEX" ]; then
  echo "❌ HARDCODED HEX COLORS found:"
  echo "$HEX"
  echo ""
  VIOLATIONS=$((VIOLATIONS+1))
else
  echo "✅ No hardcoded hex colors"
fi

# ── Category 2: Hardcoded px values ──
PX=$(grep -rn '[0-9]\+px[^-a-zA-Z%]' src/ examples/components/ 2>/dev/null \
  | grep -v 'node_modules\|\.test\.\|tokens\.css' \
  || true)

if [ -n "$PX" ]; then
  echo "❌ HARDCODED PX VALUES found:"
  echo "$PX"
  echo ""
  VIOLATIONS=$((VIOLATIONS+1))
else
  echo "✅ No hardcoded px values"
fi

# ── Category 3: Inline style colors ──
INLINE=$(grep -rn 'style={{.*color' src/ examples/components/ --include='*.tsx' --include='*.ts' 2>/dev/null \
  | grep -v 'node_modules\|\.test\.' \
  || true)

if [ -n "$INLINE" ]; then
  echo "❌ INLINE STYLE COLORS found:"
  echo "$INLINE"
  echo ""
  VIOLATIONS=$((VIOLATIONS+1))
else
  echo "✅ No inline style colors"
fi

# ── Category 4: GSAP without cleanup (warning only) ──
GSAP_FILES=$(grep -rln 'gsap\.' src/ examples/components/ --include='*.tsx' --include='*.ts' 2>/dev/null \
  | grep -v 'node_modules\|\.test\.' \
  || true)

if [ -n "$GSAP_FILES" ]; then
  for f in $GSAP_FILES; do
    if ! grep -q 'ctx\.revert\|context.*revert' "$f" 2>/dev/null; then
      echo "⚠️  GSAP without ctx.revert() cleanup: $f"
    fi
  done
fi

# ── Result ──
echo ""
if [ "$VIOLATIONS" -gt 0 ]; then
  echo "❌ DS LINT FAILED: $VIOLATIONS violation type(s) found"
  echo "   Fix violations before merging. See docs/DS-REFERENCE.md for guidance."
  exit 1
fi

echo "✅ DS Lint passed — 0 violations"
exit 0
