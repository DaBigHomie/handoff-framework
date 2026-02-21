#!/usr/bin/env node --no-warnings
/**
 * migrate-existing.mts — Migrate Existing Project to Handoff Framework
 * 
 * Purpose: Migrate a project that already has docs to the new framework structure
 * Usage: npx tsx .handoff-framework/scripts/migrate-existing.mts <project-name>
 * Example: npx tsx .handoff-framework/scripts/migrate-existing.mts damieus-com-migration
 */

import { copyFile, mkdir, readdir, readFile, rename, stat, writeFile } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { access } from 'fs/promises';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
};

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function findExistingDocs(projectDir: string): Promise<string[]> {
  const existingDocs: string[] = [];

  // Check common doc locations
  const docsDir = join(projectDir, 'docs');
  
  if (await isDirectory(join(docsDir, 'handoff'))) {
    existingDocs.push(join(docsDir, 'handoff'));
  }

  if (await isDirectory(join(docsDir, 'agent-prompts'))) {
    existingDocs.push(join(docsDir, 'agent-prompts'));
  }

  // Find individual handoff documents
  if (await isDirectory(docsDir)) {
    const files = await readdir(docsDir);
    for (const file of files) {
      if (file.match(/.*-HANDOFF.*\.md|.*handoff.*\.md|AGENTS\.md/i)) {
        existingDocs.push(join(docsDir, file));
      }
    }
  }

  return existingDocs;
}

interface MigrationMapping {
  oldDoc: string;
  contentToMigrate: string;
  newTemplate: string;
}

function guessMapping(filename: string): MigrationMapping {
  const lower = filename.toLowerCase();

  if (lower.includes('handoff') || lower === 'agents.md') {
    return {
      oldDoc: filename,
      contentToMigrate: 'Agent instructions, quick start',
      newTemplate: '00-MASTER-INDEX.md',
    };
  }

  if (lower.includes('state') || lower.includes('status')) {
    return {
      oldDoc: filename,
      contentToMigrate: 'Current state, metrics',
      newTemplate: '01-PROJECT-STATE.md',
    };
  }

  if (lower.includes('context') || lower.includes('gotchas')) {
    return {
      oldDoc: filename,
      contentToMigrate: 'Critical context, gotchas',
      newTemplate: '02-CRITICAL-CONTEXT.md',
    };
  }

  if (lower.includes('architecture') || lower.includes('design')) {
    return {
      oldDoc: filename,
      contentToMigrate: 'Architecture details',
      newTemplate: 'ARCHITECTURE.md',
    };
  }

  if (lower.includes('feature') || lower.includes('todo')) {
    return {
      oldDoc: filename,
      contentToMigrate: 'Feature status, roadmap',
      newTemplate: 'FEATURE-STATUS.md',
    };
  }

  return {
    oldDoc: filename,
    contentToMigrate: '[Review manually]',
    newTemplate: '[Choose template]',
  };
}

