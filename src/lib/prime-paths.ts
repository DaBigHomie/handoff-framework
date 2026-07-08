/**
 * prime-paths.ts — Canonical Prime / CORTEX / handoff path builders.
 *
 * SSOT references:
 * - documentation-standards/templates/handoff/NAMING-CONVENTIONS.md (v3.1)
 * - documentation-standards/docs/policies/handoff-cortex-ssot.md
 * - documentation-standards/docs/policies/session-naming-schema.md
 */

import { join } from 'node:path';

export type HandoffScope = 'sunset' | 'chapter' | 'thread' | 'session' | 'index';

export const SESSION_MANIFESTS_SUBDIR = 'docs/session-manifests';

export type PrimePathRefs = {
  mgmtRoot: string;
  docstd: string;
  handoffFramework: string;
  writeHandoffScript: string;
  handoffPolicy: string;
  handoffNaming: string;
  handoffCloudDirectSkill: string;
  handoffSunsetV30Skill: string;
  sessionChapterIndexSkill: string;
  multiModelAssignmentSkill: string;
  orchestratorContinuationSkill: string;
  handoffPromptSuite: string;
  promptOrchestrator: string;
  promptKnowledge: string;
  promptManifest: string;
  promptSunset: string;
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
    handoffNaming: join(handoffTemplates, 'NAMING-CONVENTIONS.md'),
    handoffCloudDirectSkill: join(docstd, 'skills/handoff-cloud-direct/SKILL.md'),
    handoffSunsetV30Skill: join(docstd, 'skills/handoff-sunset-v30/SKILL.md'),
    sessionChapterIndexSkill: join(docstd, 'skills/session-chapter-index/SKILL.md'),
    multiModelAssignmentSkill: join(docstd, 'skills/multi-model-task-assignment/SKILL.md'),
    orchestratorContinuationSkill: join(docstd, 'skills/orchestrator-continuation/SKILL.md'),
    handoffPromptSuite: join(handoffTemplates, 'README.md'),
    promptOrchestrator: join(handoffTemplates, 'PROMPT-CORTEX-HANDOFF-ORCHESTRATOR.md'),
    promptKnowledge: join(handoffTemplates, 'PROMPT-CORTEX-KNOWLEDGE-ARTIFACT.md'),
    promptManifest: join(handoffTemplates, 'PROMPT-SESSION-HANDOFF-MANIFEST.md'),
    promptSunset: join(handoffTemplates, 'PROMPT-SUNSET-HANDOFF-PROTOCOL.md'),
    promptNextAgent: join(docstd, 'docs/PROMPT-NEXT-AGENT-HANDOFF.md'),
    agentDispatchWorkflow: join(hf, 'workflows/handoff-orchestrator-multi-agent.md'),
  };
}

/** ISO date YYYY-MM-DD for CORTEX keys */
export function isoDateKey(isoOrDate: string): string {
  return isoOrDate.slice(0, 10);
}

/** Compact YYYYMMDD for manifest filenames */
export function compactDate(isoOrDate: string): string {
  return isoOrDate.slice(0, 10).replace(/-/g, '');
}

