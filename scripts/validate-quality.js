#!/usr/bin/env node

/**
 * Handoff Documentation Quality Validator
 *
 * Validates quality of handoff docs created by agents against the
 * handoff-framework v3.0.0 conventions: numeric-first naming,
 * session folders, investigation-first content.
 *
 * Adapted from documentation-standards/scripts/validate-quality.js
 * but tuned for agent handoff docs (not general project docs).
 *
 * Usage:
 *   node scripts/validate-quality.js docs/handoff-dedup/
 *   node scripts/validate-quality.js docs/handoff-20x-e2e-integration/
 *   node scripts/validate-quality.js path/to/single-doc.md
 *   node scripts/validate-quality.js --all docs/          # scan all handoff-* folders
 *   node scripts/validate-quality.js --detailed docs/handoff-dedup/
 */

import fs from 'node:fs';
import path from 'node:path';

// ─── Color codes ────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// ─── Handoff-Specific Constants ─────────────────────────────────

/** v3.0 numeric filename: 00-MASTER_INDEX_2026-02-20.md or 00-MASTER_INDEX.md */
const NUMERIC_REGEX = /^(\d{2})-([A-Z][A-Z0-9_-]+?)(?:_(\d{4}-\d{2}-\d{2}))?\.md$/;

/** Relaxed: also accepts lowercase slugs and hyphens (real agent output) */
const RELAXED_NUMERIC_REGEX = /^(\d{2})-([A-Za-z][A-Za-z0-9_-]+?)(?:_(\d{4}-\d{2}-\d{2}))?\.md$/;

/** Required sequence numbers (00-05 = context + session) */
const REQUIRED_SEQUENCES = [0, 1, 2, 3, 4, 5];

/** Category ranges for coverage scoring */
const CATEGORY_RANGES = {
  context:   { min: 0, max: 2, label: 'Context (00-02)' },
  session:   { min: 3, max: 5, label: 'Session (03-05)' },
  findings:  { min: 6, max: 11, label: 'Findings (06-11)' },
  reference: { min: 12, max: 14, label: 'Reference (12-14)' },
};

/** Quality scoring weights — tuned for handoff docs */
const WEIGHTS = {
  naming:       0.10,  // Follows numeric naming convention
  structure:    0.15,  // Title, sections, tables
  completeness: 0.20,  // Content depth (not skeleton/placeholder)
  actionability: 0.15, // Clear agent actions, execution order
  crossRefs:    0.10,  // References other handoff docs
  metadata:     0.10,  // Date, session, status info
  coverage:     0.10,  // Category coverage (context + session + findings)
  investigation: 0.10, // Evidence of investigation (not template fill)
};

const QUALITY_RUBRIC = {
  90: { icon: '\u2B50\u2B50\u2B50', label: 'Excellent - Production ready' },
  80: { icon: '\u2B50\u2B50', label: 'Good - Ready for handoff' },
  70: { icon: '\u2B50', label: 'Acceptable - Needs improvement' },
  60: { icon: '\u2717', label: 'Needs work before handoff' },
  0:  { icon: '\u2717', label: 'Incomplete - Not ready' },
};

// ─── Validator Class ────────────────────────────────────────────

class HandoffQualityValidator {
  constructor(options = {}) {
    this.detailed = options.detailed || false;
    this.results = [];
    this.folderIssues = [];
    this.totalScore = 0;
  }

