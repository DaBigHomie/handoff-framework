#!/usr/bin/env node --no-warnings
/**
 * init-project.mts — Initialize Handoff Framework in a Project
 * 
 * Purpose: One-command setup to create .handoff/ structure with templates
 * Usage: npx tsx .handoff-framework/scripts/init-project.mts <project-name>
 * Example: npx tsx .handoff-framework/scripts/init-project.mts damieus-com-migration
 */

import { access, copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for output (ANSI escape codes)
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

// Configuration
interface ProjectConfig {
  projectName: string;
  version: string;
  framework: {
    version: string;
    docsPath: string;
    masterIndexPath: string;
  };
  qualityGates: Record<string, {
    enabled: boolean;
    command: string;
    required: boolean;
    artifact?: string;
  }>;
  deployment: {
    requiredGates: string[];
    recommendedGates: string[];
  };
  tokenEstimates: {
    masterIndex: number;
    projectState: number;
    criticalContext: number;
    total: number;
  };
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function detectTechStack(projectDir: string): Promise<string[]> {
  const stack: string[] = [];
  
  try {
    const packageJsonPath = join(projectDir, 'package.json');
    if (await fileExists(packageJsonPath)) {
      const content = await readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (allDeps.react) stack.push('React');
      if (allDeps.typescript) stack.push('TypeScript');
      if (allDeps.vite) stack.push('Vite');
      if (allDeps.next) stack.push('Next.js');
      if (allDeps['@supabase/supabase-js']) stack.push('Supabase');
      if (allDeps.tailwindcss) stack.push('Tailwind CSS');
      if (allDeps.stripe) stack.push('Stripe');
    }
  } catch (err) {
    log.warning('Could not detect tech stack from package.json');
  }
  
  return stack.length > 0 ? stack : ['Not detected'];
}

async function getProjectVersion(projectDir: string): Promise<string> {
  try {
    const packageJsonPath = join(projectDir, 'package.json');
    if (await fileExists(packageJsonPath)) {
      const content = await readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);
      return pkg.version || '1.0.0';
    }
  } catch {
    // Ignore error
  }
  return '1.0.0';
}

async function main() {
  const projectName = process.argv[2];

  if (!projectName) {
    log.error('Project name required');
    console.log('');
    console.log('Usage: npx tsx .handoff-framework/scripts/init-project.mts <project-name>');
    console.log('');
    console.log('Example:');
    console.log('  npx tsx .handoff-framework/scripts/init-project.mts damieus-com-migration');
    process.exit(1);
  }

  const frameworkDir = join(__dirname, '..');
  const projectDir = join(frameworkDir, '..', projectName);
  const handoffDocsDir = join(projectDir, 'docs', '.handoff');

  log.info(`Initializing handoff framework for: ${projectName}`);
  console.log('');

  // Step 1: Verify project exists
  if (!(await fileExists(projectDir))) {
    log.error(`Project directory not found: ${projectDir}`);
    console.log('');
    log.info('Available projects in workspace:');
    try {
      const { stdout } = await execAsync('ls -1', { cwd: join(frameworkDir, '..') });
      console.log(stdout);
    } catch {
      // Ignore error
    }
    process.exit(1);
  }

  log.success(`Found project directory: ${projectDir}`);

  // Step 2: Create .handoff/ directory
  if (await fileExists(handoffDocsDir)) {
    log.warning('docs/.handoff/ already exists');
    log.info('Will skip existing files, only copy new templates');
  } else {
    log.info('Creating docs/.handoff/ directory...');
    await mkdir(handoffDocsDir, { recursive: true });
    log.success('Created docs/.handoff/');
  }

  console.log('');

  // Step 3: Copy templates
  log.info('Copying framework templates...');

  const templatesDir = join(frameworkDir, 'templates');
  const templates = [
    '00-MASTER-INDEX-TEMPLATE.md',
    '01-PROJECT-STATE-TEMPLATE.md',
    '02-CRITICAL-CONTEXT-TEMPLATE.md',
    'ARCHITECTURE-TEMPLATE.md',
    'FEATURE-STATUS-TEMPLATE.md',
    // Add more as they're created
  ];

  let copiedCount = 0;
  let skippedCount = 0;

  for (const template of templates) {
    const sourcePath = join(templatesDir, template);
    
    if (!(await fileExists(sourcePath))) {
      continue; // Template doesn't exist yet
    }

    // Remove "-TEMPLATE" from filename
    const outputFilename = template.replace('-TEMPLATE', '');
    const outputPath = join(handoffDocsDir, outputFilename);

    if (await fileExists(outputPath)) {
      log.warning(`  File exists: ${outputFilename} (skipping)`);
      skippedCount++;
    } else {
      await copyFile(sourcePath, outputPath);
      log.success(`  Copied: ${outputFilename}`);
      copiedCount++;
    }
  }

  log.success(`Copied ${copiedCount} templates, skipped ${skippedCount} existing`);
  console.log('');

  // Step 4: Create .handoff.config.json
  const configPath = join(projectDir, '.handoff.config.json');

  if (await fileExists(configPath)) {
    log.warning('.handoff.config.json already exists — Not overwriting');
  } else {
    log.info('Creating .handoff.config.json...');

    const version = await getProjectVersion(projectDir);
    const techStack = await detectTechStack(projectDir);

    const config: ProjectConfig = {
      projectName,
      version,
      framework: {
        version: '1.0.0',
        docsPath: 'docs/.handoff',
        masterIndexPath: 'docs/.handoff/00-MASTER-INDEX.md',
      },
      qualityGates: {
        typescript: {
          enabled: true,
          command: 'npx tsc --noEmit',
          required: true,
        },
        eslint: {
          enabled: true,
          command: 'npm run lint',
          required: true,
        },
        build: {
          enabled: true,
          command: 'npm run build',
          required: true,
        },
        routeDiscovery: {
          enabled: true,
          command: 'npm run discover:routes',
          artifact: 'e2e/fixtures/route-manifest.json',
          required: false,
        },
        routeHealth: {
          enabled: true,
          command: 'npm run test:health',
          required: false,
        },
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
        devtools: {
          enabled: techStack.includes('React'),
          command: 'npm run test:devtools',
          required: true,
        },
      },
      deployment: {
        requiredGates: ['typescript', 'eslint', 'build'],
        recommendedGates: ['routeHealth', 'ctaGaps', 'accessibility', 'performance'],
      },
      tokenEstimates: {
        masterIndex: 2000,
        projectState: 2000,
        criticalContext: 1500,
        total: 5500,
      },
    };

    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    log.success('Created .handoff.config.json');
  }

  console.log('');

  // Step 5: Create initial 00-MASTER-INDEX.md with project info
  const masterIndexPath = join(handoffDocsDir, '00-MASTER-INDEX.md');

  if (!(await fileExists(masterIndexPath))) {
    log.info('Creating initial 00-MASTER-INDEX.md...');

    const version = await getProjectVersion(projectDir);
    const techStack = await detectTechStack(projectDir);
    const today = new Date().toISOString().split('T')[0];

    const initialContent = `# Master Index — ${projectName}

**Project**: ${projectName}
**Version**: ${version}
**Framework Version**: 1.0.0
**Last Updated**: ${today}

---

## Overview

[TODO: Brief project description — 1-2 sentences about what this project does]

**Tech Stack**: ${techStack.join(', ')}

**Status**: [TODO: Development / Staging / Production]

---

## Quick Start

**For new agent joining this project**:

1. Read this file (00-MASTER-INDEX.md) — Navigation hub
2. Read 01-PROJECT-STATE.md — Current state, quality gates
3. Read 02-CRITICAL-CONTEXT.md — Gotchas, known issues
4. [TODO: Add project-specific quick start steps]

**Estimated read time**: [TODO: X minutes]

---

## Document Index

| Document | Purpose | Tokens | Priority |
|----------|---------|--------|----------|
| [00-MASTER-INDEX.md](00-MASTER-INDEX.md) | Navigation hub | ~2,000 | 🔴 MUST READ |
| [01-PROJECT-STATE.md](01-PROJECT-STATE.md) | Current state, quality gates | ~2,000 | 🔴 MUST READ |
| [02-CRITICAL-CONTEXT.md](02-CRITICAL-CONTEXT.md) | Gotchas, critical decisions | ~1,500 | 🔴 MUST READ |
| [TODO: Add more docs as created] | | | |

**Total**: ~5,500 tokens

---

## Quality Gates

**Required gates** (must pass before deployment):

1. ✅ **TypeScript**: \`npx tsc --noEmit\` → 0 errors
2. ✅ **ESLint**: \`npm run lint\` → 0 errors
3. ✅ **Build**: \`npm run build\` → Success

**Status**: [TODO: Update after running gates]

**Last checked**: [TODO: Date/time]

---

## Key Information

[TODO: Add critical project-specific information here]

**Important constraints**:
- [TODO: Add constraints]

**Common gotchas**:
- [TODO: Add gotchas]

---

## Next Steps

[TODO: What should an agent work on next?]

---

**Framework Version**: 1.0.0
**Auto-generated**: ${today}
`;

    await writeFile(masterIndexPath, initialContent, 'utf-8');
    log.success('Created initial 00-MASTER-INDEX.md with project info');
  }

  console.log('');

  // Step 6: Print next steps
  log.success('Framework initialization complete! 🎉');
  console.log('');
  log.info('Next steps:');
  console.log('');
  console.log('1. Fill in TODO placeholders in handoff docs:');
  console.log(`   cd ${projectName}/docs/.handoff`);
  console.log('   # Edit 00-MASTER-INDEX.md, 02-CRITICAL-CONTEXT.md');
  console.log('');
  console.log('2. Generate current project state:');
  console.log(`   npx tsx .handoff-framework/scripts/generate-state.mts ${projectName}`);
  console.log('');
  console.log('3. Configure quality gates in .handoff.config.json:');
  console.log(`   cat ${projectName}/.handoff.config.json`);
  console.log('');
  console.log('4. Run quality gates to verify setup:');
  console.log(`   cd ${projectName}`);
  console.log('   npx tsc --noEmit && npm run lint && npm run build');
  console.log('');
  console.log('5. Validate documentation compliance:');
  console.log(`   npx tsx .handoff-framework/scripts/validate-docs.mts ${projectName}`);
  console.log('');
  console.log('6. Commit the handoff framework setup:');
  console.log(`   cd ${projectName}`);
  console.log('   git add docs/.handoff/ .handoff.config.json');
  console.log('   git commit -m "docs: initialize handoff framework v1.0.0"');
  console.log('');
  log.success('Done! Framework ready to use.');
}

main().catch((err) => {
  log.error(`Initialization failed: ${err.message}`);
  process.exit(1);
});
