#!/usr/bin/env -S npx tsx
/**
 * emit-handoff-tasklist.mts — READ-ONLY formatted handoff task list.
 *
 * Emits the Sunset Handoff 3.0 execution DAG as a formatted, numbered
 * task-list (Markdown checklist) to STDOUT. Deterministic and side-effect
 * free: it READS parameters + canonical paths and PRINTS. It NEVER writes
 * files, never mutates CORTEX, never touches git. Safe to automate (CI,
 * /loop, orchestrator boot).
 *
 * `--repos` is a VARIABLE (comma-separated touched-repo list).
 *
 * Usage:
 *   npx tsx src/emit-handoff-tasklist.mts --repos="$REPOS" [--from-session=<id>] \
 *     [--session-path=<dir>] [--risk=low|medium|high|critical] [--format=md|plain]
 *
 * Exit codes: 0 = printed, 2 = arg error.
 */

import { resolveMgmtRoot } from './lib/mgmt-root.js';
import { buildPrimePathRefs } from './lib/prime-paths.js';

type Risk = 'low' | 'medium' | 'high' | 'critical';

type Args = {
  repos: string[];
  fromSession: string;
  sessionPath?: string;
  risk: Risk;
  format: 'md' | 'plain';
  mgmtRoot?: string;
};

function parseArgs(argv: string[]): Args {
  const get = (p: string) => argv.find((a) => a.startsWith(`${p}=`))?.slice(p.length + 1);
  const reposRaw = get('--repos');
  const riskRaw = (get('--risk') ?? 'medium') as Risk;
  const fmtRaw = (get('--format') ?? 'md') as 'md' | 'plain';
  return {
    repos: reposRaw ? reposRaw.split(',').map((r) => r.trim()).filter(Boolean) : [],
    fromSession: get('--from-session') ?? '<from_session_id>',
    sessionPath: get('--session-path'),
    risk: (['low', 'medium', 'high', 'critical'] as const).includes(riskRaw) ? riskRaw : 'medium',
    format: fmtRaw === 'plain' ? 'plain' : 'md',
    mgmtRoot: get('--mgmt-root'),
  };
}

type Task = { id: string; title: string; cmd?: string; agent?: string; readonly: boolean };
type Wave = { wave: string; name: string; tasks: Task[] };

function buildWaves(args: Args, refs: ReturnType<typeof buildPrimePathRefs>): Wave[] {
  const reposArg = args.repos.length ? args.repos.join(',') : '$REPOS';
  const hf = refs.handoffFramework;
  const scopeTarget = args.sessionPath ? `--session-path=${args.sessionPath}` : `--repos="${reposArg}"`;

  return [
    {
      wave: '0',
      name: 'Markers (read-only)',
      tasks: [
        {
          id: 'T0.1',
          title: 'Generate session markers (chapters, threads, artifact pointers)',
          agent: '181',
          readonly: true,
          cmd: `# read-only pass per ${refs.sessionChapterIndexSkill}`,
        },
      ],
    },
    {
      wave: '1',
      name: 'Author (parallel — disjoint write targets)',
      tasks: [
        {
          id: 'T1.1',
          title: 'Scaffold one sunset manifest per touched repo',
          agent: '180',
          readonly: false,
          cmd: `cd "${hf}" && npx tsx src/scaffold-sunset-handoffs.mts --from-session=${args.fromSession} --repos="${reposArg}" --scope=sunset --description=<slug>${args.sessionPath ? ` --session-path=${args.sessionPath}` : ''}`,
        },
        {
          id: 'T1.2',
          title: 'Author CORTEX knowledge archive per scope',
          agent: '590',
          readonly: false,
          cmd: `# use ${refs.promptKnowledge}`,
        },
      ],
    },
    {
      wave: '2',
      name: 'Validate (gate — must PASS before CORTEX write)',
      tasks: [
        {
          id: 'T2.1',
          title: 'Validate v3.1 manifests (filename + frontmatter + Change Log)',
          agent: '594',
          readonly: true,
          cmd: `cd "${hf}" && npx tsx src/validate-session-manifests.mts ${scopeTarget}`,
        },
        {
          id: 'T2.2',
          title: 'Validate v3 doc set + naming',
          agent: '594',
          readonly: true,
          cmd: `cd "${hf}" && npx tsx src/validate-docs.mts <project> --session <slug> && npx tsx src/validate-naming.mts <project> --session <slug>`,
        },
      ],
    },
    {
      wave: '3',
      name: 'CORTEX SSOT write (orchestrator + human review)',
      tasks: [
        {
          id: 'T3.1',
          title: 'Build CORTEX payload JSON',
          agent: '181',
          readonly: false,
          cmd: `cd "${hf}" && npx tsx src/build-cortex-payload.mts --repo=<repo> --from-session=${args.fromSession} --project=<folder> --session=<slug> --out=./.handoff-work/<slug>/handoff.json`,
        },
        {
          id: 'T3.2',
          title: 'Dry-run CORTEX write (mandatory review)',
          agent: '181',
          readonly: true,
          cmd: `npx tsx "${refs.writeHandoffScript}" --repo=<repo> --from-session=${args.fromSession} --payload-file=./handoff.json --dry-run`,
        },
        {
          id: 'T3.3',
          title: 'HUMAN: review dry-run, then apply',
          agent: 'human',
          readonly: false,
          cmd: `npx tsx "${refs.writeHandoffScript}" --repo=<repo> --from-session=${args.fromSession} --payload-file=./handoff.json --apply`,
        },
      ],
    },
    {
      wave: '4',
      name: `40x review panel (only when risk = high | critical; current: ${args.risk})`,
      tasks: [
        {
          id: 'T4.1',
          title: 'Dispatch 5-agent review panel (5, 81, 84, 161, 180)',
          agent: '181',
          readonly: true,
          cmd:
            args.risk === 'high' || args.risk === 'critical'
              ? `cd "${hf}" && npx tsx src/emit-agent-dispatch.mts --repo=<repo> --from-session=${args.fromSession} --project=<folder> --session=<slug> --risk=${args.risk}`
              : 'SKIP — risk below high',
        },
      ],
    },
  ];
}

