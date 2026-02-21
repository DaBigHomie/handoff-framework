/**
 * version.ts — Single source of truth for framework version
 *
 * All scripts, templates, and configs reference this.
 * Bump via: npx tsx src/version-bump.mts [major|minor|patch]
 */

export const VERSION = '2.0.0' as const;
export const VERSION_DATE = '2026-02-20' as const;
export const FRAMEWORK_NAME = '@dabighomie/handoff-framework' as const;

export interface VersionInfo {
  version: typeof VERSION;
  date: typeof VERSION_DATE;
  name: typeof FRAMEWORK_NAME;
  major: number;
  minor: number;
  patch: number;
}

export function getVersionInfo(): VersionInfo {
  const [major, minor, patch] = VERSION.split('.').map(Number);
  return {
    version: VERSION,
    date: VERSION_DATE,
    name: FRAMEWORK_NAME,
    major,
    minor,
    patch,
  };
}

export function getVersionString(): string {
  return `${FRAMEWORK_NAME}@${VERSION} (${VERSION_DATE})`;
}
