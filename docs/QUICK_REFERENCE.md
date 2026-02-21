# Handoff Framework — Quick Reference

**Purpose**: One-page cheat sheet for daily framework usage

**Audience**: Agents, developers using the framework

---

## 🚀 Quick Start Commands

### Initialize New Project
```bash
npx tsx .handoff-framework/scripts/init-project.mts <project-name>
```

### Update Project State
```bash
npx tsx .handoff-framework/scripts/generate-state.mts <project-name>
```

### Migrate Existing Docs
```bash
npx tsx .handoff-framework/scripts/migrate-existing.mts <project-name>
```

### Validate Documentation
```bash
npx tsx .handoff-framework/scripts/validate-docs.mts <project-name>
```

---

## 📋 Template Decision Tree

**Choose templates based on project size:**

### Minimal Project (<5K LOC)
✅ **Use 3 core docs only:**
- `00-MASTER-INDEX.md` — Overview + navigation
- `01-PROJECT-STATE.md` — Current state + quality gates
- `02-CRITICAL-CONTEXT.md` — Known issues + decisions

**Token estimate**: ~4,000 tokens  
**Read time**: 10 minutes

### Medium Project (5K-20K LOC)
✅ **Add 2 recommended docs:**
- ✅ Core 3 (above)
- `ARCHITECTURE.md` — System design
- `FEATURE-STATUS.md` — Implementation tracking

**Token estimate**: ~15,000 tokens  
**Read time**: 20 minutes

### Large Project (>20K LOC)
✅ **Use all templates:**
- ✅ Core 3 + Recommended 2 (above)
- `TESTID-FRAMEWORK.md` — Test coverage
- `GAP-ANALYSIS.md` — Comprehensive audits
- `DEPLOYMENT-ROADMAP.md` — Execution plan

**Token estimate**: ~30,000 tokens (with artifacts)  
**Read time**: 30-40 minutes

---

## ✅ Quality Gate Matrix

| Gate | Command | When to Use | Token Savings |
|------|---------|-------------|---------------|
| **TypeScript** | `npx tsc --noEmit` | Always (required) | N/A (blocking) |
| **ESLint** | `npm run lint` | Always (required) | N/A (blocking) |
| **Build** | `npm run build` | Always (required) | N/A (blocking) |
| **Routes** | `npm run discover:routes` | >10 pages | 50K → 3K (17x) |
| **CTA Gaps** | `npm run audit:cta` | E-commerce/marketing | 150K → 9K (17x) |
| **Accessibility** | `npm run audit:a11y` | WCAG required | 80K → 7K (11x) |
| **Performance** | `npm run audit:performance` | Performance SLA | 100K → 9K (11x) |
| **Database** | `npm run audit:database` | Has database | 120K → 16K (7.6x) |
| **Test Coverage** | `npm run test:coverage` | ≥80% coverage | 200K → 22K (9.3x) |
| **Cart Systems** | `npm run audit:cart` | E-commerce cart | 180K → 20K (9x) |

---

## 🔄 Common Workflows

### Daily: Before Handoff
```bash
# 1. Update state
npx tsx .handoff-framework/scripts/generate-state.mts <project>

# 2. Verify quality gates passing
# (output shows ✅/❌ for each gate)

# 3. Share docs with next agent
# - docs/.handoff/00-MASTER-INDEX.md
# - docs/.handoff/01-PROJECT-STATE.md
# - docs/.handoff/02-CRITICAL-CONTEXT.md
```

### Weekly: Validate Compliance
```bash
# Check framework standards
npx tsx .handoff-framework/scripts/validate-docs.mts <project>

# Fix any errors shown
# Re-validate until 0 errors
```

### Monthly: Quality Review
```bash
# 1. Review token usage trends
cat .handoff.config.json | jq '.metrics'

# 2. Add quality gate artifacts if needed
npm run audit:<gate-name>

# 3. Update CRITICAL-CONTEXT with new gotchas
# 4. Archive resolved issues from FEATURE-STATUS
```

---

## 📊 Token Estimation Guide

**Estimate tokens**: `characters ÷ 4`

| Document Size | Tokens | Read Time |
|---------------|--------|-----------|
| 1,000 chars | 250 | 30 sec |
| 4,000 chars | 1,000 | 2 min |
| 16,000 chars | 4,000 | 8 min |
| 40,000 chars | 10,000 | 20 min |
| 120,000 chars | 30,000 | 45 min |

**Token budget targets:**
- ✅ Minimal: <5K tokens
- ✅ Medium: 5K-15K tokens
- ⚠️ Large: 15K-30K tokens
- ❌ Too large: >30K tokens (refactor needed)

---

## 🎯 Handoff Protocol

### Phase 1: Pre-Handoff (Outgoing Agent)
```bash
# 1. Run quality gates
npx tsx .handoff-framework/scripts/generate-state.mts <project>

# 2. Verify all gates passing
# (TypeScript, ESLint, Build must be ✅)

# 3. Create handoff document (if multi-agent)
# Or update FEATURE-STATUS with work completed

# 4. Pass docs to next agent:
# - 00-MASTER-INDEX.md
# - 01-PROJECT-STATE.md (just generated ✅)
# - 02-CRITICAL-CONTEXT.md
# - Any artifacts (route-manifest.json, etc.)
```