  /**
   * Main entry point — validate a path (file or directory).
   * @param {string} targetPath - File or directory path
   * @returns {boolean} true if overall score >= 75
   */
  validate(targetPath) {
    console.log(`\n${C.blue}${C.bold}📊 Handoff Documentation Quality Report${C.reset}\n`);

    if (!fs.existsSync(targetPath)) {
      console.log(`${C.red}Error: Path not found: ${targetPath}${C.reset}`);
      process.exit(1);
    }

    const stat = fs.statSync(targetPath);

    if (stat.isFile() && targetPath.endsWith('.md')) {
      // Single file
      const score = this.analyzeFile(targetPath);
      this.results.push({ file: targetPath, score, breakdown: score._breakdown });
    } else if (stat.isDirectory()) {
      this.analyzeFolder(targetPath);
    } else {
      console.log(`${C.red}Error: Not a markdown file or directory${C.reset}`);
      process.exit(1);
    }

    if (this.results.length === 0) {
      console.log(`${C.yellow}No handoff markdown files found${C.reset}`);
      process.exit(1);
    }

    // Calculate overall
    this.totalScore = Math.round(
      this.results.reduce((sum, r) => sum + (typeof r.score === 'object' ? r.score.total : r.score), 0) / this.results.length
    );

    this.printFileScores();
    this.printFolderAnalysis();
    this.printOverall();
    if (this.detailed) this.printRecommendations();

    return this.totalScore >= 75;
  }

  /**
   * Analyze a handoff folder — checks individual files + folder-level concerns.
   */
  analyzeFolder(dirPath) {
    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.md'))
      .sort();

    if (files.length === 0) {
      console.log(`${C.yellow}No .md files in ${dirPath}${C.reset}`);
      return;
    }

    // Analyze each file
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const result = this.analyzeFile(fullPath);
      this.results.push({ file: fullPath, score: result, breakdown: result._breakdown });
    }

