# Handoff Framework Distribution Strategy

**Date**: February 20, 2026  
**Status**: Research Complete — Ready for Implementation  
**Framework**: `@dabighomie/handoff-framework` v3.0.0  
**Repo**: https://github.com/DaBigHomie/handoff-framework

---

## Problem Statement

The handoff framework lives at `management-git/.handoff-framework/` — a sibling folder in a local VS Code multi-root workspace. It is **invisible** to:

| Agent Context | Can Access Framework? | Why Not |
|---------------|----------------------|---------|
| **Copilot coding agent** (assigned to issues) | ❌ | Runs in isolated container, only clones the target repo |
| **PR review workflows** (GitHub Actions) | ❌ | Only has the triggering repo's files |
| **Cloud Copilot Chat** (github.com) | ❌ | Only sees the current repo |
| **GitHub Actions** (CI/CD) | ❌ | Only the repo it runs in (unless it explicitly clones another) |
| **Local Copilot Chat** (VS Code) | ✅ | Multi-root workspace can see `.handoff-framework/` |

**Goal**: Make the framework accessible in ALL 5 contexts with minimal maintenance burden.

---

## Channel Analysis

### 1. npm Package (`npx @dabighomie/handoff-framework`)

**How it works**: Publish to npm public registry. Any context with Node.js can run `npx @dabighomie/handoff-framework init <project> --session <slug>`.

| Criteria | Rating | Notes |
|----------|--------|-------|
| Copilot coding agents | ✅ Yes | Containers have Node.js; can run `npx` |
| PR workflows / Actions | ✅ Yes | `npm install` or `npx` in workflow step |
| Interactive Copilot Chat | ✅ Yes | Can suggest/run `npx` commands |
| Setup complexity | **Medium** | Need `.npmignore`, `files` field, `prepublishOnly` script, npm account |
| Maintenance burden | **Low** | `npm publish` on each release; standard semver |
| Version drift risk | **Low** | Lockfile pins version; `npx` gets latest by default |

**Required changes to `package.json`**:
```json
{
  "files": [
    "bin/",
    "dist/",
    "templates/",
    "scripts/validate-quality.js",
    "workflows/",
    "README.md"
  ],
  "main": "dist/src/cli.mjs",
  "bin": {
    "handoff": "bin/handoff.mjs"
  },
  "scripts": {
    "prepublishOnly": "npm run build"
  }
}
```

**Key issue**: The `bin/handoff.mjs` currently uses `tsx` to run `.mts` files. For npm distribution, it should consume the pre-built `dist/` output instead. The bin entry needs to be updated:

```javascript
// bin/handoff.mjs — UPDATED for npm distribution
// Instead of: execSync(`node --import tsx "${scriptPath}" ...`)
// Use: execSync(`node "${distScriptPath}" ...`)
```

This eliminates the `tsx` runtime dependency for consumers. Only the framework dev needs `tsx`.

**Verdict**: ✅ **PRIMARY CHANNEL** — covers all 5 agent contexts.

---

### 2. GitHub Action (Reusable Workflow / Composite Action)

**How it works**: Create `.github/actions/handoff/action.yml` in the framework repo. Other repos reference it as `DaBigHomie/handoff-framework/.github/actions/handoff@v3`.

| Criteria | Rating | Notes |
|----------|--------|-------|
| Copilot coding agents | ⚠️ Partial | Agent creates PRs but doesn't run Actions directly |
| PR workflows / Actions | ✅ Yes | Perfect fit — `uses: DaBigHomie/handoff-framework/.github/actions/handoff@v3` |
| Interactive Copilot Chat | ❌ No | Chat can't invoke GitHub Actions |
| Setup complexity | **Medium** | Need composite action YAML + workflow template |
| Maintenance burden | **Low** | Tag releases, repos reference by tag |
| Version drift risk | **Low** | Pinned to `@v3` tag |

**Best used for**: Automated validation in CI/CD — validate handoff docs on every PR, ensure naming conventions, score quality.

