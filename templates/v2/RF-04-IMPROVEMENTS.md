# Improvement Suggestions — {{PROJECT_NAME}}

**Project**: {{PROJECT_NAME}}
**Framework**: @dabighomie/handoff-framework v{{FRAMEWORK_VERSION}}
**Last Updated**: {{DATE}}

---

## Purpose

Collected improvement suggestions for instruction files, AGENTS.md, CI/CD, and automation opportunities discovered during development sessions.

---

## 1. Instruction File Improvements

> Suggestions for `.github/instructions/*.instructions.md` files.

| File | Current Issue | Suggested Improvement | Priority | Status |
|------|-------------|----------------------|----------|--------|
| [TODO] | [what's wrong/missing] | [what to add/change] | P0-P3 | Pending / Done |

### New Instruction Files Needed

| Filename | applyTo Glob | Purpose |
|----------|-------------|---------|
| [TODO].instructions.md | `**/path/**` | [purpose] |

---

## 2. AGENTS.md Enhancements

> Suggestions for the project's AGENTS.md file.

### Missing Sections

| Section | Why Needed | Content Summary |
|---------|-----------|----------------|
| [TODO] | [reason] | [what to include] |

### Outdated Information

| Section | What's Wrong | Correction |
|---------|-------------|-----------|
| [TODO] | [current content] | [corrected content] |

### Proposed Additions

| Addition | Purpose | Priority |
|----------|---------|----------|
| Failed commands list | Prevent token waste | P0 |
| Task tracker cross-references | Single source of truth | P0 |
| Session log template | Track completed/skipped | P1 |
| [TODO] | [purpose] | [priority] |

---

## 3. CI/CD Improvements

| # | Improvement | Current State | Proposed | Effort | Impact |
|---|------------|--------------|----------|--------|--------|
| 1 | [TODO] | [current] | [proposed] | [hours] | High/Med/Low |

### Pipeline Gaps

| Stage | Has CI | Has CD | Blocks Deploy | Fix |
|-------|--------|--------|--------------|-----|
| TypeScript | ✅/❌ | N/A | Yes | [fix] |
| Lint | ✅/❌ | N/A | Yes | [fix] |
| Build | ✅/❌ | N/A | Yes | [fix] |
| E2E Tests | ✅/❌ | N/A | Yes | [fix] |
| Deploy | N/A | ✅/❌ | Yes | [fix] |

---

## 4. Context Optimization Strategies

> Reduce token waste and improve agent session efficiency.

| Strategy | Token Savings | Implementation |
|----------|--------------|---------------|
| Pre-load SCOREBOARD.json | ~5000 tokens | Add to AGENTS.md "Read first" |
| Use `jq` for JSON queries | ~2000 tokens | Don't `cat` entire JSON files |
| Check SESSION_LOG for failures | ~1000-5000/session | Reference before running commands |
| Use subagent for research | ~3000 tokens | Avoid loading large files in main context |
| Skip outdated docs | ~2000 tokens | Mark outdated in master index |
| Read handoff docs in priority order | ~3000 tokens | P0 docs first, skip P3 unless needed |
| [TODO] | [savings] | [how] |

---

## 5. Automation Opportunities

> Things currently done manually that should be automated.

| # | Manual Task | Frequency | Automation Method | Effort | ROI |
|---|------------|-----------|-------------------|--------|-----|
| 1 | [TODO] | [per session/daily/weekly] | [script/workflow/tool] | [hours] | [hours saved/month] |

### Recommended Automation Scripts to Build

| Script | Purpose | Input | Output | Priority |
|--------|---------|-------|--------|----------|
| `scripts/sync-scoreboard.mts` | Sync SCOREBOARD.json from implementation-plan | JSON files | Updated SCOREBOARD | P1 |
| `scripts/validate-handoff.mts` | Validate all handoff docs structure | docs/handoff/ | Pass/Fail report | P1 |
| [TODO] | [purpose] | [input] | [output] | [priority] |

---

## 6. Documentation Gaps

| Document | Gap | Resolution | Priority |
|----------|-----|-----------|----------|
| [TODO] | [what's missing] | [create/update] | P0-P3 |

---

## Implementation Tracker

| # | Improvement | Filed | Implemented | Date |
|---|------------|-------|-------------|------|
| 1 | [TODO] | Issue #[N] / N/A | Yes/No | [date] |

---

**Framework**: @dabighomie/handoff-framework v{{FRAMEWORK_VERSION}}
**Generated**: {{DATE}}
