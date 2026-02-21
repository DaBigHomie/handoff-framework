# Changelog

All notable changes to the Handoff Framework are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

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