    // Folder-level checks
    this.checkFolderNaming(dirPath);
    this.checkRequiredDocs(files);
    this.checkCategoryCoverage(files);
    this.checkSequenceGaps(files);
  }

  /**
   * Analyze a single handoff file — returns score object with total + breakdown.
   */
  analyzeFile(filePath) {
    const filename = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const breakdown = {};

    // 1. Naming (10%)
    const namingMatch = RELAXED_NUMERIC_REGEX.test(filename);
    const strictMatch = NUMERIC_REGEX.test(filename);
    breakdown.naming = strictMatch ? 10 : (namingMatch ? 7 : 2);

    // 2. Structure (15%)
    const hasTitle = /^#\s/.test(content);
    const sectionCount = (content.match(/^#{2,3}\s/gm) || []).length;
    const hasTables = /\|.*\|.*\|/m.test(content);
    const hasLists = /^[-*]\s/m.test(content) || /^\d+\.\s/m.test(content);
    let structureScore = 0;
    if (hasTitle) structureScore += 4;
    if (sectionCount >= 3) structureScore += 4;
    else if (sectionCount >= 1) structureScore += 2;
    if (hasTables) structureScore += 4;
    if (hasLists) structureScore += 3;
    breakdown.structure = Math.min(15, structureScore);

    // 3. Completeness (20%)
    const charCount = content.length;
    const lineCount = lines.filter(l => l.trim().length > 0).length;
    const hasSubstantiveContent = charCount > 500 && lineCount > 15;
    const isDeep = charCount > 2000 && lineCount > 40;
    const isPlaceholder = /<!-- INVESTIGATE|TODO|TBD|PLACEHOLDER|FILL IN/i.test(content);
    let completenessScore = 0;
    if (isDeep) completenessScore = 18;
    else if (hasSubstantiveContent) completenessScore = 14;
    else if (lineCount > 8) completenessScore = 8;
    else completenessScore = 3;
    // Penalty for placeholder-heavy docs
    const placeholderCount = (content.match(/<!-- INVESTIGATE|TODO|TBD|PLACEHOLDER/gi) || []).length;
    if (placeholderCount > 5) completenessScore = Math.max(3, completenessScore - 5);
    else if (placeholderCount > 2) completenessScore = Math.max(5, completenessScore - 2);
    breakdown.completeness = Math.min(20, completenessScore);

    // 4. Actionability (15%)
    const hasAgentActions = /\b(EXECUTE|READ FIRST|REFERENCE|IMPLEMENT|DEPLOY|RUN|VERIFY)\b/.test(content);
    const hasExecutionOrder = /execution order|phase \d|step \d|priority|P[0-3]/i.test(content);
    const hasCodeBlocks = /```(bash|sql|typescript|tsx?|jsx?|shell|sh)/i.test(content);
    const hasCommands = /\b(npx|npm run|node |git |supabase )\b/.test(content);
    let actionScore = 0;
    if (hasAgentActions) actionScore += 5;
    if (hasExecutionOrder) actionScore += 4;
    if (hasCodeBlocks) actionScore += 3;
    if (hasCommands) actionScore += 3;
    breakdown.actionability = Math.min(15, actionScore);

    // 5. Cross-References (10%)
    const internalRefs = (content.match(/`\d{2}-[A-Z][A-Z0-9_-]+\.md`/g) || []).length;
    const markdownLinks = (content.match(/\[.*?\]\(.*?\.md\)/g) || []).length;
    const refCount = internalRefs + markdownLinks;
    let refScore = 0;
    if (refCount >= 5) refScore = 10;
    else if (refCount >= 3) refScore = 8;
    else if (refCount >= 1) refScore = 5;
    else refScore = 0;
    breakdown.crossRefs = refScore;

    // 6. Metadata (10%)
    const hasDate = /\b(Date|Updated|Created|Last|February|January|March|April|May|June|July|August|September|October|November|December)\b/i.test(content)
      || /\d{4}-\d{2}-\d{2}/.test(content);
    const hasSession = /session|handoff|agent/i.test(content);
    const hasStatus = /status|severity|priority|critical|warning|blocked|complete/i.test(content);
    let metaScore = 0;
    if (hasDate) metaScore += 4;
    if (hasSession) metaScore += 3;
    if (hasStatus) metaScore += 3;
    breakdown.metadata = Math.min(10, metaScore);

    // 7. Coverage (10%) — evaluated at folder level, give file-level credit for sequence
    const seqMatch = filename.match(/^(\d{2})/);
    const seq = seqMatch ? parseInt(seqMatch[1], 10) : -1;
    // Files with valid sequence get base credit
    breakdown.coverage = seq >= 0 ? 7 : 2;

    // 8. Investigation evidence (10%)
    const hasSpecificData = /\d+\s*(duplicates|errors|warnings|tests|pages|routes|components)/i.test(content);
    const hasFileRefs = /`src\/|`scripts\/|`supabase\/|`\.github\//i.test(content);
    const hasConcreteFindings = /found|discovered|identified|detected|audit|analyzed/i.test(content);
    const hasNoGeneric = !/lorem ipsum|example text|sample content/i.test(content);
    let investigationScore = 0;
    if (hasSpecificData) investigationScore += 3;
    if (hasFileRefs) investigationScore += 3;
    if (hasConcreteFindings) investigationScore += 2;
    if (hasNoGeneric) investigationScore += 2;
    breakdown.investigation = Math.min(10, investigationScore);

    const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

    return { total: Math.round(total), _breakdown: breakdown };
  }

  // ─── Folder-Level Checks ────────────────────────────────────

  checkFolderNaming(dirPath) {
    const folderName = path.basename(dirPath);
    if (/^handoff(-[a-z0-9-]+)?$/.test(folderName)) {
      // Good: handoff or handoff-{slug}
    } else if (/^handoff/i.test(folderName)) {
      this.folderIssues.push({
        severity: 'warning',
        message: `Folder "${folderName}" should follow pattern: handoff-{session-slug}`,
      });
    } else {
      this.folderIssues.push({
        severity: 'suggestion',
        message: `Folder "${folderName}" is not a standard handoff folder name`,
      });
    }
  }

  checkRequiredDocs(files) {
    const sequences = files
      .map(f => f.match(/^(\d{2})/))
      .filter(Boolean)
      .map(m => parseInt(m[1], 10));

    const missing = REQUIRED_SEQUENCES.filter(seq => !sequences.includes(seq));
    if (missing.length > 0) {
      const labels = missing.map(s => String(s).padStart(2, '0'));
      this.folderIssues.push({
        severity: missing.includes(0) ? 'error' : 'warning',
        message: `Missing required sequences: ${labels.join(', ')} (00-05 are required for a complete handoff)`,
      });
    }
  }

  checkCategoryCoverage(files) {
    const sequences = files
      .map(f => f.match(/^(\d{2})/))
      .filter(Boolean)
      .map(m => parseInt(m[1], 10));

    const covered = {};
    for (const [cat, range] of Object.entries(CATEGORY_RANGES)) {
      covered[cat] = sequences.some(s => s >= range.min && s <= range.max);
    }

    const uncovered = Object.entries(covered)
      .filter(([, v]) => !v)
      .map(([k]) => CATEGORY_RANGES[k].label);

    if (uncovered.length > 0) {
      this.folderIssues.push({
        severity: 'suggestion',
        message: `Missing category coverage: ${uncovered.join(', ')}`,
      });
    }
  }

  checkSequenceGaps(files) {
    const sequences = files
      .map(f => f.match(/^(\d{2})/))
      .filter(Boolean)
      .map(m => parseInt(m[1], 10))
      .sort((a, b) => a - b);

    if (sequences.length < 2) return;

    // Check for non-sequential numbering (gaps > 1 in required range)
    for (let i = 0; i < Math.min(sequences.length, 6); i++) {
      if (sequences[i] !== i && i <= 5) {
        this.folderIssues.push({
          severity: 'suggestion',
          message: `Sequence gap: expected ${String(i).padStart(2, '0')} but next is ${String(sequences[i]).padStart(2, '0')}`,
        });
        break;
      }
    }
  }

  // ─── Output ─────────────────────────────────────────────────

  printFileScores() {
    console.log(`${C.cyan}File Scores:${C.reset}\n`);

    for (const result of this.results) {
      const score = typeof result.score === 'object' ? result.score.total : result.score;
      const rating = this.getRating(score);
      const bar = this.getScoreBar(score);
      const relativePath = path.relative(process.cwd(), result.file);

      console.log(`  ${score}% ${bar} ${C.blue}${relativePath}${C.reset}`);
      console.log(`         ${rating.icon} ${rating.label}`);

      if (this.detailed && result.breakdown) {
        const bd = result.breakdown;
        const parts = [];
        if (bd.naming < 8) parts.push('naming');
        if (bd.completeness < 14) parts.push('content depth');
        if (bd.actionability < 8) parts.push('actionability');
        if (bd.crossRefs < 5) parts.push('cross-refs');
        if (bd.investigation < 5) parts.push('investigation evidence');
        if (parts.length > 0) {
          console.log(`         ${C.dim}Improve: ${parts.join(', ')}${C.reset}`);
        }
      }
      console.log('');
    }
  }

  printFolderAnalysis() {
    if (this.folderIssues.length === 0) return;

    console.log(`${C.cyan}Folder Analysis:${C.reset}\n`);
    for (const issue of this.folderIssues) {
      const icon = issue.severity === 'error' ? `${C.red}✗` :
                   issue.severity === 'warning' ? `${C.yellow}⚠` :
                   `${C.dim}→`;
      console.log(`  ${icon} ${issue.message}${C.reset}`);
    }
    console.log('');
  }

  printOverall() {
    console.log(`${C.bold}${'━'.repeat(50)}${C.reset}`);
    const bar = this.getScoreBar(this.totalScore);
    const rating = this.getRating(this.totalScore);
    console.log(`${C.bold}Overall Score: ${this.totalScore}% ${bar}${C.reset}`);
    console.log(`${rating.icon} ${rating.label}\n`);

    if (this.totalScore >= 75) {
      console.log(`${C.green}${C.bold}✅ Handoff docs meet quality standards${C.reset}\n`);
    } else {
      console.log(`${C.red}${C.bold}❌ Handoff docs need improvement before handoff${C.reset}\n`);
    }
  }

  printRecommendations() {
    const lowScorers = this.results.filter(r => {
      const score = typeof r.score === 'object' ? r.score.total : r.score;
      return score < 75;
    });

    if (lowScorers.length === 0) return;

    console.log(`${C.cyan}Recommendations:${C.reset}\n`);
    for (const result of lowScorers) {
      const relativePath = path.relative(process.cwd(), result.file);
      console.log(`  ${C.yellow}→ ${relativePath}${C.reset}`);

      if (result.breakdown) {
        const bd = result.breakdown;
        if (bd.naming < 8) console.log(`    • Rename to numeric format: NN-SLUG.md or NN-SLUG_YYYY-MM-DD.md`);
        if (bd.structure < 10) console.log(`    • Add more sections (##), tables, or bullet lists`);
        if (bd.completeness < 14) console.log(`    • Add more substantive content (target 2000+ characters)`);
        if (bd.actionability < 8) console.log(`    • Add agent actions (EXECUTE, READ FIRST), execution order, code blocks`);
        if (bd.crossRefs < 5) console.log(`    • Reference other handoff docs by filename`);
        if (bd.metadata < 6) console.log(`    • Add date, session context, and status info`);
        if (bd.investigation < 5) console.log(`    • Include specific data (counts, file paths, concrete findings)`);
      }
      console.log('');
    }
  }

  getRating(score) {
    if (score >= 90) return QUALITY_RUBRIC[90];
    if (score >= 80) return QUALITY_RUBRIC[80];
    if (score >= 70) return QUALITY_RUBRIC[70];
    if (score >= 60) return QUALITY_RUBRIC[60];
    return QUALITY_RUBRIC[0];
  }

  getScoreBar(score) {
    const filled = Math.round(score / 5);
    const empty = 20 - filled;
    const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
    if (score >= 80) return `${C.green}${bar}${C.reset}`;
    if (score >= 70) return `${C.yellow}${bar}${C.reset}`;
    return `${C.red}${bar}${C.reset}`;
  }
}

