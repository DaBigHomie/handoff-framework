/**
 * types.spec.ts — Tests for shared types and constants
 *
 * Run: node --import tsx --test tests/types.spec.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FSD_CATEGORIES,
  FSD_CATEGORY_NAMES,
  FSD_CATEGORY_DESCRIPTIONS,
  CANONICAL_DOCS_PATH,
  REQUIRED_TEMPLATES,
  RECOMMENDED_TEMPLATES,
  PROJECT_SIZE_THRESHOLDS,
} from '../src/types.js';

describe('FSD_CATEGORY_NAMES', () => {
  it('has a name for every category', () => {
    for (const cat of FSD_CATEGORIES) {
      assert.ok(FSD_CATEGORY_NAMES[cat], `Missing name for ${cat}`);
    }
  });
});

describe('FSD_CATEGORY_DESCRIPTIONS', () => {
  it('has a description for every category', () => {
    for (const cat of FSD_CATEGORIES) {
      assert.ok(FSD_CATEGORY_DESCRIPTIONS[cat], `Missing description for ${cat}`);
    }
  });
});

describe('CANONICAL_DOCS_PATH', () => {
  it('is docs/handoff', () => {
    assert.equal(CANONICAL_DOCS_PATH, 'docs/handoff');
  });
});

describe('REQUIRED_TEMPLATES', () => {
  it('includes CO-00 (master index)', () => {
    const co00 = REQUIRED_TEMPLATES.find((t) => t.category === 'CO' && t.sequence === 0);
    assert.ok(co00, 'Missing CO-00');
    assert.equal(co00.slug, 'MASTER_INDEX');
    assert.equal(co00.required, true);
  });

  it('includes CO-01 (project state)', () => {
    const co01 = REQUIRED_TEMPLATES.find((t) => t.category === 'CO' && t.sequence === 1);
    assert.ok(co01, 'Missing CO-01');
  });

  it('includes CO-02 (critical context)', () => {
    const co02 = REQUIRED_TEMPLATES.find((t) => t.category === 'CO' && t.sequence === 2);
    assert.ok(co02, 'Missing CO-02');
  });

  it('includes CO-03 (task tracker)', () => {
    const co03 = REQUIRED_TEMPLATES.find((t) => t.category === 'CO' && t.sequence === 3);
    assert.ok(co03, 'Missing CO-03');
    assert.equal(co03.slug, 'TASK_TRACKER');
    assert.equal(co03.required, true);
  });

  it('includes OP-01 (deployment)', () => {
    const op01 = REQUIRED_TEMPLATES.find((t) => t.category === 'OP' && t.sequence === 1);
    assert.ok(op01, 'Missing OP-01');
  });

  it('includes QA-01 (testid framework)', () => {
    const qa01 = REQUIRED_TEMPLATES.find((t) => t.category === 'QA' && t.sequence === 1);
    assert.ok(qa01, 'Missing QA-01');
  });

  it('has 6 required templates total', () => {
    assert.equal(REQUIRED_TEMPLATES.length, 6);
  });

  it('all required templates have token budgets', () => {
    for (const t of REQUIRED_TEMPLATES) {
      assert.ok(t.tokenBudget > 0, `${t.filename} has no token budget`);
      assert.ok(t.maxLines > 0, `${t.filename} has no maxLines`);
    }
  });
});

describe('RECOMMENDED_TEMPLATES', () => {
  it('are all marked as not required', () => {
    for (const t of RECOMMENDED_TEMPLATES) {
      assert.equal(t.required, false);
    }
  });

  it('has 9 recommended templates total', () => {
    assert.equal(RECOMMENDED_TEMPLATES.length, 9);
  });

  it('includes AR-02 (component map)', () => {
    const ar02 = RECOMMENDED_TEMPLATES.find((t) => t.category === 'AR' && t.sequence === 2);
    assert.ok(ar02, 'Missing AR-02');
    assert.equal(ar02.slug, 'COMPONENT_MAP');
  });

  it('includes OP-02 (session log)', () => {
    const op02 = RECOMMENDED_TEMPLATES.find((t) => t.category === 'OP' && t.sequence === 2);
    assert.ok(op02, 'Missing OP-02');
    assert.equal(op02.slug, 'SESSION_LOG');
  });

  it('includes OP-03 (scripts reference)', () => {
    const op03 = RECOMMENDED_TEMPLATES.find((t) => t.category === 'OP' && t.sequence === 3);
    assert.ok(op03, 'Missing OP-03');
    assert.equal(op03.slug, 'SCRIPTS_REFERENCE');
  });

  it('includes QA-02 (gap analysis)', () => {
    const qa02 = RECOMMENDED_TEMPLATES.find((t) => t.category === 'QA' && t.sequence === 2);
    assert.ok(qa02, 'Missing QA-02');
    assert.equal(qa02.slug, 'GAP_ANALYSIS');
  });

  it('includes RF-02 (route audit)', () => {
    const rf02 = RECOMMENDED_TEMPLATES.find((t) => t.category === 'RF' && t.sequence === 2);
    assert.ok(rf02, 'Missing RF-02');
    assert.equal(rf02.slug, 'ROUTE_AUDIT');
  });

  it('includes RF-03 (audit prompts)', () => {
    const rf03 = RECOMMENDED_TEMPLATES.find((t) => t.category === 'RF' && t.sequence === 3);
    assert.ok(rf03, 'Missing RF-03');
    assert.equal(rf03.slug, 'AUDIT_PROMPTS');
  });

  it('includes RF-04 (improvements)', () => {
    const rf04 = RECOMMENDED_TEMPLATES.find((t) => t.category === 'RF' && t.sequence === 4);
    assert.ok(rf04, 'Missing RF-04');
    assert.equal(rf04.slug, 'IMPROVEMENTS');
  });

  it('total templates (required + recommended) = 15', () => {
    assert.equal(REQUIRED_TEMPLATES.length + RECOMMENDED_TEMPLATES.length, 15);
  });
});

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
