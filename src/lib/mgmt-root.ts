/**
 * mgmt-root.mts — Portable Management Git workspace root resolution.
 */

import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CANDIDATE_DIR_NAMES = ['Management Git', 'management-git'] as const;

export function resolveMgmtRoot(explicit?: string): string {
  if (explicit && existsSync(explicit)) return explicit;
  if (process.env.MGMT_ROOT && existsSync(process.env.MGMT_ROOT)) {
    return process.env.MGMT_ROOT;
  }
  const home = homedir();
  for (const name of CANDIDATE_DIR_NAMES) {
    const candidate = join(home, name);
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(
    'MGMT_ROOT not set and neither ~/Management Git nor ~/management-git exists. ' +
      'Export MGMT_ROOT to the workspace sibling-clones root.',
  );
}
