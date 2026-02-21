# Session Log — {{PROJECT_NAME}}

**Project**: {{PROJECT_NAME}}
**Framework**: @dabighomie/handoff-framework v{{FRAMEWORK_VERSION}}
**Last Updated**: {{DATE}}

---

## Purpose

Track what was completed, skipped, and what information is outdated. Document failed commands and their solutions to prevent token loss on future sessions.

---

## Session: {{DATE}}

**Agent**: [Agent name/model]
**Duration**: [estimated]
**Focus**: [primary objective]

### Completed

| # | Work Item | Files Changed | Evidence |
|---|-----------|---------------|----------|
| 1 | [TODO] | [TODO] | TypeScript: 0 errors |
| 2 | [TODO] | [TODO] | Build: Success |

### Skipped (Intentionally)

| # | Work Item | Reason | Revisit? |
|---|-----------|--------|----------|
| 1 | [TODO] | [reason skipped] | Yes/No |

### Outdated Information Discovered

| # | Document/Section | What's Wrong | Corrected In |
|---|-----------------|-------------|-------------|
| 1 | [TODO] | [what's outdated] | [new doc or section] |

---

## Failed Commands Log

> **CRITICAL**: Document every failed command. This prevents token waste on subsequent sessions.

### Session {{DATE}}

| # | Command | Error | Root Cause | Solution | Tokens Wasted |
|---|---------|-------|------------|----------|---------------|
| 1 | `[command]` | `[error message]` | [why it failed] | [what fixed it] | ~[estimate] |

### 20x Token Loss Prevention Rules

1. **Before running any command**: Check if it failed in a previous session (search this log)
2. **Before DB migrations**: Verify schema with `npx supabase db diff` first
3. **Before `create_file`**: Check if file exists — use edit tools for existing files
4. **Before long builds**: Verify dependencies installed (`npm ls`)
5. **Before E2E tests**: Verify dev server is running
6. **Before Supabase commands**: Verify correct project ID and auth
7. **Before git operations**: Verify correct directory (`pwd`) — workspace root is NOT a git repo

### Known Command Failures (Persistent)

| Command | Always Fails Because | Use Instead |
|---------|---------------------|-------------|
| `gh issue edit --add-assignee @copilot` | User "copilot" not found via CLI | `mcp_github2_assign_copilot_to_issue` MCP tool |
| `npx supabase db push` | Direct DB connection blocked by Copilot | `node scripts/apply-migration-via-rest.cjs` |
| `npx supabase gen types` | Requires auth token | Run locally or in CI |
| `git add` from workspace root | management-git/ is not a git repo | `cd` into project first |
| `create_file` on existing file | Tool rejects existing paths | Use `replace_string_in_file` or delete+recreate |

---

## Features Implemented / Improved

### This Session

| Feature | Type | Status | Files | Impact |
|---------|------|--------|-------|--------|
| [TODO] | New / Improved / Fixed | Complete | [file list] | [description] |

### Running Changelog

| Date | Feature | Type | Commit |
|------|---------|------|--------|
| {{DATE}} | [TODO] | feat/fix/docs | [hash] |

---

## Optimization Opportunities Identified

| # | Opportunity | Category | Effort | Impact | Status |
|---|------------|----------|--------|--------|--------|
| 1 | [TODO] | CI/CD / DX / Performance | [hours] | High/Med/Low | Not started |

---

## Context Optimization Strategies

> Strategies discovered during this session to reduce token usage and improve agent efficiency.

| Strategy | Saves | How |
|----------|-------|-----|
| Read SCOREBOARD.json first | ~5000 tokens | Avoid re-auditing completed features |
| Use `jq` for JSON queries | ~2000 tokens | Don't read entire JSON files |
| Check this log for failed commands | ~1000-5000 tokens/failure | Don't repeat known failures |
| Use subagent for research | ~3000 tokens | Avoid loading large files into main context |
| Skip outdated docs (see list above) | ~2000 tokens | Don't read docs marked outdated |

---

## Missed Automation Tasks

> Things that could have been automated but were done manually.

| # | Task Done Manually | Could Automate With | Effort to Automate | Priority |
|---|-------------------|--------------------|--------------------|----------|
| 1 | [TODO] | [script/tool] | [hours] | P0-P3 |

---

**Framework**: @dabighomie/handoff-framework v{{FRAMEWORK_VERSION}}
**Generated**: {{DATE}}
