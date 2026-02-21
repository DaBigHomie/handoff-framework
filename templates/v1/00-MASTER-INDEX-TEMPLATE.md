# Master Index Template

**Document**: #00  
**Purpose**: Navigation hub - tells agents which doc answers which question  
**Max Lines**: 500  
**Update Frequency**: When new docs are added/removed

---

## 🎯 Quick Navigation

**New agent?** Start here:
1. Read this index (5 min)
2. Read [02-CRITICAL-CONTEXT.md](./02-CRITICAL-CONTEXT.md) (3 min)
3. Find your task below → read that doc (2-5 min)

**Total onboarding**: 10-15 minutes instead of hours.

---

## 📊 Project Metrics

- **Handoff Documents**: [X total] (~Y,000 lines)
- **Architecture Docs**: [N docs] (docs #[numbers])
- **Last Updated**: [date]
- **Framework Version**: 1.0.0

---

## 📚 Document Index

| # | Document | Lines | Purpose | Read When |
|---|----------|-------|---------|-----------|
| 00 | **MASTER-INDEX** (this doc) | ~300 | Navigation hub | Always read first |
| 01 | **PROJECT-STATE** | ~800 | Current codebase state | Joining project / major changes |
| 02 | **CRITICAL-CONTEXT** | ~600 | Must-know info | Before ANY work |
| 03 | **[Feature Name] Architecture** | ~1,000 | System design | Modifying that feature |
| 04 | **[Feature Name] Status** | ~800 | What's built/missing | Before adding features |
| 05 | **Test-ID Framework** | ~800 | Testing standards | Before writing tests |
| 06 | **Deployment Roadmap** | ~1,000 | Execution plan | Before deploying |
| 07 | **Gap Analysis** | ~5,000 | Comprehensive audit | Major decisions only |

---

## 🔍 Find By Question

### "What's the current state?"
→ Read [01-PROJECT-STATE.md](./01-PROJECT-STATE.md)

### "What should I know before I start?"
→ Read [02-CRITICAL-CONTEXT.md](./02-CRITICAL-CONTEXT.md)

### "How does [feature] work?"
→ Read architecture doc for that feature (doc #[X])

### "What features are done vs missing?"
→ Read feature status doc (doc #[X])

### "How do I test this?"
→ Read [XX-TESTID-FRAMEWORK.md](./XX-TESTID-FRAMEWORK.md)

### "Should I deploy now?"
→ Read gap analysis decision matrix (doc #[X] Section 7)

### "What are the open issues?"
→ Read project state doc (doc #01) or run `gh issue list`

---

## 🎯 Task-Based Reading Paths

### Task: Fix a Bug

1. Read [02-CRITICAL-CONTEXT.md](./02-CRITICAL-CONTEXT.md) - system overview
2. Read architecture doc for affected feature
3. Fix bug
4. Update architecture doc if behavior changed

**Est. Reading**: 1,200 lines, 3,000 tokens, 2 minutes

---

### Task: Add Feature

1. Read [01-PROJECT-STATE.md](./01-PROJECT-STATE.md) - what exists
2. Read feature status doc - what's built vs missing
3. Read test-ID framework - testing standards
4. Implement feature
5. Update feature status doc

**Est. Reading**: 2,000 lines, 5,000 tokens, 3 minutes

---

### Task: Deploy to Production

1. Read [02-CRITICAL-CONTEXT.md](./02-CRITICAL-CONTEXT.md) - critical constraints
2. Read deployment roadmap - execution plan
3. Read gap analysis (if major deployment)
4. Execute deployment
5. Update project state doc

**Est. Reading**: 1,500 lines, 4,000 tokens, 2.5 minutes

---

### Task: Code Review

1. Read [02-CRITICAL-CONTEXT.md](./02-CRITICAL-CONTEXT.md) - code standards
2. Read architecture doc for changed feature
3. Review code
4. Update docs if needed

**Est. Reading**: 1,000 lines, 2,500 tokens, 1.5 minutes

---

## 📖 Document Descriptions

### Core Documents (Always Relevant)

**00-MASTER-INDEX.md** (this doc)  
Navigation hub. Read first to know what doc answers what question.

**01-PROJECT-STATE.md**  
Auto-generated snapshot of current codebase state (tech stack, file counts, recent changes, open issues).

**02-CRITICAL-CONTEXT.md**  
Manually curated must-know information (anti-patterns, gotchas, deployment blockers, coding standards).

### Architecture Documents (Read When Modifying)

**[Add doc descriptions specific to your project]**

Example:
**15-CART-SYSTEMS-ARCHITECTURE.md**  
Explains 3 cart systems (Unified, Shopping, Legacy), data flows, decision tree for which cart to use.

### Feature Status Documents (Read When Adding Features)

**[Add doc descriptions specific to your project]**

Example:
**17-ECOMMERCE-FEATURES-STATUS.md**  
25 ecommerce features defined, deployment status (done/partial/missing), automation system.

### Testing/Quality Documents

**[Add doc descriptions specific to your project]**

Example:
**20-TESTID-FRAMEWORK.md**  
Naming conventions for test-IDs, coverage targets, automation scripts.

### Planning Documents (Read for Major Decisions)

**[Add doc descriptions specific to your project]**

Example:
**19-COMPREHENSIVE-GAP-ANALYSIS.md**  
10-section audit, decision matrices, deployment roadmap, risk assessment.

---

## 🚨 Critical Reads (Before ANY Work)

**Must read these 2 docs** (combined: ~1,000 lines, 2,500 tokens, 5 minutes):

1. **02-CRITICAL-CONTEXT.md** - Gotchas that break production
2. **01-PROJECT-STATE.md** - Current state snapshot

**Then read task-specific docs** as needed (refer to "Find By Question" section above).

---

## 🔄 Quick Reading Sequence by Role

### New Agent Joining Project
```
00-MASTER-INDEX.md → 02-CRITICAL-CONTEXT.md → 01-PROJECT-STATE.md
Total: ~1,700 lines, 4,000 tokens, 7 minutes
```

### Agent Assigned Specific Task
```
00-MASTER-INDEX.md → Find task → Read 1-2 relevant docs
Total: ~1,500 lines, 3,500 tokens, 5 minutes
```

### Agent Doing Research/Audit
```
Launch subagent with workflow → Receive research doc
Total: 0 lines read in main agent, 5,000 tokens (subagent cost)
```

---

## 📈 Documentation Standards

All docs in this project follow:
- **Max 1,000 lines** (except gap analyses ≤5,000)
- **Mermaid diagrams** for complex flows
- **Executive summary** at top
- **Numbered sections** for easy reference
- **Version controlled** (committed with code)

---

## 🛠️ Maintenance

**When to update this index**:
- ✅ New handoff doc created → Add row to table
- ✅ Doc deleted/archived → Remove row
- ✅ Doc purpose changes → Update description
- ✅ New task pattern emerges → Add to "Find By Question"

**How to update**:
```bash
# 1. Edit this file
vim docs/handoff/00-MASTER-INDEX.md

# 2. Update metrics (doc count, line count)
# 3. Add new doc to table
# 4. Commit
git add docs/handoff/00-MASTER-INDEX.md
git commit -m "docs: update master index (added doc #XX)"
```

---

## 📊 Token Usage Tracking

Agents should track cumulative tokens used:

```markdown
## Token Budget

- **Initial**: 200,000
- **Used so far**: [X]
- **Remaining**: [200,000 - X]
- **Estimated for this task**: [Y]
- **Buffer**: [200,000 - X - Y]
```

**Warning thresholds**:
- 🟢 < 100,000: Good
- 🟡 100,000-150,000: Use more subagents
- 🔴 > 150,000: Critical, stop reading codebase directly

---

## 🎯 Success Metrics

This index is successful if:
- ✅ New agents find their doc in < 2 minutes
- ✅ Agents read < 3,000 lines total for any task
- ✅ No agent ever says "I need to explore the codebase"
- ✅ Token usage stays < 20,000 per handoff

---

**Next Doc**: [02-CRITICAL-CONTEXT.md](./02-CRITICAL-CONTEXT.md) (read this before any work)
