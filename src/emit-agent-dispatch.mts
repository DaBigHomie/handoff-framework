#!/usr/bin/env -S npx tsx
/**
 * emit-agent-dispatch.mts — Multi-agent dispatch brief for handoff closeout.
 *
 * Emits JSON + Markdown with parallel subagent lanes aligned to
 * multi-model-task-assignment and review-40x-panel agent IDs.
 *
 * Usage:
 *   npx tsx src/emit-agent-dispatch.mts \
 *     --repo=<slug> \
 *     --from-session=<session_id> \
 *     --project=<folder> \
 *     --session=<handoff-v3-slug> \
 *     [--risk=low|medium|high|critical] \
 *     [--out=./handoff-agent-dispatch.json] \
 *     [--markdown=./handoff-agent-dispatch.md]
 */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { todayISO } from './types.js';
import { log, getFrameworkRoot } from './utils.js';
import { resolveMgmtRoot } from './lib/mgmt-root.js';
import {
  buildPrimePathRefs,
  contextManifestPath,
  hubContextManifestPath,
} from './lib/prime-paths.js';

type Risk = 'low' | 'medium' | 'high' | 'critical';

type AgentLane = {
  wave: number;
  lane_id: string;
  agent_id: number;
  agent_role: string;
  model_tier: 'haiku' | 'sonnet' | 'opus' | 'fable';
  surface: 'cursor-task' | 'cursor-explore' | 'claude-code' | 'orchestrator-direct';
  readonly: boolean;
  skill: string;
  prompt_ref: string;
  brief: string;
  write_targets: string[];
  depends_on: string[];
};

type DispatchBrief = {
  schema_version: '1.0';
  generated_at: string;
  repo: string;
  from_session: string;
  handoff_session_slug: string;
  risk: Risk;
  orchestrator_agent: number;
  paths: ReturnType<typeof buildPrimePathRefs> & {
    manifest_primary: string;
    manifest_hub: string;
    handoff_v3: string;
  };
  waves: AgentLane[];
  compose_with: string[];
};

function parseArgs() {
  const argv = process.argv.slice(2);
  const get = (p: string) => argv.find((a) => a.startsWith(`${p}=`))?.slice(p.length + 1);
  const repo = get('--repo');
  const fromSession = get('--from-session');
  const project = get('--project');
  const session = get('--session');
  if (!repo || !fromSession || !project || !session) {
    console.error('Required: --repo= --from-session= --project= --session=');
    process.exit(2);
  }
  return {
    repo,
    fromSession,
    project,
    session,
    risk: (get('--risk') as Risk) ?? 'medium',
    out: get('--out') ?? './handoff-agent-dispatch.json',
    markdown: get('--markdown') ?? './handoff-agent-dispatch.md',
    mgmtRoot: get('--mgmt-root'),
  };
}

function buildWaves(args: ReturnType<typeof parseArgs>, refs: ReturnType<typeof buildPrimePathRefs>): AgentLane[] {
  const today = todayISO();
  const manifest = contextManifestPath(refs.mgmtRoot, args.repo, 'sunset', 'sunset', today);
  const handoffDir = join(refs.mgmtRoot, args.project, 'docs', `handoff-${args.session}`);

  const waves: AgentLane[] = [
    {
      wave: 0,
      lane_id: 'th-markers',
      agent_id: 181,
      agent_role: 'Integration Orchestrator (dispatch only)',
      model_tier: 'haiku',
      surface: 'cursor-explore',
      readonly: true,
      skill: refs.sessionChapterIndexSkill,
      prompt_ref: refs.sessionChapterIndexSkill,
      brief:
        'Read-only session-chapter-index pass: chapters, threads, cross-refs, desyncs, handoff seed. ' +
        'Do NOT author handoff docs. Emit markers block only.',
      write_targets: [],
      depends_on: [],
    },
    {
      wave: 1,
      lane_id: 'th-handoff-v3',
      agent_id: 180,
      agent_role: 'Integration / Handoff Author',
      model_tier: 'sonnet',
      surface: 'cursor-task',
      readonly: false,
      skill: refs.handoffCloudDirectSkill,
      prompt_ref: refs.promptSunset,
      brief:
        `Execute Sunset protocol per ${refs.promptSunset}. One manifest PER touched repo. ` +
        `Strict naming: ${refs.handoffNaming}. Fill [SESSION MANIFEST], [ARTIFACT REGISTRY], ` +
        `[COMMAND SUNSET LOG], [THE BATON] + Change Log v1.0.0.`,
      write_targets: [handoffDir, manifest, hubContextManifestPath(refs.mgmtRoot, args.repo, 'sunset', 'sunset', today)],
      depends_on: ['th-markers'],
    },
    {
      wave: 1,
      lane_id: 'th-cortex-knowledge',
      agent_id: 590,
      agent_role: 'Knowledge / Corpus Archivist',
      model_tier: 'sonnet',
      surface: 'cursor-task',
      readonly: false,
      skill: refs.promptKnowledge,
      prompt_ref: refs.promptKnowledge,
      brief:
        'Author CORTEX knowledge per chapter/thread/session scope. Use [CORTEX ARCHIVE ENTRY] sections. ' +
        'One archive mirror per scope under docs/session-artifacts/<session_id>/ch<NN>|th-<slug>/. ' +
        'Mandatory version + Change Log.',
      write_targets: [
        join(refs.mgmtRoot, args.repo, 'docs/session-artifacts', args.fromSession, `CORTEX-ARCHIVE-${args.session}.md`),
      ],
      depends_on: ['th-markers'],
    },
    {
      wave: 2,
      lane_id: 'th-validate',
      agent_id: 594,
      agent_role: 'Validate / QA',
      model_tier: 'haiku',
      surface: 'cursor-task',
      readonly: true,
      skill: join(refs.handoffFramework, 'src/validate-docs.mts'),
      prompt_ref: join(refs.handoffFramework, 'HANDOFF_PROTOCOL.md'),
      brief:
        `Run: npx tsx "${join(refs.handoffFramework, 'src/validate-docs.mts')}" ${args.project} --session ${args.session} ` +
        `&& npx tsx "${join(refs.handoffFramework, 'src/validate-naming.mts')}" ${args.project} --session ${args.session}. Fix findings in th-handoff-v3 lane only.`,
      write_targets: [],
      depends_on: ['th-handoff-v3'],
    },
    {
      wave: 3,
      lane_id: 'th-cortex-write',
      agent_id: 181,
      agent_role: 'Orchestrator — CORTEX SSOT write',
      model_tier: 'fable',
      surface: 'orchestrator-direct',
      readonly: false,
      skill: refs.handoffCloudDirectSkill,
      prompt_ref: refs.promptOrchestrator,
      brief:
        'Build handoff.json via build-cortex-payload.mts, dry-run write-handoff-to-cortex.mts, human confirm, --apply. ' +
        'Emit next-agent bootstrap §13.',
      write_targets: [`cortex_knowledge:handoff:${args.repo}:${args.fromSession}:sunset:${today.slice(0, 10)}`],
      depends_on: ['th-handoff-v3', 'th-validate'],
    },
  ];

  if (args.risk === 'high' || args.risk === 'critical') {
    waves.push({
      wave: 4,
      lane_id: 'th-40x-panel',
      agent_id: 84,
      agent_role: 'RLS / Security (conditional)',
      model_tier: 'sonnet',
      surface: 'cursor-task',
      readonly: true,
      skill: join(refs.mgmtRoot, 'documentation-standards/skills/malfig/SKILL.md'),
      prompt_ref: '~/.cursor/skills/review-40x-panel/SKILL.md',
      brief:
        'Background 40x review panel if schema/auth/RLS touched: agents 5, 81, 84, 161, 180. Read-only verdict — fixes go to new lanes.',
      write_targets: [],
      depends_on: ['th-cortex-write'],
    });
  }

  return waves;
}

