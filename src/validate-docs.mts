#!/usr/bin/env node --no-warnings
/**
 * validate-docs.mts — Validate Handoff Documentation Quality & Structure
 *
 * Checks numeric-named docs for content quality, structure, token budgets,
 * and quality gate integration. Uses documentation-standards 7-point scoring.
 *
 * Usage: npx tsx src/validate-docs.mts <project-name> [--session <slug>]
 * Example: npx tsx src/validate-docs.mts damieus-com-migration --session 20x-e2e-integration
 */

import { readFile, readdir } from 'fs/promises';
import { join, basename } from 'path';

import { VERSION } from './version.js';
import {
  NUMERIC_FILENAME_REGEX,
  REQUIRED_TEMPLATES,
  getCategoryForSequence,
  type ValidationIssue,
  type ValidationResult,
  type Severity,
} from './types.js';
import {
  log,
  fileExists,
  estimateTokens,
  getFrameworkRoot,
  resolveProjectDir,
  getHandoffDocsPath,
  parseSessionArg,
  findHandoffFolders,
} from './utils.js';

// ─── Scoring Weights (documentation-standards 7-point system) ────

const WEIGHTS = {
  structure: 0.15,
  content: 0.30,
  formatting: 0.10,
  links: 0.10,
  examples: 0.15,
  accessibility: 0.10,
  metadata: 0.10,
} as const;

// ─── Content Validators ──────────────────────────────────────────

async function searchInFile(
  filePath: string,
  pattern: string | RegExp,
): Promise<boolean> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return typeof pattern === 'string'
      ? content.includes(pattern)
      : pattern.test(content);
  } catch {
    return false;
  }
}

async function countMatches(
  filePath: string,
  pattern: RegExp,
): Promise<number> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return (content.match(pattern) || []).length;
  } catch {
    return 0;
  }
}

// ─── Per-Doc Validators ──────────────────────────────────────────

type IssueCollector = (
  severity: Severity,
  message: string,
  file?: string,
  rule?: string,
) => void;