### Phase 2: Handoff (Incoming Agent)
```bash
# 1. Read MASTER-INDEX (5 min)
# - Understand project scope
# - Review tech stack
# - Note quality gate results

# 2. Read PROJECT-STATE (3 min)
# - Check current metrics
# - Verify quality gates ✅
# - Review recent changes

# 3. Read CRITICAL-CONTEXT (5 min)
# - Note known issues/gotchas
# - Review decision log
# - Check environment setup

# 4. Start work with full context ✅
# Total handoff time: 13 minutes
```

---

## 🛠️ Troubleshooting

### "Project directory not found"
**Fix**: Ensure project is sibling to `.handoff-framework/`
```
✅ workspace/
  ├── .handoff-framework/
  └── your-project/

❌ workspace/
  ├── .handoff-framework/
  └── subfolder/
      └── your-project/
```

### "Quality gates failing"
**Fix**: Address errors before handoff
```bash
# Fix TypeScript errors
npx tsc --noEmit

# Auto-fix ESLint errors
npm run lint --fix

# Fix build errors
npm run build
```

### "Token count too high"
**Fix options**:
1. Use artifacts instead of verbose docs
2. Remove duplicate content
3. Archive old/resolved issues
4. Split into feature-specific docs

### "Validation errors"
**Fix**: Complete all `[TODO]` placeholders
```bash
# Find remaining TODOs
grep -r "\[TODO\]" docs/.handoff/

# Fill in sections or delete if not applicable
```

---

## 📁 File Structure Reference

```
project/
├── docs/
│   └── .handoff/
│       ├── 00-MASTER-INDEX.md         (navigation)
│       ├── 01-PROJECT-STATE.md         (auto-generated)
│       ├── 02-CRITICAL-CONTEXT.md      (gotchas)
│       ├── ARCHITECTURE.md             (optional)
│       ├── FEATURE-STATUS.md           (optional)
│       ├── TESTID-FRAMEWORK.md         (optional)
│       ├── GAP-ANALYSIS.md             (optional)
│       └── DEPLOYMENT-ROADMAP.md       (optional)
│
├── .handoff.config.json                (quality gates)
│
└── [artifacts — if quality gates enabled]
    ├── e2e/fixtures/route-manifest.json
    ├── reports/cta-gap-analysis.json
    ├── reports/a11y-audit.json
    ├── reports/performance-audit.json
    └── reports/database-audit.json
```

---

## ⚡ Performance Tips

### Speed Up Handoffs
1. ✅ Use artifacts (17x token reduction per gate)
2. ✅ Auto-generate state (don't write manually)
3. ✅ Keep docs under 30K tokens total
4. ✅ Archive resolved issues weekly

### Reduce Token Usage
1. ✅ Enable quality gate artifacts
2. ✅ Reference subagent workflows
3. ✅ Use tables instead of paragraphs
4. ✅ Remove outdated content monthly

### Improve Quality
1. ✅ Run `validate-docs.mts` weekly
2. ✅ Keep quality gates passing
3. ✅ Update CRITICAL-CONTEXT immediately when gotchas found
4. ✅ Review docs during code review

---

## 📈 Success Metrics

**Track before/after framework adoption:**

| Metric | Before | Target After | Status |
|--------|--------|--------------|--------|
| Handoff time | 30-60 min | <10 min | Track weekly |
| Token usage | 30K-180K | <30K | Auto-calculated |
| Quality gate pass rate | Manual | 100% | `generate-state.mts` |
| Agent onboarding | 2+ hours | <15 min | Survey agents |
| Context loss incidents | Frequent | Rare | Track monthly |

---

## 🔗 Quick Links

| Resource | Location |
|----------|----------|
| **Full Guide** | `.handoff-framework/README.md` |
| **Protocol** | `.handoff-framework/HANDOFF_PROTOCOL.md` |
| **Migration Guide** | `.handoff-framework/MIGRATION_GUIDE.md` |
| **Script Usage** | `.handoff-framework/scripts/README.md` |
| **Examples** | `.handoff-framework/examples/` |
| **Workflows** | `.handoff-framework/workflows/` |
| **Config Reference** | `.handoff-framework/.handoff-config.example.json` |

---

## 💡 Quick Tips

✅ **DO**:
- Run `generate-state.mts` before every handoff
- Enable artifacts for 10x+ token savings
- Keep docs under 30K tokens
- Archive old content monthly
- Use subagent workflows for specialized audits

❌ **DON'T**:
- Manually edit `01-PROJECT-STATE.md` (auto-generated)
- Skip quality gates (breaks handoff contract)
- Duplicate content across templates
- Let `[TODO]` placeholders remain
- Deploy with failing quality gates

---

**Framework Version**: 1.0.0  
**Last Updated**: 2026-02-14  
**Print this page**: Save as PDF for offline reference
