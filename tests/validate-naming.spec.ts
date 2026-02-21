/**
 * validate-naming.spec.ts — Tests for numeric-first naming convention validation
 *
 * Run: node --import tsx --test tests/validate-naming.spec.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  NUMERIC_FILENAME_REGEX,
  FSD_FILENAME_REGEX,
  DOC_CATEGORIES,
  getCategoryForSequence,
  isValidISODate,
  todayISO,
} from '../src/types.js';

// ─── NUMERIC_FILENAME_REGEX (v2.1 format) ────────────────────────

describe('NUMERIC_FILENAME_REGEX', () => {
  const validFilenames = [
    '00-MASTER_INDEX_2026-02-20.md',
    '01-PROJECT_STATE_2026-02-20.md',
    '02-CRITICAL_CONTEXT_2026-01-15.md',
    '03-TASK_TRACKER_2026-02-20.md',
    '04-SESSION_LOG_2026-02-20.md',
    '05-NEXT_STEPS_2026-02-20.md',
    '06-ARCHITECTURE_2026-02-14.md',
    '07-COMPONENT_MAP_2026-02-13.md',
    '08-ROUTE_AUDIT_2026-02-13.md',
    '09-GAP_ANALYSIS_2026-02-14.md',
    '10-TEST_FRAMEWORK_2026-02-13.md',
    '11-SCRIPTS_REFERENCE_2026-02-20.md',
    '12-REFERENCE_MAP_2026-02-20.md',
    '13-AUDIT_PROMPTS_2026-02-20.md',
    '14-IMPROVEMENTS_2026-02-20.md',
  ];

  for (const name of validFilenames) {
    it(`accepts valid filename: ${name}`, () => {
      assert.ok(NUMERIC_FILENAME_REGEX.test(name), `Expected "${name}" to match`);
    });
  }

  const invalidFilenames = [
    '00-MASTER-HANDOFF-INDEX.md',            // v1 format (no date, hyphens in slug)
    'CO-00-MASTER_INDEX_2026-02-20.md',      // v2.0 FSD format (has prefix)
    '0-MASTER_INDEX_2026-02-20.md',          // single digit sequence
    '00-master_index_2026-02-20.md',         // lowercase slug
    '00-MASTER-INDEX_2026-02-20.md',         // hyphen in slug
    '00-MASTER_INDEX_26-02-20.md',           // 2-digit year
    '00-MASTER_INDEX_2026-2-20.md',          // single-digit month
    '00-MASTER_INDEX.md',                    // missing date
    '00-MASTER_INDEX_2026-02-20.txt',        // wrong extension
    'MASTER_INDEX.md',                        // no sequence
    '100-MASTER_INDEX_2026-02-20.md',        // 3-digit sequence
    '00-_LEADING_UNDER_2026-02-20.md',       // slug starts with underscore
    '00-3NUMERIC_START_2026-02-20.md',       // slug starts with digit
  ];

  for (const name of invalidFilenames) {
    it(`rejects invalid filename: ${name}`, () => {
      assert.ok(!NUMERIC_FILENAME_REGEX.test(name), `Expected "${name}" to NOT match`);
    });
  }
});

describe('NUMERIC_FILENAME_REGEX capture groups', () => {
  it('captures sequence, slug, and date', () => {
    const match = '00-MASTER_INDEX_2026-02-20.md'.match(NUMERIC_FILENAME_REGEX);
    assert.ok(match);
    assert.equal(match[1], '00');
    assert.equal(match[2], 'MASTER_INDEX');
    assert.equal(match[3], '2026-02-20');
  });

  it('captures multi-word slugs', () => {
    const match = '10-TEST_FRAMEWORK_2026-02-13.md'.match(NUMERIC_FILENAME_REGEX);
    assert.ok(match);
    assert.equal(match[1], '10');
    assert.equal(match[2], 'TEST_FRAMEWORK');
  });

  it('supports custom sequence numbers beyond 14', () => {
    const match = '99-CUSTOM_DOC_2026-03-01.md'.match(NUMERIC_FILENAME_REGEX);
    assert.ok(match);
    assert.equal(match[1], '99');
    assert.equal(match[2], 'CUSTOM_DOC');
  });
});

// ─── Legacy FSD_FILENAME_REGEX (migration support) ───────────────

describe('FSD_FILENAME_REGEX (legacy)', () => {
  it('still matches v2.0 format for migration', () => {
    assert.ok(FSD_FILENAME_REGEX.test('CO-00-MASTER_INDEX_2026-02-20.md'));
    assert.ok(FSD_FILENAME_REGEX.test('AR-01-SYSTEM_ARCHITECTURE_2026-02-14.md'));
    assert.ok(FSD_FILENAME_REGEX.test('RF-04-IMPROVEMENTS_2026-02-20.md'));
  });

  it('rejects v2.1 format (no prefix)', () => {
    assert.ok(!FSD_FILENAME_REGEX.test('00-MASTER_INDEX_2026-02-20.md'));
  });
});

// ─── getCategoryForSequence ──────────────────────────────────────

describe('getCategoryForSequence', () => {
  it('maps 00-02 to context', () => {
    assert.equal(getCategoryForSequence(0), 'context');
    assert.equal(getCategoryForSequence(1), 'context');
    assert.equal(getCategoryForSequence(2), 'context');
  });

  it('maps 03-05 to session', () => {
    assert.equal(getCategoryForSequence(3), 'session');
    assert.equal(getCategoryForSequence(4), 'session');
    assert.equal(getCategoryForSequence(5), 'session');
  });

  it('maps 06-11 to findings', () => {
    assert.equal(getCategoryForSequence(6), 'findings');
    assert.equal(getCategoryForSequence(7), 'findings');
    assert.equal(getCategoryForSequence(11), 'findings');
  });

  it('maps 12-14 to reference', () => {
    assert.equal(getCategoryForSequence(12), 'reference');
    assert.equal(getCategoryForSequence(13), 'reference');
    assert.equal(getCategoryForSequence(14), 'reference');
  });

  it('maps 15+ to reference (future docs)', () => {
    assert.equal(getCategoryForSequence(15), 'reference');
    assert.equal(getCategoryForSequence(99), 'reference');
  });
});

// ─── DOC_CATEGORIES ──────────────────────────────────────────────

describe('DOC_CATEGORIES', () => {
  it('contains exactly 4 categories', () => {
    assert.equal(DOC_CATEGORIES.length, 4);
  });

  it('contains context, session, findings, reference', () => {
    assert.deepEqual([...DOC_CATEGORIES], ['context', 'session', 'findings', 'reference']);
  });
});

// ─── isValidISODate ──────────────────────────────────────────────

describe('isValidISODate', () => {
  it('accepts valid dates', () => {
    assert.ok(isValidISODate('2026-02-20'));
    assert.ok(isValidISODate('2025-01-01'));
    assert.ok(isValidISODate('2026-12-31'));
  });

  it('rejects invalid dates', () => {
    assert.ok(!isValidISODate('2026-13-01'));   // month 13
    assert.ok(!isValidISODate('2026-02-30'));   // Feb 30
    assert.ok(!isValidISODate('26-02-20'));     // 2-digit year
    assert.ok(!isValidISODate('2026-2-20'));    // single-digit month
    assert.ok(!isValidISODate('not-a-date'));   // garbage
    assert.ok(!isValidISODate(''));             // empty
  });
});

describe('todayISO', () => {
  it('returns YYYY-MM-DD format', () => {
    const today = todayISO();
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns a valid date', () => {
    assert.ok(isValidISODate(todayISO()));
  });
});