export function slugifyDescription(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function sanitizeCortexId(sessionId: string): string {
  // Filename-safe, hyphen-only per NAMING-CONVENTIONS (`:` and `_` → `-`).
  return sessionId
    .toLowerCase()
    .replace(/[:/\\@._]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** UTC datetime key YYYYMMDDTHHMMSS for manifest filenames */
export function manifestDatetimeKey(isoOrDate: string): string {
  if (isoOrDate.includes('T')) {
    const d = new Date(isoOrDate);
    if (!Number.isNaN(d.getTime())) {
      const p = (n: number) => String(n).padStart(2, '0');
      return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
    }
  }
  return `${compactDate(isoOrDate)}T000000`;
}

export function handoffTypeForScope(scope: HandoffScope): string {
  if (scope === 'index') return 'index';
  if (scope === 'session' || scope === 'sunset') return 'sunset';
  return scope;
}

/**
 * Scope segment for CORTEX handoff keys and filenames.
 * scopeRef: `sunset` | `ch-03` | `th-bg-v1-t1`
 */
export function normalizeScopeRef(scope: HandoffScope, scopeRef?: string): string {
  if (scope === 'session' || scope === 'sunset') return 'sunset';
  if (scope === 'index') return 'index';
  if (scopeRef && scopeRef.trim()) return scopeRef.trim();
  if (scope === 'chapter') return 'ch-00';
  return 'th-unknown';
}

export function defaultDescriptionForScope(scope: HandoffScope, scopeRef?: string): string {
  const segment = normalizeScopeRef(scope, scopeRef);
  if (scope === 'chapter' || scope === 'thread') return segment;
  if (scope === 'index') return 'multi-repo-session-index';
  return 'session-sunset';
}

/**
 * CORTEX handoff key — scope-aware (session-naming-schema aligned).
 * handoff:<repo>:<session_id>:<scope-segment>:<YYYY-MM-DD>
 */
export function cortexHandoffKey(
  repo: string,
  fromSession: string,
  scope: HandoffScope,
  scopeRef: string | undefined,
  dateIso: string,
): string {
  const segment = normalizeScopeRef(scope, scopeRef);
  return `handoff:${repo}:${fromSession}:${segment}:${isoDateKey(dateIso)}`;
}

/** Legacy flat key (deprecated — use cortexHandoffKey) */
export function cortexHandoffKeyLegacy(repo: string, fromSession: string, dateIso: string): string {
  return `handoff:${repo}:${fromSession}:${isoDateKey(dateIso)}`;
}

export function cortexKnowledgeKey(
  sessionId: string,
  scope: HandoffScope,
  scopeRef: string | undefined,
  dateIso: string,
): string {
  const segment = normalizeScopeRef(scope, scopeRef);
  if (scope === 'session' || scope === 'sunset') {
    return `session:${sessionId}:knowledge-${isoDateKey(dateIso)}`;
  }
  if (scope === 'chapter') {
    return `session:${sessionId}:knowledge-${segment}-${isoDateKey(dateIso)}`;
  }
  return `session:${sessionId}:knowledge-${segment}-${isoDateKey(dateIso)}`;
}

export function chapterIndexKey(sessionId: string, dateIso: string): string {
  return `session:${sessionId}:chapters-${isoDateKey(dateIso)}`;
}

/**
 * Manifest filename (v3.1 — not full path).
 * Pattern: datetime-description-repo-handoff-type-cortex-id.md
 */
export function manifestFilename(
  repo: string,
  scope: HandoffScope,
  scopeRef: string | undefined,
  dateIso: string,
  descriptionSlug?: string,
  cortexSessionId?: string,
): string {
  const dt = manifestDatetimeKey(dateIso);
  const desc = slugifyDescription(descriptionSlug ?? defaultDescriptionForScope(scope, scopeRef));
  const handoffType = handoffTypeForScope(scope);
  const cortexId = sanitizeCortexId(cortexSessionId ?? 'unknown');
  return `${dt}-${desc}-${repo}-${handoffType}-${cortexId}.md`;
}

export function sessionManifestPath(
  mgmtRoot: string,
  repo: string,
  scope: HandoffScope,
  scopeRef: string | undefined,
  dateIso: string,
  descriptionSlug?: string,
  cortexSessionId?: string,
): string {
  return join(
    mgmtRoot,
    repo,
    SESSION_MANIFESTS_SUBDIR,
    manifestFilename(repo, scope, scopeRef, dateIso, descriptionSlug, cortexSessionId),
  );
}

/** @deprecated Use sessionManifestPath — v3.1 name retained for callers during migration */
export function contextManifestPath(
  mgmtRoot: string,
  repo: string,
  scope: HandoffScope,
  scopeRef: string | undefined,
  dateIso: string,
  descriptionSlug?: string,
  cortexSessionId?: string,
): string {
  return sessionManifestPath(mgmtRoot, repo, scope, scopeRef, dateIso, descriptionSlug, cortexSessionId);
}

export function hubSessionIndexPath(
  mgmtRoot: string,
  sessionHash: string,
  dateIso: string,
  cortexSessionId?: string,
): string {
  return join(
    mgmtRoot,
    'documentation-standards',
    SESSION_MANIFESTS_SUBDIR,
    manifestFilename(
      'documentation-standards',
      'index',
      'index',
      dateIso,
      `multi-repo-session-index-${sessionHash}`,
      cortexSessionId ?? sessionHash,
    ),
  );
}

export function hubSessionManifestPath(
  mgmtRoot: string,
  repo: string,
  scope: HandoffScope,
  scopeRef: string | undefined,
  dateIso: string,
  descriptionSlug?: string,
  cortexSessionId?: string,
): string {
  return join(
    mgmtRoot,
    'documentation-standards',
    SESSION_MANIFESTS_SUBDIR,
    manifestFilename(repo, scope, scopeRef, dateIso, descriptionSlug, cortexSessionId),
  );
}

/** @deprecated Use hubSessionManifestPath */
export function hubContextManifestPath(
  mgmtRoot: string,
  repo: string,
  scope: HandoffScope,
  scopeRef: string | undefined,
  dateIso: string,
  descriptionSlug?: string,
  cortexSessionId?: string,
): string {
  return hubSessionManifestPath(mgmtRoot, repo, scope, scopeRef, dateIso, descriptionSlug, cortexSessionId);
}

export function cortexArchiveMirrorPath(
  mgmtRoot: string,
  repo: string,
  sessionId: string,
  scope: HandoffScope,
  scopeRef: string | undefined,
  slug: string,
): string {
  const base = join(mgmtRoot, repo, 'docs/session-artifacts', sessionId);
  const segment = normalizeScopeRef(scope, scopeRef);
  if (scope === 'chapter') {
    const nn = segment.replace(/^ch-/, '').padStart(2, '0');
    return join(base, `ch${nn}`, `CORTEX-ARCHIVE-${slug}.md`);
  }
  if (scope === 'thread') {
    const thSlug = segment.replace(/^th-/, '');
    return join(base, `th-${thSlug}`, `CORTEX-ARCHIVE-${slug}.md`);
  }
  return join(base, `CORTEX-ARCHIVE-${slug}.md`);
}

export function handoffV3Folder(
  mgmtRoot: string,
  projectDirName: string,
  sessionSlug: string,
  scope: HandoffScope,
  scopeRef?: string,
): string {
  const segment = normalizeScopeRef(scope, scopeRef);
  if (scope === 'chapter') {
    return join(mgmtRoot, projectDirName, 'docs', `handoff-${sessionSlug}-${segment}`);
  }
  if (scope === 'thread') {
    return join(mgmtRoot, projectDirName, 'docs', `handoff-${sessionSlug}-${segment}`);
  }
  return join(mgmtRoot, projectDirName, 'docs', `handoff-${sessionSlug}`);
}

export function owningRepoPlanPath(mgmtRoot: string, repo: string, planName: string): string {
  return join(mgmtRoot, repo, 'docs/plans', planName);
}

export function hubPlanPath(mgmtRoot: string, planName: string): string {
  return join(mgmtRoot, 'documentation-standards', 'docs/plans', planName);
}

export function deriveArtifactId(
  sessionId: string,
  kind: string,
  repo: string,
  ref: string,
  threadSlug?: string,
): string {
  if (threadSlug) {
    return `${sessionId}:thread:${threadSlug}:artifact:${kind}:${repo}:${ref}`;
  }
  return `${sessionId}:artifact:${kind}:${repo}:${ref}`;
}

export function deriveThreadId(sessionId: string, slug: string): string {
  return `${sessionId}:thread:${slug}`;
}

export function deriveChapterId(sessionId: string, nn: string, slug: string): string {
  return `${sessionId}:chapter:ch-${nn}-${slug}`;
}
