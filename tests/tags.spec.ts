/**
 * tags.spec.ts — Tests for tag-based multi-topic session support
 *
 * Covers: tag validation, frontmatter parsing/serialization, injection,
 * CLI --tags parsing, and buildDefaultFrontmatter.
 *
 * Run: node --import tsx --test tests/tags.spec.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TAG_SLUG_REGEX,
  isValidTag,
  getCategoryForSequence,
} from '../src/types.js';
import {
  parseFrontmatter,
  serializeFrontmatter,
  injectFrontmatter,
  buildDefaultFrontmatter,
  parseTagsArg,
} from '../src/utils.js';

// ─── TAG_SLUG_REGEX ──────────────────────────────────────────────

describe('TAG_SLUG_REGEX', () => {
  it('matches simple lowercase tags', () => {
    assert.ok(TAG_SLUG_REGEX.test('checkout'));
    assert.ok(TAG_SLUG_REGEX.test('stripe'));
    assert.ok(TAG_SLUG_REGEX.test('db'));
  });

  it('matches kebab-case tags', () => {
    assert.ok(TAG_SLUG_REGEX.test('checkout-flow'));
    assert.ok(TAG_SLUG_REGEX.test('db-migration'));
    assert.ok(TAG_SLUG_REGEX.test('e2e-tests'));
    assert.ok(TAG_SLUG_REGEX.test('a-b-c'));
  });

  it('matches tags with numbers', () => {
    assert.ok(TAG_SLUG_REGEX.test('v2'));
    assert.ok(TAG_SLUG_REGEX.test('phase-3'));
    assert.ok(TAG_SLUG_REGEX.test('20x'));
  });

  it('rejects uppercase', () => {
    assert.ok(!TAG_SLUG_REGEX.test('Checkout'));
    assert.ok(!TAG_SLUG_REGEX.test('DB-Migration'));
  });

  it('rejects spaces', () => {
    assert.ok(!TAG_SLUG_REGEX.test('checkout flow'));
  });

  it('rejects leading/trailing hyphens', () => {
    assert.ok(!TAG_SLUG_REGEX.test('-checkout'));
    assert.ok(!TAG_SLUG_REGEX.test('checkout-'));
  });

  it('rejects double hyphens', () => {
    assert.ok(!TAG_SLUG_REGEX.test('checkout--flow'));
  });

  it('rejects empty string', () => {
    assert.ok(!TAG_SLUG_REGEX.test(''));
  });
});

// ─── isValidTag ──────────────────────────────────────────────────

describe('isValidTag', () => {
  it('accepts valid tags', () => {
    assert.ok(isValidTag('checkout'));
    assert.ok(isValidTag('db-migration'));
    assert.ok(isValidTag('e2e'));
    assert.ok(isValidTag('phase-3'));
  });

  it('rejects tags shorter than 2 chars', () => {
    assert.ok(!isValidTag('a'));
    assert.ok(!isValidTag(''));
  });

  it('rejects tags longer than 50 chars', () => {
    const long = 'a'.repeat(51);
    assert.ok(!isValidTag(long));
  });

  it('accepts tags exactly 2 and 50 chars', () => {
    assert.ok(isValidTag('ab'));
    assert.ok(isValidTag('a'.repeat(50)));
  });

  it('rejects invalid format', () => {
    assert.ok(!isValidTag('UPPER'));
    assert.ok(!isValidTag('has spaces'));
    assert.ok(!isValidTag('-leading'));
  });
});

// ─── parseFrontmatter ────────────────────────────────────────────

describe('parseFrontmatter', () => {
  it('parses YAML frontmatter with tags', () => {
    const content = `---
tags: [checkout, stripe]
topic: "Payment flow"
created: "2026-02-20"
sequence: 3
category: "session"
---
# Title

Body content here.`;

    const { frontmatter, body } = parseFrontmatter(content);
    assert.ok(frontmatter !== null);
    assert.deepEqual(frontmatter!.tags, ['checkout', 'stripe']);
    assert.equal(frontmatter!.topic, 'Payment flow');
    assert.equal(frontmatter!.created, '2026-02-20');
    assert.equal(frontmatter!.sequence, 3);  // simple YAML parser preserves numbers
    assert.equal(frontmatter!.category, 'session');
    assert.ok(body.includes('# Title'));
    assert.ok(body.includes('Body content here.'));
  });

  it('parses empty tags array', () => {
    const content = `---
tags: []
topic: ""
created: "2026-02-20"
sequence: 0
category: "context"
---
# Content`;

    const { frontmatter } = parseFrontmatter(content);
    assert.ok(frontmatter !== null);
    assert.deepEqual(frontmatter!.tags, []);
  });

  it('returns null frontmatter for content without ---', () => {
    const content = `# Just a title\n\nSome content.`;
    const { frontmatter, body } = parseFrontmatter(content);
    assert.equal(frontmatter, null);
    assert.equal(body, content);
  });

  it('handles quoted tags', () => {
    const content = `---
tags: ["checkout-flow", "stripe"]
---
# Doc`;

    const { frontmatter } = parseFrontmatter(content);
    assert.ok(frontmatter !== null);
    assert.deepEqual(frontmatter!.tags, ['checkout-flow', 'stripe']);
  });
});

// ─── serializeFrontmatter ────────────────────────────────────────

describe('serializeFrontmatter', () => {
  it('serializes frontmatter with tags', () => {
    const fm = {
      tags: ['checkout', 'stripe'],
      topic: 'Payment flow',
      created: '2026-02-20',
      sequence: 3,
      category: 'session' as const,
    };

    const result = serializeFrontmatter(fm);
    assert.ok(result.startsWith('---\n'));
    assert.ok(result.endsWith('\n---'));
    assert.ok(result.includes('tags: [checkout, stripe]'));
    assert.ok(result.includes('topic: "Payment flow"'));
    assert.ok(result.includes('created: "2026-02-20"'));
    assert.ok(result.includes('sequence: 3'));
    assert.ok(result.includes('category: "session"'));
  });

  it('serializes empty tags array', () => {
    const fm = {
      tags: [],
      topic: '',
      created: '2026-02-20',
      sequence: 0,
      category: 'context' as const,
    };

    const result = serializeFrontmatter(fm);
    assert.ok(result.includes('tags: []'));
  });
});

// ─── injectFrontmatter ──────────────────────────────────────────

describe('injectFrontmatter', () => {
  it('prepends frontmatter to content without existing frontmatter', () => {
    const content = '# Title\n\nBody';
    const fm = {
      tags: ['checkout'],
      topic: '',
      created: '2026-02-20',
      sequence: 0,
      category: 'context' as const,
    };

    const result = injectFrontmatter(content, fm);
    assert.ok(result.startsWith('---\n'));
    assert.ok(result.includes('tags: [checkout]'));
    assert.ok(result.includes('# Title'));
    assert.ok(result.includes('Body'));
  });

  it('replaces existing frontmatter', () => {
    const content = `---
tags: []
topic: ""
created: "old"
sequence: 0
category: "context"
---
# Title

Body`;

    const fm = {
      tags: ['new-tag'],
      topic: 'New topic',
      created: '2026-02-20',
      sequence: 0,
      category: 'context' as const,
    };

    const result = injectFrontmatter(content, fm);
    assert.ok(result.includes('tags: [new-tag]'));
    assert.ok(result.includes('topic: "New topic"'));
    assert.ok(result.includes('# Title'));
    // Should not have double frontmatter
    const fmCount = (result.match(/^---$/gm) || []).length;
    assert.equal(fmCount, 2, 'Should have exactly one frontmatter block (2 --- markers)');
  });
});

// ─── buildDefaultFrontmatter ─────────────────────────────────────

describe('buildDefaultFrontmatter', () => {
  it('builds frontmatter with tags and correct category', () => {
    const fm = buildDefaultFrontmatter(3, '2026-02-20', ['checkout', 'stripe']);
    assert.deepEqual(fm.tags, ['checkout', 'stripe']);
    assert.equal(fm.sequence, 3);
    assert.equal(fm.created, '2026-02-20');
    assert.equal(fm.category, 'session'); // seq 3 is in session range
  });

  it('builds frontmatter for context category (seq 0)', () => {
    const fm = buildDefaultFrontmatter(0, '2026-02-20', []);
    assert.deepEqual(fm.tags, []);
    assert.equal(fm.category, 'context');
  });

  it('builds frontmatter for findings category (seq 9)', () => {
    const fm = buildDefaultFrontmatter(9, '2026-02-20', ['architecture']);
    assert.equal(fm.category, 'findings');
  });

  it('builds frontmatter for reference category (seq 13)', () => {
    const fm = buildDefaultFrontmatter(13, '2026-02-20', []);
    assert.equal(fm.category, 'reference');
  });
});

// ─── parseTagsArg ────────────────────────────────────────────────

describe('parseTagsArg', () => {
  it('parses --tags with comma-separated values', () => {
    const args = ['--tags', 'checkout,stripe,db-migration'];
    const { tags, remainingArgs } = parseTagsArg(args);
    assert.deepEqual(tags, ['checkout', 'stripe', 'db-migration']);
    assert.deepEqual(remainingArgs, []);
  });

  it('returns empty tags when --tags not present', () => {
    const args = ['some-project', '--session', 'slug'];
    const { tags, remainingArgs } = parseTagsArg(args);
    assert.deepEqual(tags, []);
    assert.deepEqual(remainingArgs, ['some-project', '--session', 'slug']);
  });

  it('preserves remaining args after extracting --tags', () => {
    const args = ['my-project', '--session', 'checkout', '--tags', 'stripe,payments'];
    const { tags, remainingArgs } = parseTagsArg(args);
    assert.deepEqual(tags, ['stripe', 'payments']);
    assert.deepEqual(remainingArgs, ['my-project', '--session', 'checkout']);
  });

  it('handles single tag', () => {
    const args = ['--tags', 'checkout'];
    const { tags } = parseTagsArg(args);
    assert.deepEqual(tags, ['checkout']);
  });

  it('trims whitespace from tags', () => {
    const args = ['--tags', ' checkout , stripe '];
    const { tags } = parseTagsArg(args);
    assert.deepEqual(tags, ['checkout', 'stripe']);
  });

  it('handles --tags at end without value gracefully', () => {
    const args = ['my-project', '--tags'];
    const { tags, remainingArgs } = parseTagsArg(args);
    assert.deepEqual(tags, []);
    // --tags without a value is kept in remaining args (not consumed)
    assert.deepEqual(remainingArgs, ['my-project', '--tags']);
  });
});
