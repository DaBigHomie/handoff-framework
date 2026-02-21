#!/usr/bin/env node

/**
 * handoff — CLI entry point for @dabighomie/handoff-framework
 *
 * Usage:
 *   handoff init <project-name>        — Scaffold docs/handoff/ with FSD templates
 *   handoff generate <project-name>    — Auto-generate CO-01 PROJECT_STATE
 *   handoff validate <project-name>    — Validate docs quality (7-point scoring)
 *   handoff validate:naming <project>  — Validate FSD naming conventions
 *   handoff migrate <project-name>     — Migrate v1 docs to v2 naming
 *   handoff version                    — Show framework version
 *   handoff help                       — Show usage
 *
 * Requires: Node.js >= 18, tsx installed
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, '..', 'src');

const args = process.argv.slice(2);
const command = args[0] || 'help';

const COMMANDS = {
  init: 'init-project.mts',
  generate: 'generate-state.mts',
  validate: 'validate-docs.mts',
  'validate:naming': 'validate-naming.mts',
  migrate: 'migrate-existing.mts',
  version: 'cli.mts',
  help: 'cli.mts',
};

function run() {
  const scriptFile = COMMANDS[command];
  if (!scriptFile) {
    console.error(`Unknown command: ${command}`);
    console.error(`Available: ${Object.keys(COMMANDS).join(', ')}`);
    process.exit(1);
  }

  const scriptPath = join(srcDir, scriptFile);
  const restArgs = args.slice(1).join(' ');

  try {
    execSync(`node --import tsx "${scriptPath}" ${command} ${restArgs}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch (error) {
    process.exit(error.status || 1);
  }
}

run();