function toMarkdown(brief: DispatchBrief): string {
  const lines: string[] = [
    `# Handoff multi-agent dispatch — ${brief.repo}`,
    '',
    `- **from_session:** \`${brief.from_session}\``,
    `- **risk:** ${brief.risk}`,
    `- **orchestrator:** Agent ${brief.orchestrator_agent}`,
    `- **generated:** ${brief.generated_at}`,
    '',
    '## Waves',
    '',
    '| Wave | Lane | Agent | Model | Read-only | Depends |',
    '|------|------|-------|-------|-----------|---------|',
  ];
  for (const w of brief.waves) {
    lines.push(
      `| ${w.wave} | ${w.lane_id} | ${w.agent_id} (${w.agent_role}) | ${w.model_tier} | ${w.readonly} | ${w.depends_on.join(', ') || '—'} |`,
    );
  }
  lines.push('', '## Lane briefs', '');
  for (const w of brief.waves) {
    lines.push(`### ${w.lane_id} — Agent ${w.agent_id}`, '', w.brief, '', `- **Skill:** \`${w.skill}\``, `- **Prompt:** \`${w.prompt_ref}\``, '');
  }
  lines.push('## Compose with', '', brief.compose_with.map((s) => `- \`${s}\``).join('\n'), '');
  return lines.join('\n');
}

async function main(): Promise<void> {
  const args = parseArgs();
  const mgmtRoot = resolveMgmtRoot(args.mgmtRoot);
  const refs = buildPrimePathRefs(mgmtRoot);
  const today = todayISO();
  const date = today.replace(/-/g, '');

  const brief: DispatchBrief = {
    schema_version: '1.0',
    generated_at: new Date().toISOString(),
    repo: args.repo,
    from_session: args.fromSession,
    handoff_session_slug: args.session,
    risk: args.risk,
    orchestrator_agent: 181,
    paths: {
      ...refs,
      manifest_primary: contextManifestPath(mgmtRoot, args.repo, 'sunset', 'sunset', today),
      manifest_hub: hubContextManifestPath(mgmtRoot, args.repo, 'sunset', 'sunset', today),
      handoff_v3: join(mgmtRoot, args.project, 'docs', `handoff-${args.session}`),
    },
    waves: buildWaves(args, refs),
    compose_with: [
      refs.multiModelAssignmentSkill,
      refs.sessionChapterIndexSkill,
      refs.handoffCloudDirectSkill,
      refs.orchestratorContinuationSkill,
      join(mgmtRoot, 'documentation-standards/skills/exit/SKILL.md'),
    ],
  };

  await writeFile(args.out, `${JSON.stringify(brief, null, 2)}\n`, 'utf-8');
  await writeFile(args.markdown, `${toMarkdown(brief)}\n`, 'utf-8');
  log.success(`Wrote ${args.out}`);
  log.success(`Wrote ${args.markdown}`);
  log.info('Dispatch parallel lanes in one message — disjoint write_targets per wave-1 lane.');
}

main().catch((err: Error) => {
  log.error(err.message);
  process.exit(1);
});