function renderMarkdown(args: Args, waves: Wave[]): string {
  const lines: string[] = [];
  lines.push('# Handoff Sunset 3.0 — Execution Task List');
  lines.push('');
  lines.push('> READ-ONLY plan. Agents EXECUTE these framework scripts; they do NOT edit the framework.');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('|-------|-------|');
  lines.push(`| Session | \`${args.fromSession}\` |`);
  lines.push(`| Repos (\`--repos\`) | \`${args.repos.length ? args.repos.join(', ') : '$REPOS'}\` |`);
  lines.push(`| Scope target | \`${args.sessionPath ? args.sessionPath : 'docs/session-manifests (derived)'}\` |`);
  lines.push(`| Risk | \`${args.risk}\` |`);
  lines.push('');
  for (const w of waves) {
    lines.push(`## Wave ${w.wave} — ${w.name}`);
    lines.push('');
    for (const t of w.tasks) {
      const tags = `${t.agent ? `Agent ${t.agent}` : ''}${t.agent ? ' · ' : ''}${t.readonly ? 'read-only' : 'writes'}`;
      lines.push(`- [ ] **${t.id}** ${t.title}  _(${tags})_`);
      if (t.cmd) {
        lines.push('');
        lines.push('  ```bash');
        lines.push(`  ${t.cmd}`);
        lines.push('  ```');
      }
    }
    lines.push('');
  }
  lines.push('---');
  lines.push('_Emitted by `emit-handoff-tasklist.mts` (read-only). Framework is execute-only — see `AGENTS.md`._');
  return lines.join('\n');
}

function renderPlain(args: Args, waves: Wave[]): string {
  const lines: string[] = [];
  lines.push('HANDOFF SUNSET 3.0 — EXECUTION TASK LIST (READ-ONLY)');
  lines.push(`session=${args.fromSession} repos=${args.repos.join(',') || '$REPOS'} risk=${args.risk}`);
  for (const w of waves) {
    lines.push('');
    lines.push(`WAVE ${w.wave} — ${w.name}`);
    for (const t of w.tasks) {
      lines.push(`  [ ] ${t.id} ${t.title}${t.agent ? ` (agent ${t.agent}, ${t.readonly ? 'ro' : 'rw'})` : ''}`);
      if (t.cmd) lines.push(`        $ ${t.cmd}`);
    }
  }
  return lines.join('\n');
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const mgmtRoot = resolveMgmtRoot(args.mgmtRoot);
  const refs = buildPrimePathRefs(mgmtRoot);
  const waves = buildWaves(args, refs);
  const out = args.format === 'plain' ? renderPlain(args, waves) : renderMarkdown(args, waves);
  process.stdout.write(out + '\n');
}

main();
