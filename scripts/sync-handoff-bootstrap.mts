#!/usr/bin/env npx tsx
/**
 * sync-handoff-bootstrap.mts — Inject handoff framework bootstrap into repo AGENTS.md files
 *
 * Reads templates/AGENTS_BOOTSTRAP.md, substitutes {{PROJECT_NAME}},
 * and appends/replaces the section in each repo's AGENTS.md using HTML comment markers.
 *
 * Usage:
 *   npx tsx scripts/sync-handoff-bootstrap.mts                          # Sync all repos in registry
 *   npx tsx scripts/sync-handoff-bootstrap.mts damieus-com-migration    # Sync one repo
 *
 * Requires: documentation-standards/workspace-rules/repo-registry.json
 */

import { readFile, writeFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { log } from '../src/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FRAMEWORK_ROOT = join(__dirname, '..');
const WORKSPACE_ROOT = join(FRAMEWORK_ROOT, '..');

const BOOTSTRAP_TEMPLATE = join(FRAMEWORK_ROOT, 'templates', 'AGENTS_BOOTSTRAP.md');
const REGISTRY = join(WORKSPACE_ROOT, 'documentation-standards', 'workspace-rules', 'repo-registry.json');

const MARKER_START = '<!-- HANDOFF-FRAMEWORK-BOOTSTRAP-START -->';
const MARKER_END = '<!-- HANDOFF-FRAMEWORK-BOOTSTRAP-END -->';

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

interface RepoEntry {
  name: string;
  branch: string;
}

interface RepoRegistry {
  owner: string;
  repos: RepoEntry[];
  workspace_root: string;
}

async function getRepoNames(cliArgs: string[]): Promise<string[]> {
  if (cliArgs.length > 0) return cliArgs;

  if (!(await fileExists(REGISTRY))) {
    log.error(`Repo registry not found: ${REGISTRY}`);
    log.info('Provide repo names as arguments or create the registry file.');
    process.exit(1);
  }

  const content = await readFile(REGISTRY, 'utf-8');
  const registry: RepoRegistry = JSON.parse(content);
  return registry.repos.map((r) => r.name);
}

function injectBootstrap(existingContent: string, injection: string): string {
  const startIdx = existingContent.indexOf(MARKER_START);
  const endIdx = existingContent.indexOf(MARKER_END);

  if (startIdx !== -1 && endIdx !== -1) {
    // Replace existing block
    const before = existingContent.slice(0, startIdx);
    const after = existingContent.slice(endIdx + MARKER_END.length);
    return before + injection + after;
  }

  // Append to end
  return existingContent.trimEnd() + '\n\n' + injection + '\n';
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (!(await fileExists(BOOTSTRAP_TEMPLATE))) {
    log.error(`Bootstrap template not found: ${BOOTSTRAP_TEMPLATE}`);
    process.exit(1);
  }

  const templateContent = await readFile(BOOTSTRAP_TEMPLATE, 'utf-8');
  const repos = await getRepoNames(args);

  log.header(`Syncing Handoff Bootstrap to ${repos.length} repos`);

  let success = 0;
  let skipped = 0;

  for (const repo of repos) {
    const agentsFile = join(WORKSPACE_ROOT, repo, 'AGENTS.md');

    if (!(await fileExists(agentsFile))) {
      log.warning(`Skipped ${repo} — no AGENTS.md found`);
      skipped++;
      continue;
    }

    const bootstrapContent = templateContent.replaceAll('{{PROJECT_NAME}}', repo);
    const injection = `${MARKER_START}\n${bootstrapContent}\n${MARKER_END}`;

    const existing = await readFile(agentsFile, 'utf-8');
    const updated = injectBootstrap(existing, injection);

    await writeFile(agentsFile, updated, 'utf-8');

    const action = existing.includes(MARKER_START) ? 'replaced existing section' : 'appended new section';
    log.success(`Updated ${repo}/AGENTS.md (${action})`);
    success++;
  }

  console.log('');
  log.header(`Results: ${success} synced, ${skipped} skipped`);
}

main().catch((err) => {
  log.error(err.message);
  process.exit(1);
});