// ─── Scan Mode: find all handoff-* folders under a root ─────────

function findHandoffFolders(rootDir) {
  const folders = [];
  const docsDir = path.join(rootDir, 'docs');

  if (fs.existsSync(docsDir)) {
    for (const entry of fs.readdirSync(docsDir)) {
      if (entry.startsWith('handoff') && fs.statSync(path.join(docsDir, entry)).isDirectory()) {
        folders.push(path.join(docsDir, entry));
      }
    }
  }

  // Also check if rootDir itself is a handoff folder
  const base = path.basename(rootDir);
  if (base.startsWith('handoff') && fs.statSync(rootDir).isDirectory()) {
    folders.push(rootDir);
  }

  return folders;
}

// ─── CLI ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const detailed = args.includes('--detailed');
const scanAll = args.includes('--all');
const filteredArgs = args.filter(a => !a.startsWith('--'));
const targetPath = filteredArgs[0] || '.';

const validator = new HandoffQualityValidator({ detailed });

if (scanAll) {
  // Scan for all handoff-* folders under the target
  const folders = findHandoffFolders(path.resolve(targetPath));
  if (folders.length === 0) {
    console.log(`${C.yellow}No handoff folders found under ${targetPath}${C.reset}`);
    process.exit(1);
  }

  let allPass = true;
  for (const folder of folders) {
    console.log(`\n${C.magenta}${C.bold}── ${path.relative(process.cwd(), folder)} ──${C.reset}`);
    const v = new HandoffQualityValidator({ detailed });
    const pass = v.validate(folder);
    if (!pass) allPass = false;
  }
  process.exit(allPass ? 0 : 1);
} else {
  const success = validator.validate(path.resolve(targetPath));
  process.exit(success ? 0 : 1);
}
