#!/usr/bin/env -S npx tsx
/**
 * finalize-session-handoff.mts — End-to-end handoff automation pipeline.
 *
 * Chains handoff-framework v3 scaffold → generate → validate → cortex payload
 * → optional CORTEX SSOT write → agent dispatch brief.
 *
 * Usage:
 *   export MGMT_ROOT=~/Management\ Git   # or ~/management-git
 *
 *   npx tsx src/finalize-session-handoff.mts \
 *     --repo=documentation-standards \
 *     --project=documentation-standards \
 *     --from-session=sess_docstd_20260708 \
 *     --session=cortex-handoff-suite \
 *     --tags=handoff,cortex,prime \
 *     [--init] [--generate] [--validate] [--build-payload] [--agent-dispatch] \
 *     [--cortex-dry-run] [--cortex-apply] \
 *     [--goal="One line goal"] \
 *     [--manifest=<path>] \
 *     [--session-path=<dir>] \
 *     [--skip-hub-mirror]
 *
 * Default (no step flags): runs --init --generate --validate --build-payload
 *   --agent-dispatch --cortex-dry-run
 *
 * Always review dry-run output before --cortex-apply.
 */

import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import { todayISO } from './types.js';
import { log, getFrameworkRoot } from './utils.js';
import { resolveMgmtRoot } from './lib/mgmt-root.js';
import {
  buildPrimePathRefs,
  contextManifestPath,
  cortexHandoffKey,
  hubContextManifestPath,
} from './lib/prime-paths.js';

type Args = {
  repo: string;
  project: string;
  fromSession: string;
  session: string;
  tags: string;
  goal?: string;
  manifest?: string;
  description?: string;
  sessionPath?: string;
  init: boolean;
  generate: boolean;
  validate: boolean;
  buildPayload: boolean;
  agentDispatch: boolean;
  cortexDryRun: boolean;
  cortexApply: boolean;
  skipHubMirror: boolean;
  mgmtRoot?: string;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const get = (p: string) => argv.find((a) => a.startsWith(`${p}=`))?.slice(p.length + 1);
  const has = (f: string) => argv.includes(f);

  const repo = get('--repo');
  const project = get('--project');
  const fromSession = get('--from-session');
  const session = get('--session');
  if (!repo || !project || !fromSession || !session) {
    console.error(
      'Required: --repo= --project= --from-session= --session=\n\n' +
        'Example:\n' +
        '  npx tsx src/finalize-session-handoff.mts \\\n' +
        '    --repo=documentation-standards \\\n' +
        '    --project=documentation-standards \\\n' +
        '    --from-session=sess_docstd_20260708 \\\n' +
        '    --session=cortex-handoff-suite \\\n' +
        '    --tags=handoff,cortex,prime \\\n' +
        '    --cortex-apply',
    );
    process.exit(2);
  }

  const anyStep =
    has('--init') ||
    has('--generate') ||
    has('--validate') ||
    has('--build-payload') ||
    has('--agent-dispatch') ||
    has('--cortex-dry-run') ||
    has('--cortex-apply');

  const defaults = !anyStep;

  return {
    repo,
    project,
    fromSession,
    session,
    tags: get('--tags') ?? 'handoff,cortex,prime',
    goal: get('--goal'),
    description: get('--description') ?? session,
    sessionPath: get('--session-path'),
    manifest: get('--manifest'),
    init: defaults || has('--init'),
    generate: defaults || has('--generate'),
    validate: defaults || has('--validate'),
    buildPayload: defaults || has('--build-payload'),
    agentDispatch: defaults || has('--agent-dispatch'),
    cortexDryRun: defaults || has('--cortex-dry-run') || has('--cortex-apply'),
    cortexApply: has('--cortex-apply'),
    skipHubMirror: has('--skip-hub-mirror'),
    mgmtRoot: get('--mgmt-root'),
  };
}