async function validateMasterIndex(
  filePath: string,
  addIssue: IssueCollector,
): Promise<void> {
  const file = basename(filePath);

  if (!(await searchInFile(filePath, /Quick Start/i))) {
    addIssue('error', 'Missing "Quick Start" section', file, 'structure');
  }

  if (!(await searchInFile(filePath, /Document Index|Navigation/i))) {
    addIssue('error', 'Missing "Document Index" section', file, 'structure');
  }

  if (!(await searchInFile(filePath, /Token/i))) {
    addIssue('warning', 'Missing token estimates', file, 'content');
  }

  const todoCount = await countMatches(filePath, /\[TODO/g);
  if (todoCount > 0) {
    addIssue('warning', `${todoCount} [TODO] placeholders remain`, file, 'content');
  }
}

async function validateProjectState(
  filePath: string,
  addIssue: IssueCollector,
): Promise<void> {
  const file = basename(filePath);

  if (!(await searchInFile(filePath, /Quality Gates/i))) {
    addIssue('error', 'Missing "Quality Gates" section', file, 'structure');
  }

  if (!(await searchInFile(filePath, /Deployment Blockers/i))) {
    addIssue('warning', 'Missing "Deployment Blockers" section', file, 'content');
  }

  if (!(await searchInFile(filePath, /Auto-generated|Last updated/i))) {
    addIssue('suggestion', 'Missing timestamp (run generate-state.mts)', file, 'metadata');
  }
}

async function validateCriticalContext(
  filePath: string,
  addIssue: IssueCollector,
): Promise<void> {
  const file = basename(filePath);

  if (!(await searchInFile(filePath, /Known Issues|Gotchas|Critical/i))) {
    addIssue('warning', 'Missing gotchas/known issues section', file, 'content');
  }

  if (!(await searchInFile(filePath, /Decision|ADR/i))) {
    addIssue('suggestion', 'Missing architectural decision records', file, 'content');
  }
}

// ─── Main Validator ──────────────────────────────────────────────

async function validateProject(
  projectDir: string,
  projectName: string,
  sessionSlug?: string,
): Promise<ValidationResult> {
  const handoffDir = getHandoffDocsPath(projectDir, sessionSlug);
  const issues: ValidationIssue[] = [];
  const folderLabel = sessionSlug
    ? `docs/handoff-${sessionSlug}/`
    : 'docs/handoff/';

  const addIssue: IssueCollector = (severity, message, file, rule) => {
    issues.push({ severity, message, file, rule });
  };

  // 1. Check docs/handoff[-slug]/ exists
  if (!(await fileExists(handoffDir))) {
    addIssue('error', `${folderLabel} directory not found. Run init-project.mts first.`);
    return buildResult(issues);
  }

  // 2. List all .md files
  const allFiles = await readdir(handoffDir);
  const mdFiles = allFiles.filter((f) => f.endsWith('.md'));

  if (mdFiles.length === 0) {
    addIssue('error', `No markdown files in ${folderLabel}`);
    return buildResult(issues);
  }

  // 3. Check required documents exist (by filename prefix)
  for (const req of REQUIRED_TEMPLATES) {
    const found = mdFiles.some((f) => f.startsWith(req.filename));
    if (!found) {
      addIssue(
        'error',
        `Missing required document: ${req.filename}*.md (${req.description})`,
        undefined,
        'required',
      );
    }
  }

  // 4. Validate each file
  for (const file of mdFiles) {
    const filePath = join(handoffDir, file);

    // Validate naming format — numeric {NN}-{SLUG}_{DATE}.md
    if (!NUMERIC_FILENAME_REGEX.test(file)) {
      addIssue(
        'warning',
        `Non-standard filename: ${file} — should match {NN}-{SLUG}_{DATE}.md`,
        file,
        'naming',
      );
    }

    // Content validation based on sequence number
    if (file.startsWith('00-MASTER_INDEX')) {
      await validateMasterIndex(filePath, addIssue);
    } else if (file.startsWith('01-PROJECT_STATE')) {
      await validateProjectState(filePath, addIssue);
    } else if (file.startsWith('02-CRITICAL_CONTEXT')) {
      await validateCriticalContext(filePath, addIssue);
    }

    // Token budget check
    const tokens = await estimateTokens(filePath);
    if (tokens > 10000) {
      addIssue('warning', `${file}: ~${tokens} tokens (very large, consider splitting)`, file, 'tokens');
    } else if (tokens < 50) {
      addIssue('warning', `${file}: ~${tokens} tokens (suspiciously small — still a template?)`, file, 'content');
    }
  }

  // 5. Total token budget
  let totalTokens = 0;
  for (const file of mdFiles) {
    totalTokens += await estimateTokens(join(handoffDir, file));
  }

  if (totalTokens > 50000) {
    addIssue('error', `Total tokens (~${totalTokens}) exceed 50K — refactor or use subagent workflows`);
  } else if (totalTokens > 25000) {
    addIssue('warning', `Total tokens (~${totalTokens}) > 25K — consider subagent workflows for some sections`);
  }

  // 6. Check .handoff.config.json
  const configPath = join(projectDir, '.handoff.config.json');
  if (await fileExists(configPath)) {
    try {
      const configContent = await readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);

      if (!config.qualityGates) {
        addIssue('error', 'Missing qualityGates in .handoff.config.json', undefined, 'config');
      }
      if (config.framework?.namingVersion !== 'v2.1') {
        addIssue('warning', 'Config namingVersion not set to "v2.1"', undefined, 'config');
      }
    } catch {
      addIssue('error', '.handoff.config.json is invalid JSON', undefined, 'config');
    }
  } else {
    addIssue('error', 'Missing .handoff.config.json', undefined, 'config');
  }

  return buildResult(issues);
}

function buildResult(issues: ValidationIssue[]): ValidationResult {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  const suggestions = issues.filter((i) => i.severity === 'suggestion').length;

  let score = 100;
  score -= errors * 15;
  score -= warnings * 5;
  score -= suggestions * 1;
  score = Math.max(0, Math.min(100, score));

  return {
    passed: errors === 0,
    errors,
    warnings,
    suggestions,
    issues,
    score,
  };
}

