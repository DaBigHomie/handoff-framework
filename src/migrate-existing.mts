#!/usr/bin/env node --no-warnings
/**
 * migrate-existing.mts — Migrate existing project docs to FSD v2 naming
 *
 * Scans docs/.handoff/ (v1) or docs/handoff/ for non-FSD files,
 * creates backup, renames to FSD convention, generates migration log.
 *
 * Usage: npx tsx src/migrate-existing.mts <project-name>
 * Example: npx tsx src/migrate-existing.mts damieus-com-migration
 */

import { copyFile, mkdir, readdir, readFile, rename, writeFile } from 'fs/promises';
import { join, basename, dirname } from 'path';

import { VERSION } from './version.js';
import {
  FSD_FILENAME_REGEX,
  FSD_CATEGORIES,
  FSD_CATEGORY_NAMES,
  CANONICAL_DOCS_PATH,
  REQUIRED_TEMPLATES,
  RECOMMENDED_TEMPLATES,
  todayISO,
  type FsdCategory,
} from './types.js';
import {
  log,
  fileExists,
  ensureDir,
  resolveProjectDir,
  getHandoffDocsPath,
  getFrameworkRoot,
} from './utils.js';

// ─── V1 → V2 Name Mapping ───────────────────────────────────────

interface MigrationRule {
  v1Pattern: RegExp;
  v2Category: FsdCategory;
  v2Sequence: number;
  v2Slug: string;
}

const MIGRATION_RULES: MigrationRule[] = [
  { v1Pattern: /^00-MASTER[-_]INDEX/i, v2Category: 'CO', v2Sequence: 0, v2Slug: 'MASTER_INDEX' },
  { v1Pattern: /^01-PROJECT[-_]STATE/i, v2Category: 'CO', v2Sequence: 1, v2Slug: 'PROJECT_STATE' },
  { v1Pattern: /^02-CRITICAL[-_]CONTEXT/i, v2Category: 'CO', v2Sequence: 2, v2Slug: 'CRITICAL_CONTEXT' },
  { v1Pattern: /ARCHITECTURE/i, v2Category: 'AR', v2Sequence: 1, v2Slug: 'SYSTEM_ARCHITECTURE' },
  { v1Pattern: /FEATURE[-_]STATUS/i, v2Category: 'RF', v2Sequence: 2, v2Slug: 'FEATURE_STATUS' },
  { v1Pattern: /TESTID[-_]FRAMEWORK/i, v2Category: 'QA', v2Sequence: 1, v2Slug: 'TESTID_FRAMEWORK' },
  { v1Pattern: /GAP[-_]ANALYSIS/i, v2Category: 'QA', v2Sequence: 2, v2Slug: 'GAP_ANALYSIS' },
  { v1Pattern: /DEPLOYMENT[-_]ROADMAP/i, v2Category: 'OP', v2Sequence: 1, v2Slug: 'DEPLOYMENT_ROADMAP' },
  { v1Pattern: /ROUTE[-_]AUDIT/i, v2Category: 'RF', v2Sequence: 1, v2Slug: 'ROUTE_AUDIT' },
  { v1Pattern: /REFERENCE[-_]MAP/i, v2Category: 'RF', v2Sequence: 1, v2Slug: 'REFERENCE_MAP' },
  { v1Pattern: /QUICK[-_]START/i, v2Category: 'OP', v2Sequence: 4, v2Slug: 'QUICK_START' },
  { v1Pattern: /INSTRUCTION[-_]FILES/i, v2Category: 'RF', v2Sequence: 7, v2Slug: 'INSTRUCTION_FILES' },
];

interface MigrationAction {
  oldName: string;
  newName: string;
  rule: MigrationRule | null;
  action: 'rename' | 'skip' | 'manual';
  reason?: string;
}

function computeNewName(filename: string, today: string): MigrationAction {
  // Already FSD-named — skip
  if (FSD_FILENAME_REGEX.test(filename)) {
    return { oldName: filename, newName: filename, rule: null, action: 'skip', reason: 'Already FSD-named' };
  }

  // Try migration rules
  for (const rule of MIGRATION_RULES) {
    if (rule.v1Pattern.test(filename)) {
      const seq = String(rule.v2Sequence).padStart(2, '0');
      const newName = `${rule.v2Category}-${seq}-${rule.v2Slug}_${today}.md`;
      return { oldName: filename, newName, rule, action: 'rename' };
    }
  }

  // Can't auto-map — manual review
  return {
    oldName: filename,
    newName: filename,
    rule: null,
    action: 'manual',
    reason: 'No matching migration rule — review manually',
  };
}

