#!/usr/bin/env node --no-warnings
/**
 * generate-state.mts — Auto-Generate Project State Document
 * 
 * Purpose: Scan project metrics and quality gates, generate 01-PROJECT-STATE.md
 * Usage: npx tsx .handoff-framework/scripts/generate-state.mts <project-name>
 * Example: npx tsx .handoff-framework/scripts/generate-state.mts damieus-com-migration
 */

import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { access } from 'fs/promises';

const execAsync = promisify(exec);

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

async function countFiles(dir: string, pattern: RegExp): Promise<number> {
  try {
    let count = 0;
    const files = await readdir(dir, { recursive: true });
    for (const file of files) {
      if (pattern.test(file)) count++;
    }
    return count;
  } catch {
    return 0;
  }
}

async function countLines(dir: string, extensions: string[]): Promise<number> {
  try {
    const patterns = extensions.map(ext => `-name "*.${ext}"`).join(' -o ');
    const { stdout } = await execAsync(
      `find "${dir}" \\( ${patterns} \\) -type f -exec wc -l {} + | tail -1 | awk '{print $1}'`
    );
    return parseInt(stdout.trim()) || 0;
  } catch {
    return 0;
  }
}

async function runQualityGate(projectDir: string, command: string): Promise<{ passed: boolean; errors: number; output: string }> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: projectDir,
      timeout: 120000, // 2 min timeout
    });
    return { passed: true, errors: 0, output: stdout + stderr };
  } catch (err: any) {
    const output = (err.stdout || '') + (err.stderr || '');
    const errorCount = (output.match(/error/gi) || []).length;
    return { passed: false, errors: errorCount, output };
  }
}

