#!/usr/bin/env -S npx tsx
/**
 * validate-session-manifests.mts — Validate v3.1 handoff manifests.
 *
 * SSOT: documentation-standards/templates/handoff/NAMING-CONVENTIONS.md (v3.1).
 *
 * Validates every handoff manifest in scope against:
 *   1. Filename pattern:
 *      <YYYYMMDD>T<HHMMSS>-<detailed-description>-<repo>-<handoff-type>-<cortex-id>.md
 *   2. Valid UTC datetime prefix.
 *   3. Required frontmatter keys (title, doc_type, repo, session_id, scope,
 *      version, created, updated, status, cortex_key, manifest_path).
 *   4. Mandatory `## Change Log` section with at least one data row.
 *
 * Scope resolution (choose one):
 *   --session-path=<dir>   Explicit directory of manifests to validate.
 *   --repos=<csv>          Comma-separated repo slugs; each resolves to
 *                          <mgmt-root>/<repo>/docs/session-manifests.
 *
 * Usage:
 *   npx tsx src/validate-session-manifests.mts --session-path=/abs/dir
 *   npx tsx src/validate-session-manifests.mts --repos="$REPOS" [--mgmt-root=<root>]
 *   npx tsx src/validate-session-manifests.mts --repos=documentation-standards,maximus-ai
 *
 * Exit codes: 0 = pass, 1 = validation errors, 2 = arg error.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { resolveMgmtRoot } from './lib/mgmt-root.js';
import { SESSION_MANIFESTS_SUBDIR } from './lib/prime-paths.js';

const HANDOFF_TYPES = ['sunset', 'chapter', 'thread', 'index', 'fork'] as const;

const REQUIRED_FRONTMATTER = [
  'title',
  'doc_type',
  'repo',
  'session_id',
  'scope',
  'version',
  'created',
  'updated',
  'status',
  'cortex_key',
  'manifest_path',
] as const;

const FILENAME_RE = new RegExp(
  `^(\\d{8})T(\\d{6})-([a-z0-9-]+)-(${HANDOFF_TYPES.join('|')})-([a-z0-9-]+)\\.md$`,
);

type Issue = { file: string; severity: 'error' | 'warning'; rule: string; message: string };

type Args = {
  sessionPath?: string;
  repos: string[];
  mgmtRoot?: string;
};

function parseArgs(argv: string[]): Args {
  const get = (p: string) => argv.find((a) => a.startsWith(`${p}=`))?.slice(p.length + 1);
  const reposRaw = get('--repos');
  return {
    sessionPath: get('--session-path'),
    repos: reposRaw ? reposRaw.split(',').map((r) => r.trim()).filter(Boolean) : [],
    mgmtRoot: get('--mgmt-root'),
  };
}

function isValidDatetime(yyyymmdd: string, hhmmss: string): boolean {
  const y = Number(yyyymmdd.slice(0, 4));
  const mo = Number(yyyymmdd.slice(4, 6));
  const d = Number(yyyymmdd.slice(6, 8));
  const h = Number(hhmmss.slice(0, 2));
  const mi = Number(hhmmss.slice(2, 4));
  const s = Number(hhmmss.slice(4, 6));
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  if (h > 23 || mi > 59 || s > 59) return false;
  const dt = new Date(Date.UTC(y, mo - 1, d, h, mi, s));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

function parseFrontmatter(content: string): Record<string, string> | null {
  if (!content.startsWith('---')) return null;
  const end = content.indexOf('\n---', 3);
  if (end === -1) return null;
  const block = content.slice(3, end);
  const map: Record<string, string> = {};
  for (const line of block.split('\n')) {
    const m = line.match(/^([a-z0-9_]+)\s*:\s*(.*)$/i);
    if (m) map[m[1]] = m[2].trim();
  }
  return map;
}

function hasChangeLogRow(content: string): boolean {
  const idx = content.toLowerCase().indexOf('## change log');
  if (idx === -1) return false;
  const after = content.slice(idx);
  // At least one table data row that is not the header/separator.
  const rows = after
    .split('\n')
    .filter((l) => l.trim().startsWith('|'))
    .filter((l) => !/^\|[\s|:-]+\|?$/.test(l.trim()))
    .filter((l) => !/version\s*\|\s*date/i.test(l));
  return rows.length >= 1;
}

async function validateFile(dir: string, file: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const rel = join(dir, file);

  const fnMatch = file.match(FILENAME_RE);
  if (!fnMatch) {
    issues.push({
      file: rel,
      severity: 'error',
      rule: 'filename-pattern',
      message:
        'Filename must match <YYYYMMDD>T<HHMMSS>-<description>-<repo>-<handoff-type>-<cortex-id>.md',
    });
  } else if (!isValidDatetime(fnMatch[1], fnMatch[2])) {
    issues.push({
      file: rel,
      severity: 'error',
      rule: 'filename-datetime',
      message: `Invalid UTC datetime ${fnMatch[1]}T${fnMatch[2]} in filename`,
    });
  }

  const content = await readFile(rel, 'utf8');
  const fm = parseFrontmatter(content);
  if (!fm) {
    issues.push({ file: rel, severity: 'error', rule: 'frontmatter', message: 'Missing YAML frontmatter block' });
  } else {
    for (const key of REQUIRED_FRONTMATTER) {
      if (!fm[key]) {
        issues.push({
          file: rel,
          severity: 'error',
          rule: 'frontmatter-key',
          message: `Missing required frontmatter key: ${key}`,
        });
      }
    }
    if (fm.scope && !['sunset', 'chapter', 'thread', 'session', 'index'].includes(fm.scope)) {
      issues.push({
        file: rel,
        severity: 'error',
        rule: 'frontmatter-scope',
        message: `Invalid scope "${fm.scope}"`,
      });
    }
  }

  if (!hasChangeLogRow(content)) {
    issues.push({
      file: rel,
      severity: 'error',
      rule: 'change-log',
      message: 'Missing "## Change Log" section with at least one data row',
    });
  }

  return issues;
}

async function collectDirs(args: Args): Promise<string[]> {
  const dirs: string[] = [];
  if (args.sessionPath) {
    dirs.push(args.sessionPath);
  }
  if (args.repos.length) {
    const mgmtRoot = resolveMgmtRoot(args.mgmtRoot);
    for (const repo of args.repos) {
      dirs.push(join(mgmtRoot, repo, SESSION_MANIFESTS_SUBDIR));
    }
  }
  return dirs;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (!args.sessionPath && args.repos.length === 0) {
    process.stderr.write(
      'Required: --session-path=<dir> OR --repos=<csv>\n' +
        'Examples:\n' +
        '  npx tsx src/validate-session-manifests.mts --session-path=/abs/session-manifests\n' +
        '  npx tsx src/validate-session-manifests.mts --repos="$REPOS"\n',
    );
    process.exit(2);
  }

  const dirs = await collectDirs(args);
  const allIssues: Issue[] = [];
  let filesChecked = 0;
  let dirsMissing = 0;

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      process.stdout.write(`[validate-manifests] SKIP (absent): ${dir}\n`);
      dirsMissing += 1;
      continue;
    }
    const st = await stat(dir);
    if (!st.isDirectory()) {
      allIssues.push({ file: dir, severity: 'error', rule: 'not-a-dir', message: 'Path is not a directory' });
      continue;
    }
    const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      filesChecked += 1;
      allIssues.push(...(await validateFile(dir, file)));
    }
  }

  const errors = allIssues.filter((i) => i.severity === 'error');
  const warnings = allIssues.filter((i) => i.severity === 'warning');

  process.stdout.write(`\n[validate-manifests] dirs=${dirs.length} absent=${dirsMissing} files=${filesChecked}\n`);
  for (const i of allIssues) {
    process.stdout.write(`  [${i.severity}] ${i.rule}: ${i.message}\n    → ${i.file}\n`);
  }

  if (filesChecked === 0 && dirsMissing === dirs.length) {
    process.stdout.write('[validate-manifests] No manifest directories present yet — nothing to validate (PASS).\n');
    process.exit(0);
  }

  process.stdout.write(
    `[validate-manifests] ${errors.length === 0 ? 'PASS' : 'FAIL'} — errors=${errors.length} warnings=${warnings.length}\n`,
  );
  process.exit(errors.length === 0 ? 0 : 1);
}

main().catch((e) => {
  process.stderr.write(`${(e as Error).message}\n`);
  process.exit(1);
});