**Example composite action**:
```yaml
# .github/actions/handoff/action.yml
name: 'Handoff Framework'
description: 'Validate or generate handoff documentation'
inputs:
  command:
    description: 'Command to run (validate, validate:naming, init, generate)'
    required: true
  project:
    description: 'Project name'
    required: true
  session:
    description: 'Session slug'
    required: false
runs:
  using: 'composite'
  steps:
    - run: npx @dabighomie/handoff-framework@3 ${{ inputs.command }} ${{ inputs.project }} ${{ inputs.session && format('--session {0}', inputs.session) || '' }}
      shell: bash
```

**Verdict**: ✅ **SECONDARY CHANNEL** — perfect for CI/CD validation pipelines. Depends on npm package existing first.

---

### 3. Git Submodule

**How it works**: `git submodule add https://github.com/DaBigHomie/handoff-framework.git .handoff-framework`

| Criteria | Rating | Notes |
|----------|--------|-------|
| Copilot coding agents | ⚠️ Fragile | Must run `git submodule update --init` — agents may not do this |
| PR workflows / Actions | ⚠️ Fragile | Need `submodules: recursive` in checkout action |
| Interactive Copilot Chat | ✅ Yes | Files are in the repo tree (if initialized) |
| Setup complexity | **Medium** | One-time setup per repo, but submodule UX is notoriously painful |
| Maintenance burden | **High** | Must `git submodule update` in every repo when framework updates |
| Version drift risk | **High** | Submodules pin to a specific commit; drift is guaranteed without automation |

**Key problems**:
- Copilot coding agents run `git clone` but do NOT run `git submodule update --init` — the `.handoff-framework/` directory will be empty
- Every developer/agent must remember to init submodules
- PRs that update the submodule pointer create noise

**Verdict**: ❌ **NOT RECOMMENDED** — too fragile for automated agent contexts.

---

### 4. Sync Script (Copy Templates into Repos)

**How it works**: Extend the existing `documentation-standards/scripts/push-rules.sh` pattern. A script copies templates + CLI scripts directly into each repo's `.github/handoff/` or `scripts/handoff/` directory via the GitHub API.

| Criteria | Rating | Notes |
|----------|--------|-------|
| Copilot coding agents | ✅ Yes | Files are IN the repo — always available |
| PR workflows / Actions | ✅ Yes | Files are IN the repo |
| Interactive Copilot Chat | ✅ Yes | Files are IN the repo |
| Setup complexity | **Medium** | Extend existing `push-rules.sh` infrastructure |
| Maintenance burden | **High** | Must re-sync 15 templates + 10 scripts across N repos on every update |
| Version drift risk | **Medium** | Drift happens between sync runs; no lockfile mechanism |

**Advantages**:
- Proven pattern — `documentation-standards` already syncs `.instructions.md` files to 11 repos
- No external dependency (npm) needed
- Files are always present in every repo

**Disadvantages**:
- Syncing 30+ files (templates + scripts) is much heavier than syncing 6 instruction files
- No single version truth — each repo has a copy that could diverge
- Maintenance burden grows linearly with repo count

**Verdict**: ⚠️ **SUPPLEMENTARY** — good for syncing lightweight assets (templates only), but not for the full CLI toolchain.

---

### 5. GitHub Packages (npm alternative)

**How it works**: Publish to GitHub Packages (`npm install @dabighomie/handoff-framework` from GitHub registry).

| Criteria | Rating | Notes |
|----------|--------|-------|
| Copilot coding agents | ⚠️ Partial | Needs `.npmrc` with `@dabighomie:registry=https://npm.pkg.github.com` + token |
| PR workflows / Actions | ✅ Yes | Can use `GITHUB_TOKEN` for auth |
| Interactive Copilot Chat | ⚠️ Partial | Extra auth config needed |
| Setup complexity | **High** | Auth token management in every consuming context |
| Maintenance burden | **Medium** | Same as npm but with auth overhead |
| Version drift risk | **Low** | Same as npm |

**Verdict**: ❌ **NOT RECOMMENDED over npm** — adds authentication complexity with no benefit for a public package. npm public registry is simpler and more universal.

---

### 6. Template Repository

**How it works**: Mark `DaBigHomie/handoff-framework` as a GitHub template repo. New projects can "Use this template" to start with the framework baked in.

