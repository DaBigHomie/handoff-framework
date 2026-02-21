#!/usr/bin/env node --no-warnings
/**
 * migrate-existing.mts — Migrate existing project docs to numeric v2.1 naming
 *
 * Supports three migration paths:
 *   v1 (bare names in docs/.handoff/)     to v2.1 numeric (docs/handoff[-slug]/)
 *   v2 (FSD prefix in docs/handoff/)      to v2.1 numeric (docs/handoff[-slug]/)
 *   bare (docs/handoff-* unstructured)    to v2.1 numeric (same folder)
 *
 * Usage: npx tsx src/migrate-existing.mts [project-name] [--session slug]
 * Example: npx tsx src/migrate-existing.mts damieus-com-migration --session 20x-e2e
 */

import { copyFile, mkdir, readdir, readFile, rename, writeFile } from 'fs/promises';
import { join, basename } from 'path';

import { VERSION } from './version.js';
import {
  FSD_FILENAME_REGEX,
  NUMERIC_FILENAME_REGEX,
  getCategoryForSequence,
  DOC_CATEGORY_NAMES,
  REQUIRED_TEMPLATES,
  RECOMMENDED_TEMPLATES,
  todayISO,
  type DocCategory,
} from './types.js';
import {
  log,
  fileExists,
  ensureDir,
  resolveProjectDir,
  getHandoffDocsPath,
  getFrameworkRoot,
  parseSessionArg,
  findHandoffFolders,
} from './utils.js';

// ─── Migration Rules ─────────────────────────────────────────────

interface MigrationRule {
  /** Pattern to match the old filename */
  pattern: RegExp;
  /** Target sequence number (00-14) */
  sequence: number;
  /** Target slug for renamed file */
  slug: string;
}

/**
 * Rules for converting bare/v1 filenames → v2.1 numeric naming.
 * Also converts v2 FSD-prefixed files by stripping the prefix.
 */
