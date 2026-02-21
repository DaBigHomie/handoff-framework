#!/usr/bin/env node --no-warnings
/**
 * generate-state.mts — Auto-generate CO-01-PROJECT_STATE document
 *
 * Scans project metrics, runs quality gates, outputs FSD-named doc.
 *
 * Usage: npx tsx src/generate-state.mts <project-name>
 * Example: npx tsx src/generate-state.mts damieus-com-migration
 */

import { readdir, writeFile } from 'fs/promises';
import { join } from 'path';

import { VERSION } from './version.js';
import { CANONICAL_DOCS_PATH, todayISO } from './types.js';
import {
  log,
  fileExists,
  countLines,
  detectTechStack,
  getProjectVersion,
  getFrameworkRoot,
  resolveProjectDir,
  getHandoffDocsPath,
  execAsync,
} from './utils.js';

// ─── Metrics Collection ──────────────────────────────────────────

interface ProjectMetrics {
  loc: number;
  components: number;
  pages: number;
  hooks: number;
  tests: number;
  migrations: number;
}

async function countFiles(dir: string, pattern: RegExp): Promise<number> {
  try {
    const files = await readdir(dir, { recursive: true });
    return files.filter((f) => pattern.test(String(f))).length;
  } catch {
    return 0;
  }
}

async function collectMetrics(projectDir: string): Promise<ProjectMetrics> {
  const srcDir = join(projectDir, 'src');
  const appDir = join(projectDir, 'app');

  return {
    loc: await countLines(srcDir),
    components: await countFiles(join(srcDir, 'components'), /\.tsx$/),
    pages:
      (await countFiles(join(srcDir, 'pages'), /\.tsx$/)) ||
      (await countFiles(appDir, /page\.tsx$/)),
    hooks: await countFiles(srcDir, /use[A-Z].*\.(ts|tsx)$/),
    tests: await countFiles(projectDir, /\.(spec|test)\.(ts|tsx)$/),
    migrations: await countFiles(join(projectDir, 'supabase', 'migrations'), /\.sql$/),
  };
}

// ─── Quality Gate Runner ─────────────────────────────────────────

interface GateResult {
  passed: boolean;
  errors: number;
  output: string;
}

async function runGate(
  projectDir: string,
  command: string,
): Promise<GateResult> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: projectDir,
      timeout: 120_000,
    });
    return { passed: true, errors: 0, output: stdout + stderr };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string };
    const output = (e.stdout || '') + (e.stderr || '');
    const errors = (output.match(/error/gi) || []).length;
    return { passed: false, errors, output };
  }
}

async function getRecentCommits(
  projectDir: string,
  count = 5,
): Promise<string[]> {
  try {
    const { stdout } = await execAsync(`git log --oneline -n ${count}`, {
      cwd: projectDir,
    });
    return stdout.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

// ─── Document Generator ──────────────────────────────────────────

function generateDocument(
  projectName: string,
  metrics: ProjectMetrics,
  gates: Record<string, GateResult>,
  commits: string[],
  techStack: string[],
): string {
  const now = new Date().toISOString();
  const allPassing = Object.values(gates).every((g) => g.passed);

  const gateCommandMap: Record<string, string> = {
    typescript: 'npx tsc --noEmit',
    eslint: 'npm run lint',
    build: 'npm run build',
  };

  return `# Project State — ${projectName}

**Project**: ${projectName}
**Tech Stack**: ${techStack.join(', ')}
**Framework**: @dabighomie/handoff-framework v${VERSION}
**Auto-generated**: ${now}
**Status**: ${allPassing ? '✅ All Gates Passing' : '⚠️ Gate Failures'}

---

## Project Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Total LOC** | ${metrics.loc.toLocaleString()} | TypeScript + JavaScript |
| **Components** | ${metrics.components} | .tsx files in src/components |
| **Pages** | ${metrics.pages} | Route pages |
| **Hooks** | ${metrics.hooks} | Custom React hooks |
| **Tests** | ${metrics.tests} | .spec.ts + .test.ts files |
| **Migrations** | ${metrics.migrations} | Supabase SQL migrations |

---

## Quality Gates

**Last checked**: ${now}

| Gate | Command | Status | Errors |
|------|---------|--------|--------|
${Object.entries(gates)
  .map(
    ([name, g]) =>
      `| ${g.passed ? '✅' : '❌'} **${name}** | \`${gateCommandMap[name] || name}\` | ${g.passed ? 'PASS' : 'FAIL'} | ${g.errors} |`,
  )
  .join('\n')}

${allPassing ? '**All required gates passing** ✅' : '**Some gates failing** ❌ — Fix before deployment'}

---

## Deployment Blockers

${
  allPassing
    ? '**NONE** — All quality gates passing, ready to deploy.'
    : `**BLOCKER**: Quality gates failing.

${Object.entries(gates)
  .filter(([, g]) => !g.passed)
  .map(
    ([name, g]) => `- **${name}**: ${g.errors} errors — run \`${gateCommandMap[name] || name}\` and fix`,
  )
  .join('\n')}

