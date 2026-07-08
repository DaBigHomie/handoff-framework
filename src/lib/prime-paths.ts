/**
 * prime-paths.mts — Canonical Prime / CORTEX / handoff path builders.
 *
 * SSOT references:
 * - documentation-standards/docs/policies/handoff-cortex-ssot.md
 * - documentation-standards/templates/handoff/README.md
 */

import { join } from 'node:path';

export type PrimePathRefs = {
  mgmtRoot: string;
  docstd: string;
  handoffFramework: string;
  writeHandoffScript: string;
  handoffPolicy: string;
  handoffCloudDirectSkill: string;
  sessionChapterIndexSkill: string;
  multiModelAssignmentSkill: string;
  orchestratorContinuationSkill: string;
  handoffPromptSuite: string;
  promptOrchestrator: string;
  promptKnowledge: string;
  promptManifest: string;
  promptNextAgent: string;
  agentDispatchWorkflow: string;
};

export function buildPrimePathRefs(mgmtRoot: string): PrimePathRefs {
  const docstd = join(mgmtRoot, 'documentation-standards');
  const hf = join(mgmtRoot, 'handoff-framework');
  const handoffTemplates = join(docstd, 'templates/handoff');
  return {
    mgmtRoot,
    docstd,
    handoffFramework: hf,
    writeHandoffScript: join(docstd, 'scripts/write-handoff-to-cortex.mts'),
    handoffPolicy: join(docstd, 'docs/policies/handoff-cortex-ssot.md'),
    handoffCloudDirectSkill: join(docstd, 'skills/handoff-cloud-direct/SKILL.md'),
    sessionChapterIndexSkill: join(docstd, 'skills/session-chapter-index/SKILL.md'),
    multiModelAssignmentSkill: join(docstd, 'skills/multi-model-task-assignment/SKILL.md'),
    orchestratorContinuationSkill: join(docstd, 'skills/orchestrator-continuation/SKILL.md'),
    handoffPromptSuite: join(handoffTemplates, 'README.md'),
    promptOrchestrator: join(handoffTemplates, 'PROMPT-CORTEX-HANDOFF-ORCHESTRATOR.md'),
    promptKnowledge: join(handoffTemplates, 'PROMPT-CORTEX-KNOWLEDGE-ARTIFACT.md'),
    promptManifest: join(handoffTemplates, 'PROMPT-SESSION-HANDOFF-MANIFEST.md'),
    promptNextAgent: join(docstd, 'docs/PROMPT-NEXT-AGENT-HANDOFF.md'),
    agentDispatchWorkflow: join(hf, 'workflows/handoff-orchestrator-multi-agent.md'),
  };
}

export function cortexHandoffKey(repo: string, fromSession: string, date: string): string {
  return `handoff:${repo}:${fromSession}:${date}`;
}

export function cortexKnowledgeKey(sessionId: string, date: string): string {
  return `session:${sessionId}:knowledge-${date}`;
}

export function contextManifestPath(
  mgmtRoot: string,
  repo: string,
  slug: string,
  yyyymmdd: string,
): string {
  return join(
    mgmtRoot,
    repo,
    'docs/context-manifests',
    `SESSION-${repo}-${slug}-${yyyymmdd}.md`,
  );
}

export function hubContextManifestPath(
  mgmtRoot: string,
  repo: string,
  slug: string,
  yyyymmdd: string,
): string {
  return join(
    mgmtRoot,
    'documentation-standards',
    'docs/context-manifests',
    `SESSION-${repo}-${slug}-${yyyymmdd}.md`,
  );
}

export function cortexArchiveMirrorPath(
  mgmtRoot: string,
  repo: string,
  sessionId: string,
  slug: string,
): string {
  return join(
    mgmtRoot,
    repo,
    'docs/session-artifacts',
    sessionId,
    `CORTEX-ARCHIVE-${slug}.md`,
  );
}

export function owningRepoPlanPath(mgmtRoot: string, repo: string, planName: string): string {
  return join(mgmtRoot, repo, 'docs/plans', planName);
}

export function hubPlanPath(mgmtRoot: string, planName: string): string {
  return join(mgmtRoot, 'documentation-standards', 'docs/plans', planName);
}

export function handoffV3Folder(mgmtRoot: string, projectDirName: string, sessionSlug: string): string {
  return join(mgmtRoot, projectDirName, 'docs', `handoff-${sessionSlug}`);
}