| Criteria | Rating | Notes |
|----------|--------|-------|
| Copilot coding agents | ❌ No | Template repos are for **new** repos, not existing ones |
| PR workflows / Actions | ❌ No | Not relevant to existing repos |
| Interactive Copilot Chat | ❌ No | Chat doesn't create repos |
| Setup complexity | **Low** | One checkbox in GitHub settings |
| Maintenance burden | **None** | Template is just the repo itself |
| Version drift risk | **High** | Forks from template never get updates |

**Verdict**: ❌ **NOT APPLICABLE** — the framework needs to be added to existing repos, not used as a starting point for new ones.

---

### 7. AGENTS.md Bootstrap Instructions

**How it works**: Add a section to every repo's `AGENTS.md` telling agents how to fetch and use the framework:

```markdown
## Handoff Framework

Generate handoff documentation using `@dabighomie/handoff-framework`:

\`\`\`bash
npx @dabighomie/handoff-framework init . --session <describe-your-work>
\`\`\`

Or if templates are needed offline:
\`\`\`bash
npx @dabighomie/handoff-framework init . --session <slug> --tags <csv>
\`\`\`

Full docs: https://github.com/DaBigHomie/handoff-framework
```

| Criteria | Rating | Notes |
|----------|--------|-------|
| Copilot coding agents | ✅ Yes | Agents read `AGENTS.md` — instructions tell them what to run |
| PR workflows / Actions | ❌ No | Actions don't read AGENTS.md |
| Interactive Copilot Chat | ✅ Yes | Chat reads AGENTS.md and can follow instructions |
| Setup complexity | **Low** | Add a section to existing AGENTS.md files |
| Maintenance burden | **Low** | Only update when CLI interface changes |
| Version drift risk | **None** | Instructions point to `npx` which always gets latest |

**Verdict**: ✅ **ESSENTIAL COMPANION** — zero cost, high value. Makes every other approach discoverable.

---

### 8. npx Bootstrap Script

**How it works**: A single `npx @dabighomie/handoff-framework` command that does everything — installs, initializes, generates templates.

| Criteria | Rating | Notes |
|----------|--------|-------|
| Same as npm package | ✅ | This IS the npm package with a good CLI UX |

**Verdict**: ✅ **This is just the npm package with good DX** — not a separate channel. The bin entry already provides this.

---

## Compatibility Matrix (Summary)

| Channel | Coding Agent | PR/Actions | Cloud Chat | Local Chat | Setup | Maintenance | Drift |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **npm package** | ✅ | ✅ | ✅ | ✅ | Med | Low | Low |
| **GitHub Action** | ⚠️ | ✅ | ❌ | ❌ | Med | Low | Low |
| **Git submodule** | ❌ | ⚠️ | ✅ | ✅ | Med | High | High |
| **Sync script** | ✅ | ✅ | ✅ | ✅ | Med | High | Med |
| **GitHub Packages** | ⚠️ | ✅ | ⚠️ | ⚠️ | High | Med | Low |
| **Template repo** | ❌ | ❌ | ❌ | ❌ | Low | None | High |
| **AGENTS.md bootstrap** | ✅ | ❌ | ✅ | ✅ | Low | Low | None |
| **npx bootstrap** | ✅ | ✅ | ✅ | ✅ | — | — | — |

---

## 🏆 Recommended 20x Solution: 3-Layer Strategy

### Layer 1: npm Package (Foundation)
**Covers**: ALL 5 agent contexts  
**Priority**: P0 — implement first  
**Effort**: ~2 hours

Publish `@dabighomie/handoff-framework` to npm. This is the single source of truth that every other layer depends on.

**Implementation**:
1. Add `"files"` field to `package.json` (include `bin/`, `dist/`, `templates/`, `scripts/validate-quality.js`)
2. Update `bin/handoff.mjs` to use `dist/` output instead of `tsx` runtime
3. Add `"prepublishOnly": "npm run build"` script
4. Create `.npmignore` (exclude `src/`, `tests/`, `.github/`, `examples/`)
5. `npm publish --access public`
6. Test: `npx @dabighomie/handoff-framework version` from any directory

