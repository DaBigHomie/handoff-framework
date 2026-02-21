#!/usr/bin/env node --no-warnings
/**
 * validate-naming.mts — Validate numeric naming convention in handoff docs
 *
 * Usage: npx tsx src/validate-naming.mts <project-name> [--session <slug>]
 * Example: npx tsx src/validate-naming.mts damieus-com-migration --session 20x-e2e-integration
 *
 * Validates:
 *   - Filenames match numeric regex: {NN}-{SLUG}_{YYYY-MM-DD}.md
 *   - Dates are valid ISO 8601
 *   - No sequence duplicates
 *   - Required docs exist (00-05)
 *   - Handoff folder exists (docs/handoff/ or docs/handoff-{session}/)
 */

import { readdir } from 'fs/promises';

import {
  NUMERIC_FILENAME_REGEX,
  REQUIRED_TEMPLATES,
  buildDocsPath,
  getCategoryForSequence,
  DOC_CATEGORY_NAMES,
  isValidISODate,
  type DocCategory,
  type ValidationIssue,
  type ValidationResult,
} from './types.js';
import {
  log,
  fileExists,
  getFrameworkRoot,
  resolveProjectDir,
  getHandoffDocsPath,
  parseSessionArg,
} from './utils.js';
import { VERSION } from './version.js';

// ─── Filename Parser ─────────────────────────────────────────────
interface ParsedFilename {
  sequence: number;
  category: DocCategory;
  slug: string;
  date: string;
  original: string;
}

function parseFilename(filename: string): ParsedFilename | null {
  const match = filename.match(NUMERIC_FILENAME_REGEX);
  if (!match) return null;
  const sequence = parseInt(match[1], 10);
  return {
    sequence,
    category: getCategoryForSequence(sequence),
    slug: match[2],
    date: match[3],
    original: filename,
  };
}

// ─── Validation Functions ────────────────────────────────────────

function validateFilenames(files: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const parsed = parseFilename(file);
    if (!parsed) {
      issues.push({
        severity: 'error',
        message: `Invalid filename: "${file}" — must match pattern {NN}-{SLUG}_{YYYY-MM-DD}.md`,
        file,
        rule: 'numeric-filename',
      });
      continue;
    }

    // Validate date
    if (!isValidISODate(parsed.date)) {
      issues.push({
        severity: 'error',
        message: `Invalid date "${parsed.date}" in "${file}" — must be valid ISO 8601 (YYYY-MM-DD)`,
        file,
        rule: 'valid-date',
      });
    }

    // Validate slug format (UPPER_SNAKE_CASE)
    if (!/^[A-Z][A-Z0-9_]+$/.test(parsed.slug)) {
      issues.push({
        severity: 'error',
        message: `Invalid slug "${parsed.slug}" in "${file}" — must be UPPER_SNAKE_CASE`,
        file,
        rule: 'slug-format',
      });
    }
  }

  return issues;
}

function validateSequences(files: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const sequences: number[] = [];

  for (const file of files) {
    const parsed = parseFilename(file);
    if (!parsed) continue;
    sequences.push(parsed.sequence);
  }

  const sorted = [...sequences].sort((a, b) => a - b);

  // Check for duplicates
  const seen = new Set<number>();
  for (const seq of sorted) {
    if (seen.has(seq)) {
      issues.push({
        severity: 'error',
        message: `Duplicate sequence ${String(seq).padStart(2, '0')} — each number must be unique`,
        rule: 'no-duplicate-seq',
      });
    }
    seen.add(seq);
  }

  // Check for gaps in required range (00-05) — warning only
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] <= 5 && sorted[i + 1] <= 5 && sorted[i + 1] - sorted[i] > 1) {
      const gap = sorted[i] + 1;
      issues.push({
        severity: 'warning',
        message: `Sequence gap in required docs: missing ${String(gap).padStart(2, '0')} between ${String(sorted[i]).padStart(2, '0')} and ${String(sorted[i + 1]).padStart(2, '0')}`,
        rule: 'no-seq-gaps',
      });
    }
  }

  return issues;
}

function validateRequiredDocs(files: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const parsedFiles = files.map(parseFilename).filter(Boolean) as ParsedFilename[];

  for (const req of REQUIRED_TEMPLATES) {
    const found = parsedFiles.some((f) => f.sequence === req.sequence);
    if (!found) {
      issues.push({
        severity: 'error',
        message: `Missing required doc: ${req.filename}_{date}.md — ${req.description}`,
        rule: 'required-doc',
      });
    }
  }

  return issues;
}