const MIGRATION_RULES: MigrationRule[] = [
  // v2 FSD-prefixed patterns (CO-00-MASTER_INDEX → 00-MASTER_INDEX)
  { pattern: /^CO-00-MASTER[-_]INDEX/i, sequence: 0, slug: 'MASTER_INDEX' },
  { pattern: /^CO-01-PROJECT[-_]STATE/i, sequence: 1, slug: 'PROJECT_STATE' },
  { pattern: /^CO-02-CRITICAL[-_]CONTEXT/i, sequence: 2, slug: 'CRITICAL_CONTEXT' },
  { pattern: /^CO-03-TASK[-_]TRACKER/i, sequence: 3, slug: 'TASK_TRACKER' },
  { pattern: /^OP-02-SESSION[-_]LOG/i, sequence: 4, slug: 'SESSION_LOG' },
  { pattern: /^OP-01-DEPLOYMENT[-_]ROADMAP/i, sequence: 5, slug: 'NEXT_STEPS' },
  { pattern: /^AR-01-SYSTEM[-_]ARCHITECTURE/i, sequence: 6, slug: 'ARCHITECTURE' },
  { pattern: /^AR-02-COMPONENT[-_]MAP/i, sequence: 7, slug: 'COMPONENT_MAP' },
  { pattern: /^RF-02-ROUTE[-_]AUDIT/i, sequence: 8, slug: 'ROUTE_AUDIT' },
  { pattern: /^QA-02-GAP[-_]ANALYSIS/i, sequence: 9, slug: 'GAP_ANALYSIS' },
  { pattern: /^QA-01-TESTID[-_]FRAMEWORK/i, sequence: 10, slug: 'TEST_FRAMEWORK' },
  { pattern: /^OP-03-SCRIPTS[-_]REFERENCE/i, sequence: 11, slug: 'SCRIPTS_REFERENCE' },
  { pattern: /^RF-01-REFERENCE[-_]MAP/i, sequence: 12, slug: 'REFERENCE_MAP' },
  { pattern: /^RF-03-AUDIT[-_]PROMPTS/i, sequence: 13, slug: 'AUDIT_PROMPTS' },
  { pattern: /^RF-04-IMPROVEMENTS/i, sequence: 14, slug: 'IMPROVEMENTS' },

  // v1 bare-name patterns (00-MASTER-INDEX → 00-MASTER_INDEX)
  { pattern: /^00-MASTER[-_](?:HANDOFF[-_])?INDEX/i, sequence: 0, slug: 'MASTER_INDEX' },
  { pattern: /^01-PROJECT[-_]STATE/i, sequence: 1, slug: 'PROJECT_STATE' },
  { pattern: /^02-CRITICAL[-_]CONTEXT/i, sequence: 2, slug: 'CRITICAL_CONTEXT' },
  { pattern: /ARCHITECTURE/i, sequence: 6, slug: 'ARCHITECTURE' },
  { pattern: /FEATURE[-_]STATUS/i, sequence: 9, slug: 'GAP_ANALYSIS' },
  { pattern: /TESTID[-_]FRAMEWORK/i, sequence: 10, slug: 'TEST_FRAMEWORK' },
  { pattern: /GAP[-_]ANALYSIS/i, sequence: 9, slug: 'GAP_ANALYSIS' },
  { pattern: /DEPLOYMENT[-_]ROADMAP/i, sequence: 5, slug: 'NEXT_STEPS' },
  { pattern: /ROUTE[-_]AUDIT/i, sequence: 8, slug: 'ROUTE_AUDIT' },
  { pattern: /REFERENCE[-_]MAP/i, sequence: 12, slug: 'REFERENCE_MAP' },
  { pattern: /QUICK[-_]START/i, sequence: 5, slug: 'NEXT_STEPS' },
  { pattern: /INSTRUCTION[-_]FILES/i, sequence: 12, slug: 'REFERENCE_MAP' },
  { pattern: /COMPONENT[-_]MAP/i, sequence: 7, slug: 'COMPONENT_MAP' },
  { pattern: /SESSION[-_]LOG/i, sequence: 4, slug: 'SESSION_LOG' },
  { pattern: /TASK[-_]TRACKER/i, sequence: 3, slug: 'TASK_TRACKER' },
  { pattern: /NEXT[-_]STEPS/i, sequence: 5, slug: 'NEXT_STEPS' },
  { pattern: /SCRIPTS[-_]REFERENCE/i, sequence: 11, slug: 'SCRIPTS_REFERENCE' },
];

interface MigrationAction {
  oldName: string;
  newName: string;
  rule: MigrationRule | null;
  action: 'rename' | 'skip' | 'manual';
  reason?: string;
}

