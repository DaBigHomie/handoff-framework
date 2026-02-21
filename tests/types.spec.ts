/**
 * types.spec.ts — Tests for shared types, constants, and template metadata
 *
 * Run: node --import tsx --test tests/types.spec.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DOC_CATEGORIES,
  DOC_CATEGORY_NAMES,
  DOC_CATEGORY_DESCRIPTIONS,
  DOC_CATEGORY_RANGES,
  getCategoryForSequence,
  CANONICAL_DOCS_BASE,
  CANONICAL_DOCS_PREFIX,
  CANONICAL_DOCS_PATH,
  buildDocsPath,
  REQUIRED_TEMPLATES,
  RECOMMENDED_TEMPLATES,
  PROJECT_SIZE_THRESHOLDS,
} from '../src/types.js';

// ─── DOC_CATEGORY_NAMES ─────────────────────────────────────────

describe('DOC_CATEGORY_NAMES', () => {
  it('has a name for every category', () => {
    for (const cat of DOC_CATEGORIES) {
      assert.ok(DOC_CATEGORY_NAMES[cat], `Missing name for ${cat}`);
    }
  });
});

describe('DOC_CATEGORY_DESCRIPTIONS', () => {
  it('has a description for every category', () => {
    for (const cat of DOC_CATEGORIES) {
      assert.ok(DOC_CATEGORY_DESCRIPTIONS[cat], `Missing description for ${cat}`);
    }
  });
});

// ─── DOC_CATEGORY_RANGES ────────────────────────────────────────

describe('DOC_CATEGORY_RANGES', () => {
  it('has a range for every category', () => {
    for (const cat of DOC_CATEGORIES) {
      const range = DOC_CATEGORY_RANGES[cat];
      assert.ok(range, `Missing range for ${cat}`);
      assert.ok(typeof range.min === 'number');
      assert.ok(typeof range.max === 'number');
      assert.ok(range.min <= range.max, `${cat} min > max`);
    }
  });

  it('context covers 0-2', () => {
    assert.equal(DOC_CATEGORY_RANGES.context.min, 0);
    assert.equal(DOC_CATEGORY_RANGES.context.max, 2);
  });

  it('session covers 3-5', () => {
    assert.equal(DOC_CATEGORY_RANGES.session.min, 3);
    assert.equal(DOC_CATEGORY_RANGES.session.max, 5);
  });

  it('findings covers 6-11', () => {
    assert.equal(DOC_CATEGORY_RANGES.findings.min, 6);
    assert.equal(DOC_CATEGORY_RANGES.findings.max, 11);
  });

  it('reference covers 12-14', () => {
    assert.equal(DOC_CATEGORY_RANGES.reference.min, 12);
    assert.equal(DOC_CATEGORY_RANGES.reference.max, 14);
  });

  it('ranges are contiguous (no gaps)', () => {
    const ordered = [...DOC_CATEGORIES];
    for (let i = 1; i < ordered.length; i++) {
      const prevMax = DOC_CATEGORY_RANGES[ordered[i - 1]].max;
      const currMin = DOC_CATEGORY_RANGES[ordered[i]].min;
      assert.equal(currMin, prevMax + 1, `Gap between ${ordered[i - 1]} and ${ordered[i]}`);
    }
  });
});

// ─── buildDocsPath ──────────────────────────────────────────────

describe('buildDocsPath', () => {
  it('returns docs/handoff when no slug', () => {
    assert.equal(buildDocsPath(), 'docs/handoff');
    assert.equal(buildDocsPath(undefined), 'docs/handoff');
  });

  it('returns docs/handoff-{slug} with slug', () => {
    assert.equal(buildDocsPath('20x-e2e-integration'), 'docs/handoff-20x-e2e-integration');
  });

  it('normalizes uppercase to lowercase', () => {
    assert.equal(buildDocsPath('My-Session'), 'docs/handoff-my-session');
  });

  it('replaces spaces and special chars with hyphens', () => {
    assert.equal(buildDocsPath('checkout refactor'), 'docs/handoff-checkout-refactor');
    assert.equal(buildDocsPath('db_migration!'), 'docs/handoff-db-migration');
  });

  it('collapses multiple hyphens', () => {
    assert.equal(buildDocsPath('a--b---c'), 'docs/handoff-a-b-c');
  });

  it('strips leading/trailing hyphens', () => {
    assert.equal(buildDocsPath('-test-'), 'docs/handoff-test');
  });
});

describe('CANONICAL_DOCS constants', () => {
  it('CANONICAL_DOCS_BASE is docs', () => {
    assert.equal(CANONICAL_DOCS_BASE, 'docs');
  });

  it('CANONICAL_DOCS_PREFIX is handoff', () => {
    assert.equal(CANONICAL_DOCS_PREFIX, 'handoff');
  });

  it('CANONICAL_DOCS_PATH is docs/handoff (deprecated)', () => {
    assert.equal(CANONICAL_DOCS_PATH, 'docs/handoff');
  });
});

// ─── REQUIRED_TEMPLATES ─────────────────────────────────────────

describe('REQUIRED_TEMPLATES', () => {
  it('has 6 required templates total', () => {
    assert.equal(REQUIRED_TEMPLATES.length, 6);
  });

  it('sequences 0-5 (context + session)', () => {
    const seqs = REQUIRED_TEMPLATES.map(t => t.sequence);
    assert.deepEqual(seqs, [0, 1, 2, 3, 4, 5]);
  });

  it('includes 00-MASTER_INDEX', () => {
    const t = REQUIRED_TEMPLATES.find(t => t.sequence === 0);
    assert.ok(t, 'Missing seq 0');
    assert.equal(t.slug, 'MASTER_INDEX');
    assert.equal(t.filename, '00-MASTER_INDEX');
    assert.equal(t.category, 'context');
    assert.equal(t.required, true);
  });

  it('includes 01-PROJECT_STATE', () => {
    const t = REQUIRED_TEMPLATES.find(t => t.sequence === 1);
    assert.ok(t, 'Missing seq 1');
    assert.equal(t.slug, 'PROJECT_STATE');
    assert.equal(t.category, 'context');
  });

  it('includes 02-CRITICAL_CONTEXT', () => {
    const t = REQUIRED_TEMPLATES.find(t => t.sequence === 2);
    assert.ok(t, 'Missing seq 2');
    assert.equal(t.slug, 'CRITICAL_CONTEXT');
    assert.equal(t.category, 'context');
  });

  it('includes 03-TASK_TRACKER', () => {
    const t = REQUIRED_TEMPLATES.find(t => t.sequence === 3);
    assert.ok(t, 'Missing seq 3');
    assert.equal(t.slug, 'TASK_TRACKER');
    assert.equal(t.category, 'session');
  });

  it('includes 04-SESSION_LOG', () => {
    const t = REQUIRED_TEMPLATES.find(t => t.sequence === 4);
    assert.ok(t, 'Missing seq 4');
    assert.equal(t.slug, 'SESSION_LOG');
    assert.equal(t.category, 'session');
  });

  it('includes 05-NEXT_STEPS', () => {
    const t = REQUIRED_TEMPLATES.find(t => t.sequence === 5);
    assert.ok(t, 'Missing seq 5');
    assert.equal(t.slug, 'NEXT_STEPS');
    assert.equal(t.category, 'session');
  });

  it('all are marked required', () => {
    for (const t of REQUIRED_TEMPLATES) {
      assert.equal(t.required, true, `${t.filename} should be required`);
    }
  });

  it('all have token budgets', () => {
    for (const t of REQUIRED_TEMPLATES) {
      assert.ok(t.tokenBudget > 0, `${t.filename} has no token budget`);
      assert.ok(t.maxLines > 0, `${t.filename} has no maxLines`);
    }
  });
});

// ─── RECOMMENDED_TEMPLATES ──────────────────────────────────────

describe('RECOMMENDED_TEMPLATES', () => {
  it('has 9 recommended templates total', () => {
    assert.equal(RECOMMENDED_TEMPLATES.length, 9);
  });

  it('sequences 6-14 (findings + reference)', () => {
    const seqs = RECOMMENDED_TEMPLATES.map(t => t.sequence);
    assert.deepEqual(seqs, [6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });

  it('all are marked not required', () => {
    for (const t of RECOMMENDED_TEMPLATES) {
      assert.equal(t.required, false, `${t.filename} should be optional`);
    }
  });

  it('includes 07-COMPONENT_MAP', () => {
    const t = RECOMMENDED_TEMPLATES.find(t => t.sequence === 7);
    assert.ok(t, 'Missing seq 7');
    assert.equal(t.slug, 'COMPONENT_MAP');
    assert.equal(t.category, 'findings');
  });

  it('includes 09-GAP_ANALYSIS', () => {
    const t = RECOMMENDED_TEMPLATES.find(t => t.sequence === 9);
    assert.ok(t, 'Missing seq 9');
    assert.equal(t.slug, 'GAP_ANALYSIS');
    assert.equal(t.category, 'findings');
  });

  it('includes 12-REFERENCE_MAP', () => {
    const t = RECOMMENDED_TEMPLATES.find(t => t.sequence === 12);
    assert.ok(t, 'Missing seq 12');
    assert.equal(t.slug, 'REFERENCE_MAP');
    assert.equal(t.category, 'reference');
  });

  it('includes 14-IMPROVEMENTS', () => {
    const t = RECOMMENDED_TEMPLATES.find(t => t.sequence === 14);
    assert.ok(t, 'Missing seq 14');
    assert.equal(t.slug, 'IMPROVEMENTS');
    assert.equal(t.category, 'reference');
  });

  it('total templates (required + recommended) = 15', () => {
    assert.equal(REQUIRED_TEMPLATES.length + RECOMMENDED_TEMPLATES.length, 15);
  });

  it('all categories align with getCategoryForSequence', () => {
    const all = [...REQUIRED_TEMPLATES, ...RECOMMENDED_TEMPLATES];
    for (const t of all) {
      const expected = getCategoryForSequence(t.sequence);
      assert.equal(t.category, expected, `${t.filename} category mismatch: ${t.category} vs ${expected}`);
    }
  });
});

// ─── PROJECT_SIZE_THRESHOLDS ────────────────────────────────────

describe('PROJECT_SIZE_THRESHOLDS', () => {
  it('has three tiers', () => {
    assert.ok(PROJECT_SIZE_THRESHOLDS.minimal);
    assert.ok(PROJECT_SIZE_THRESHOLDS.medium);
    assert.ok(PROJECT_SIZE_THRESHOLDS.large);
  });

  it('thresholds increase with size', () => {
    assert.ok(PROJECT_SIZE_THRESHOLDS.minimal.maxLoc < PROJECT_SIZE_THRESHOLDS.medium.maxLoc);
    assert.ok(PROJECT_SIZE_THRESHOLDS.medium.maxLoc < PROJECT_SIZE_THRESHOLDS.large.maxLoc);
  });

  it('required docs increase with size', () => {
    assert.ok(
      PROJECT_SIZE_THRESHOLDS.minimal.requiredDocs <= PROJECT_SIZE_THRESHOLDS.medium.requiredDocs,
    );
    assert.ok(
      PROJECT_SIZE_THRESHOLDS.medium.requiredDocs <= PROJECT_SIZE_THRESHOLDS.large.requiredDocs,
    );
  });
});
