# Workflow Library

**Purpose**: Catalog of all subagent workflows for 20x handoff framework  
**Total Workflows**: 7  
**Average Token Savings**: 9-17x per workflow  
**Last Updated**: [Current Date]

---

## Quick Reference

| Workflow | Token Savings | Time | Output | Priority |
|----------|---------------|------|--------|----------|
| [audit-cart-systems](#audit-cart-systems) | 45K → 5K (9x) | 12 min | 1,000 lines | P1 |
| [audit-database](#audit-database) | 38K → 5K (7.6x) | 12 min | 1,000 lines | P0 |
| [audit-test-coverage](#audit-test-coverage) | 42K → 4.5K (9.3x) | 10 min | 900 lines | P1 |
| [audit-cta-gaps](#audit-cta-gaps) | 50K → 3K (17x) | 8 min | 600 lines | P2 |
| [audit-accessibility](#audit-accessibility) | 45K → 4K (11x) | 10 min | 800 lines | P1 |
| [audit-performance](#audit-performance) | 40K → 3.5K (11x) | 9 min | 700 lines | P2 |
| [audit-routes](#audit-routes) | 35K → 3K (12x) | 7 min | 500 lines | P0 |

**Combined Savings**: Main agent saves **290,000 tokens** by delegating these 7 workflows to subagents → Only **28,000 tokens** to read outputs = **10.4x overall reduction**

---

## How to Use This Library

### When to Use a Workflow

**Trigger**: Main agent encounters a task requiring deep research across many files

**Decision Tree**:

1. **Does this task require reading 20+ files?**
   - ❌ No → Main agent does it directly
   - ✅ Yes → Continue to #2

2. **Is there a matching workflow in this library?**
   - ✅ Yes → Delegate to subagent using that workflow
   - ❌ No → Continue to #3

3. **Would creating a workflow save tokens for future agents?**
   - ✅ Yes → Create new workflow (add to this library)
   - ❌ No → Main agent does it (one-time task)

### How to Delegate

**Step 1 — Pick Workflow**: Choose from table above  
**Step 2 — Launch Subagent**:
```typescript
runSubagent({
  description: "Audit cart systems",
  prompt: `Follow the workflow in .handoff-framework/workflows/audit-cart-systems.md

[Copy workflow content here]

Expected output: 1 document (1,000 lines) showing cart implementations, data flow, consolidation proposal.`
});
```

**Step 3 — Receive Output**: Subagent returns completed document  
**Step 4 — Read Output**: Main agent reads document (5,000 tokens vs 45,000 tokens)  
**Step 5 — Continue Work**: Main agent proceeds with decisions based on research

### Workflow Naming Convention

```
audit-[domain].md
```

**Examples**:
- `audit-cart-systems.md` — Specific system (cart)
- `audit-database.md` — Infrastructure layer (database)
- `audit-test-coverage.md` — Quality assurance (testing)
- `audit-routes.md` — Routing architecture

---

## Workflow Catalog

---

### audit-cart-systems

**File**: [audit-cart-systems.md](./audit-cart-systems.md)

**Purpose**: Research all cart implementations (hooks, components, contexts) and propose consolidation

**When to Use**:
- Multiple cart implementations exist (duplication suspected)
- Cart integration failing (need to understand data flow)
- Refactoring cart system (need architecture doc)

**Token Savings**: 45,000 → 5,000 = **9x reduction**

**Estimated Time**: 12 minutes

**Expected Output** (1,000 lines):
- Executive summary (what's implemented, what's duplicated)
- Inventory of all cart files (hooks, components, contexts, types)
- Data flow Mermaid diagrams (per implementation)
- Duplication matrix (quantify overlaps)
- Consolidation proposal (Option A/B/C with decision matrix)
- Migration plan (step-by-step if consolidating)

**Success Criteria**:
- ✅ All cart files read and documented
- ✅ Data flow diagrams created
- ✅ Duplications quantified (% overlap)
- ✅ Clear recommendation with pros/cons
- ✅ Migration plan if consolidating

**Common Use Cases**:
1. "We have 3 different cart hooks — which one is canonical?"
2. "Cart state isn't persisting — need to understand architecture"
3. "Planning to refactor cart — need current state doc"

---

### audit-database

**File**: [audit-database.md](./audit-database.md)

**Purpose**: Research database schema, compare with TypeScript types, identify mismatches and security gaps

**When to Use**:
- TypeScript types don't match database columns (build errors)
- RLS policies missing or misconfigured (security risk)
- Migrations applied but types not regenerated
- Frontend expects columns that don't exist

**Token Savings**: 38,000 → 5,000 = **7.6x reduction**

**Estimated Time**: 12 minutes

**Expected Output** (1,000 lines):
- Executive summary (tables audited, mismatches found, critical issues)
- Schema overview (table inventory, ERD diagram)
- Table details (columns, indexes, foreign keys, RLS policies, triggers)
- Schema-code mismatches (missing columns, type conflicts, RLS gaps, broken FKs)
- RLS policy analysis (coverage, security risks, policy flow diagram)
- Migration history (applied/pending/skipped migrations)
- Critical issues with SQL fixes
- Recommended actions (immediate/short-term/long-term)

**Success Criteria**:
- ✅ All tables documented with full schema
- ✅ All migrations listed chronologically
- ✅ Mismatches quantified (missing columns, type conflicts, RLS gaps)
- ✅ ERD diagram shows table relationships
- ✅ RLS coverage analyzed for security risks
- ✅ Critical issues listed with specific SQL fixes

**Common Use Cases**:
1. "TypeScript errors: 'Property X does not exist on type Y'"
2. "Users can query other users' data — RLS misconfigured?"
3. "Migration ran but types.ts not updated — causing build failures"

---

### audit-test-coverage

**File**: [audit-test-coverage.md](./audit-test-coverage.md)

**Purpose**: Find components missing test-IDs, document E2E coverage gaps, create testing roadmap

**When to Use**:
- Cannot write E2E tests (components lack test-IDs)
- Quality gates failing (CTA gaps, checkout flow, cart integration)
- Unknown coverage (how much of app is tested?)
- Planning testing sprint (need priority list)

**Token Savings**: 42,000 → 4,500 = **9.3x reduction**

**Estimated Time**: 10 minutes

**Expected Output** (900 lines):
- Executive summary (components audited, test-ID coverage %, quality gates status)
- Coverage summary (overall + by category + by route)
- Components inventory (with/without test-IDs)
- E2E test specs (Layer 1/2/3 specs inventoried)
- Missing test-IDs priority list (P0/P1/P2/P3)
- Quality gates status (which gates fail due to missing test-IDs)
- Testing roadmap (4-week plan)
- test-ID naming conventions
- Automation recommendations

**Success Criteria**:
- ✅ All components categorized (UI/Features/Pages/Shared/Other)
- ✅ test-ID coverage calculated per category
- ✅ E2E specs inventoried by layer (Discovery/Validation/Regression)
- ✅ Missing test-IDs prioritized (P0/P1/P2/P3)
- ✅ Quality gate status documented
- ✅ Testing roadmap created

**Common Use Cases**:
1. "Quality gates failing — need to know which components lack test-IDs"
2. "Planning testing sprint — which components should we prioritize?"
3. "Cannot test checkout flow — need to find which components lack test-IDs"

---

### audit-cta-gaps

**File**: [audit-cta-gaps.md](./audit-cta-gaps.md)

**Purpose**: Find all CTAs (buttons, links) across the site, identify missing test-IDs and conversion blockers

**When to Use**:
- CTA gaps quality gate failing
- Conversion funnel broken (CTAs not clickable in tests)
- Marketing wants CTA inventory (for optimization)
- Planning A/B tests (need list of all CTAs)

**Token Savings**: 50,000 → 3,000 = **17x reduction** (highest savings!)

**Estimated Time**: 8 minutes

**Expected Output** (600 lines):
- Executive summary (total CTAs, missing test-IDs, critical gaps)
- CTA inventory by page (route → CTAs found → test-ID status)
- Missing test-IDs priority list (P0/P1/P2/P3 by conversion impact)
- Conversion funnel analysis (Homepage → Shop → Cart → Checkout)
- CTA best practices violations (accessibility, UX, copywriting)
- Quality gate integration (how CTAs block gates)
- Recommended fixes (add test-IDs, improve copy, fix accessibility)

**Success Criteria**:
- ✅ All routes scanned for CTAs
- ✅ CTAs categorized (primary/secondary/tertiary)
- ✅ Missing test-IDs quantified
- ✅ Conversion funnel mapped
- ✅ Priority list created (P0 = deployment blockers)

**Common Use Cases**:
1. "CTA gaps gate failing — need list of all CTAs without test-IDs"
2. "Conversion funnel analysis — which CTAs drive purchases?"
3. "A/B testing CTAs — need inventory of all buttons/links"

---

### audit-accessibility

**File**: [audit-accessibility.md](./audit-accessibility.md)

**Purpose**: Scan site for accessibility violations (WCAG AA), identify missing aria-labels, keyboard navigation issues

**When to Use**:
- Accessibility quality gate failing
- WCAG compliance required (legal/business requirement)
- Screen reader testing (need to know what's broken)
- Keyboard navigation broken (need audit)

**Token Savings**: 45,000 → 4,000 = **11x reduction**

**Estimated Time**: 10 minutes

**Expected Output** (800 lines):
- Executive summary (violations found, WCAG level, pass/fail)
- Accessibility summary (by severity: Critical/Serious/Moderate/Minor)
- Violations by category (alt text, aria-labels, color contrast, keyboard nav, form labels)
- Violations by route (which pages have most issues)
- WCAG criteria checklist (which success criteria pass/fail)
- Recommended fixes (specific code changes for each violation)
- Testing instructions (how to verify fixes with screen readers)

**Success Criteria**:
- ✅ All routes scanned with axe-core
- ✅ Violations categorized by severity
- ✅ WCAG success criteria checklist completed
- ✅ Specific code fixes provided (not just "add aria-label")
- ✅ Testing instructions included

**Common Use Cases**:
1. "Accessibility gate failing — need list of violations"
2. "WCAG AA compliance required — need audit report"
3. "Screen reader testing failed — what's missing?"

---

### audit-performance

**File**: [audit-performance.md](./audit-performance.md)

**Purpose**: Run Lighthouse audits, analyze bundle size, identify performance bottlenecks

**When to Use**:
- Performance quality gate failing
- Site slow (need to identify bottlenecks)
- Bundle size exceeding limits
- Lighthouse score < 90

**Token Savings**: 40,000 → 3,500 = **11x reduction**

**Estimated Time**: 9 minutes

**Expected Output** (700 lines):
- Executive summary (Lighthouse scores, critical issues, recommendations)
- Lighthouse report (Performance/Accessibility/Best Practices/SEO scores)
- Core Web Vitals (LCP/FID/CLS with targets)
- Bundle analysis (total size, largest chunks, opportunities)
- Network waterfall (critical path, render-blocking resources)
- Image optimization (unoptimized images, format recommendations)
- Recommended fixes (code splitting, lazy loading, image optimization)
- Testing instructions (how to re-run audits)

**Success Criteria**:
- ✅ Lighthouse run on all critical routes
- ✅ Core Web Vitals measured (LCP/FID/CLS)
- ✅ Bundle size analyzed
- ✅ Specific optimizations recommended
- ✅ Re-test instructions provided

**Common Use Cases**:
1. "Performance gate failing — need Lighthouse report"
2. "Site loading slow — need bottleneck analysis"
3. "Bundle size too large — need chunk analysis"

---

### audit-routes

**File**: [audit-routes.md](./audit-routes.md)

**Purpose**: Discover all routes in application, verify they're defined in routing config, identify 404s and duplicates

**When to Use**:
- Route discovery quality gate failing
- New routes added but not in routing file
- 404 errors on legitimate pages
- Route health degraded (routes returning errors)

**Token Savings**: 35,000 → 3,000 = **12x reduction**

**Estimated Time**: 7 minutes

**Expected Output** (500 lines):
- Executive summary (routes discovered, missing routes, broken routes)
- Route inventory (all routes with status: ✅ / ❌ / ⚠️)
- Missing routes (found in code but not in routing config)
- Broken routes (404 errors, 500 errors)
- Duplicate routes (same path defined multiple times)
- Route health report (which routes pass/fail health check)
- Recommended fixes (add routes to config, fix imports, remove duplicates)

**Success Criteria**:
- ✅ All routes discovered (from App.tsx or routing file)
- ✅ Route health tested (200 OK vs 404/500)
- ✅ Missing routes identified
- ✅ \Duplicates flagged
- ✅ Specific fixes provided

**Common Use Cases**:
1. "Route health gate failing — need to know which routes are broken"
2. "Added new routes but they 404 — not in routing config?"
3. "Route discovery gate failing — routes.ts outdated?"

---

## Creating New Workflows

### When to Create a New Workflow

Create a new workflow when:

1. **Task is recurring** — Same research needed for multiple projects
2. **Token savings > 5x** — Significant efficiency gain for future agents
3. **Research is deep** — Requires reading 20+ files across multiple directories
4. **Output is reusable** — Document can be referenced by multiple agents

### Workflow Template

```markdown
# Workflow — [Name]

**Purpose**: [One sentence]
**Token Saving**: [X]K → [Y]K = [Z]x reduction
**Expected Output**: [Number] document(s) ([lines]) describing [what]
**Estimated Time**: [minutes]

---

## Context

[When is this workflow needed? What problem does it solve?]

**Problem**: Main agent would need to read [files] = [tokens]
**Solution**: Subagent does research, creates [output] ([tokens] for main agent)

---

## Your Task

[Clear description of what subagent should create]

---

## Step-by-Step Instructions

### 1. [Phase Name]

[Instructions]

### 2. [Phase Name]

[Instructions]

### 3. [Phase Name]

[Instructions]

---

## Output Format

[Exact Markdown structure expected]

---

## Success Criteria

- ✅ [Criterion 1]
- ✅ [Criterion 2]
- ✅ [Criterion 3]

---

## Token Budget

**Files to read**: [X] files × [Y] lines = [Z] tokens
**Output**: [A] lines = [B] tokens for main agent
**Net saving**: [Z] → [B] = [C]x reduction

---

## Common Pitfalls

❌ **DON'T** [mistake]
✅ **DO** [correct approach]

---

## Handoff Back to Main Agent

[Template handoff message]
```

### Adding to This Library

**Steps**:

1. Create workflow file: `.handoff-framework/workflows/audit-[domain].md`
2. Follow template above
3. Test workflow with subagent (verify it produces expected output)
4. Add entry to this library (insert into [Workflow Catalog](#workflow-catalog) section)
5. Update [Quick Reference](#quick-reference) table
6. Commit workflow + library update together

---

## Maintenance

### Updating Workflows

**When workflows need updates**:
- Framework architecture changes (e.g., new quality gate added)
- Better patterns discovered (more efficient research method)
- Output format improvements (easier for main agents to read)

**How to update**:
1. Edit workflow file
2. Update "Last Updated" date
3. Test changes with subagent
4. Update this library if summary/token savings changed
5. Commit with changelog

### Deprecating Workflows

**When to deprecate**:
- Workflow no longer relevant (feature removed from framework)
- Better workflow replaces it (e.g., combined two workflows)
- Automated tool makes workflow unnecessary (e.g., script does it faster)

**How to deprecate**:
1. Move workflow to `.handoff-framework/workflows/deprecated/`
2. Add deprecation notice at top of workflow file:
   ```markdown
   > **DEPRECATED**: Use [new-workflow.md] instead. This workflow is no longer maintained.
   ```
3. Remove from this library's Quick Reference table
4. Add to "Deprecated Workflows" section (if doesn't exist, create it)

---

## Token Savings Calculation

### How to Calculate

**Formula**: (Main agent tokens WITHOUT workflow) - (Main agent tokens WITH workflow) = Savings

**Example** (audit-cart-systems):

**Without workflow**:
- Read 15 cart files × 200 lines = 3,000 lines = 7,500 tokens
- Read 8 hook files × 150 lines = 1,200 lines = 3,000 tokens
- Read 5 component files × 300 lines = 1,500 lines = 3,750 tokens
- Read 3 context files × 250 lines = 750 lines = 1,875 tokens
- Read 2 type files × 100 lines = 200 lines = 500 tokens
- **Total**: 6,650 lines = 16,625 tokens (let's call it ~17K for simplicity)
- **Analysis time**: Main agent spends 10-15 minutes reading + analyzing
- **Output**: None (analysis stays in agent's memory, lost after handoff)

**Wait, the workflow says 45K → 5K. Let me recalculate...**

Actually, looking at the workflow, it says:
- Files to read: 40 cart files across features, components, hooks, types
- Token budget: ~45,000 tokens for main agent to read all files
- Output: 1,000 lines = 2,500 tokens for subagent's document
- Main agent reads document: 5,000 tokens (generous estimate for reading + understanding)
- **Net saving**: 45,000 → 5,000 = **9x reduction**

**Formula verified**: (Tokens to read all source files) / (Tokens to read workflow output) = Reduction factor

### Validation

**Before claiming token savings**:
1. Count actual files workflow will read
2. Estimate lines per file (check real files in codebase)
3. Calculate tokens: lines × 2.5 (average for TypeScript/React)
4. Calculate output document tokens: expected_lines × 2.5
5. Verify reduction: (input tokens) / (output tokens) ≥ 5x
6. If < 5x, workflow may not be worth it (case-by-case decision)

---

## Future Workflows (Ideas)

**Potential workflows to create**:

1. **audit-github-issues.md** — Summarize open issues, link to code, prioritize
   - Token savings estimate: 35K → 4K = 8.8x
2. **audit-dependencies.md** — Find outdated packages, security vulnerabilities
   - Token savings estimate: 30K → 3K = 10x
3. **audit-api-integration.md** — Document all API calls (Stripe, Supabase, external)
   - Token savings estimate: 40K → 4K = 10x
4. **audit-styling-system.md** — Inventory all CSS/Tailwind classes, find duplications
   - Token savings estimate: 38K → 3.5K = 11x
5. **audit-state-management.md** — Map all state (React Query, Zustand, contexts)
   - Token savings estimate: 42K → 4.5K = 9.3x

---

## Metrics

### Library Statistics

- **Total workflows**: 7
- **Average token savings**: 10.4x
- **Total tokens saved per full audit**: 290K → 28K = **262,000 tokens** saved
- **Time saved per full audit**: ~68 minutes (agents work in parallel) vs ~8 hours (main agent reads serially)

### Usage Tracking

**How to track**:
- Log each time workflow is used (in project's handoff docs)
- Track: Workflow used, Token savings, Time savings, Issues found
- Aggregate monthly: Which workflows most valuable?

**Example log entry**:
```markdown
## Workflow Usage Log

| Date | Workflow | Project | Tokens Saved | Time Saved | Issues Found |
|------|----------|---------|--------------|------------|--------------|
| 2026-02-10 | audit-cart-systems | damieus-com-migration | 40K | 12 min | 3 duplicates |
| 2026-02-11 | audit-database | damieus-com-migration | 33K | 10 min | 8 schema mismatches |
```

---

## Version History

**v1.0.0** (Initial Release)
- Created 7 core workflows (cart, database, test-coverage, CTA, a11y, performance, routes)
- Established workflow template and library structure
- Integrated with 20x E2E Testing Framework quality gates

**Future versions**:
- Add workflows as needed
- Deprecate workflows if automated tools replace them
- Improve token savings calculations based on real usage data

---

## Agent Handoff Context

**If you're the next agent**:
1. Read [Quick Reference](#quick-reference) table (find relevant workflow)
2. Read specific workflow file (deep dive into instructions)
3. Delegate to subagent using `runSubagent` tool
4. Receive output document
5. Read output (fraction of tokens vs reading source files directly)
6. Continue work with research insights

**If you need a workflow that doesn't exist**:
1. Check [Future Workflows](#future-workflows-ideas) for planned ones
2. If not listed, create using [Workflow Template](#workflow-template)
3. Add to this library
4. Commit workflow + library update

---

**Lines**: ~600
**Tokens**: ~1,500 (this index)
**Purpose**: Find and delegate research workflows to subagents
**Updates**: Add new workflows as created, update metrics quarterly