// ─── Backup ──────────────────────────────────────────────────────

async function createBackup(
  sourceDir: string,
  projectDir: string,
): Promise<string> {
  const timestamp = todayISO().replace(/-/g, '') + '-' +
    new Date().toTimeString().split(' ')[0].replace(/:/g, '');
  const backupDir = join(projectDir, 'docs', `.handoff-backup-${timestamp}`);
  await mkdir(backupDir, { recursive: true });

  const files = await readdir(sourceDir);
  for (const file of files) {
    if (file.endsWith('.md')) {
      await copyFile(join(sourceDir, file), join(backupDir, file));
    }
  }

  return backupDir;
}

// ─── Migration Log Generator ─────────────────────────────────────

function generateMigrationLog(
  projectName: string,
  actions: MigrationAction[],
  backupDir: string,
  today: string,
): string {
  const renamed = actions.filter((a) => a.action === 'rename');
  const skipped = actions.filter((a) => a.action === 'skip');
  const manual = actions.filter((a) => a.action === 'manual');

  return `# Migration Log

**Project**: ${projectName}
**Migration Date**: ${today}
**Framework**: @dabighomie/handoff-framework v${VERSION}
**Naming Version**: v1 → v2 (FSD)

---

## Summary

- **Renamed**: ${renamed.length} files
- **Skipped**: ${skipped.length} files (already FSD-named)
- **Manual**: ${manual.length} files (need manual review)
- **Backup**: ${backupDir}

---

## Renamed Files

| Old Name | New Name |
|----------|----------|
${renamed.map((a) => `| ${a.oldName} | ${a.newName} |`).join('\n') || '| *None* | |'}

## Skipped (Already FSD)

${skipped.map((a) => `- ${a.oldName}`).join('\n') || '*None*'}

## Manual Review Required

${manual.map((a) => `- **${a.oldName}**: ${a.reason}`).join('\n') || '*None*'}

---

## FSD Naming Reference

| Prefix | Category | Description |
|--------|----------|-------------|
${FSD_CATEGORIES.map((c) => `| ${c} | ${FSD_CATEGORY_NAMES[c]} | See NAMING_CONVENTION.md |`).join('\n')}

**Pattern**: \`{PREFIX}-{SEQ}-{SLUG}_{YYYY-MM-DD}.md\`

---

## Checklist

- [ ] Verify renamed files look correct
- [ ] Handle "Manual Review" items above
- [ ] Update any internal cross-references between docs
- [ ] Run: \`npx tsx src/validate-naming.mts ${projectName}\`
- [ ] Run: \`npx tsx src/validate-docs.mts ${projectName}\`
- [ ] Delete backup after verifying: \`${backupDir}\`
- [ ] Commit the migration

---

**Generated by**: migrate-existing.mts
**Date**: ${today}
`;
}