function runTsx(frameworkRoot: string, script: string, scriptArgs: string[]): void {
  const scriptPath = join(frameworkRoot, 'src', script);
  const result = spawnSync('npx', ['tsx', scriptPath, ...scriptArgs], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: tsx ${script} ${scriptArgs.join(' ')}`);
  }
}

async function writeManifestPointer(
  args: Args,
  refs: ReturnType<typeof buildPrimePathRefs>,
  payloadPath: string,
  dispatchPath: string,
): Promise<string> {
  const today = todayISO();
  const derivedPrimary = contextManifestPath(
    refs.mgmtRoot,
    args.repo,
    'sunset',
    'sunset',
    today,
    args.description,
    args.fromSession,
  );
  // --session-path overrides the derived <repo>/docs/session-manifests dir.
  const primary = args.sessionPath
    ? join(args.sessionPath, basename(derivedPrimary))
    : derivedPrimary;
  const hub = hubContextManifestPath(
    refs.mgmtRoot,
    args.repo,
    'sunset',
    'sunset',
    today,
    args.description,
    args.fromSession,
  );
  const key = cortexHandoffKey(args.repo, args.fromSession, 'sunset', 'sunset', today);

  const body = `---
title: "Session handoff pointer — ${args.session}"
doc_type: handoff
repo: ${args.repo}
session_id: ${args.fromSession}
scope: sunset
scope_ref: sunset
version: "1.0.0"
created: ${today}
updated: ${today}
status: in_progress
cortex_handoff_key: "${key}"
tags: [handoff, auto-pointer, cortex, sunset]
---

> **CORTEX SSOT:** \`${key}\` — authoritative. Complete Sunset protocol in PROMPT-SUNSET-HANDOFF-PROTOCOL.md.

# Handoff automation pointer

| Artifact | Path |
|----------|------|
| Naming SSOT | \`${refs.handoffNaming}\` |
| Sunset prompt | \`${refs.promptSunset}\` |
| CORTEX payload (draft) | \`${payloadPath}\` |
| Agent dispatch brief | \`${dispatchPath}\` |
| Handoff v3 folder | \`${join(refs.mgmtRoot, args.project, 'docs', `handoff-${args.session}`)}\` |
| Orchestrator prompt | \`${refs.promptOrchestrator}\` |
| handoff-sunset-v30 skill | \`${refs.handoffSunsetV30Skill}\` |

## Next agent

1. Read agent dispatch: \`${dispatchPath}\`
2. Complete manifest sections or v3 docs 00–05
3. Re-run \`build-cortex-payload.mts\` then \`write-handoff-to-cortex.mts --apply\`
4. Bootstrap: \`${refs.promptNextAgent}\`

## Change log

| Date | Author | Note |
|------|--------|------|
| ${today} | finalize-session-handoff.mts | Auto-generated sunset pointer v1.0.0 |
`;

  await mkdir(dirname(primary), { recursive: true });
  await writeFile(primary, body, 'utf-8');
  log.success(`Wrote manifest pointer: ${primary}`);

  if (!args.skipHubMirror && args.repo !== 'documentation-standards') {
    await mkdir(join(refs.mgmtRoot, 'documentation-standards', 'docs', 'session-manifests'), { recursive: true });
    await writeFile(hub, body, 'utf-8');
    log.success(`Wrote hub mirror: ${hub}`);
  }

  return primary;
}

async function main(): Promise<void> {
  const args = parseArgs();
  const mgmtRoot = resolveMgmtRoot(args.mgmtRoot);
  process.env.MGMT_ROOT = mgmtRoot;

  const frameworkRoot = getFrameworkRoot(import.meta.url);
  const refs = buildPrimePathRefs(mgmtRoot);
  const workDir = join(frameworkRoot, '.handoff-work', args.session);
  await mkdir(workDir, { recursive: true });

  const payloadPath = join(workDir, 'handoff.json');
  const dispatchJson = join(workDir, 'handoff-agent-dispatch.json');
  const dispatchMd = join(workDir, 'handoff-agent-dispatch.md');

  log.header('finalize-session-handoff');
  log.info(`MGMT_ROOT=${mgmtRoot}`);
  log.info(`repo=${args.repo} session=${args.session} from=${args.fromSession}`);

  const common = [args.project, '--session', args.session];

  if (args.init) {
    log.header('Step: init v3 handoff docs');
    runTsx(frameworkRoot, 'init-project.mts', [...common, '--tags', args.tags]);
  }

  if (args.generate) {
    log.header('Step: generate 01-PROJECT_STATE');
    runTsx(frameworkRoot, 'generate-state.mts', common);
  }

  if (args.validate) {
    log.header('Step: validate naming + docs');
    runTsx(frameworkRoot, 'validate-naming.mts', common);
    runTsx(frameworkRoot, 'validate-docs.mts', common);
  }

  if (args.buildPayload) {
    log.header('Step: build CORTEX payload JSON');
    const buildArgs = [
      `--repo=${args.repo}`,
      `--from-session=${args.fromSession}`,
      `--project=${args.project}`,
      `--session=${args.session}`,
      `--out=${payloadPath}`,
    ];
    if (args.goal) buildArgs.push(`--goal=${args.goal}`);
    if (args.manifest) buildArgs.push(`--manifest=${args.manifest}`);
    runTsx(frameworkRoot, 'build-cortex-payload.mts', buildArgs);
  }

  if (args.agentDispatch) {
    log.header('Step: emit multi-agent dispatch brief');
    runTsx(frameworkRoot, 'emit-agent-dispatch.mts', [
      `--repo=${args.repo}`,
      `--from-session=${args.fromSession}`,
      `--project=${args.project}`,
      `--session=${args.session}`,
      `--out=${dispatchJson}`,
      `--markdown=${dispatchMd}`,
    ]);
  }

  if (args.cortexDryRun || args.cortexApply) {
    log.header('Step: CORTEX handoff write');
    const cortexArgs = [
      refs.writeHandoffScript,
      `--repo=${args.repo}`,
      `--from-session=${args.fromSession}`,
      `--payload-file=${payloadPath}`,
      args.cortexApply ? '--apply' : '--dry-run',
    ];
    const result = spawnSync('npx', ['tsx', ...cortexArgs], { stdio: 'inherit', env: process.env });
    if (result.status !== 0) {
      throw new Error('write-handoff-to-cortex.mts failed');
    }
  }

  const manifestPath = await writeManifestPointer(args, refs, payloadPath, dispatchJson);

  if (args.validate) {
    log.header('Step: validate session manifests (v3.1 naming + frontmatter + Change Log)');
    const validateArgs = args.sessionPath
      ? [`--session-path=${args.sessionPath}`]
      : [`--repos=${args.repo}`, `--mgmt-root=${mgmtRoot}`];
    runTsx(frameworkRoot, 'validate-session-manifests.mts', validateArgs);
  }

  console.log('');
  log.success('Pipeline complete');
  console.log('');
  log.info('Outputs:');
  console.log(`  payload:     ${payloadPath}`);
  console.log(`  dispatch:    ${dispatchJson}`);
  console.log(`  dispatch md: ${dispatchMd}`);
  console.log(`  manifest:    ${manifestPath}`);
  console.log(`  CORTEX key:  ${cortexHandoffKey(args.repo, args.fromSession, 'sunset', 'sunset', todayISO())}`);
  console.log('');
  log.info('Multi-agent: dispatch wave-1 lanes in ONE message (disjoint write targets).');
  log.dim(`  Read: ${dispatchMd}`);
  console.log('');
  if (!args.cortexApply) {
    log.warning('CORTEX row NOT applied — re-run with --cortex-apply after human review.');
  }
}

main().catch((err: Error) => {
  log.error(err.message);
  process.exit(1);
});