// ─── Main Validation ─────────────────────────────────────────────

export async function validateNaming(
  projectDir: string,
  sessionSlug?: string,
): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];
  const handoffDir = getHandoffDocsPath(projectDir, sessionSlug);
  const docsPath = buildDocsPath(sessionSlug);

  // Check handoff folder exists
  if (!(await fileExists(handoffDir))) {
    issues.push({
      severity: 'error',
      message: `Handoff docs directory not found: ${docsPath}/ — run init to create it`,
      rule: 'canonical-path',
    });
    return buildResult(issues);
  }

  // Get all files
  const allFiles = await readdir(handoffDir);
  const mdFiles = allFiles.filter((f) => f.endsWith('.md'));

  if (mdFiles.length === 0) {
    issues.push({
      severity: 'error',
      message: `No markdown files found in ${docsPath}/`,
      rule: 'has-docs',
    });
    return buildResult(issues);
  }

  // Run validations
  issues.push(...validateFilenames(mdFiles));
  issues.push(...validateSequences(mdFiles));
  issues.push(...validateRequiredDocs(mdFiles));

  return buildResult(issues);
}

function buildResult(issues: ValidationIssue[]): ValidationResult {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  const suggestions = issues.filter((i) => i.severity === 'suggestion').length;

  // Score: start at 100, deduct 15 per error, 5 per warning, 1 per suggestion
  const score = Math.max(0, 100 - errors * 15 - warnings * 5 - suggestions * 1);

  return {
    passed: errors === 0,
    errors,
    warnings,
    suggestions,
    issues,
    score,
  };
}

// ─── CLI Entry Point ─────────────────────────────────────────────

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const { sessionSlug, remainingArgs } = parseSessionArg(rawArgs);
  const projectName = remainingArgs[0];

  if (!projectName) {
    log.error('Usage: npx tsx src/validate-naming.mts <project-name> [--session <slug>]');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx src/validate-naming.mts damieus-com-migration --session 20x-e2e-integration');
    console.log('  npx tsx src/validate-naming.mts one4three-co-next-app');
    process.exit(1);
  }

  const frameworkRoot = getFrameworkRoot(import.meta.url);
  const projectDir = resolveProjectDir(frameworkRoot, projectName);
  const docsPath = buildDocsPath(sessionSlug);

  log.header(`Naming Validation — ${projectName}`);
  log.info(`Framework: v${VERSION}`);
  log.info(`Checking: ${docsPath}/`);
  console.log('');

  const result = await validateNaming(projectDir, sessionSlug);

  // Print issues grouped by severity
  if (result.issues.length > 0) {
    const errors = result.issues.filter((i) => i.severity === 'error');
    const warnings = result.issues.filter((i) => i.severity === 'warning');
    const suggestions = result.issues.filter((i) => i.severity === 'suggestion');

    if (errors.length > 0) {
      console.log(`${'\x1b[31m'}Errors (${errors.length}):${'\x1b[0m'}`);
      for (const issue of errors) {
        console.log(`  ❌ [${issue.rule}] ${issue.message}`);
      }
      console.log('');
    }

    if (warnings.length > 0) {
      console.log(`${'\x1b[33m'}Warnings (${warnings.length}):${'\x1b[0m'}`);
      for (const issue of warnings) {
        console.log(`  ⚠️  [${issue.rule}] ${issue.message}`);
      }
      console.log('');
    }

    if (suggestions.length > 0) {
      console.log(`${'\x1b[34m'}Suggestions (${suggestions.length}):${'\x1b[0m'}`);
      for (const issue of suggestions) {
        console.log(`  💡 [${issue.rule}] ${issue.message}`);
      }
      console.log('');
    }
  }

  // Summary
  log.header('Summary');
  log.result(`Errors: ${result.errors}`, result.errors === 0);
  log.result(`Warnings: ${result.warnings}`, result.warnings <= 2);
  log.result(`Score: ${result.score}/100`, result.score >= 80);
  console.log('');

  if (result.passed) {
    log.success(`Naming validation PASSED (score: ${result.score}/100)`);
  } else {
    log.error(`Naming validation FAILED — ${result.errors} error(s) must be fixed`);
    process.exit(1);
  }
}

main().catch((err) => {
  log.error(`Validation failed: ${err.message}`);
  process.exit(1);
});
