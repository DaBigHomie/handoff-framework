# Changelog

All notable changes to the Handoff Framework are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [3.0.0] — 2026-02-21

### Breaking Changes
- **Numeric-first naming**: `{NN}-{SLUG}_{DATE}.md` replaces FSD `{PREFIX}-{SEQ}-{SLUG}_{DATE}.md`
- **Session-named folders**: `docs/handoff-{slug}/` replaces generic `docs/handoff/`
- **Category metadata, not filenames**: Categories (context/session/findings/reference) are inferred from sequence number, not filename prefix
- **Config `namingVersion: 'v2.1'`**: New config flag distinguishes v3 from v2

### Added
- **`buildDocsPath(sessionSlug?)`**: Generates session-aware folder paths
- **`getCategoryForSequence(seq)`**: Infers category from numeric sequence
- **`NUMERIC_FILENAME_REGEX`**: Validates `{NN}-{SLUG}_{DATE}.md` pattern
- **`parseSessionArg(args)`**: Extracts `--session <slug>` from CLI args across all scripts
- **`findHandoffFolders(projectDir)`**: Discovers all `handoff-*` folders
- **`DOC_CATEGORIES`**: 4 metadata categories (context, session, findings, reference)
- **`DOC_CATEGORY_RANGES`**: Maps numeric ranges to categories (0-2, 3-5, 6-11, 12-14)
- **Investigation hints**: `<!-- INVESTIGATE: ... -->` HTML comments replace `[TODO]` placeholders
- **3-path migration**: v1 → v3, v2 FSD → v3, bare → v3

### Changed
- **All 15 templates**: Renamed from `CO-00-MASTER_INDEX.md` to `00-MASTER_INDEX.md` (etc.)
- **Template content**: All FSD references replaced with numeric naming
- **`init-project.mts`**: Session-aware, generates `--session` folder, outputs numeric filenames
- **`generate-state.mts`**: Session-aware, outputs `01-PROJECT_STATE`
- **`validate-naming.mts`**: Completely rewritten for numeric validation
- **`validate-docs.mts`**: Completely rewritten with session discovery
- **`migrate-existing.mts`**: Completely rewritten with 3 migration paths
- **`cli.mts`**: Updated descriptions and `--session` documentation
- **Tests**: All rewritten for numeric naming (validate-naming, types)
- **Prompt**: Rewritten with investigation-first workflow

### Deprecated
- **FSD naming** (`CO-00-MASTER_INDEX_DATE.md`): Still recognized by migration script
- **`CANONICAL_DOCS_PATH`**: Use `buildDocsPath()` instead
- **`FSD_FILENAME_REGEX`**: Kept for migration compatibility only

---

## [2.0.0] — 2026-02-20

### Added
- **FSD Naming Convention**: 5-category system (CO, AR, OP, QA, RF) with date-stamped filenames
- **`NAMING_CONVENTION.md`**: Canonical naming standard with validation regex
- **v2 templates**: `CO-00-MASTER_INDEX`, `CO-01-PROJECT_STATE`, `CO-02-CRITICAL_CONTEXT`, `AR-01-SYSTEM_ARCHITECTURE`, `OP-01-DEPLOYMENT_ROADMAP`, `QA-01-TESTID_FRAMEWORK`, `RF-01-REFERENCE_MAP`
- **`validate-naming.mts`**: FSD filename validation script with regex enforcement
- **`src/version.ts`**: Single source of truth for framework version
- **`src/types.ts`**: Shared TypeScript interfaces for config, validation, templates
- **`src/utils.ts`**: Shared utilities (logging, file ops, date formatting)
- **Root `package.json`**: Proper npm package structure (`@dabighomie/handoff-framework`)
- **`tsconfig.json`**: Strict TypeScript configuration
- **`CHANGELOG.md`**: This file — version history tracking
- **Test suite**: `tests/validate-naming.spec.ts`, `tests/version.spec.ts`
- **CLI entry point**: `src/cli.mts` for `npx handoff <command>`
- **Prompt shortcut**: `.github/prompts/generate-handoff.prompt.md`

### Changed
- **Canonical docs path**: `docs/.handoff/` → `docs/handoff/`
- **Template naming**: `XX-NAME-TEMPLATE.md` → `{PREFIX}-{SEQ}-{SLUG}.md` (FSD)
- **Repo structure**: Flat files → organized `src/`, `docs/`, `config/`, `templates/v{n}/`, `tests/`
- **`init-project.mts`**: Updated for v2.0 FSD naming, `docs/handoff/` path, date suffixes
- **`validate-docs.mts`**: Integrated documentation-standards quality scoring
- **Config schema**: Added `framework.namingVersion`, updated `docsPath` to `docs/handoff`

### Deprecated
- v1 templates (preserved in `templates/v1/` for reference)
- Shell scripts (`*.sh`) — replaced by TypeScript `.mts` equivalents

### Migration
- See `docs/MIGRATION_GUIDE.md` for v1 → v2 upgrade steps
- Migration tables in `docs/NAMING_CONVENTION.md` for both one4three and damieus naming

---

## [1.0.0] — 2026-02-14

### Added
- Initial framework with 6 templates (00-MASTER-INDEX through TESTID-FRAMEWORK)
- Three-layer testing architecture (Discovery → Validation → Regression)
- Scripts: `init-project.mts`, `generate-state.mts`, `validate-docs.mts`, `migrate-existing.mts`
- Shell script wrappers for all TypeScript scripts
- Example workflows and audit templates
- `.handoff-config.example.json` with quality gates and token budgets
- `HANDOFF_PROTOCOL.md`, `QUICK_REFERENCE.md`, `IMPLEMENTATION_PLAN.md`
- 40x token reduction strategy documentation
