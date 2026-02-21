#!/usr/bin/env node --no-warnings
/**
 * validate-docs.mts — Validate Handoff Documentation Standards
 * 
 * Purpose: Check documentation compliance with framework standards
 * Usage: npx tsx .handoff-framework/scripts/validate-docs.mts <project-name>
 * Example: npx tsx .handoff-framework/scripts/validate-docs.mts damieus-com-migration
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { access } from 'fs/promises';

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

async function estimateTokens(filePath: string): Promise<number> {
  try {
    const content = await readFile(filePath, 'utf-8');
    // Rough estimate: ~4 chars per token
    return Math.floor(content.length / 4);
  } catch {
    return 0;
  }
}

async function searchInFile(filePath: string, pattern: string | RegExp): Promise<boolean> {
  try {
    const content = await readFile(filePath, 'utf-8');
    if (typeof pattern === 'string') {
      return content.includes(pattern);
    }
    return pattern.test(content);
  } catch {
    return false;
  }
}

async function countOccurrences(filePath: string, pattern: string | RegExp): Promise<number> {
  try {
    const content = await readFile(filePath, 'utf-8');
    if (typeof pattern === 'string') {
      return (content.match(new RegExp(pattern, 'g')) || []).length;
    }
    return (content.match(pattern) || []).length;
  } catch {
    return 0;
  }
}

interface ValidationResult {
  errors: number;
  warnings: number;
  suggestions: number;
}

async function main() {
  const projectName = process.argv[2];

  if (!projectName) {
    log.error('Project name required');
    console.log('');
    console.log('Usage: npx tsx .handoff-framework/scripts/validate-docs.mts <project-name>');
    console.log('');
    console.log('Example:');
    console.log('  npx tsx .handoff-framework/scripts/validate-docs.mts damieus-com-migration');
    process.exit(1);
  }

  const frameworkDir = join(__dirname, '..');
  const projectDir = join(frameworkDir, '..', projectName);
  const handoffDocsDir = join(projectDir, 'docs', '.handoff');

  log.info(`Validating handoff documentation for: ${projectName}`);
  console.log('');

  // Verify project exists
  if (!(await fileExists(projectDir))) {
    log.error(`Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  log.success(`Found project directory: ${projectDir}`);

  // Verify .handoff/ directory exists
  if (!(await fileExists(handoffDocsDir))) {
    log.error(`Handoff docs directory not found: ${handoffDocsDir}`);
    log.warning('Run init-project.mts first');
    process.exit(1);
  }

  log.success(`Found handoff docs: ${handoffDocsDir}`);
  console.log('');

  const result: ValidationResult = { errors: 0, warnings: 0, suggestions: 0 };

  // Header
  log.info('====================================');
  log.info('  FRAMEWORK STANDARDS VALIDATION');
  log.info('====================================');
  console.log('');

  // Section 1: Required Documents
  log.info('1. Required Documents');
  console.log('');

  const requiredDocs = [
    '00-MASTER-INDEX.md',
    '01-PROJECT-STATE.md',
    '02-CRITICAL-CONTEXT.md',
  ];

  for (const doc of requiredDocs) {
    const docPath = join(handoffDocsDir, doc);
    if (await fileExists(docPath)) {
      log.success(`  Found: ${doc}`);
    } else {
      log.error(`  Missing: ${doc} (REQUIRED)`);
      result.errors++;
    }
  }

  console.log('');

  // Section 2: Recommended Documents
  log.info('2. Recommended Documents');
  console.log('');

  const recommendedDocs = [
    'ARCHITECTURE.md',
    'FEATURE-STATUS.md',
    'TESTID-FRAMEWORK.md',
    'GAP-ANALYSIS.md',
    'DEPLOYMENT-ROADMAP.md',
  ];

  for (const doc of recommendedDocs) {
    const docPath = join(handoffDocsDir, doc);
    if (await fileExists(docPath)) {
      log.success(`  Found: ${doc}`);
    } else {
      log.warning(`  Missing: ${doc} (recommended)`);
      result.warnings++;
    }
  }

  console.log('');

  // Section 3: Document Structure Validation
  log.info('3. Document Structure Validation');
  console.log('');

  // Check 00-MASTER-INDEX.md
  const masterIndexPath = join(handoffDocsDir, '00-MASTER-INDEX.md');
  if (await fileExists(masterIndexPath)) {
    log.info('  Checking 00-MASTER-INDEX.md...');

    if (await searchInFile(masterIndexPath, 'Token Estimates')) {
      log.success('    ✓ Has token estimates section');
    } else {
      log.warning('    Missing "Token Estimates" section');
      result.warnings++;
    }

    if (await searchInFile(masterIndexPath, /Quick Start/i)) {
      log.success('    ✓ Has quick start section');
    } else {
      log.error('    Missing "Quick Start" section (REQUIRED)');
      result.errors++;
    }

    if (await searchInFile(masterIndexPath, /Document Index|Navigation/i)) {
      log.success('    ✓ Has document index/navigation');
    } else {
      log.error('    Missing "Document Index" section (REQUIRED)');
      result.errors++;
    }

    const todoCount = await countOccurrences(masterIndexPath, /\[TODO/g);
    if (todoCount > 0) {
      log.warning(`    Found ${todoCount} [TODO] placeholders`);
      result.warnings++;
    }
  }

  console.log('');

  // Check 01-PROJECT-STATE.md
  const projectStatePath = join(handoffDocsDir, '01-PROJECT-STATE.md');
  if (await fileExists(projectStatePath)) {
    log.info('  Checking 01-PROJECT-STATE.md...');

    if (await searchInFile(projectStatePath, /Quality Gates/i)) {
      log.success('    ✓ Has quality gates section');
    } else {
      log.error('    Missing "Quality Gates" section (REQUIRED)');
      result.errors++;
    }

    if (await searchInFile(projectStatePath, /Deployment Blockers/i)) {
      log.success('    ✓ Has deployment blockers section');
    } else {
      log.warning('    Missing "Deployment Blockers" section');
      result.warnings++;
    }

    if (await searchInFile(projectStatePath, /Recent Changes|Git History/i)) {
      log.success('    ✓ Has recent changes section');
    } else {
      log.warning('    Missing "Recent Changes" section');
      result.suggestions++;
    }

    if (await searchInFile(projectStatePath, /Auto-generated|Last updated/i)) {
      log.success('    ✓ Has timestamp/generation metadata');
    } else {
      log.warning('    Missing timestamp (run generate-state.mts)');
      result.suggestions++;
    }
  }

  console.log('');

  // Check 02-CRITICAL-CONTEXT.md
  const criticalContextPath = join(handoffDocsDir, '02-CRITICAL-CONTEXT.md');
  if (await fileExists(criticalContextPath)) {
    log.info('  Checking 02-CRITICAL-CONTEXT.md...');

    if (await searchInFile(criticalContextPath, /Known Issues|Gotchas/i)) {
      log.success('    ✓ Has known issues/gotchas section');
    } else {
      log.warning('    Missing "Known Issues" or "Gotchas" section');
      result.warnings++;
    }

    if (await searchInFile(criticalContextPath, /Decision|ADR/i)) {
      log.success('    ✓ Has decision log/ADRs');
    } else {
      log.warning('    Missing decision log (architectural decisions)');
      result.suggestions++;
    }

    if (await searchInFile(criticalContextPath, /Environment|Supabase/i)) {
      log.success('    ✓ Has environment/config context');
    } else {
      log.warning('    Missing environment-specific context');
      result.suggestions++;
    }
  }

  console.log('');

  // Section 4: Quality Gate Integration
  log.info('4. Quality Gate Integration');
  console.log('');

  const configPath = join(projectDir, '.handoff.config.json');

  if (await fileExists(configPath)) {
    log.success('  Found .handoff.config.json');

    const configContent = await readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    if (config.qualityGates) {
      log.success('    ✓ Has quality gates configuration');

      const enabledGates = Object.values(config.qualityGates).filter(
        (gate: any) => gate.enabled
      ).length;
      log.info(`    Enabled gates: ${enabledGates}`);

      if (enabledGates < 3) {
        log.warning(`    Only ${enabledGates} gates enabled (recommend at least 3)`);
        result.warnings++;
      }
    } else {
      log.error('    Missing quality gates configuration');
      result.errors++;
    }

    if (config.deployment) {
      log.success('    ✓ Has deployment configuration');
    } else {
      log.warning('    Missing deployment configuration');
      result.warnings++;
    }
  } else {
    log.error('  Missing .handoff.config.json (REQUIRED)');
    result.errors++;
  }

  console.log('');

  // Section 5: Token Budget Validation
  log.info('5. Token Budget Validation');
  console.log('');

  const files = await readdir(handoffDocsDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  let totalTokens = 0;

  for (const file of mdFiles) {
    const filePath = join(handoffDocsDir, file);
    const tokens = await estimateTokens(filePath);
    totalTokens += tokens;

    if (tokens > 10000) {
      log.warning(`  ${file}: ~${tokens} tokens (very large, consider splitting)`);
      result.warnings++;
    } else if (tokens > 5000) {
      log.info(`  ${file}: ~${tokens} tokens`);
    } else {
      log.success(`  ${file}: ~${tokens} tokens`);
    }
  }

  log.info(`  Total estimated tokens: ~${totalTokens}`);

  if (totalTokens > 50000) {
    log.error('  Total tokens exceed 50K (consider using subagent workflows)');
    result.errors++;
  } else if (totalTokens > 30000) {
    log.warning('  Total tokens > 30K (recommend using subagent workflows for some sections)');
    result.warnings++;
  } else {
    log.success('  Token budget is reasonable');
  }

  console.log('');

  // Section 6: Workflow References
  log.info('6. Subagent Workflow References');
  console.log('');

  const workflowsDir = join(frameworkDir, 'workflows');

  if (await fileExists(workflowsDir)) {
    let workflowRefs = 0;

    for (const file of mdFiles) {
      const filePath = join(handoffDocsDir, file);
      const content = await readFile(filePath, 'utf-8');
      workflowRefs += (content.match(/audit-.*\.md|\.handoff-framework\/workflows/g) || []).length;
    }

    if (workflowRefs > 0) {
      log.success(`  Found ${workflowRefs} workflow references in docs`);
    } else {
      log.warning('  No workflow references found');
      log.info('  Consider delegating large audits to subagent workflows:');
      log.info('    - audit-cart-systems.md (9x token reduction)');
      log.info('    - audit-database.md (7.6x token reduction)');
      log.info('    - audit-routes.md (12x token reduction)');
      log.info('    - audit-cta-gaps.md (17x token reduction)');
      result.suggestions++;
    }
  } else {
    log.warning('  Framework workflows directory not found');
    log.info('  Visit: https://github.com/DaBigHomie/management-git/.handoff-framework');
  }

  console.log('');

  // Final Report
  log.info('====================================');
  log.info('  VALIDATION SUMMARY');
  log.info('====================================');
  console.log('');

  log.info(`Project: ${projectName}`);
  log.info(`Docs location: ${handoffDocsDir}`);
  console.log('');

  if (result.errors === 0 && result.warnings === 0) {
    log.success('✅ ALL CHECKS PASSED!');
    console.log('');
    log.success('Documentation is fully compliant with framework standards.');
    process.exit(0);
  } else if (result.errors === 0) {
    log.warning('⚠️  PASSED WITH WARNINGS');
    console.log('');
    log.info(`Errors: ${result.errors}`);
    log.warning(`Warnings: ${result.warnings}`);
    log.info(`Suggestions: ${result.suggestions}`);
    console.log('');
    log.info('Documentation is functional but could be improved.');
    log.info('Review warnings above and fix if applicable.');
    process.exit(0);
  } else {
    log.error('❌ VALIDATION FAILED');
    console.log('');
    log.error(`Errors: ${result.errors} (MUST FIX)`);
    log.warning(`Warnings: ${result.warnings}`);
    log.info(`Suggestions: ${result.suggestions}`);
    console.log('');
    log.error('Fix all errors before deploying.');
    log.info('Run this script again after making changes.');
    process.exit(1);
  }
}

main().catch((err) => {
  log.error(`Validation failed: ${err.message}`);
  process.exit(1);
});