async function getRecentCommits(projectDir: string, count: number = 5): Promise<string[]> {
  try {
    const { stdout } = await execAsync(
      `git log --oneline -n ${count}`,
      { cwd: projectDir }
    );
    return stdout.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

async function main() {
  const projectName = process.argv[2];

  if (!projectName) {
    log.error('Project name required');
    console.log('');
    console.log('Usage: npx tsx .handoff-framework/scripts/generate-state.mts <project-name>');
    console.log('');
    console.log('Example:');
    console.log('  npx tsx .handoff-framework/scripts/generate-state.mts damieus-com-migration');
    process.exit(1);
  }

  const frameworkDir = join(__dirname, '..');
  const projectDir = join(frameworkDir, '..', projectName);
  const handoffDocsDir = join(projectDir, 'docs', '.handoff');
  const outputPath = join(handoffDocsDir, '01-PROJECT-STATE.md');

  log.info(`Generating project state for: ${projectName}`);
  console.log('');

  // Verify project exists
  if (!(await fileExists(projectDir))) {
    log.error(`Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  log.success(`Found project directory: ${projectDir}`);

  // Verify .handoff/ exists
  if (!(await fileExists(handoffDocsDir))) {
    log.error(`Handoff docs not initialized: ${handoffDocsDir}`);
    log.info('Run init-project.mts first');
    process.exit(1);
  }

  console.log('');
  log.info('Collecting project metrics...');

  // Collect metrics
  const srcDir = join(projectDir, 'src');
  const metrics = {
    loc: await countLines(srcDir, ['ts', 'tsx', 'js', 'jsx']),
    components: await countFiles(join(srcDir, 'components'), /\.tsx$/),
    pages: await countFiles(join(srcDir, 'pages'), /\.tsx$/) || await countFiles(join(projectDir, 'app'), /page\.tsx$/),
    hooks: await countFiles(srcDir, /use[A-Z].*\.(ts|tsx)$/),
    tests: await countFiles(projectDir, /\.(spec|test)\.(ts|tsx)$/),
  };

  log.success(`Collected metrics: ${metrics.loc} LOC, ${metrics.components} components`);

  console.log('');
  log.info('Running quality gates...');

  const gates = {
    typescript: await runQualityGate(projectDir, 'npx tsc --noEmit'),
    eslint: await runQualityGate(projectDir, 'npm run lint'),
    build: await runQualityGate(projectDir, 'npm run build'),
  };

  log.info(`TypeScript: ${gates.typescript.passed ? 'PASS' : `FAIL (${gates.typescript.errors} errors)`}`);
  log.info(`ESLint: ${gates.eslint.passed ? 'PASS' : `FAIL (${gates.eslint.errors} errors)`}`);
  log.info(`Build: ${gates.build.passed ? 'PASS' : 'FAIL'}`);

  console.log('');
  log.info('Checking quality gate artifacts...');

  const artifacts = {
    routeManifest: await fileExists(join(projectDir, 'e2e/fixtures/route-manifest.json')),
    ctaGaps: await fileExists(join(projectDir, 'reports/cta-gap-analysis.json')),
    accessibility: await fileExists(join(projectDir, 'reports/a11y-audit.json')),
    performance: await fileExists(join(projectDir, 'reports/performance-audit.json')),
  };

  console.log('');
  log.info('Getting recent commits...');

  const recentCommits = await getRecentCommits(projectDir, 5);

  console.log('');
  log.info('Generating document...');

  // Generate document
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  const content = `# Project State — ${projectName}

**Project**: ${projectName}
**Framework Version**: 1.0.0
**Auto-generated**: ${now}
**Status**: ${gates.typescript.passed && gates.eslint.passed && gates.build.passed ? '✅ All Gates Passing' : '⚠️ Gate Failures'}

---

## Overview

This document contains auto-generated project state information:
- Project metrics (LOC, components, pages, hooks, tests)
- Quality gate status (TypeScript, ESLint, build)
- Deployment blockers (if any)
- Recent changes (git history)

**Read time**: ~3 minutes  
**Token count**: ~2,000 tokens

---

## Project Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Total LOC** | ${metrics.loc.toLocaleString()} | TypeScript + JavaScript |
| **Components** | ${metrics.components} | .tsx files in src/components |
| **Pages** | ${metrics.pages} | Route pages |
| **Hooks** | ${metrics.hooks} | Custom React hooks |
| **Tests** | ${metrics.tests} | .spec.ts + .test.ts files |

---

## Quality Gates Status

**Last checked**: ${now}

| Gate | Command | Status | Errors | Notes |
|------|---------|--------|--------|-------|
| ${gates.typescript.passed ? '✅' : '❌'} **TypeScript** | \`npx tsc --noEmit\` | ${gates.typescript.passed ? 'PASS' : 'FAIL'} | ${gates.typescript.errors} | Type checking |
| ${gates.eslint.passed ? '✅' : '❌'} **ESLint** | \`npm run lint\` | ${gates.eslint.passed ? 'PASS' : 'FAIL'} | ${gates.eslint.errors} | Code quality |
| ${gates.build.passed ? '✅' : '❌'} **Build** | \`npm run build\` | ${gates.build.passed ? 'PASS' : 'FAIL'} | — | Production build |

${gates.typescript.passed && gates.eslint.passed && gates.build.passed ? '**All required gates passing** ✅' : '**Some gates failing** ❌ — Fix before deployment'}

---

## Deployment Blockers

${!gates.typescript.passed || !gates.eslint.passed || !gates.build.passed ? `
**BLOCKER**: Quality gates failing

**Fix instructions**:

${!gates.typescript.passed ? `
1. **TypeScript errors** (${gates.typescript.errors} found)
   \`\`\`bash
   npx tsc --noEmit
   # Review errors and fix type issues
   \`\`\`
` : ''}${!gates.eslint.passed ? `
2. **ESLint errors** (${gates.eslint.errors} found)
   \`\`\`bash
   npm run lint
   # Auto-fix: npm run lint -- --fix
   \`\`\`
` : ''}${!gates.build.passed ? `
3. **Build failure**
   \`\`\`bash
   npm run build
   # Review build errors in output
   \`\`\`
` : ''}

**After fixing**: Re-run this script to verify
\`\`\`bash
npx tsx .handoff-framework/scripts/generate-state.mts ${projectName}
\`\`\`
` : '**NONE** — All quality gates passing, ready to deploy'}

---

## Optional Quality Gates

| Gate | Status | Command | Artifact | Notes |
|------|--------|---------|----------|-------|
| ${artifacts.routeManifest ? '✅' : '⏭️'} Route Discovery | ${artifacts.routeManifest ? 'Found' : 'Not run'} | \`npm run discover:routes\` | route-manifest.json | Route health checks |
| ${artifacts.ctaGaps ? '✅' : '⏭️'} CTA Gaps | ${artifacts.ctaGaps ? 'Found' : 'Not run'} | \`npm run audit:cta\` | cta-gap-analysis.json | Conversion optimization |
| ${artifacts.accessibility ? '✅' : '⏭️'} Accessibility | ${artifacts.accessibility ? 'Found' : 'Not run'} | \`npm run audit:a11y\` | a11y-audit.json | WCAG compliance |
| ${artifacts.performance ? '✅' : '⏭️'} Performance | ${artifacts.performance ? 'Found' : 'Not run'} | \`npm run audit:performance\` | performance-audit.json | Lighthouse scores |

**Note**: These gates are recommended but not required for deployment

---

## Recent Changes

**Last 5 commits**:

${recentCommits.map((commit, i) => `${i + 1}. ${commit}`).join('\n')}

${recentCommits.length === 0 ? '*No git history found*' : ''}

---

## Handoff Notes

**For new agent**:

${gates.typescript.passed && gates.eslint.passed && gates.build.passed ? `
This project is in a **good state**. All required quality gates pass.

**Start working** — No blockers
` : `
This project has **quality gate failures**. Review "Deployment Blockers" section above.

**Fix gates first** before making changes
`}

**Quality gate artifacts**: ${[artifacts.routeManifest, artifacts.ctaGaps, artifacts.accessibility, artifacts.performance].filter(Boolean).length}/4 available

---

**Framework Version**: 1.0.0  
**Auto-generated**: ${now}  
**Token Count**: ~2,000 tokens
`;

  await writeFile(outputPath, content, 'utf-8');

  console.log('');
  log.success(`Generated: ${outputPath}`);
  console.log('');
  
  if (!gates.typescript.passed || !gates.eslint.passed || !gates.build.passed) {
    log.warning('Some quality gates failed — Review output above');
    log.info('Fix errors and re-generate to update status');
  } else {
    log.success('All quality gates passing! 🎉');
  }
  
  console.log('');
  log.info('Next steps:');
  console.log('');
  console.log('1. Review generated state:');
  console.log(`   cat ${projectName}/docs/.handoff/01-PROJECT-STATE.md`);
  console.log('');
  console.log('2. Validate documentation:');
  console.log(`   npx tsx .handoff-framework/scripts/validate-docs.mts ${projectName}`);
  console.log('');
  console.log('3. Commit state snapshot:');
  console.log(`   cd ${projectName}`);
  console.log('   git add docs/.handoff/01-PROJECT-STATE.md');
  console.log(`   git commit -m "docs: update project state (${today})"`);
}

main().catch((err) => {
  log.error(`State generation failed: ${err.message}`);
  process.exit(1);
});
