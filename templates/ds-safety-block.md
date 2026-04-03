## Design System Safety

> ⚠️ Read `docs/DESIGN-SYSTEM-REFERENCE.md` before making ANY styling change.

**Forbidden patterns** (agent must refuse and report these):

| Pattern | Example | Why |
|---------|---------|-----|
| Hardcoded hex colors | `#fff`, `#1a2b3c`, `color: #333` | Use semantic tokens from DESIGN-SYSTEM-REFERENCE |
| Raw RGB/RGBA | `rgb(255,0,0)`, `rgba(0,0,0,0.5)` | Use semantic tokens with opacity modifiers |
| Hardcoded pixel values | `16px`, `margin: 8px`, `width: 200px` | Use Tailwind spacing scale |
| Inline style colors | `style={{ color: 'red' }}` | Use className with token classes |
| Non-semantic Tailwind | `bg-gray-100`, `text-blue-500` | Use `bg-surface`, `text-brand-primary` |
| Unapproved GSAP animation | Animating `width`, `height`, `top` | See DESIGN-SYSTEM-REFERENCE § Animation Rules |
| Missing GSAP cleanup | No `ctx.revert()` in useEffect | Memory leak — always clean up |
| Missing reduced-motion check | GSAP without `prefers-reduced-motion` | Accessibility requirement |

**Pre-commit safety check**:

```bash
#!/bin/bash
FAIL=0

# Check hardcoded hex
if grep -rn '#[0-9a-fA-F]\{3,6\}\b' src/ --include='*.tsx' --include='*.ts' --include='*.css' 2>/dev/null | grep -v 'node_modules\|\.test\.\|tokens\.css'; then
  echo "❌ FAIL: Hardcoded hex colors found"
  FAIL=1
fi

# Check hardcoded px
if grep -rn '[0-9]\+px[^-a-zA-Z%]' src/ --include='*.tsx' --include='*.ts' 2>/dev/null | grep -v 'node_modules\|\.test\.'; then
  echo "❌ FAIL: Hardcoded px values found"
  FAIL=1
fi

# Check inline style colors
if grep -rn 'style={{.*color' src/ --include='*.tsx' 2>/dev/null | grep -v 'node_modules\|\.test\.'; then
  echo "❌ FAIL: Inline style colors found"
  FAIL=1
fi

if [ "$FAIL" -eq 0 ]; then
  echo "✅ DS safety check passed"
fi
```

**Authority**: `docs/DESIGN-SYSTEM-REFERENCE.md`