// ─── CLI Output ──────────────────────────────────────────────────

function printResult(result: ValidationResult, projectName: string, sessionSlug?: string): void {
  log.header('HANDOFF DOCUMENTATION VALIDATION');
  console.log('');
  log.info(`Project: ${projectName}`);
  if (sessionSlug) log.info(`Session: ${sessionSlug}`);
  log.info(`Framework: v${VERSION}`);
  console.log('');

  const errors = result.issues.filter((i) => i.severity === 'error');
  const warnings = result.issues.filter((i) => i.severity === 'warning');
  const suggestions = result.issues.filter((i) => i.severity === 'suggestion');

  if (errors.length > 0) {
    log.error(`ERRORS (${errors.length}):`);
    for (const e of errors) {
      console.log(`  ❌ ${e.file ? `[${e.file}] ` : ''}${e.message}`);
    }
    console.log('');
  }

  if (warnings.length > 0) {
    log.warning(`WARNINGS (${warnings.length}):`);
    for (const w of warnings) {
      console.log(`  ⚠️  ${w.file ? `[${w.file}] ` : ''}${w.message}`);
    }
    console.log('');
  }

  if (suggestions.length > 0) {
    log.info(`SUGGESTIONS (${suggestions.length}):`);
    for (const s of suggestions) {
      console.log(`  💡 ${s.file ? `[${s.file}] ` : ''}${s.message}`);
    }
    console.log('');
  }

  const scoreLabel =
    result.score >= 80
      ? '⭐⭐⭐ Excellent'
      : result.score >= 65
        ? '⭐⭐ Good'
        : result.score >= 50
          ? '⭐ Fair'
          : '❌ Poor';

  log.header('SUMMARY');
  console.log('');
  console.log(`  Score:       ${result.score}/100 (${scoreLabel})`);
  console.log(`  Errors:      ${result.errors}`);
  console.log(`  Warnings:    ${result.warnings}`);
  console.log(`  Suggestions: ${result.suggestions}`);
  console.log(`  Passed:      ${result.passed ? '✅ YES' : '❌ NO'}`);
  console.log('');

  if (result.score < 80) {
    log.warning('Score below 80% — fix errors and warnings to meet quality threshold');
  }
}

// ─── Main ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const { sessionSlug, remainingArgs } = parseSessionArg(rawArgs);
  const projectName = remainingArgs[0];

  if (!projectName) {
    log.error('Project name required');
    console.log('');
    console.log('Usage: npx tsx src/validate-docs.mts <project-name> [--session <slug>]');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx src/validate-docs.mts damieus-com-migration --session 20x-e2e-integration');
    console.log('  npx tsx src/validate-docs.mts damieus-com-migration   # validates docs/handoff/');
    console.log('');
    console.log('Without --session, validates docs/handoff/');
    console.log('With --session <slug>, validates docs/handoff-<slug>/');
    process.exit(1);
  }

  const frameworkDir = getFrameworkRoot(import.meta.url);
  const projectDir = resolveProjectDir(frameworkDir, projectName);

  if (!(await fileExists(projectDir))) {
    log.error(`Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  // If no session specified, show available session folders
  if (!sessionSlug) {
    const folders = await findHandoffFolders(projectDir);
    if (folders.length > 1) {
      log.info('Multiple handoff sessions found:');
      for (const f of folders) {
        console.log(`  - ${f.name}${f.sessionSlug ? ` (--session ${f.sessionSlug})` : ''}`);
      }
      console.log('');
      log.info('Tip: Use --session <slug> to validate a specific session');
      console.log('');
    }
  }

  const result = await validateProject(projectDir, projectName, sessionSlug);
  printResult(result, projectName, sessionSlug);

  process.exit(result.passed ? 0 : 1);
}

main().catch((err: Error) => {
  log.error(`Validation failed: ${err.message}`);
  process.exit(1);
});

export { validateProject };