function computeNewName(filename: string, today: string): MigrationAction {
  // Already v2.1 numeric-named — skip
  if (NUMERIC_FILENAME_REGEX.test(filename)) {
    return {
      oldName: filename,
      newName: filename,
      rule: null,
      action: 'skip',
      reason: 'Already numeric-named (v2.1)',
    };
  }

  // Try migration rules (in order — v2 FSD patterns checked first)
  for (const rule of MIGRATION_RULES) {
    if (rule.pattern.test(filename)) {
      const seq = String(rule.sequence).padStart(2, '0');
      const newName = `${seq}-${rule.slug}_${today}.md`;
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
  const timestamp =
    todayISO().replace(/-/g, '') +
    '-' +
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

// ─── Migration Log (v2.1) ────────────────────────────────────────

function generateMigrationLog(
  projectName: string,
  actions: MigrationAction[],
  backupDir: string,
  today: string,
  sessionSlug?: string,
): string {
  const renamed = actions.filter((a) => a.action === 'rename');
  const skipped = actions.filter((a) => a.action === 'skip');
  const manual = actions.filter((a) => a.action === 'manual');
  const folderLabel = sessionSlug ? `docs/handoff-${sessionSlug}` : 'docs/handoff';

  return `# Migration Log

**Project**: ${projectName}
**Migration Date**: ${today}${sessionSlug ? `\n**Session**: ${sessionSlug}` : ''}
**Framework**: @dabighomie/handoff-framework v${VERSION}
**Naming**: v2.1 (numeric-first)

---

## Summary

- **Renamed**: ${renamed.length} files
- **Skipped**: ${skipped.length} files (already numeric-named)
- **Manual**: ${manual.length} files (need manual review)
- **Backup**: ${backupDir}

---

## Renamed Files

| Old Name | New Name | Sequence | Category |
|----------|----------|----------|----------|
${
  renamed
    .map((a) => {
      const seq = a.rule ? a.rule.sequence : -1;
      const cat = seq >= 0 ? getCategoryForSequence(seq) : 'unknown';
      return `| ${a.oldName} | ${a.newName} | ${String(seq).padStart(2, '0')} | ${DOC_CATEGORY_NAMES[cat as DocCategory] || cat} |`;
    })
    .join('\n') || '| *None* | | | |'
}

## Skipped (Already Numeric)

${skipped.map((a) => `- ${a.oldName}`).join('\n') || '*None*'}

## Manual Review Required

${manual.map((a) => `- **${a.oldName}**: ${a.reason}`).join('\n') || '*None*'}

---

## Numeric Naming Reference (v2.1)

| Range | Category | Description |
|-------|----------|-------------|
| 00-02 | Context  | Project state, critical context, master index |
| 03-05 | Session  | Tasks, log, next steps |
| 06-11 | Findings | Architecture, components, routes, gaps, tests |
| 12-14 | Reference| File maps, prompts, improvements |

**Pattern**: \`{NN}-{SLUG}_{YYYY-MM-DD}.md\`

---

## Checklist

- [ ] Verify renamed files look correct
- [ ] Handle "Manual Review" items above
- [ ] Update any internal cross-references between docs
- [ ] Run: \`npx tsx src/validate-naming.mts ${projectName}${sessionSlug ? ` --session ${sessionSlug}` : ''}\`
- [ ] Run: \`npx tsx src/validate-docs.mts ${projectName}${sessionSlug ? ` --session ${sessionSlug}` : ''}\`
- [ ] Delete backup after verifying: \`${backupDir}\`
- [ ] Commit the migration

---

**Generated by**: migrate-existing.mts v${VERSION}
**Date**: ${today}
`;
}

// ─── Main ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const { sessionSlug, remainingArgs } = parseSessionArg(rawArgs);
  const projectName = remainingArgs[0];

  if (!projectName) {
    log.error('Project name required');
    console.log('');
    console.log('Usage: npx tsx src/migrate-existing.mts <project-name> [--session <slug>]');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx src/migrate-existing.mts damieus-com-migration --session 20x-e2e-integration');
    console.log('  npx tsx src/migrate-existing.mts damieus-com-migration');
    console.log('');
    console.log('Migrates FSD-named or bare-named docs to numeric v2.1 naming.');
    console.log('With --session, output goes to docs/handoff-<slug>/');
    process.exit(1);
  }

  const frameworkDir = getFrameworkRoot(import.meta.url);
  const projectDir = resolveProjectDir(frameworkDir, projectName);
  const today = todayISO();

  log.header(`Migrating handoff docs to numeric v2.1 for: ${projectName}`);
  if (sessionSlug) log.info(`Session: ${sessionSlug}`);
  console.log('');

  // Verify project exists
  if (!(await fileExists(projectDir))) {
    log.error(`Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  // Find existing docs — check v1 (docs/.handoff), v2-FSD (docs/handoff), session (docs/handoff-slug)
  const v1Dir = join(projectDir, 'docs', '.handoff');
  const sessionDir = getHandoffDocsPath(projectDir, sessionSlug);
  const genericDir = getHandoffDocsPath(projectDir); // docs/handoff (no slug)
  let sourceDir: string;
  let targetDir: string;

  if (await fileExists(v1Dir)) {
    sourceDir = v1Dir;
    targetDir = sessionDir; // migrate into session folder
    log.info(`Found v1 docs at: docs/.handoff/ — will migrate to ${sessionSlug ? `docs/handoff-${sessionSlug}/` : 'docs/handoff/'}`);
  } else if (sessionSlug && (await fileExists(sessionDir))) {
    sourceDir = sessionDir;
    targetDir = sessionDir; // rename in place
    log.info(`Found docs at: docs/handoff-${sessionSlug}/`);
  } else if (await fileExists(genericDir)) {
    sourceDir = genericDir;
    targetDir = sessionSlug ? sessionDir : genericDir;
    log.info(`Found docs at: docs/handoff/${sessionSlug ? ` — will migrate to docs/handoff-${sessionSlug}/` : ''}`);
  } else {
    log.error('No handoff docs found. Run init-project.mts first.');
    console.log('');
    const folders = await findHandoffFolders(projectDir);
    if (folders.length > 0) {
      log.info('Available handoff folders:');
      for (const f of folders) {
        console.log(`  - ${f.name}${f.sessionSlug ? ` (--session ${f.sessionSlug})` : ''}`);
      }
    }
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

  // Deduplicate — if multiple old files map to the same new name, keep first
  const seenNames = new Set<string>();
  for (const action of actions) {
    if (action.action === 'rename' && seenNames.has(action.newName)) {
      action.action = 'manual';
      action.reason = `Duplicate target: ${action.newName} already mapped — review manually`;
    } else if (action.action === 'rename') {
      seenNames.add(action.newName);
    }
  }

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
      log.dim(`  SKIP:   ${a.oldName} (already numeric-named)`);
    }
  }
  if (manual.length > 0) {
    for (const a of manual) {
      log.warning(`  MANUAL: ${a.oldName} — ${a.reason}`);
    }
  }

  if (renamed.length === 0) {
    log.success('All files already use numeric naming — nothing to migrate!');
    process.exit(0);
  }

  console.log('');

  // Create backup
  log.info('Creating backup...');
  const backupDir = await createBackup(sourceDir, projectDir);
  log.success(`Backup: ${backupDir}`);
  console.log('');

  // Ensure target dir exists
  if (sourceDir !== targetDir) {
    await ensureDir(targetDir);
  }

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
      await rename(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
    log.success(`  ✓ ${action.oldName} → ${action.newName}`);
  }

  // Copy non-renamed files to target dir if different source
  if (sourceDir !== targetDir) {
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
  const migrationLog = generateMigrationLog(projectName, actions, backupDir, today, sessionSlug);
  const logPath = join(targetDir, 'MIGRATION_LOG.md');
  await writeFile(logPath, migrationLog, 'utf-8');
  log.success('Generated: MIGRATION_LOG.md');
  console.log('');

  // Summary
  const targetLabel = sessionSlug ? `docs/handoff-${sessionSlug}` : 'docs/handoff';
  log.success('Migration complete!');
  console.log(`
  Renamed: ${renamed.length} files
  Skipped: ${skipped.length} files
  Manual:  ${manual.length} files
  Backup:  ${backupDir}
`);

  log.info('Next steps:');
  console.log(`
  1. Review: ls ${projectName}/${targetLabel}/
  2. Handle manual items in MIGRATION_LOG.md
  3. Validate: npx tsx src/validate-naming.mts ${projectName}${sessionSlug ? ` --session ${sessionSlug}` : ''}
  4. Commit:
     cd ${projectName}
     git add ${targetLabel}/
     git commit -m "docs: migrate handoff docs to numeric v2.1 naming"
`);
}

main().catch((err: Error) => {
  log.error(`Migration failed: ${err.message}`);
  process.exit(1);
});
