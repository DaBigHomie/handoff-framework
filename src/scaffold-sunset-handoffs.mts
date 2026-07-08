#!/usr/bin/env -S npx tsx
/**
 * scaffold-sunset-handoffs.mts — Scaffold per-repo / per-chapter / per-thread manifest stubs.
 *
 * Emits strictly named manifest files with frontmatter + Sunset section shells + Change Log.
 * One file per (repo × scope) — never a blended cross-repo manifest.
 *
 * Usage:
 *   npx tsx src/scaffold-sunset-handoffs.mts \
 *     --from-session=<session_id> \
 *     --repos=documentation-standards,maximus-ai \
 *     --scope=sunset \
 *     [--scope-ref=sunset] \
 *     [--description=handoff-automation-v3] \
 *     [--author-agent=agent-180] \
 *     [--dry-run]
 *
 * Chapter mode:
 *   --scope=chapter --scope-ref=ch-03-wave-mcp --chapter-nn=03 --chapter-slug=wave-mcp
 *
 * Thread mode:
 *   --scope=thread --scope-ref=th-bg-v1-t1 --thread-slug=bg-v1-t1
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { todayISO } from './types.js';
import { log } from './utils.js';
import { resolveMgmtRoot } from './lib/mgmt-root.js';
import {
  buildPrimePathRefs,
  contextManifestPath,
  manifestFilename,
  SESSION_MANIFESTS_SUBDIR,
  cortexHandoffKey,
  cortexArchiveMirrorPath,
  deriveChapterId,
  deriveThreadId,
  handoffV3Folder,
  hubSessionIndexPath,
  type HandoffScope,
} from './lib/prime-paths.js';

type Args = {
  fromSession: string;
  repos: string[];
  scope: HandoffScope;
  scopeRef?: string;
  sessionSlug: string;
  description: string;
  authorAgent: string;
  chapterNn?: string;
  chapterSlug?: string;
  threadSlug?: string;
  sessionPath?: string;
  dryRun: boolean;
  mgmtRoot?: string;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const get = (p: string) => argv.find((a) => a.startsWith(`${p}=`))?.slice(p.length + 1);
  const fromSession = get('--from-session');
  const reposRaw = get('--repos');
  if (!fromSession || !reposRaw) {
    console.error('Required: --from-session= --repos=repo-a,repo-b [--scope=sunset|chapter|thread]');
    process.exit(2);
  }
  const scope = (get('--scope') as HandoffScope) ?? 'sunset';
  return {
    fromSession,
    repos: reposRaw.split(',').map((r) => r.trim()).filter(Boolean),
    scope,
    scopeRef: get('--scope-ref'),
    sessionSlug: get('--session-slug') ?? 'session-handoff',
    description: get('--description') ?? get('--session-slug') ?? 'session-sunset',
    authorAgent: get('--author-agent') ?? 'agent-180',
    chapterNn: get('--chapter-nn'),
    chapterSlug: get('--chapter-slug'),
    threadSlug: get('--thread-slug'),
    sessionPath: get('--session-path'),
    dryRun: argv.includes('--dry-run'),
    mgmtRoot: get('--mgmt-root'),
  };
}

function buildScopeRef(args: Args): string {
  if (args.scopeRef) return args.scopeRef;
  if (args.scope === 'chapter' && args.chapterNn) {
    return `ch-${args.chapterNn}${args.chapterSlug ? `-${args.chapterSlug}` : ''}`;
  }
  if (args.scope === 'thread' && args.threadSlug) {
    return `th-${args.threadSlug}`;
  }
  return 'sunset';
}

function manifestBody(args: Args, repo: string, refs: ReturnType<typeof buildPrimePathRefs>, scopeRef: string): string {
  const today = todayISO();
  const chapterId =
    args.scope === 'chapter' && args.chapterNn && args.chapterSlug
      ? deriveChapterId(args.fromSession, args.chapterNn, args.chapterSlug)
      : 'null';
  const threadId =
    args.scope === 'thread' && args.threadSlug
      ? deriveThreadId(args.fromSession, args.threadSlug)
      : 'null';
  const manifestPath = contextManifestPath(
    refs.mgmtRoot,
    repo,
    args.scope,
    scopeRef,
    today,
    args.description,
    args.fromSession,
  );
  const cortexKey = cortexHandoffKey(repo, args.fromSession, args.scope, scopeRef, today);
  const v3Folder = handoffV3Folder(refs.mgmtRoot, repo, args.sessionSlug, args.scope, scopeRef);

  return `---
title: "${repo} — ${args.scope} ${scopeRef} — TBD"
doc_type: handoff
repo: "${repo}"
session_id: "${args.fromSession}"
chapter_id: ${chapterId === 'null' ? 'null' : `"${chapterId}"`}
thread_id: ${threadId === 'null' ? 'null' : `"${threadId}"`}
scope: ${args.scope}
scope_ref: "${scopeRef}"
version: "1.0.0"
created: ${today}
updated: ${today}
status: paused
tags: [sunset, handoff, ${repo}, ${args.scope}]
cortex_key: "${cortexKey}"
manifest_path: "${manifestPath}"
author_agent: "${args.authorAgent}"
blast_radius_constraints: []
---

> **CORTEX SSOT:** \`${cortexKey}\` — authoritative after \`write-handoff-to-cortex.mts --apply\`.
> **Naming SSOT:** \`${refs.handoffNaming}\`
> **Sunset prompt:** \`${refs.promptSunset}\`

# Sunset handoff — ${repo} — ${scopeRef}

## [SESSION MANIFEST]

| Field | Value |
|-------|-------|
| **Primary Objective** | TBD — one sentence |
| **Chapter Status** | Paused |
| **Thread Status** | N/A |
| **Chapter ID** | ${chapterId === 'null' ? 'N/A' : chapterId} |
| **Thread ID** | ${threadId === 'null' ? 'N/A' : threadId} |
| **Blast Radius Constraints** | TBD |

## [ARTIFACT REGISTRY]

| Artifact ID | Kind | Path or ref | Repo | Commit SHA / proof | Status |
|-------------|------|-------------|------|-------------------|--------|
| TBD | doc | TBD | ${repo} | TBD | WIP |

**Action Confirmed:** TBD — verify commits before sunset apply.

## [COMMAND SUNSET LOG]

| Command | Use Case | Status |
|---------|----------|--------|
| TBD | TBD | TBD |

## [THE BATON]

| Field | Value |
|-------|-------|
| **Starting Point for Next Agent** | TBD |
| **Known Blockers / Warnings** | TBD |
| **Do NOT redo** | TBD |
| **v3 handoff folder** | \`${v3Folder}\` |

## [REPO STATE]

| Field | Value |
|-------|-------|
| Branch | TBD |
| Worktree | TBD |
| Dirty files | TBD |
| SSOT SHA | TBD |

## [CORTEX CHECKPOINT]

| task_id | status | proof in output_blob? | desync vs git? |
|---------|--------|------------------------|----------------|
| TBD | pending | no | TBD |

## Change Log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0.0 | ${today} | ${args.authorAgent} | Scaffolded ${args.scope} manifest stub for ${repo}. |
`;
}

async function main(): Promise<void> {
  const args = parseArgs();
  const mgmtRoot = resolveMgmtRoot(args.mgmtRoot);
  const refs = buildPrimePathRefs(mgmtRoot);
  const scopeRef = buildScopeRef(args);
  const today = todayISO();
  const written: string[] = [];

  for (const repo of args.repos) {
    // --session-path overrides the derived <repo>/docs/session-manifests dir.
    const outDir = args.sessionPath ?? join(mgmtRoot, repo, SESSION_MANIFESTS_SUBDIR);
    const path = args.sessionPath
      ? join(outDir, manifestFilename(repo, args.scope, scopeRef, today, args.description, args.fromSession))
      : contextManifestPath(mgmtRoot, repo, args.scope, scopeRef, today, args.description, args.fromSession);
    const body = manifestBody(args, repo, refs, scopeRef);
    if (args.dryRun) {
      log.dim(`[dry-run] would write ${path}`);
    } else {
      await mkdir(outDir, { recursive: true });
      await writeFile(path, body, 'utf-8');
      log.success(`Wrote ${path}`);
      written.push(path);
    }
    const archivePath = cortexArchiveMirrorPath(
      mgmtRoot,
      repo,
      args.fromSession,
      args.scope,
      scopeRef,
      today.replace(/-/g, ''),
    );
    if (!args.dryRun) {
      await mkdir(join(mgmtRoot, repo, 'docs/session-artifacts', args.fromSession), { recursive: true });
      log.dim(`Archive mirror target: ${archivePath}`);
    }
  }

  if (args.repos.length > 1 && !args.dryRun) {
    const hash = args.fromSession.slice(-8);
    const indexPath = hubSessionIndexPath(mgmtRoot, hash, today, args.fromSession);
    const indexBody = `---
title: "Session index — ${args.fromSession}"
doc_type: handoff
repo: documentation-standards
session_id: "${args.fromSession}"
scope: session
version: "1.0.0"
created: ${today}
updated: ${today}
status: active
tags: [session-index, cross-repo, sunset]
---

# SESSION-INDEX — ${args.fromSession}

Per-repo manifests (do not merge into one file):

${written.map((p) => `- \`${p}\``).join('\n')}

## Change Log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0.0 | ${today} | ${args.authorAgent} | Index for multi-repo ${args.scope} sunset. |
`;
    await mkdir(join(mgmtRoot, 'documentation-standards', SESSION_MANIFESTS_SUBDIR), { recursive: true });
    await writeFile(indexPath, indexBody, 'utf-8');
    log.success(`Wrote hub index ${indexPath}`);
  }

  log.info(`CORTEX key pattern: handoff:<repo>:${args.fromSession}:${scopeRef}:<YYYY-MM-DD>`);
}

main().catch((err: Error) => {
  log.error(err.message);
  process.exit(1);
});
