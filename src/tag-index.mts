#!/usr/bin/env npx tsx
/**
 * tag-index.mts — Cross-session tag index generator
 *
 * Scans all docs/handoff-* folders in a project, reads YAML frontmatter
 * from each .md file, and generates docs/HANDOFF_TAG_INDEX.md — a
 * cross-session discovery index grouped by tag.
 *
 * Usage:
 *   npx tsx src/tag-index.mts <project-path>
 *   npx tsx src/tag-index.mts ../damieus-com-migration
 *
 * Output: <project-path>/docs/HANDOFF_TAG_INDEX.md
 */

import { readdir, readFile, stat, writeFile, mkdir } from 'fs/promises';
import { join, basename, relative } from 'path';
import { log, fileExists, parseFrontmatter } from './utils.js';
import { VERSION } from './version.js';
import type { HandoffDocFrontmatter } from './types.js';

// ─── Types ───────────────────────────────────────────────────────

interface TaggedDoc {
  /** Relative path from project root, e.g. "docs/handoff-checkout/03-TASK_TRACKER_2026-02-20.md" */
  path: string;
  /** Filename only */
  filename: string;
  /** Session slug parsed from folder name */
  session: string;
  /** Frontmatter data (may be null) */
  frontmatter: HandoffDocFrontmatter | null;
  /** Tags from frontmatter */
  tags: string[];
  /** Topic from frontmatter */
  topic: string;
}

interface TagEntry {
  tag: string;
  docs: TaggedDoc[];
  sessions: Set<string>;
}

// ─── Scanner ─────────────────────────────────────────────────────

/**
 * Find all handoff-* folders under docs/.
 */
async function findHandoffFolders(projectDir: string): Promise<string[]> {
  const docsDir = join(projectDir, 'docs');
  if (!(await fileExists(docsDir))) return [];

  const entries = await readdir(docsDir);
  const folders: string[] = [];

  for (const entry of entries) {
    if (!entry.startsWith('handoff')) continue;
    const fullPath = join(docsDir, entry);
    const s = await stat(fullPath);
    if (s.isDirectory()) folders.push(fullPath);
  }

  return folders.sort();
}

/**
 * Parse session slug from folder name.
 * "handoff-checkout-refactor" → "checkout-refactor"
 * "handoff" → "default"
 */
function parseSessionFromFolder(folderName: string): string {
  if (folderName === 'handoff') return 'default';
  if (folderName.startsWith('handoff-')) return folderName.slice('handoff-'.length);
  return folderName;
}

/**
 * Scan a single handoff folder and extract tagged docs.
 */
async function scanFolder(folderPath: string, projectDir: string): Promise<TaggedDoc[]> {
  const folderName = basename(folderPath);
  const session = parseSessionFromFolder(folderName);

  const files = (await readdir(folderPath))
    .filter(f => f.endsWith('.md'))
    .sort();

  const docs: TaggedDoc[] = [];

  for (const file of files) {
    const fullPath = join(folderPath, file);
    const content = await readFile(fullPath, 'utf-8');
    const { frontmatter } = parseFrontmatter(content);

    const tags = (frontmatter?.tags as string[] | undefined) ?? [];
    const topic = (frontmatter?.topic as string | undefined) ?? '';

    docs.push({
      path: relative(projectDir, fullPath),
      filename: file,
      session,
      frontmatter,
      tags,
      topic,
    });
  }

  return docs;
}

// ─── Index Builder ───────────────────────────────────────────────

/**
 * Build tag index from all scanned docs.
 */
function buildTagIndex(allDocs: TaggedDoc[]): Map<string, TagEntry> {
  const index = new Map<string, TagEntry>();

  for (const doc of allDocs) {
    for (const tag of doc.tags) {
      if (!index.has(tag)) {
        index.set(tag, { tag, docs: [], sessions: new Set() });
      }
      const entry = index.get(tag)!;
      entry.docs.push(doc);
      entry.sessions.add(doc.session);
    }
  }

  return index;
}

/**
 * Generate the HANDOFF_TAG_INDEX.md content.
 */