**After this layer**: Any context with Node.js can run:
```bash
npx @dabighomie/handoff-framework init . --session my-work --tags feature-a,bugfix
```

### Layer 2: AGENTS.md Bootstrap + Copilot Instructions (Discovery)
**Covers**: Copilot coding agents, interactive Chat  
**Priority**: P0 — implement alongside Layer 1  
**Effort**: ~30 minutes

Add handoff framework instructions to every repo's `AGENTS.md` and `.github/copilot-instructions.md`. This makes the framework **discoverable** by agents that read these files.

**Implementation**:
1. Create a standard `HANDOFF_BOOTSTRAP.md` snippet
2. Append to `AGENTS.md` in each repo (can be automated via `push-rules.sh` pattern)
3. Add a `handoff-framework.instructions.md` to `documentation-standards/workspace-rules/` for auto-sync

**Snippet to add to each AGENTS.md**:
```markdown
## 🔄 Handoff Documentation

When starting a new work session or wrapping up, generate handoff docs:

\`\`\`bash
# Initialize handoff docs for this session
npx @dabighomie/handoff-framework@3 init . --session <describe-your-work>

# Auto-generate project state
npx @dabighomie/handoff-framework@3 generate . --session <slug>

# Validate handoff docs
npx @dabighomie/handoff-framework@3 validate . --session <slug>
\`\`\`

**When to generate handoff docs**:
- After completing a significant feature or bug fix
- Before ending a work session
- When assigned an issue that needs context preservation
- After any multi-file refactor

**Templates**: 15 numbered docs (00-14) covering context, session, findings, and reference.
**Full docs**: https://github.com/DaBigHomie/handoff-framework
```

### Layer 3: GitHub Action (CI/CD Validation)
**Covers**: PR workflows, automated quality gates  
**Priority**: P1 — implement after npm publish  
**Effort**: ~1 hour

Create a reusable composite action and a workflow template that repos can adopt to automatically validate handoff docs on PRs.

**Implementation**:
1. Create `.github/actions/validate-handoff/action.yml` in the framework repo
2. Create a reusable workflow `.github/workflows/validate-handoff.yml`
3. Add workflow to consuming repos (can be synced via `push-rules.sh`)

**Reusable workflow** (consumers reference this):
```yaml
# In consuming repo: .github/workflows/validate-handoff.yml
name: Validate Handoff Docs
on:
  pull_request:
    paths: ['docs/handoff-**']

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npx @dabighomie/handoff-framework@3 validate . || true
      - run: npx @dabighomie/handoff-framework@3 validate:naming . || true
```

---

## Piggyback on documentation-standards Infrastructure

**Yes — Layer 2 should use the existing sync pipeline.**

The `documentation-standards` repo already:
- Has a `workspace-rules/repo-registry.json` listing 11 repos
- Has `scripts/push-rules.sh` that syncs `.instructions.md` files via GitHub API
- Uses `gh api --method PUT` to create/update files in target repos

**Additions to documentation-standards**:

1. **New file**: `workspace-rules/handoff-framework.instructions.md`
   ```markdown
   ---
   applyTo: "**/docs/handoff-**,**/AGENTS.md"
   ---
   
   # Handoff Framework Usage
   
   This repo uses @dabighomie/handoff-framework for agent-to-agent documentation.
   
   ## Quick Commands
   - Init: `npx @dabighomie/handoff-framework@3 init . --session <slug>`
   - Generate: `npx @dabighomie/handoff-framework@3 generate . --session <slug>`
   - Validate: `npx @dabighomie/handoff-framework@3 validate . --session <slug>`
   ```