async function main() {
  const projectName = process.argv[2];

  if (!projectName) {
    log.error('Project name required');
    console.log('');
    console.log('Usage: npx tsx .handoff-framework/scripts/migrate-existing.mts <project-name>');
    console.log('');
    console.log('Example:');
    console.log('  npx tsx .handoff-framework/scripts/migrate-existing.mts damieus-com-migration');
    process.exit(1);
  }

  const frameworkDir = join(__dirname, '..');
  const projectDir = join(frameworkDir, '..', projectName);
  const handoffDocsDir = join(projectDir, 'docs', '.handoff');

  log.info(`Migrating existing project: ${projectName}`);
  console.log('');

  // Step 1: Verify project exists
  if (!(await fileExists(projectDir))) {
    log.error(`Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  log.success(`Found project directory: ${projectDir}`);

  // Step 2: Find existing handoff docs
  log.info('Searching for existing handoff documentation...');

  const existingDocs = await findExistingDocs(projectDir);

  for (const doc of existingDocs) {
    if (await isDirectory(doc)) {
      log.success(`Found: ${basename(doc)}/ (directory)`);
    } else {
      log.success(`Found: ${basename(doc)}`);
    }
  }

  if (existingDocs.length === 0) {
    log.warning('No existing handoff docs found');
    log.info('This project may not have handoff documentation yet');

    const rl = readline.createInterface({ input, output });
    const answer = await rl.question('Continue with migration anyway? (y/N): ');
    rl.close();

    if (!answer.match(/^y(es)?$/i)) {
      log.info('Aborted. Use init-project.mts instead for new projects.');
      process.exit(0);
    }
  }

  console.log('');

  // Step 3: Create backup
  log.info('Creating backup of existing docs...');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '-' + 
                    new Date().toTimeString().split(' ')[0].replace(/:/g, '');
  const backupDir = join(projectDir, 'docs', `.handoff-backup-${timestamp}`);
  await mkdir(backupDir, { recursive: true });

  for (const doc of existingDocs) {
    const targetPath = join(backupDir, basename(doc));
    
    if (await isDirectory(doc)) {
      // Copy directory recursively
      const files = await readdir(doc, { recursive: true });
      for (const file of files) {
        const srcPath = join(doc, file);
        const destPath = join(backupDir, basename(doc), file);
        
        if (await isDirectory(srcPath)) {
          await mkdir(destPath, { recursive: true });
        } else {
          await mkdir(dirname(destPath), { recursive: true });
          await copyFile(srcPath, destPath);
        }
      }
      log.success(`  Backed up: ${basename(doc)}/ (directory)`);
    } else {
      await copyFile(doc, targetPath);
      log.success(`  Backed up: ${basename(doc)}`);
    }
  }

  log.success(`Backup created: ${backupDir}`);
  console.log('');

  // Step 4: Create .handoff/ directory
  log.info('Creating docs/.handoff/ directory...');

  if (await fileExists(handoffDocsDir)) {
    log.warning('docs/.handoff/ already exists');
    
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question('Move existing files to backup and recreate? (y/N): ');
    rl.close();

    if (answer.match(/^y(es)?$/i)) {
      await rename(handoffDocsDir, join(backupDir, 'existing-handoff-dir'));
      log.success('  Moved existing .handoff/ to backup');
    } else {
      log.info('Keeping existing .handoff/ directory');
    }
  }

  await mkdir(handoffDocsDir, { recursive: true });
  log.success('Created docs/.handoff/');

  // Step 5: Copy framework templates
  log.info('Copying framework templates...');

  const templatesDir = join(frameworkDir, 'templates');
  const templates = await readdir(templatesDir);
  let copiedCount = 0;

  for (const template of templates) {
    if (!template.endsWith('.md')) continue;

    const sourcePath = join(templatesDir, template);
    const outputFilename = template.replace('-TEMPLATE', '');
    const outputPath = join(handoffDocsDir, outputFilename);

    if (await fileExists(outputPath)) {
      log.warning(`  File exists: ${outputFilename} (keeping existing)`);
    } else {
      await copyFile(sourcePath, outputPath);
      copiedCount++;
      log.success(`  Copied: ${outputFilename}`);
    }
  }

  log.success(`Copied ${copiedCount} new templates`);
  console.log('');

  // Step 6: Create migration mapping
  log.info('Creating migration mapping...');

  const migrationLogPath = join(handoffDocsDir, 'MIGRATION_LOG.md');
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

  const mappings = existingDocs.map(doc => {
    const name = basename(doc);
    return guessMapping(name);
  });

  let migrationLogContent = `# Migration Log

**Project**: ${projectName}
**Migration Date**: ${dateStr} ${timeStr}
**Framework Version**: 1.0.0

---

## Migration Summary

**Existing docs found**: ${existingDocs.length}

**Backup location**: ${backupDir}

**New structure**: docs/.handoff/ (framework templates)

---

## Existing Documentation

`;

  for (const doc of existingDocs) {
    const name = basename(doc);
    const isDir = await isDirectory(doc);
    migrationLogContent += `- [\`${name}${isDir ? '/' : ''}\`](${backupDir}/${name})\n`;
  }

  migrationLogContent += `
---

## Migration Tasks

**Manual steps required**:

1. **Review existing docs** in backup directory:
   \`${backupDir}\`

2. **Map content to new templates**:

   | Old Doc | Content to Migrate | New Template |
   |---------|-------------------|--------------|
`;

  for (const mapping of mappings) {
    migrationLogContent += `   | ${mapping.oldDoc} | ${mapping.contentToMigrate} | ${mapping.newTemplate} |\n`;
  }

  migrationLogContent += `
3. **Copy relevant content**:
   - Open old doc (from backup)
   - Open new template
   - Copy sections that match template structure
   - Fill in [TODO] placeholders

4. **Verify quality gates**:
   - Review .handoff.config.json
   - Customize gates for your project
   - Run gates: \`npx tsc --noEmit && npm run lint && npm run build\`

5. **Generate project state**:
   \`\`\`bash
   npx tsx ../.handoff-framework/scripts/generate-state.mts ${projectName}
   \`\`\`

6. **Review and commit**:
   - Verify all templates filled in
   - Delete MIGRATION_LOG.md (or keep for reference)
   - Commit new .handoff/ structure

---

## New Framework Structure

\`\`\`
docs/.handoff/
├── 00-MASTER-INDEX.md       (Navigation hub, quick start)
├── 01-PROJECT-STATE.md      (Auto-generated metrics, quality gates)
├── 02-CRITICAL-CONTEXT.md   (Gotchas, decisions, must-know info)
├── ARCHITECTURE.md          (Deep dive into system architecture)
├── FEATURE-STATUS.md        (Feature inventory, roadmap)
└── MIGRATION_LOG.md         (This file — delete after migration)
\`\`\`

**Old docs preserved in**:
\`${backupDir}\`

---

## Checklist

- [ ] Review all existing docs in backup
- [ ] Map content to new templates (see table above)
- [ ] Fill in 00-MASTER-INDEX.md
- [ ] Fill in 02-CRITICAL-CONTEXT.md (gotchas)
- [ ] Fill in ARCHITECTURE.md (if applicable)
- [ ] Fill in FEATURE-STATUS.md
- [ ] Run generate-state.mts to create 01-PROJECT-STATE.md
- [ ] Configure quality gates in .handoff.config.json
- [ ] Run quality gates, verify passing
- [ ] Delete or archive MIGRATION_LOG.md
- [ ] Commit new .handoff/ structure
- [ ] Delete backup directory (after verifying migration)

---

**Framework Version**: 1.0.0  
**Migration Script**: migrate-existing.mts
`;

  await writeFile(migrationLogPath, migrationLogContent, 'utf-8');
  log.success('Created: MIGRATION_LOG.md');
  console.log('');

  // Step 7: Create .handoff.config.json (if not exists)
  const configPath = join(projectDir, '.handoff.config.json');

  if (await fileExists(configPath)) {
    log.warning('.handoff.config.json already exists — Skipping');
  } else {
    log.info('Creating .handoff.config.json...');

    const config = {
      projectName,
      version: '1.0.0',
      framework: {
        version: '1.0.0',
        docsPath: 'docs/.handoff',
        masterIndexPath: 'docs/.handoff/00-MASTER-INDEX.md',
      },
      migration: {
        date: dateStr,
        backupPath: backupDir,
        migrated: false,
      },
      qualityGates: {
        typescript: { enabled: true, command: 'npx tsc --noEmit', required: true },
        eslint: { enabled: true, command: 'npm run lint', required: true },
        build: { enabled: true, command: 'npm run build', required: true },
        routeDiscovery: {
          enabled: true,
          command: 'npm run discover:routes',
          artifact: 'e2e/fixtures/route-manifest.json',
          required: false,
        },
        routeHealth: { enabled: true, command: 'npm run test:health', required: false },
        ctaGaps: {
          enabled: true,
          command: 'npm run audit:cta',
          artifact: 'reports/cta-gap-analysis.json',
          required: false,
        },
        accessibility: {
          enabled: true,
          command: 'npm run audit:a11y',
          artifact: 'reports/a11y-audit.json',
          required: false,
        },
        performance: {
          enabled: true,
          command: 'npm run audit:performance',
          artifact: 'reports/performance-audit.json',
          required: false,
        },
        devtools: { enabled: true, command: 'npm run test:devtools', required: true },
      },
      deployment: {
        requiredGates: ['typescript', 'eslint', 'build', 'devtools'],
        recommendedGates: ['routeHealth', 'ctaGaps', 'accessibility', 'performance'],
      },
    };

    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    log.success('Created .handoff.config.json');
  }

  console.log('');

  // Step 8: Print summary
  log.success('Migration preparation complete!');
  console.log('');
  log.info('Summary:');
  console.log(`  Existing docs found: ${existingDocs.length}`);
  console.log(`  Backup location: ${backupDir}`);
  console.log(`  New structure: ${handoffDocsDir}`);
  console.log(`  Migration guide: ${migrationLogPath}`);
  console.log('');

  log.warning('IMPORTANT: Manual migration steps required!');
  console.log('');
  console.log('Next steps:');
  console.log('');
  console.log('1. Review MIGRATION_LOG.md:');
  console.log(`   cat ${join(projectName, 'docs', '.handoff', 'MIGRATION_LOG.md')}`);
  console.log('');
  console.log('2. Open old docs (in backup) and new templates (in docs/.handoff/)');
  console.log('   - Map content from old docs to new templates');
  console.log('   - Fill in [TODO] placeholders');
  console.log('');
  console.log('3. Generate project state:');
  console.log(`   npx tsx .handoff-framework/scripts/generate-state.mts ${projectName}`);
  console.log('');
  console.log('4. Verify quality gates pass:');
  console.log(`   cd ${projectName}`);
  console.log('   npx tsc --noEmit && npm run lint && npm run build');
  console.log('');
  console.log('5. Review all .handoff/ docs, then commit:');
  console.log('   git add docs/.handoff/ .handoff.config.json');
  console.log('   git commit -m "docs: migrate to handoff framework v1.0.0"');
  console.log('');
  console.log('6. AFTER verifying migration is complete:');
  console.log(`   rm -rf ${backupDir}  # Delete backup`);
  console.log('   rm docs/.handoff/MIGRATION_LOG.md  # Delete migration log');
  console.log('');
  log.success('Done! 🎉');
}

main().catch((err) => {
  log.error(`Migration failed: ${err.message}`);
  process.exit(1);
});