function generateIndexContent(
  tagIndex: Map<string, TagEntry>,
  allDocs: TaggedDoc[],
  sessions: string[],
): string {
  const today = new Date().toISOString().split('T')[0];
  const sortedTags = [...tagIndex.entries()].sort((a, b) => b[1].docs.length - a[1].docs.length);

  const taggedCount = allDocs.filter(d => d.tags.length > 0).length;
  const untaggedCount = allDocs.length - taggedCount;

  let content = `# Handoff Tag Index

**Generated**: ${today}
**Framework**: @dabighomie/handoff-framework v${VERSION}
**Sessions Scanned**: ${sessions.length}
**Total Documents**: ${allDocs.length}
**Tagged**: ${taggedCount} | **Untagged**: ${untaggedCount}

---

## Tag Summary

| Tag | Documents | Sessions | Topics |
|-----|-----------|----------|--------|
`;

  for (const [, entry] of sortedTags) {
    const topics = [...new Set(entry.docs.map(d => d.topic).filter(Boolean))];
    content += `| \`${entry.tag}\` | ${entry.docs.length} | ${[...entry.sessions].join(', ')} | ${topics.join(', ') || '—'} |\n`;
  }

  content += `\n---\n`;

  // Detailed sections per tag
  for (const [, entry] of sortedTags) {
    content += `\n## \`${entry.tag}\`\n\n`;
    content += `**${entry.docs.length} document${entry.docs.length > 1 ? 's' : ''}** across **${entry.sessions.size} session${entry.sessions.size > 1 ? 's' : ''}**\n\n`;
    content += `| Document | Session | Category | Topic |\n`;
    content += `|----------|---------|----------|-------|\n`;

    for (const doc of entry.docs) {
      const cat = doc.frontmatter?.category ?? '—';
      content += `| [${doc.filename}](${doc.path}) | ${doc.session} | ${cat} | ${doc.topic || '—'} |\n`;
    }

    content += `\n`;
  }

  // Untagged docs section
  const untaggedDocs = allDocs.filter(d => d.tags.length === 0);
  if (untaggedDocs.length > 0) {
    content += `---\n\n## Untagged Documents\n\n`;
    content += `These documents have no tags in their frontmatter:\n\n`;
    content += `| Document | Session |\n`;
    content += `|----------|---------|\n`;
    for (const doc of untaggedDocs) {
      content += `| [${doc.filename}](${doc.path}) | ${doc.session} |\n`;
    }
    content += `\n`;
  }

  // Session overview
  content += `---\n\n## Sessions Overview\n\n`;
  content += `| Session | Documents | Tags Used |\n`;
  content += `|---------|-----------|----------|\n`;

  for (const session of sessions) {
    const sessionDocs = allDocs.filter(d => d.session === session);
    const sessionTags = [...new Set(sessionDocs.flatMap(d => d.tags))];
    content += `| ${session} | ${sessionDocs.length} | ${sessionTags.map(t => '\`' + t + '\`').join(', ') || '—'} |\n`;
  }

  content += `\n---\n\n**Framework**: @dabighomie/handoff-framework v${VERSION}\n**Generated**: ${today}\n`;

  return content;
}

// ─── Main ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const projectDir = process.argv[2];

  if (!projectDir) {
    log.error('Usage: npx tsx src/tag-index.mts <project-path>');
    process.exit(1);
  }

  if (!(await fileExists(projectDir))) {
    log.error(`Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  log.header('Handoff Tag Index Generator');
  console.log('');

  // Find all handoff folders
  const folders = await findHandoffFolders(projectDir);

  if (folders.length === 0) {
    log.warning('No handoff-* folders found under docs/');
    log.info('Run `npx tsx src/init-project.mts <project> --session <slug> --tags <csv>` first');
    process.exit(0);
  }

  log.info(`Found ${folders.length} handoff folder${folders.length > 1 ? 's' : ''}`);

  // Scan all folders
  const allDocs: TaggedDoc[] = [];
  const sessions: string[] = [];

  for (const folder of folders) {
    const folderName = basename(folder);
    const session = parseSessionFromFolder(folderName);
    sessions.push(session);

    const docs = await scanFolder(folder, projectDir);
    allDocs.push(...docs);
    log.info(`  ${folderName}: ${docs.length} docs, ${docs.filter(d => d.tags.length > 0).length} tagged`);
  }

  console.log('');

  // Build index
  const tagIndex = buildTagIndex(allDocs);

  if (tagIndex.size === 0) {
    log.warning('No tagged documents found');
    log.info('Add tags to document frontmatter: tags: [checkout, stripe]');
  }

  log.info(`Found ${tagIndex.size} unique tag${tagIndex.size !== 1 ? 's' : ''} across ${allDocs.length} documents`);

  // Generate output
  const content = generateIndexContent(tagIndex, allDocs, sessions);

  // Write to docs/HANDOFF_TAG_INDEX.md
  const docsDir = join(projectDir, 'docs');
  await mkdir(docsDir, { recursive: true });

  const outputPath = join(docsDir, 'HANDOFF_TAG_INDEX.md');
  await writeFile(outputPath, content, 'utf-8');

  log.success(`Generated ${outputPath}`);
  console.log('');

  // Summary
  if (tagIndex.size > 0) {
    log.header('Tag Summary');
    for (const [tag, entry] of [...tagIndex.entries()].sort((a, b) => b[1].docs.length - a[1].docs.length)) {
      console.log(`  ${tag}: ${entry.docs.length} docs in ${entry.sessions.size} session${entry.sessions.size > 1 ? 's' : ''}`);
    }
    console.log('');
  }
}

main().catch((err) => {
  log.error(`Tag index error: ${err.message}`);
  process.exit(1);
});