2. **Registry update**: Add `handoff-framework` to `repo-registry.json` (it's already a DaBigHomie repo)

3. **Optional**: Extend `push-rules.sh` to also sync the `validate-handoff.yml` workflow file into consuming repos

This means running `./scripts/push-rules.sh` once syncs both the instruction rules AND the handoff framework instructions to all repos simultaneously.

---

## Implementation Order

| Step | What | Time | Depends On |
|------|------|------|------------|
| 1 | **Prepare npm package** — add `files`, `.npmignore`, update `bin/handoff.mjs` to use `dist/` | 45 min | — |
| 2 | **Build & test** — `npm run build`, verify `npx` works from temp dir | 15 min | Step 1 |
| 3 | **npm publish** — `npm publish --access public` | 5 min | Step 2 |
| 4 | **Verify** — `npx @dabighomie/handoff-framework version` from any directory | 5 min | Step 3 |
| 5 | **Create AGENTS.md bootstrap snippet** | 15 min | Step 3 |
| 6 | **Create `handoff-framework.instructions.md`** in documentation-standards | 10 min | Step 3 |
| 7 | **Sync to all repos** — `./scripts/push-rules.sh` | 5 min | Steps 5-6 |
| 8 | **Create GitHub Action** — composite action + reusable workflow | 45 min | Step 3 |
| 9 | **Sync workflow to repos** — extend push-rules or manual | 15 min | Step 8 |
| 10 | **Test end-to-end** — assign a Copilot agent to an issue, verify it can use the framework | 20 min | Steps 7-9 |

**Total estimated time**: ~3 hours

---

## Files to Create/Modify

### In `.handoff-framework/` (framework repo)

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | **Modify** | Add `files`, `prepublishOnly`, update `main` to `dist/src/cli.mjs` |
| `bin/handoff.mjs` | **Modify** | Use `dist/` compiled output instead of `tsx` runtime |
| `.npmignore` | **Create** | Exclude `src/`, `tests/`, `.github/`, `examples/`, `docs/` |
| `.github/actions/validate-handoff/action.yml` | **Create** | Composite action for CI/CD |
| `.github/workflows/validate-handoff.yml` | **Create** | Reusable workflow template |

### In `documentation-standards/` (sync repo)

| File | Action | Purpose |
|------|--------|---------|
| `workspace-rules/handoff-framework.instructions.md` | **Create** | Auto-synced Copilot instruction for handoff usage |
| `workspace-rules/repo-registry.json` | **Modify** | Add any missing repos that need handoff |

### In each consuming repo (automated via sync)

| File | Action | Purpose |
|------|--------|---------|
| `.github/instructions/handoff-framework.instructions.md` | **Synced** | Tells Copilot how to use handoff framework |
| `AGENTS.md` | **Modify** | Add handoff bootstrap section |
| `.github/workflows/validate-handoff.yml` | **Optional** | PR validation for handoff docs |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| npm publish fails (name taken) | `@dabighomie` scope is org-owned, unlikely conflict |
| Agents don't run `npx` | AGENTS.md instructions + `.instructions.md` file provide explicit commands |
| Copilot agent container lacks Node.js | All Copilot coding agents run in containers with Node.js pre-installed |
| Version breaks consuming repos | Use `@3` major version pin in all instructions; semver protects minor/patch |
| Templates change frequently | Templates are shipped inside npm package; new version = `npm publish` |
| `tsx` dependency bloats install | Layer 1 removes `tsx` from consumer runtime — `dist/` has pre-compiled JS |

---

## Why NOT the Other Options

| Rejected | Reason |
|----------|--------|
| **Git submodule** | Copilot coding agents don't init submodules; high maintenance burden |
| **GitHub Packages** | Auth overhead for a public package; npm is simpler |
| **Template repo** | Only works for new repos; all target repos already exist |
| **Full sync script** | 30+ files per repo is too heavy; npm package is cleaner |
| **Templates-only sync** | Considered as Layer 2 alternative, but `npx` already ships templates — syncing creates drift risk |

---

## Success Criteria

After implementation, ALL of these must work:

- [ ] `npx @dabighomie/handoff-framework@3 version` returns `3.0.0` from any machine
- [ ] `npx @dabighomie/handoff-framework@3 init . --session test` creates `docs/handoff-test/` with 15 templates
- [ ] Copilot coding agent assigned to an issue can read AGENTS.md and run `npx` to generate handoff docs
- [ ] GitHub Action in a PR validates handoff doc naming and quality
- [ ] `.github/instructions/handoff-framework.instructions.md` exists in all registered repos
- [ ] Local workspace continues to work (backwards compatible)

---

**Recommended next step**: Start with Step 1 — prepare the npm package. Want me to implement it?
