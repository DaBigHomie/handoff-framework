# Handoff Protocol — Agent-to-Agent Transfer Rules

**Version**: 1.0.0  
**Purpose**: Standardize context transfer between agents to minimize token waste

---

## 🎯 Core Principles

### 1. Minimal Context Transfer
**Rule**: Transfer ONLY what the next agent needs for their specific task.

❌ **Wrong**:
```
"I read the entire codebase. Here's everything I learned about all 59 pages, 
38 components, 5 features, 55 migrations, authentication, database schema, 
routing, state management, styling..."
```
(Cost: 50,000 tokens)

✅ **Right**:
```
"Cart merge issue found. Next agent should read:
- docs/handoff/15-CART-SYSTEMS-ARCHITECTURE.md (Section 2.3)
- Affected file: src/hooks/useUnifiedCart.tsx lines 28-63

Issue: Guest cart not merging with user cart on login."
```
(Cost: 500 tokens = **100x reduction**)

---

### 2. State File System
**Rule**: All project state goes in numbered docs, not in chat messages.

**State Files** (always up-to-date):
- `00-MASTER-INDEX.md` - Navigation (what doc answers what question)
- `01-PROJECT-STATE.md` - Current state snapshot (auto-generated)
- `02-CRITICAL-CONTEXT.md` - Must-know info (manually curated)

**Handoff Process**:
1. Outgoing agent updates relevant state file
2. Commits change with evidence
3. Tells incoming agent: "Read doc #X, section Y"
4. Incoming agent reads ONLY that doc/section

---

### 3. Subagent Delegation
**Rule**: Never read >5 files to answer a question. Use subagents instead.

```typescript
// ❌ WRONG (main agent wastes 40,000 tokens)
const cartFiles = await readFiles([
  'src/hooks/useUnifiedCart.tsx',
  'src/hooks/useShoppingCart.ts',
  'src/components/cart/CartDrawer.tsx',
  'src/components/cart/ServiceCartDrawer.tsx',
  'src/components/cart/UnifiedCartDrawer.tsx',
  // ... 45 more files
]);

// ✅ RIGHT (subagent returns 1,000-line doc, costs 5,000 tokens)
const cartArchitecture = await runSubagent({
  description: "Audit cart systems",
  prompt: `Read workflow: .handoff-framework/workflows/audit-cart-systems.md
  Output: Single doc with cart systems, data flows, issues.`
});
```

**Token saving**: 40,000 → 5,000 = **8x reduction per research task**

---

### 4. Quality Gates (20x E2E Testing Framework)
**Rule**: All automation is TypeScript. NO `.sh` scripts in handoffs. Use quality gates between pipeline stages.

**The Three-Layer Testing Architecture**:

**Layer 1 — Discovery** (`.mts` scripts): "What exists? What's missing?"
- Runs standalone via `npx tsx scripts/<name>.mts`
- Produces JSON artifacts (route manifests, gap reports, audit results)
- Agents invoke when they need project state data
- **Token savings**: 50,000 → 3,000 = **17x** (read artifact instead of source files)

**Layer 2 — Validation** (`.spec.ts` thin tests): "Does what exists work?"
- Consumes Layer 1 artifacts (route-manifest.json)
- Runs in CI via `npx playwright test e2e/specs/<name>.spec.ts`
- Binary pass/fail gates
- **Must run AFTER Layer 1**, not before

**Layer 3 — Regression** (`.spec.ts` journey tests): "Do critical paths still work?"
- Checkout flow, cart operations, navigation
- Runs in CI + pre-deploy
- Last gate before production
- **Must run AFTER Layer 2 passes**

**Quality Gate Commands** (all TypeScript, zero bash):

| If agent just... | Run this gate | Command | Output |
|------------------|---------------|---------|--------|
| Generated components | Route discovery | `npm run discover:routes` | `route-manifest.json` |
| Wired up routes | Route health check | `npm run test:health` | Pass/fail |
| Completed service pages | CTA gap audit | `npm run audit:cta` | `cta-gap-analysis.json` |
| Finished implementation | Accessibility audit | `npm run audit:a11y` | `a11y-audit.json` |
| Preparing production | Performance audit | `npm run audit:performance` | `performance-audit.json` |
| Completed WP migration | Route crawler | `npm run discover:routes:crawl` | `route-manifest.json` |
| Needs visual QA | Screenshot capture | `npm run audit:screenshots` | `reports/screenshots/` |
| Pre-deployment | All critical tests | `npm run test:pre-deploy` | Pass/fail |

**Handoff Rule — Point to Artifacts, Not Source**:

```markdown
# ✅ CORRECT (agent reads JSON artifact, 3,000 tokens)
**Next Agent Instructions**:
1. Read `reports/cta-gap-analysis.json` (Section: summary.criticalIssues)
2. Fix 3 revenue pages missing cart integration
3. Re-run `npm run audit:cta` to verify fixes

# ❌ WRONG (agent reads 40+ source files, 50,000 tokens)
**Next Agent Instructions**:
1. Read `src/pages/services/*.tsx` (all 40 service pages)
2. Check which ones have cart buttons
3. Add cart buttons to missing pages
```

**Quality Gates Are Binary**:
- ✅ **PASS** - Gate succeeded, proceed
- ❌ **FAIL** - Gate blocked, next agent must fix before proceeding
- ⏭️ **SKIP** - Not applicable for this stage (e.g., performance only in staging)

**State Files for Quality Gates**:
- `e2e/fixtures/route-manifest.json` — Auto-generated route truth file
- `reports/cta-gap-analysis.json` — Revenue page coverage
- `reports/a11y-audit.json` — WCAG violations
- `reports/performance-audit.json` — Load times, LCP budgets
- `reports/DASHBOARD.md` — Merged report summary

All gate artifacts are **versioned state files** — commit them after each gate run.

---

## 📋 Handoff Checklist

### Outgoing Agent (Before Handoff)

- [ ] **Run quality gates** (if code/UI changed — see table above for which gates)
- [ ] **Commit gate artifacts** (route-manifest.json, reports/*.json)
- [ ] **Update state file** (01-PROJECT-STATE.md if code changed)
- [ ] **Create task-specific doc** (if new domain discovered)
- [ ] **Update master index** (add new doc to navigation table)
- [ ] **Commit with evidence** (✅ TypeScript: 0 errors, ✅ Build: Success, ✅ Gates: passed/blocked)
- [ ] **Write handoff message** (3-5 bullet points max, include gate results)

### Incoming Agent (After Receiving Handoff)

- [ ] **Check quality gate results** (if ❌ blocked, read artifact before proceeding)
- [ ] **Read master index FIRST** (00-MASTER-INDEX.md)
- [ ] **Read gate artifacts** (JSON reports if handoff references them)
- [ ] **Read ONLY specified docs** (don't explore, trust the handoff)
- [ ] **Verify state files are current** (check last commit date)
- [ ] **Ask clarifying questions if needed** (before reading codebase)
- [ ] **Update state files when done** (maintain the chain)
- [ ] **Re-run quality gates** (if you changed code that affects them)

---

## 🏗️ Handoff Message Format

### Template

```markdown
## 🤝 Handoff to Next Agent

**Task Completed**: [One-sentence summary]

**Changed Files**:
- [file path] ([+X lines / -Y lines])
- [file path] ([+X lines / -Y lines])

**Commit**: [hash]

**Quality Gates Run** (if applicable):
- [✅/❌/⏭️] [Gate Name]: [result] → [artifact path]
- [✅/❌/⏭️] [Gate Name]: [result] → [artifact path]
- [✅/❌/⏭️] [Gate Name]: [result] → [artifact path]

**Gate Artifacts for Next Agent** (if QA gates were run):
- `[artifact-path]` — [description] ([section to read])
- `[artifact-path]` — [description] ([section to read])

**State Files Updated**:
- ✅ [state file name] - [what changed]
- ⏳ [pending file name] - [why pending]

**Next Agent Instructions**:
1. Read `docs/handoff/[doc-name].md` [Section X if specific]
2. [Specific action to take - if blocked by QA gate, specify which artifact to read]
3. [Expected outcome]

**Decision Points** (if applicable):
- Option A: [description] (pros/cons)
- Option B: [description] (pros/cons)
- **Recommended**: [which option and why]

**Blockers** (if any):
- [ ] [Blocker description] - [how to resolve]

**Token Budget Used**: [X / 200,000]
```

### Real Example (Good)

```markdown
## 🤝 Handoff to Next Agent

**Task Completed**: Added Mermaid diagrams to architecture docs #15, #17, #18

**Changed Files**:
- docs/handoff/15-CART-SYSTEMS-ARCHITECTURE.md (+150 lines)
- docs/handoff/17-ECOMMERCE-FEATURES-STATUS.md (+200 lines)
- docs/handoff/18-COMPONENT-INTERACTION-MAP.md (+100 lines)

**Commit**: 1c32f3a

**State Files Updated**:
- ✅ 00-MASTER-INDEX.md - Added docs #19-20 to navigation
- ✅ 19-COMPREHENSIVE-GAP-ANALYSIS.md - 10-section audit complete
- ✅ 20-TESTID-FRAMEWORK.md - Framework defined, pending approval

**Next Agent Instructions**:
1. Read `docs/handoff/19-COMPREHENSIVE-GAP-ANALYSIS.md` Section 7 (Decision Matrix)
2. Review 6 blockers preventing deploy-ecommerce.sh execution
3. Decide: Resolve blockers OR proceed with partial deployment

**Decision Points**:
- Option A: Resolve all 6 blockers first (safer, 3-5 days)
- Option B: Execute deploy-ecommerce.sh with exclusions (faster, riskier)
- **Recommended**: Option A - Issue #40 must be fixed before automation

**Token Budget Used**: 72,000 / 200,000
```

**Why this works**:
- ✅ Specific doc + section to read (not "read everything")
- ✅ Clear decision context (next agent has all info)
- ✅ Evidence provided (commit hash, file changes)
- ✅ Token budget tracked (prevents overuse)

---

## 🔄 Multi-Agent Workflow Example

### Scenario: Deploy 25 ecommerce features

**Agent 1: Research Agent** (Subagent - audits)
```
Input: "Audit ecommerce automation system"
Reads: scripts/ecommerce-automation/* (9 files)
Output: docs/handoff/17-ECOMMERCE-FEATURES-STATUS.md (800 lines)
Tokens: 8,000
```

**Agent 2: Analysis Agent** (Main - makes decisions)
```
Input: "Read doc #17, decide deployment strategy"
Reads: docs/handoff/17-ECOMMERCE-FEATURES-STATUS.md (800 lines)
Output: Decision matrix in docs/handoff/19-COMPREHENSIVE-GAP-ANALYSIS.md
Tokens: 3,000
```

**Agent 3: Planning Agent** (Subagent - creates roadmap)
```
Input: "Create 4-phase deployment roadmap from gap analysis Section 7"
Reads: docs/handoff/19-COMPREHENSIVE-GAP-ANALYSIS.md Section 7 (500 lines)
Output: Gantt timeline + dependency graph (Mermaid diagrams)
Tokens: 2,500
```

**Agent 4: Execution Agent** (Main - deploys)
```
Input: "Execute Phase 1 (P4 features, no DB changes)"
Reads: docs/handoff/17-ECOMMERCE-FEATURES-STATUS.md P4 section (200 lines)
Output: GitHub issues created, automation triggered
Tokens: 1,500
```

**Total**: 15,000 tokens (vs 400,000 without framework = **27x reduction**)

---

## 📊 Token Budget Management

### Budget Allocation

| Phase | Budget | Actual Usage | Notes |
|-------|--------|--------------|-------|
| Initial research | 20,000 | Use subagents to stay under budget |
| Implementation | 50,000 | Read only specified handoff docs |
| Testing | 30,000 | Use test-ID framework doc |
| Deployment | 20,000 | Read roadmap + gap analysis |
| Documentation | 10,000 | Update state files only |
| **Buffer** | 70,000 | For unexpected complexity |
| **TOTAL** | 200,000 | Hard limit |

### Warning Thresholds

- 🟢 **< 100,000 tokens**: Good, on track
- 🟡 **100,000 - 150,000 tokens**: Caution, use more subagents
- 🔴 **> 150,000 tokens**: Critical, stop reading codebase directly

---

## 🛡️ Anti-Patterns (What NOT to Do)

### ❌ Anti-Pattern 1: The Essay Handoff

```markdown
I spent 3 hours reading the entire codebase and here's what I learned. 
The project uses React 18 with TypeScript and Vite. There are 59 pages 
organized in a pages/ folder. The routing is handled by React Router. 
Components are in src/components/ with 38 subdirectories. The state 
management uses React Query for server state and Context for client state. 
Styling is done with Tailwind CSS and shadcn/ui components. The database 
is Supabase PostgreSQL with 55 migrations. There are 5 feature modules...

[10,000 more lines of detailed exploration]

Next agent should review all of this carefully before starting work.
```

**Cost**: 50,000 tokens  
**Problem**: 99% of this is irrelevant to next agent's task

### ✅ Correct Pattern: The Pointer Handoff

```markdown
Cart merge issue discovered (P1 feature).

Read: docs/handoff/15-CART-SYSTEMS-ARCHITECTURE.md Section 2.3
File: src/hooks/useUnifiedCart.tsx lines 28-63
Issue: migrateLegacyCart() doesn't merge with logged-in user's cart

Expected fix: Add userId parameter, query Supabase carts table, merge arrays.
```

**Cost**: 200 tokens = **250x reduction**

---

### ❌ Anti-Pattern 2: The Codebase Reader

```typescript
// Agent reads 50 files to understand cart system
for (const file of cartFiles) {
  const content = await readFile(file);
  // Analyze content... (burns 40,000 tokens)
}
```

### ✅ Correct Pattern: The Subagent Delegator

```typescript
const cartDoc = await runSubagent({
  description: "Audit cart architecture",
  prompt: "Use workflow: audit-cart-systems.md. Return doc only."
});
// Agent receives 1,000-line doc (costs 5,000 tokens vs 40,000)
```

---

### ❌ Anti-Pattern 3: The State Hoarder

```markdown
**Project State** (stored in chat):
- Authentication: Uses Supabase Auth, hooks in src/hooks/useAuth.tsx...
- Database: 55 migrations, schema in types.ts...
- Components: 38 directories, organized by feature...
- [5,000 more lines of state stored in chat messages]
```

**Problem**: Every new agent must re-read entire chat history

### ✅ Correct Pattern: The State File Maintainer

```markdown
**Project State** → Moved to `docs/handoff/01-PROJECT-STATE.md`

To next agent: Read that file (800 lines), not this chat (50,000 tokens).
```

---

## 🎯 Success Criteria

A handoff is successful if:

1. ✅ **Next agent reads < 3,000 lines total** (not entire codebase)
2. ✅ **Next agent has all context needed** (no "I need to explore more")
3. ✅ **State files are updated** (not just chat messages)
4. ✅ **Decision points are clear** (no ambiguity)
5. ✅ **Token budget is tracked** (< 20,000 per handoff)

---

## 📈 Measuring Success

### Metrics to Track

```json
{
  "handoff_id": "agent-1-to-agent-2-cart-fix",
  "timestamp": "2026-02-14T10:30:00Z",
  "outgoing_agent": "Research Agent",
  "incoming_agent": "Implementation Agent",
  "metrics": {
    "state_files_updated": 3,
    "docs_created": 1,
    "docs_referenced": 2,
    "total_lines_to_read": 1200,
    "estimated_tokens": 3000,
    "handoff_message_tokens": 200,
    "token_reduction_vs_baseline": "40x",
    "time_to_context_restore": "18 seconds"
  },
  "success": true
}
```

---

## 🔄 Continuous Improvement

### After Each Handoff, Ask:

1. **Could the next agent find context faster?** → Update master index
2. **Did they read unnecessary docs?** → Improve handoff message specificity
3. **Were state files outdated?** → Automate state generation
4. **Did they ask clarifying questions?** → Add to CRITICAL-CONTEXT.md
5. **Did we exceed token budget?** → Use more subagents next time

---

## 📚 Reference: State vs Handoff Files

### State Files (Persistent, Version Controlled)

**Purpose**: Long-term project knowledge base

| File | Updates | Audience |
|------|---------|----------|
| 00-MASTER-INDEX.md | When docs added/removed | All agents |
| 01-PROJECT-STATE.md | After code changes | New agents joining |
| 02-CRITICAL-CONTEXT.md | When critical info discovered | All agents |

### Handoff Messages (Ephemeral, Chat Only)

**Purpose**: Task-specific context for immediate next agent

**Format**: 3-5 bullet points → points to state files → next agent reads state files (not chat)

---

## 🎓 Training Example

### Before Framework (Traditional Handoff)

```
Agent A: "I've completed the analysis. The system is complex with multiple 
carts, calculators, checkouts, and authentication flows. I found 38 component 
directories, 59 pages, 5 feature modules, and discovered that there are 
inconsistencies in the cart implementations. The Unified Cart uses localStorage 
while the Shopping Cart uses Supabase. There's also a legacy cart being migrated. 
I created documentation explaining all of this in detail..."

Agent B: [Reads 50,000 tokens of chat history + explores codebase]
Time: 12 minutes, Tokens: 80,000
```

### After Framework (20x Handoff)

```
Agent A: "Cart architecture documented.

Read: docs/handoff/15-CART-SYSTEMS-ARCHITECTURE.md
Focus: Section 4 (Known Issues)

Next: Implement cart merge fix from P1-cart-merge-session.prompt.md"

Agent B: [Reads 1 doc (500 lines) + 1 section (200 lines)]
Time: 18 seconds, Tokens: 2,000
```

**Improvement**: 12 min → 18 sec, 80,000 → 2,000 tokens = **40x reduction** ✅

---

**Summary**: Keep handoffs atomic, pointer-based, and state-file-driven. Never transfer context through chat essays.
