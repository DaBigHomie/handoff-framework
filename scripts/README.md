# Handoff Framework Scripts

**Purpose**: TypeScript automation scripts for framework initialization, state generation, migration, and validation

**Why TypeScript?**: Follows framework's "no bash" principle — all automation via TypeScript for cross-platform compatibility, type safety, and consistency.

---

## Prerequisites

```bash
# Install dependencies (run once in this directory)
npm install
```

**Requirements**:
- Node.js ≥ 18.0.0
- npm or yarn

---

## Available Scripts

### 1. init-project.mts

**Purpose**: Initialize handoff framework in a new project

**Usage**:
```bash
npx tsx init-project.mts <project-name>
```

**Example**:
```bash
npx tsx init-project.mts damieus-com-migration
```

**What it does**:
- ✅ Creates `docs/.handoff/` directory
- ✅ Copies all framework templates (removes `-TEMPLATE` suffix)
- ✅ Creates `.handoff.config.json` with quality gate configuration
- ✅ Creates initial `00-MASTER-INDEX.md` with project info
- ✅ Auto-detects tech stack from package.json
- ✅ Provides next steps guidance

**Output**:
```
docs/.handoff/
├── 00-MASTER-INDEX.md       (with project info pre-filled)
├── 01-PROJECT-STATE.md      (template)
├── 02-CRITICAL-CONTEXT.md   (template)
├── ARCHITECTURE.md          (template)
└── FEATURE-STATUS.md        (template)

.handoff.config.json         (quality gates configuration)
```

---

### 2. generate-state.mts

**Purpose**: Auto-generate current project state document

**Usage**:
```bash
npx tsx generate-state.mts <project-name>
```

**Example**:
```bash
npx tsx generate-state.mts damieus-com-migration
```

**What it does**:
- ✅ Collects project metrics (LOC, components, pages, hooks, tests)
- ✅ Runs quality gates (TypeScript, ESLint, build)
- ✅ Checks for quality gate artifacts (route-manifest.json, etc.)
- ✅ Retrieves recent git commits
- ✅ Generates comprehensive `01-PROJECT-STATE.md`
- ✅ Reports deployment blockers with fix instructions

**Output**:
```
docs/.handoff/01-PROJECT-STATE.md

Content includes:
- Project metrics table
- Quality gate status (✅/❌)
- Deployment blockers (if any)
- Recent git history
- Auto-generation timestamp
```

**Quality gates checked**:
1. TypeScript: `npx tsc --noEmit`
2. ESLint: `npm run lint`
3. Build: `npm run build`

**Artifacts checked**:
- `e2e/fixtures/route-manifest.json` (route discovery)
- `reports/cta-gap-analysis.json` (CTA gaps)
- `reports/a11y-audit.json` (accessibility)
- `reports/performance-audit.json` (performance)

---

### 3. migrate-existing.mts

**Purpose**: Migrate existing project with docs to framework structure

**Usage**:
```bash
npx tsx migrate-existing.mts <project-name>
```

**Example**:
```bash
npx tsx migrate-existing.mts damieus-com-migration
```

**What it does**:
- ✅ Searches for existing handoff documentation
- ✅ Creates backup of all existing docs
- ✅ Creates `docs/.handoff/` directory
- ✅ Copies framework templates
- ✅ Creates migration mapping (old docs → new templates)
- ✅ Creates `.handoff.config.json`
- ✅ Generates `MIGRATION_LOG.md` with manual steps

**Existing docs detected**:
- `docs/handoff/` directory
- `docs/agent-prompts/` directory
- `docs/*-HANDOFF*.md` files
- `docs/AGENTS.md`

**Output**:
```
docs/.handoff/
├── 00-MASTER-INDEX.md
├── 01-PROJECT-STATE.md
├── 02-CRITICAL-CONTEXT.md
├── ARCHITECTURE.md
├── FEATURE-STATUS.md
└── MIGRATION_LOG.md         (manual migration steps)

docs/.handoff-backup-TIMESTAMP/  (backup of existing docs)
.handoff.config.json
```

**Post-migration**: Follow steps in `MIGRATION_LOG.md` to map content from old docs to new templates

---

### 4. validate-docs.mts

**Purpose**: Validate documentation compliance with framework standards

**Usage**:
```bash
npx tsx validate-docs.mts <project-name>
```

**Example**:
```bash
npx tsx validate-docs.mts damieus-com-migration
```

**What it does**:
- ✅ Checks required documents exist (MASTER-INDEX, PROJECT-STATE, CRITICAL-CONTEXT)
- ✅ Checks recommended documents (ARCHITECTURE, FEATURE-STATUS, etc.)
- ✅ Validates document structure (token estimates, quick start, navigation)
- ✅ Validates quality gate integration (.handoff.config.json)
- ✅ Estimates token counts per document
- ✅ Checks for subagent workflow references
- ✅ Generates validation report