// ─── Main ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const projectName = process.argv[2];

  if (!projectName) {
    log.error('Project name required');
    console.log('');
    console.log('Usage: npx tsx src/migrate-existing.mts <project-name>');
    console.log('Example: npx tsx src/migrate-existing.mts damieus-com-migration');
    process.exit(1);
  }

  const frameworkDir = getFrameworkRoot(import.meta.url);
  const projectDir = resolveProjectDir(frameworkDir, projectName);
  const today = todayISO();

  log.header(`Migrating handoff docs to FSD v2 for: ${projectName}`);
  console.log('');

  // Verify project exists
  if (!(await fileExists(projectDir))) {
    log.error(`Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  // Find existing docs — check both v1 (docs/.handoff) and v2 (docs/handoff) locations
  const v1Dir = join(projectDir, 'docs', '.handoff');
  const v2Dir = getHandoffDocsPath(projectDir);
  let sourceDir: string;

  if (await fileExists(v1Dir)) {
    sourceDir = v1Dir;
    log.info(`Found v1 docs at: docs/.handoff/ — will migrate to ${CANONICAL_DOCS_PATH}/`);
  } else if (await fileExists(v2Dir)) {
    sourceDir = v2Dir;
    log.info(`Found docs at: ${CANONICAL_DOCS_PATH}/`);
  } else {
    log.error('No handoff docs found. Run init-project.mts first.');
    process.exit(1);
  }
  console.log('');

  // List existing files
  const files = (await readdir(sourceDir)).filter((f) => f.endsWith('.md'));

  if (files.length === 0) {
    log.warning('No markdown files found to migrate.');
    process.exit(0);
  }

  log.info(`Found ${files.length} markdown files`);

  // Compute migration actions
  const actions: MigrationAction[] = files.map((f) => computeNewName(f, today));

  // Show plan
  const renamed = actions.filter((a) => a.action === 'rename');
  const skipped = actions.filter((a) => a.action === 'skip');
  const manual = actions.filter((a) => a.action === 'manual');

  console.log('');
  log.info('Migration Plan:');
  if (renamed.length > 0) {
    for (const a of renamed) {
      log.success(`  RENAME: ${a.oldName} → ${a.newName}`);
    }
  }
  if (skipped.length > 0) {
    for (const a of skipped) {
      log.dim(`  SKIP:   ${a.oldName} (already FSD-named)`);
    }
  }
  if (manual.length > 0) {
    for (const a of manual) {
      log.warning(`  MANUAL: ${a.oldName} — ${a.reason}`);
    }
  }

  if (renamed.length === 0) {
    log.success('All files already use FSD naming — nothing to migrate!');
    process.exit(0);
  }

  console.log('');

  // Create backup
  log.info('Creating backup...');
  const backupDir = await createBackup(sourceDir, projectDir);
  log.success(`Backup: ${backupDir}`);
  console.log('');

  // Create v2 dir if migrating from v1
  if (sourceDir === v1Dir) {
    await ensureDir(v2Dir);
  }

  const targetDir = sourceDir === v1Dir ? v2Dir : sourceDir;

  // Execute renames
  log.info('Executing migration...');
  for (const action of renamed) {
    const srcPath = join(sourceDir, action.oldName);
    const destPath = join(targetDir, action.newName);

    if (await fileExists(destPath)) {
      log.warning(`  Target already exists: ${action.newName} — skipping`);
      continue;
    }

    if (sourceDir === targetDir) {
      // Same dir — just rename
      await rename(srcPath, destPath);
    } else {
      // Different dir (v1 → v2) — copy
      await copyFile(srcPath, destPath);
    }
    log.success(`  ✓ ${action.oldName} → ${action.newName}`);
  }

  // Copy non-renamed files to v2 dir if migrating from v1
  if (sourceDir === v1Dir) {
    for (const action of [...skipped, ...manual]) {
      const srcPath = join(sourceDir, action.oldName);
      const destPath = join(targetDir, action.oldName);
      if (!(await fileExists(destPath))) {
        await copyFile(srcPath, destPath);
      }
    }
  }

  console.log('');

  // Generate migration log
  const migrationLog = generateMigrationLog(projectName, actions, backupDir, today);
  const logPath = join(targetDir, 'MIGRATION_LOG.md');
  await writeFile(logPath, migrationLog, 'utf-8');
  log.success('Generated: MIGRATION_LOG.md');
  console.log('');

  // Summary
  log.success('Migration complete!');
  console.log(`
  Renamed: ${renamed.length} files
  Skipped: ${skipped.length} files
  Manual:  ${manual.length} files
  Backup:  ${backupDir}
`);

  log.info('Next steps:');
  console.log(`
  1. Review: ls ${projectName}/${CANONICAL_DOCS_PATH}/
  2. Handle manual items in MIGRATION_LOG.md
  3. Validate: npx tsx src/validate-naming.mts ${projectName}
  4. Commit:
     cd ${projectName}
     git add ${CANONICAL_DOCS_PATH}/
     git commit -m "docs: migrate handoff docs to FSD v2 naming"
`);
}

main().catch((err: Error) => {
  log.error(`Migration failed: ${err.message}`);
  process.exit(1);
});
