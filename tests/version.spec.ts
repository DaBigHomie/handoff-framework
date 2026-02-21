/**
 * version.spec.ts — Tests for version management
 *
 * Run: node --import tsx --test tests/version.spec.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VERSION, VERSION_DATE, FRAMEWORK_NAME, getVersionInfo, getVersionString } from '../src/version.js';

describe('VERSION constants', () => {
  it('VERSION matches semver format', () => {
    assert.match(VERSION, /^\d+\.\d+\.\d+$/);
  });

  it('VERSION_DATE matches ISO format', () => {
    assert.match(VERSION_DATE, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('FRAMEWORK_NAME is scoped package name', () => {
    assert.equal(FRAMEWORK_NAME, '@dabighomie/handoff-framework');
  });
});

describe('getVersionInfo', () => {
  it('returns correct structure', () => {
    const info = getVersionInfo();
    assert.equal(info.version, VERSION);
    assert.equal(info.date, VERSION_DATE);
    assert.equal(info.name, FRAMEWORK_NAME);
    assert.equal(typeof info.major, 'number');
    assert.equal(typeof info.minor, 'number');
    assert.equal(typeof info.patch, 'number');
  });

  it('parses semver components correctly', () => {
    const info = getVersionInfo();
    const [major, minor, patch] = VERSION.split('.').map(Number);
    assert.equal(info.major, major);
    assert.equal(info.minor, minor);
    assert.equal(info.patch, patch);
  });
});

describe('getVersionString', () => {
  it('includes package name, version, and date', () => {
    const str = getVersionString();
    assert.ok(str.includes(FRAMEWORK_NAME));
    assert.ok(str.includes(VERSION));
    assert.ok(str.includes(VERSION_DATE));
  });

  it('follows format: name@version (date)', () => {
    const str = getVersionString();
    assert.match(str, /^@[\w/-]+@\d+\.\d+\.\d+ \(\d{4}-\d{2}-\d{2}\)$/);
  });
});
