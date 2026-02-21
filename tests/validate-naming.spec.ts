/**
 * validate-naming.spec.ts — Tests for FSD naming convention validation
 *
 * Run: node --import tsx --test tests/validate-naming.spec.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FSD_FILENAME_REGEX,
  FSD_CATEGORIES,
  isValidISODate,
  todayISO,
} from '../src/types.js';

describe('FSD_FILENAME_REGEX', () => {
  const validFilenames = [
    'CO-00-MASTER_INDEX_2026-02-20.md',
    'CO-01-PROJECT_STATE_2026-02-20.md',
    'CO-02-CRITICAL_CONTEXT_2026-01-15.md',
    'AR-01-SYSTEM_ARCHITECTURE_2026-02-14.md',
    'AR-03-COMPONENT_INTERACTION_MAP_2026-02-13.md',
    'OP-01-DEPLOYMENT_ROADMAP_2026-02-20.md',
    'OP-04-QUICK_START_2026-02-20.md',
    'QA-01-TESTID_FRAMEWORK_2026-02-13.md',
    'QA-02-GAP_ANALYSIS_2026-02-14.md',
    'RF-01-ROUTE_AUDIT_2026-02-13.md',
    'RF-07-INSTRUCTION_FILES_2026-02-20.md',
  ];

  for (const name of validFilenames) {
    it(`accepts valid filename: ${name}`, () => {
      assert.ok(FSD_FILENAME_REGEX.test(name), `Expected "${name}" to match`);
    });
  }

  const invalidFilenames = [
    '00-MASTER-HANDOFF-INDEX.md',            // v1 format
    'CO-0-MASTER_INDEX_2026-02-20.md',       // single digit sequence
    'CO-00-master_index_2026-02-20.md',      // lowercase slug
    'CO-00-MASTER-INDEX_2026-02-20.md',      // hyphen in slug
    'CO-00-MASTER_INDEX_26-02-20.md',        // 2-digit year
    'CO-00-MASTER_INDEX_2026-2-20.md',       // single-digit month
    'XX-00-MASTER_INDEX_2026-02-20.md',      // invalid prefix
    'CO-00-MASTER_INDEX.md',                 // missing date
    'CO-00-MASTER_INDEX_2026-02-20.txt',     // wrong extension
    'MASTER_INDEX.md',                        // no prefix/seq
    'CO-100-MASTER_INDEX_2026-02-20.md',     // 3-digit sequence
    'CO-00-_LEADING_UNDER_2026-02-20.md',    // slug starts with underscore
    'co-00-MASTER_INDEX_2026-02-20.md',      // lowercase prefix
  ];

  for (const name of invalidFilenames) {
    it(`rejects invalid filename: ${name}`, () => {
      assert.ok(!FSD_FILENAME_REGEX.test(name), `Expected "${name}" to NOT match`);
    });
  }
});

describe('FSD_FILENAME_REGEX capture groups', () => {
  it('captures category, sequence, slug, and date', () => {
    const match = 'CO-00-MASTER_INDEX_2026-02-20.md'.match(FSD_FILENAME_REGEX);
    assert.ok(match);
    assert.equal(match[1], 'CO');
    assert.equal(match[2], '00');
    assert.equal(match[3], 'MASTER_INDEX');
    assert.equal(match[4], '2026-02-20');
  });

  it('captures multi-word slugs', () => {
    const match = 'AR-03-COMPONENT_INTERACTION_MAP_2026-02-13.md'.match(FSD_FILENAME_REGEX);
    assert.ok(match);
    assert.equal(match[1], 'AR');
    assert.equal(match[3], 'COMPONENT_INTERACTION_MAP');
  });
});

describe('FSD_CATEGORIES', () => {
  it('contains exactly 5 categories', () => {
    assert.equal(FSD_CATEGORIES.length, 5);
  });

  it('contains CO, AR, OP, QA, RF', () => {
    assert.deepEqual([...FSD_CATEGORIES], ['CO', 'AR', 'OP', 'QA', 'RF']);
  });
});

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
