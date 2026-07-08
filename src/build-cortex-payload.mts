#!/usr/bin/env -S npx tsx
/**
 * build-cortex-payload.mts — Build handoff.json for write-handoff-to-cortex.mts
 *
 * Reads v3 handoff docs (00–05), optional context manifest, and CLI overrides;
 * emits schema v1.0 JSON aligned with handoff-cortex-ssot.md.
 *
 * Usage:
 *   npx tsx src/build-cortex-payload.mts \
 *     --repo=<slug> \
 *     --from-session=<session_id> \
 *     --project=<folder-under-MGMT_ROOT> \
 *     --session=<handoff-v3-slug> \
 *     [--goal=<one-liner>] \
 *     [--current-state=<paragraph>] \
 *     [--handoff-type=closeout|resumable-session|cross-agent|cross-workstation] \
 *     [--author-agent=agent-181] \
 *     [--to-session=any-future] \
 *     [--manifest=<path-to-markdown-manifest>] \
 *     [--out=./handoff.json] \
 *     [--stdout]
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { todayISO } from './types.js';
import { log, parseFrontmatter, resolveProjectDir, getFrameworkRoot } from './utils.js';
import { resolveMgmtRoot } from './lib/mgmt-root.js';
import { buildPrimePathRefs, cortexHandoffKey, type HandoffScope } from './lib/prime-paths.js';

const SCHEMA_VERSION = '1.0';

type HandoffType =
  | 'resumable-session'
  | 'closeout'
  | 'cross-agent'
  | 'cross-workstation';

type Args = {
  repo: string;
  fromSession: string;
  project: string;
  session: string;
  goal?: string;
  currentState?: string;
  handoffType: HandoffType;
  authorAgent: string;
  toSession: string;
  manifest?: string;
  out: string;
  stdout: boolean;
  mgmtRoot?: string;
  scope: HandoffScope;
  scopeRef?: string;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const get = (prefix: string): string | undefined => {
    const hit = argv.find((a) => a.startsWith(`${prefix}=`));
    return hit ? hit.slice(prefix.length + 1) : undefined;
  };
  const repo = get('--repo');
  const fromSession = get('--from-session');
  const project = get('--project');
  const session = get('--session');
  if (!repo || !fromSession || !project || !session) {
    console.error(
      'Required: --repo= --from-session= --project= --session=\n' +
        'Example:\n' +
        '  npx tsx src/build-cortex-payload.mts \\\n' +
        '    --repo=documentation-standards --from-session=sess_docstd_20260708 \\\n' +
        '    --project=documentation-standards --session=cortex-handoff-suite',
    );
    process.exit(2);
  }
  return {
    repo,
    fromSession,
    project,
    session,
    goal: get('--goal'),
    currentState: get('--current-state'),
    handoffType: (get('--handoff-type') as HandoffType) ?? 'closeout',
    authorAgent: get('--author-agent') ?? 'agent-181',
    toSession: get('--to-session') ?? 'any-future',
    manifest: get('--manifest'),
    out: get('--out') ?? './handoff.json',
    stdout: argv.includes('--stdout'),
    mgmtRoot: get('--mgmt-root'),
    scope: (get('--scope') as HandoffScope) ?? 'sunset',
    scopeRef: get('--scope-ref'),
  };
}

async function readDocExcerpt(handoffDir: string, seqPrefix: string): Promise<string> {
  try {
    const entries = await readdir(handoffDir);
    const match = entries.find((f) => f.startsWith(seqPrefix) && f.endsWith('.md'));
    if (!match) return '';
    const raw = await readFile(join(handoffDir, match), 'utf-8');
    const { body } = parseFrontmatter(raw);
    const trimmed = body.trim();
    return trimmed.length > 2000 ? `${trimmed.slice(0, 1997)}...` : trimmed;
  } catch {
    return '';
  }
}

async function main(): Promise<void> {
  const args = parseArgs();
  const mgmtRoot = resolveMgmtRoot(args.mgmtRoot);
  const refs = buildPrimePathRefs(mgmtRoot);
  const frameworkRoot = getFrameworkRoot(import.meta.url);
  const projectDir = resolveProjectDir(frameworkRoot, args.project);
  const handoffDir = join(projectDir, 'docs', `handoff-${args.session}`);

  const nextSteps = await readDocExcerpt(handoffDir, '05-NEXT_STEPS');
  const critical = await readDocExcerpt(handoffDir, '02-CRITICAL_CONTEXT');
  const master = await readDocExcerpt(handoffDir, '00-MASTER_INDEX');

  let manifestText = '';
  if (args.manifest) {
    manifestText = await readFile(args.manifest, 'utf-8');
  }

  const goal =
    args.goal ??
    extractSection(manifestText, 'Executive summary') ??
    firstLine(nextSteps) ??
    `Resume session ${args.fromSession} in ${args.repo}`;

  const currentState =
    args.currentState ??
    extractSection(manifestText, 'Git & worktree state') ??
    ([critical, master].filter(Boolean).join('\n\n').slice(0, 4000) ||
      `Handoff v3 folder: ${handoffDir}`);

  const artifacts = buildArtifacts(handoffDir, refs, args);
  const blockers = parseBlockers(manifestText);
  const nextActions = parseNextActions(nextSteps, manifestText);

  const payload = {
    schema_version: SCHEMA_VERSION,
    handoff_type: args.handoffType,
    from_session: args.fromSession,
    to_session: args.toSession,
    author_agent: args.authorAgent,
    created_at: new Date().toISOString(),
    context: {
      goal,
      current_state: currentState,
      artifacts,
      blockers,
      next_orchestrator_actions: nextActions,
    },
    resumable_via: {
      command: '/prime-orchestration-continue',
      authorization_check: undefined,
    },
    supersedes: null,
    superseded_by: null,
  };

  const json = `${JSON.stringify(payload, null, 2)}\n`;
  if (args.stdout) {
    process.stdout.write(json);
  } else {
    await writeFile(args.out, json, 'utf-8');
    log.success(`Wrote ${args.out}`);
    const key = cortexHandoffKey(args.repo, args.fromSession, args.scope, args.scopeRef, todayISO());
    log.info(`CORTEX key: ${key}`);
    log.dim(`Apply: npx tsx "${refs.writeHandoffScript}" --repo=${args.repo} --from-session=${args.fromSession} --payload-file=${args.out} --apply`);
  }
}

function firstLine(text: string): string | undefined {
  const line = text.split('\n').map((l) => l.trim()).find(Boolean);
  return line?.slice(0, 240);
}

function extractSection(md: string, heading: string): string | undefined {
  if (!md) return undefined;
  const re = new RegExp(`###?\\s+${heading}[\\s\\S]*?(?=\\n###|\\n## |$)`, 'i');
  const m = md.match(re);
  if (!m) return undefined;
  return m[0].replace(/^###?\s+[^\n]+\n?/, '').trim().slice(0, 2000);
}

function buildArtifacts(
  handoffDir: string,
  refs: ReturnType<typeof buildPrimePathRefs>,
  args: Args,
): Array<{ kind: string; ref: string; sha?: string }> {
  const items: Array<{ kind: string; ref: string; sha?: string }> = [
    { kind: 'doc', ref: handoffDir },
    { kind: 'skill', ref: refs.handoffCloudDirectSkill },
    { kind: 'doc', ref: refs.promptOrchestrator },
  ];
  if (args.manifest) items.push({ kind: 'doc', ref: args.manifest });
  return items;
}

function parseBlockers(manifest: string): Array<{ description: string; blocked_on: string }> {
  const section = extractSection(manifest, 'Open items / blockers') ?? extractSection(manifest, 'blockers');
  if (!section) return [];
  const rows = section.split('\n').filter((l) => l.startsWith('|') && !l.includes('---'));
  return rows.slice(1).map((row) => {
    const cols = row.split('|').map((c) => c.trim()).filter(Boolean);
    return {
      description: cols[0] ?? 'blocker',
      blocked_on: cols[1] ?? 'human',
    };
  });
}

function parseNextActions(
  nextSteps: string,
  manifest: string,
): Array<{ action: string; priority: 'P0' | 'P1' | 'P2' | 'P3' }> {
  const fromManifest = extractSection(manifest, 'Implementation handed off');
  const source = fromManifest || nextSteps;
  const lines = source
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^(\d+\.|[-*]|\|)/.test(l));
  if (lines.length === 0) {
    return [{ action: 'Run success commands in manifest §12 before expanding scope', priority: 'P0' }];
  }
  return lines.slice(0, 8).map((line, i) => ({
    action: line.replace(/^(\d+\.|[-*]\s*|\|)/, '').trim().slice(0, 500),
    priority: (i === 0 ? 'P0' : i < 3 ? 'P1' : 'P2') as 'P0' | 'P1' | 'P2',
  }));
}

main().catch((err: Error) => {
  log.error(err.message);
  process.exit(1);
});
