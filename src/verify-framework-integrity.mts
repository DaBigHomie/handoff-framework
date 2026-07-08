#!/usr/bin/env -S npx tsx
/**
 * verify-framework-integrity.mts — READ-ONLY execute-only guard.
 *
 * The handoff-framework is EXECUTE-ONLY for agents: run the scripts, never
 * edit them. This guard asserts that no framework SOURCE has been locally
 * modified relative to git HEAD (or an explicit ref). It is read-only — it
 * runs `git` in read mode and PRINTS a verdict; it never writes or reverts.
 *
 * Intended to run at orchestrator boot / before dispatch, so an agent that
 * (against policy) edited the framework is caught before executing it.
 *
 * Usage:
 *   npx tsx src/verify-framework-integrity.mts [--ref=HEAD] [--strict]
 *
 * Exit codes:
 *   0 — clean (no framework source edits)
 *   1 — framework source modified (execute-only violation)
 *   2 — cannot determine (git unavailable) — non-strict returns 0 with WARN
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Paths whose modification constitutes a framework edit (execute-only surface).
const GUARDED = ['src/', 'workflows/', 'package.json', 'tsconfig.json'];

function parseArgs(argv: string[]): { ref: string; strict: boolean } {
  const get = (p: string) => argv.find((a) => a.startsWith(`${p}=`))?.slice(p.length + 1);
  return { ref: get('--ref') ?? 'HEAD', strict: argv.includes('--strict') };
}

function frameworkRoot(): string {
  // src/ -> repo root
  return join(dirname(fileURLToPath(import.meta.url)), '..');
}

function git(root: string, gitArgs: string[]): string {
  return execFileSync('git', gitArgs, { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const root = frameworkRoot();

  let changed: string[] = [];
  try {
    // Uncommitted (working tree + index) changes vs ref.
    const diff = git(root, ['diff', '--name-only', args.ref, '--']);
    const untracked = git(root, ['ls-files', '--others', '--exclude-standard']);
    const all = [...diff.split('\n'), ...untracked.split('\n')].map((s) => s.trim()).filter(Boolean);
    changed = all.filter((f) => GUARDED.some((g) => (g.endsWith('/') ? f.startsWith(g) : f === g)));
  } catch (e) {
    process.stderr.write(`[framework-guard] WARN: git check failed: ${(e as Error).message}\n`);
    process.exit(args.strict ? 2 : 0);
  }

  if (changed.length === 0) {
    process.stdout.write('[framework-guard] PASS — framework source unmodified (execute-only respected).\n');
    process.exit(0);
  }

  process.stderr.write('[framework-guard] FAIL — execute-only violation. Framework source modified:\n');
  for (const f of changed) process.stderr.write(`  - ${f}\n`);
  process.stderr.write('Agents must EXECUTE the framework, not edit it. Revert changes or route via human/GOV.\n');
  process.exit(1);
}

main();