**Validation checks**:

| Check | Type | Result |
|-------|------|--------|
| Required docs present | Error | Must have 3 core docs |
| Recommended docs present | Warning | Should have 5+ docs |
| Document structure | Error/Warning | Sections present & formatted |
| Quality gate config | Error | .handoff.config.json exists |
| Token budget | Error/Warning | < 50K tokens total |
| Workflow references | Suggestion | Using subagent workflows |

**Exit codes**:
- `0` = All checks passed (or warnings only)
- `1` = Errors found (must fix before deployment)

---

## Quick Reference

| Task | Command |
|------|---------|
| **New project setup** | `npx tsx init-project.mts <project>` |
| **Update state** | `npx tsx generate-state.mts <project>` |
| **Migrate existing** | `npx tsx migrate-existing.mts <project>` |
| **Validate docs** | `npx tsx validate-docs.mts <project>` |

---

## Workflow: Setting Up a New Project

```bash
# Step 1: Initialize framework
npx tsx init-project.mts my-project

# Step 2: Fill in TODO placeholders
cd my-project/docs/.handoff
# Edit 00-MASTER-INDEX.md, 02-CRITICAL-CONTEXT.md manually

# Step 3: Generate current state
cd ../../..
npx tsx generate-state.mts my-project

# Step 4: Validate compliance
npx tsx validate-docs.mts my-project

# Step 5: Commit
cd my-project
git add docs/.handoff/ .handoff.config.json
git commit -m "docs: initialize handoff framework v1.0.0"
```

---

## Workflow: Migrating an Existing Project

```bash
# Step 1: Migrate existing docs
npx tsx migrate-existing.mts my-project

# Step 2: Review migration log
cat my-project/docs/.handoff/MIGRATION_LOG.md

# Step 3: Map content from old docs to new templates
# (Manual step — open backup and new templates side-by-side)

# Step 4: Generate state
npx tsx generate-state.mts my-project

# Step 5: Validate
npx tsx validate-docs.mts my-project

# Step 6: Commit
cd my-project
git add docs/.handoff/ .handoff.config.json
git commit -m "docs: migrate to handoff framework v1.0.0"

# Step 7: Clean up (after verifying migration)
rm -rf docs/.handoff-backup-*
rm docs/.handoff/MIGRATION_LOG.md
```

---

## Troubleshooting

### "Project directory not found"

**Cause**: Script expects project to be in `../<project-name>` relative to framework

**Solution**: Ensure framework is in workspace root, projects are siblings
```
management-git/
├── .handoff-framework/
│   └── scripts/          (← you are here)
├── damieus-com-migration/
├── one4three-co-next-app/
└── [other projects]
```

### "Handoff docs not initialized"

**Cause**: `docs/.handoff/` directory doesn't exist (for generate-state/validate)

**Solution**: Run `init-project.mts` first

### "Quality gates failing"

**Cause**: `generate-state.mts` runs TypeScript/ESLint/build checks

**Solution**: Fix errors before generating state, or review deployment blockers in output

### "tsx: command not found"

**Cause**: Dependencies not installed

**Solution**:
```bash
cd .handoff-framework/scripts
npm install
```

---

## Script Architecture

**Design principles**:
1. **TypeScript-first**: No bash scripts (follows framework's "no .sh" rule)
2. **Cross-platform**: Works on Windows/macOS/Linux
3. **Type-safe**: Leverage TypeScript for error prevention
4. **Idempotent**: Safe to run multiple times (skips existing files)
5. **Informative**: Colorized output, clear next steps, error guidance

**Dependencies**:
- `tsx`: TypeScript execution (no build step required)
- `@types/node`: Node.js type definitions
- `typescript`: TypeScript compiler

**No external dependencies** beyond Node.js built-ins:
- `fs/promises`: File operations
- `child_process`: Run quality gate commands
- `readline/promises`: Interactive prompts
- `path`: Path manipulation

---

## Contributing

**Adding a new script**:

1. Create `new-script.mts` in this directory
2. Follow existing patterns (colors, log functions, error handling)
3. Add to `package.json` scripts section
4. Document in this README
5. Test with real project

**Code style**:
- Use async/await (no callbacks)
- Import from 'fs/promises' (not 'fs')
- Use colored output for user feedback
- Provide clear error messages with solutions
- Include usage examples in header comment

---

## Version History

**v1.0.0** (2026-02-14)
- Initial release
- Converted all bash scripts to TypeScript
- Cross-platform compatibility
- Quality gate integration
- Artifact-based handoff support

---

**Framework Version**: 1.0.0  
**Scripts Type**: TypeScript (ESM)  
**Node.js Requirement**: ≥ 18.0.0
