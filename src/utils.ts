/**
 * utils.ts — Shared utilities for the Handoff Framework
 *
 * Logging, file operations, and common helpers used across all scripts.
 */

import { access, readFile, readdir, stat, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

export const execAsync = promisify(exec);

// ─── ANSI Colors ─────────────────────────────────────────────────
export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
} as const;

// ─── Logger ──────────────────────────────────────────────────────
export const log = {
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg: string) => console.log(`\n${colors.bold}${colors.cyan}═══ ${msg} ═══${colors.reset}\n`),
  dim: (msg: string) => console.log(`${colors.dim}${msg}${colors.reset}`),
  result: (label: string, pass: boolean) =>
    console.log(`  ${pass ? colors.green + '✅' : colors.red + '❌'} ${label}${colors.reset}`),
};

// ─── File Utilities ──────────────────────────────────────────────
export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function readJSON<T = unknown>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

export async function writeJSON(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export async function estimateTokens(filePath: string): Promise<number> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return Math.floor(content.length / 4);
  } catch {
    return 0;
  }
}

export async function countLines(filePath: string): Promise<number> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

export async function listMarkdownFiles(dirPath: string): Promise<string[]> {
  try {
    const entries = await readdir(dirPath);
    return entries.filter((f) => f.endsWith('.md')).sort();
  } catch {
    return [];
  }
}

// ─── Project Detection ───────────────────────────────────────────
export async function detectTechStack(projectDir: string): Promise<string[]> {
  const stack: string[] = [];
  try {
    const pkgPath = join(projectDir, 'package.json');
    if (await fileExists(pkgPath)) {
      const content = await readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(content);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (allDeps.react) stack.push('React');
      if (allDeps.typescript) stack.push('TypeScript');
      if (allDeps.vite) stack.push('Vite');
      if (allDeps.next) stack.push('Next.js');
      if (allDeps['@supabase/supabase-js']) stack.push('Supabase');
      if (allDeps.tailwindcss) stack.push('Tailwind CSS');
      if (allDeps.stripe) stack.push('Stripe');
      if (allDeps['@shadcn/ui'] || allDeps['class-variance-authority']) stack.push('shadcn/ui');
      if (allDeps.playwright || allDeps['@playwright/test']) stack.push('Playwright');
    }
  } catch {
    // Ignore
  }
  return stack.length > 0 ? stack : ['Not detected'];
}

export async function getProjectVersion(projectDir: string): Promise<string> {
  try {
    const pkgPath = join(projectDir, 'package.json');
    if (await fileExists(pkgPath)) {
      const content = await readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(content);
      return pkg.version || '0.0.0';
    }
  } catch {
    // Ignore
  }
  return '0.0.0';
}

// ─── Path Helpers ────────────────────────────────────────────────

/** Get the framework root directory (parent of src/) */
export function getFrameworkRoot(importMetaUrl: string): string {
  const __filename = fileURLToPath(importMetaUrl);
  const __dirname = dirname(__filename);
  return join(__dirname, '..');
}

/** Resolve project directory relative to workspace root */
export function resolveProjectDir(frameworkRoot: string, projectName: string): string {
  // Framework sits at workspace-root/.handoff-framework/ (or as standalone repo)
  // Projects sit at workspace-root/{project-name}/
  return join(frameworkRoot, '..', projectName);
}

/** Get the canonical handoff docs path for a project */
export function getHandoffDocsPath(projectDir: string): string {
  return join(projectDir, 'docs', 'handoff');
}

// ─── Template Variable Substitution ──────────────────────────────
export function substituteVars(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

// ─── Table Formatting ────────────────────────────────────────────
export function formatTable(headers: string[], rows: string[][]): string {
  const lines: string[] = [];
  lines.push(`| ${headers.join(' | ')} |`);
  lines.push(`|${headers.map(() => '------').join('|')}|`);
  for (const row of rows) {
    lines.push(`| ${row.join(' | ')} |`);
  }
  return lines.join('\n');
}