**After fixing**: Re-run this script:
\`\`\`bash
npx tsx src/generate-state.mts ${projectName}
\`\`\``
}

---

## Recent Changes

${commits.length > 0 ? commits.map((c, i) => `${i + 1}. ${c}`).join('\n') : '*No git history found*'}

---

## Handoff Notes (for new agent)

${
  allPassing
    ? `This project is in a **good state**. All required quality gates pass.
**Start working** — no blockers.`
    : `This project has **quality gate failures**. Fix the blockers above first.`
}

---

**Framework**: @dabighomie/handoff-framework v${VERSION}
**Auto-generated**: ${now}
`;
}

// ─── Main ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const projectName = process.argv[2];

  if (!projectName) {
    log.error('Project name required');
    console.log('');
    console.log('Usage: npx tsx src/generate-state.mts <project-name>');
    console.log('Example: npx tsx src/generate-state.mts damieus-com-migration');
    process.exit(1);
  }

  const frameworkDir = getFrameworkRoot(import.meta.url);
  const projectDir = resolveProjectDir(frameworkDir, projectName);
  const handoffDir = getHandoffDocsPath(projectDir);
  const today = todayISO();

  log.header(`Generating project state for: ${projectName}`);
  console.log('');

  // Verify project exists
  if (!(await fileExists(projectDir))) {
    log.error(`Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  // Verify docs/handoff/ exists
  if (!(await fileExists(handoffDir))) {
    log.error(`${CANONICAL_DOCS_PATH}/ not initialized. Run init-project.mts first.`);
    process.exit(1);
  }

  log.success(`Found project: ${projectDir}`);
  console.log('');

  // Collect metrics
  log.info('Collecting project metrics...');
  const metrics = await collectMetrics(projectDir);
  log.success(`${metrics.loc} LOC, ${metrics.components} components, ${metrics.pages} pages`);
  console.log('');

  // Run quality gates
  log.info('Running quality gates...');
  const gates: Record<string, GateResult> = {
    typescript: await runGate(projectDir, 'npx tsc --noEmit'),
    eslint: await runGate(projectDir, 'npm run lint'),
    build: await runGate(projectDir, 'npm run build'),
  };

  for (const [name, g] of Object.entries(gates)) {
    if (g.passed) {
      log.success(`  ${name}: PASS`);
    } else {
      log.error(`  ${name}: FAIL (${g.errors} errors)`);
    }
  }
  console.log('');

  // Git history
  log.info('Getting recent commits...');
  const commits = await getRecentCommits(projectDir, 5);
  console.log('');

  // Detect stack
  const techStack = await detectTechStack(projectDir);

  // Generate document
  log.info('Generating CO-01-PROJECT_STATE...');
  const content = generateDocument(projectName, metrics, gates, commits, techStack);

  const outputFilename = `CO-01-PROJECT_STATE_${today}.md`;
  const outputPath = join(handoffDir, outputFilename);
  await writeFile(outputPath, content, 'utf-8');

  console.log('');
  log.success(`Generated: ${CANONICAL_DOCS_PATH}/${outputFilename}`);
  console.log('');

  const allPassing = Object.values(gates).every((g) => g.passed);
  if (allPassing) {
    log.success('All quality gates passing!');
  } else {
    log.warning('Some quality gates failed — see document for details');
  }

  console.log('');
  log.info('Next steps:');
  console.log(`
  1. Review: cat ${projectName}/${CANONICAL_DOCS_PATH}/${outputFilename}
  2. Validate: npx tsx src/validate-naming.mts ${projectName}
  3. Commit:
     cd ${projectName}
     git add ${CANONICAL_DOCS_PATH}/${outputFilename}
     git commit -m "docs: update project state (${today})"
`);
}

main().catch((err: Error) => {
  log.error(`State generation failed: ${err.message}`);
  process.exit(1);
});
