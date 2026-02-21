#!/usr/bin/env node --no-warnings
/**
 * version-bump.mts — Bump framework version across all files
 *
 * Usage: npx tsx src/version-bump.mts [major|minor|patch]
 * Example: npx tsx src/version-bump.mts minor → 2.0.0 → 2.1.0
 *
 * Updates:
 *   - src/version.ts (VERSION, VERSION_DATE)
 *   - package.json (version)
 *   - CHANGELOG.md (adds new section)
 */

import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { log } from './utils.js';
import { VERSION } from './version.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

type BumpType = 'major' | 'minor' | 'patch';

function bumpVersion(current: string, type: BumpType): string {
  const [major, minor, patch] = current.split('.').map(Number);
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

async function main(): Promise<void> {
  const bumpType = process.argv[2] as BumpType | undefined;

  if (!bumpType || !['major', 'minor', 'patch'].includes(bumpType)) {
    log.error('Usage: npx tsx src/version-bump.mts [major|minor|patch]');
    console.log(`  Current version: ${VERSION}`);
    console.log('  major → next major (breaking changes)');
    console.log('  minor → next minor (new features)');
    console.log('  patch → next patch (bug fixes)');
    process.exit(1);
  }

  const newVersion = bumpVersion(VERSION, bumpType);
  const today = new Date().toISOString().split('T')[0];

  log.header(`Version Bump: ${VERSION} → ${newVersion}`);

  // 1. Update src/version.ts
  const versionTsPath = join(root, 'src', 'version.ts');
  let versionTs = await readFile(versionTsPath, 'utf-8');
  versionTs = versionTs.replace(
    `export const VERSION = '${VERSION}' as const;`,
    `export const VERSION = '${newVersion}' as const;`,
  );
  versionTs = versionTs.replace(
    /export const VERSION_DATE = '[\d-]+' as const;/,
    `export const VERSION_DATE = '${today}' as const;`,
  );
  await writeFile(versionTsPath, versionTs, 'utf-8');
  log.success(`Updated src/version.ts → ${newVersion}`);

  // 2. Update package.json
  const pkgPath = join(root, 'package.json');
  const pkgContent = await readFile(pkgPath, 'utf-8');
  const pkg = JSON.parse(pkgContent);
  pkg.version = newVersion;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  log.success(`Updated package.json → ${newVersion}`);

  // 3. Add CHANGELOG entry
  const changelogPath = join(root, 'CHANGELOG.md');
  let changelog = await readFile(changelogPath, 'utf-8');
  const newEntry = `\n## [${newVersion}] — ${today}\n\n### Added\n- [TODO: List new features]\n\n### Changed\n- [TODO: List changes]\n\n### Fixed\n- [TODO: List fixes]\n\n---\n`;
  changelog = changelog.replace(
    /\n---\n\n## \[/,
    `${newEntry}\n## [`,
  );
  await writeFile(changelogPath, changelog, 'utf-8');
  log.success(`Updated CHANGELOG.md with [${newVersion}] section`);

  console.log('');
  log.info('Next steps:');
  console.log(`  1. Edit CHANGELOG.md — fill in the [${newVersion}] section`);
  console.log('  2. git add -A && git commit -m "chore: bump version to ' + newVersion + '"');
  console.log(`  3. git tag v${newVersion}`);
  console.log(`  4. git push origin main --tags`);
}

main().catch((err) => {
  log.error(`Version bump failed: ${err.message}`);
  process.exit(1);
});
