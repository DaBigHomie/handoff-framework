/**
 * utils.ts — Shared utilities for the Handoff Framework
 *
 * Logging, file operations, and common helpers used across all scripts.
 */

import { access, readFile, readdir, stat, writeFile, mkdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  buildDocsPath,
  CANONICAL_DOCS_PREFIX,
  CANONICAL_DOCS_BASE,
  type HandoffDocFrontmatter,
  type DocCategory,
  getCategoryForSequence,
} from './types.js';

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

/** Get the framework root directory (parent of src/ or dist/src/) */
export function getFrameworkRoot(importMetaUrl: string): string {
  const __filename = fileURLToPath(importMetaUrl);
  const __dirname = dirname(__filename);
  // Compiled output lives at dist/src/, so go up two levels
  if (__dirname.endsWith(join('dist', 'src'))) {
    return join(__dirname, '..', '..');
  }
  return join(__dirname, '..');
}

/**
 * Detect whether the framework is running from inside node_modules
 * (npm-installed) vs as a local sibling directory.
 */
export function isInstalledFromNpm(frameworkRoot: string): boolean {
  return frameworkRoot.includes(`${join('node_modules', '@dabighomie')}`)
    || frameworkRoot.includes(`${join('node_modules', 'handoff-framework')}`);
}

/**
 * Resolve project directory by name.
 *
 * - **Local dev**: framework is at workspace-root/.handoff-framework/,
 *   projects sit at workspace-root/{project-name}/
 * - **npm-installed**: framework is inside node_modules/,
 *   projects sit at process.cwd()/{project-name}/ (or cwd IS the project)
 */
export function resolveProjectDir(frameworkRoot: string, projectName: string): string {
  if (isInstalledFromNpm(frameworkRoot)) {
    return join(process.cwd(), projectName);
  }
  // Local dev: sibling to framework dir
  return join(frameworkRoot, '..', projectName);
}

/** Get the canonical handoff docs path for a project */
export function getHandoffDocsPath(projectDir: string, sessionSlug?: string): string {
  return join(projectDir, buildDocsPath(sessionSlug));
}

/**
 * Parse --session <slug> from CLI args.
 * Returns { sessionSlug, remainingArgs }.
 */
export function parseSessionArg(args: string[]): { sessionSlug?: string; remainingArgs: string[] } {
  const idx = args.indexOf('--session');
  if (idx === -1 || idx + 1 >= args.length) {
    return { sessionSlug: undefined, remainingArgs: args };
  }
  const sessionSlug = args[idx + 1];
  const remainingArgs = [...args.slice(0, idx), ...args.slice(idx + 2)];
  return { sessionSlug, remainingArgs };
}

/**
 * Find existing handoff folders in a project's docs/ directory.
 * Returns folder names like ["handoff-20x-e2e-integration", "handoff-checkout-refactor"].
 */
export interface HandoffFolder {
  name: string;
  sessionSlug: string | null;
}

export async function findHandoffFolders(projectDir: string): Promise<HandoffFolder[]> {
  const docsDir = join(projectDir, CANONICAL_DOCS_BASE);
  try {
    const entries = await readdir(docsDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && e.name.startsWith(CANONICAL_DOCS_PREFIX))
      .map((e) => {
        const slug = e.name === CANONICAL_DOCS_PREFIX
          ? null
          : e.name.slice(CANONICAL_DOCS_PREFIX.length + 1); // strip "handoff-"
        return { name: e.name, sessionSlug: slug };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
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

// ─── YAML Frontmatter ───────────────────────────────────────────

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---\n?/;

/**
 * Parse YAML frontmatter from markdown content.
 * Returns frontmatter fields and body (content after frontmatter).
 * Returns null frontmatter if no `---` block found.
 */
export function parseFrontmatter(content: string): {
  frontmatter: HandoffDocFrontmatter | null;
  body: string;
} {
  const match = content.match(FRONTMATTER_REGEX);
  if (!match) return { frontmatter: null, body: content };

  const yamlBlock = match[1];
  const body = content.slice(match[0].length);

  // Simple YAML parser for known flat keys (no external deps)
  const fm: Record<string, unknown> = {};
  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let value: unknown = trimmed.slice(colonIdx + 1).trim();

    // Parse inline arrays: [tag1, tag2]
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      value = inner
        ? inner.split(',').map((s: string) => s.trim().replace(/^["']|["']$/g, ''))
        : [];
    }
    // Strip quotes
    else if (typeof value === 'string' && /^["'].*["']$/.test(value)) {
      value = value.slice(1, -1);
    }
    // Parse numbers
    else if (typeof value === 'string' && /^\d+$/.test(value)) {
      value = parseInt(value, 10);
    }

    fm[key] = value;
  }

  const frontmatter: HandoffDocFrontmatter = {
    tags: Array.isArray(fm.tags) ? fm.tags as string[] : [],
    topic: typeof fm.topic === 'string' && fm.topic !== '' ? fm.topic : undefined,
    created: typeof fm.created === 'string' ? fm.created : '',
    sequence: typeof fm.sequence === 'number' ? fm.sequence : -1,
    category: typeof fm.category === 'string' ? fm.category as DocCategory : 'context',
  };

  return { frontmatter, body };
}

/**
 * Serialize a HandoffDocFrontmatter to a `---` YAML block string.
 */
export function serializeFrontmatter(fm: HandoffDocFrontmatter): string {
  const lines = ['---'];
  const tagsStr = fm.tags.length > 0
    ? `[${fm.tags.join(', ')}]`
    : '[]';
  lines.push(`tags: ${tagsStr}`);
  if (fm.topic) {
    lines.push(`topic: "${fm.topic}"`);
  }
  lines.push(`created: "${fm.created}"`);
  lines.push(`sequence: ${fm.sequence}`);
  lines.push(`category: "${fm.category}"`);
  lines.push('---');
  return lines.join('\n');
}

/**
 * Inject frontmatter into content. If frontmatter already exists, replaces it.
 */
export function injectFrontmatter(
  content: string,
  fm: HandoffDocFrontmatter,
): string {
  const { body } = parseFrontmatter(content);
  return serializeFrontmatter(fm) + '\n' + body;
}

/**
 * Build default frontmatter for a template at init time.
 */
export function buildDefaultFrontmatter(
  sequence: number,
  date: string,
  tags: string[] = [],
): HandoffDocFrontmatter {
  return {
    tags,
    created: date,
    sequence,
    category: getCategoryForSequence(sequence),
  };
}

// ─── Tag CLI Argument Parsing ────────────────────────────────────

/**
 * Parse --tags <csv> from CLI args.
 * Accepts: --tags checkout,stripe,db-migration
 * Returns: { tags: ['checkout', 'stripe', 'db-migration'], remainingArgs }
 */
export function parseTagsArg(args: string[]): { tags: string[]; remainingArgs: string[] } {
  const idx = args.indexOf('--tags');
  if (idx === -1 || idx + 1 >= args.length) {
    return { tags: [], remainingArgs: args };
  }
  const raw = args[idx + 1];
  const tags = raw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  const remainingArgs = [...args.slice(0, idx), ...args.slice(idx + 2)];
  return { tags, remainingArgs };
}
