#!/usr/bin/env node

/**
 * handoff — CLI entry point for @dabighomie/handoff-framework
 *
 * Runs pre-compiled JS from dist/src/ — no tsx dependency needed.
 *
 * Usage:
 *   npx @dabighomie/handoff-framework init <project> --session <slug> --tags <csv>
 *   npx @dabighomie/handoff-framework generate <project> --session <slug>
 *   npx @dabighomie/handoff-framework validate <project> --session <slug>
 *   npx @dabighomie/handoff-framework validate:naming <project> --session <slug>
 *   npx @dabighomie/handoff-framework migrate <project> --session <slug>
 *   npx @dabighomie/handoff-framework tag-index <project>
 *   npx @dabighomie/handoff-framework version
 *   npx @dabighomie/handoff-framework help
 *
 * Requires: Node.js >= 18
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '..', 'dist', 'src');

const args = process.argv.slice(2);
const command = args[0] || 'help';

/**
 * Map command names to compiled module filenames.
 * Each module auto-executes main() on import.
 */
const COMMANDS = {
  init: 'init-project.mjs',
  generate: 'generate-state.mjs',
  validate: 'validate-docs.mjs',
  'validate:naming': 'validate-naming.mjs',
  migrate: 'migrate-existing.mjs',
  'tag-index': 'tag-index.mjs',
  version: null,
  help: null,
};

async function run() {
  // Handle version/help directly
  if (command === 'version' || command === '--version' || command === '-v') {
    const { getVersionString } = await import(join(distDir, 'version.js'));
    console.log(getVersionString());
    return;
  }

  if (command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  const scriptFile = COMMANDS[command];
  if (!scriptFile) {
    console.error(`Unknown command: ${command}`);
    console.error('');
    showHelp();
    process.exit(1);
  }

  // Sub-commands read process.argv.slice(2) expecting: [project-name, --session, ...]
  // Strip the command name from argv so the sub-command sees correct args.
  const scriptPath = join(distDir, scriptFile);
  const savedArgv = process.argv;
  process.argv = [process.argv[0], scriptPath, ...args.slice(1)];

  try {
    await import(scriptPath);
  } catch (error) {
    console.error(`Failed to run "${command}": ${error.message}`);
    process.exit(1);
  } finally {
    process.argv = savedArgv;
  }
}

function showHelp() {
  console.log('');
  console.log('@dabighomie/handoff-framework — Agent-to-agent handoff documentation');
  console.log('');
  console.log('Usage: handoff <command> [project-name] [--session <slug>] [--tags <csv>]');
  console.log('');
  console.log('Commands:');
  console.log('  init <project> [--session <slug>] [--tags <csv>]  Scaffold handoff docs');
  console.log('  generate <project> [--session <slug>]              Auto-generate PROJECT_STATE');
  console.log('  validate <project> [--session <slug>]              Validate doc standards');
  console.log('  validate:naming <project> [--session <slug>]       Validate file naming');
  console.log('  migrate <project> [--session <slug>]               Migrate legacy docs to v3');
  console.log('  tag-index <project>                                Generate tag index');
  console.log('  version                                            Show version');
  console.log('  help                                               Show this help');
  console.log('');
  console.log('Examples:');
  console.log('  npx @dabighomie/handoff-framework init my-project --session checkout-refactor --tags checkout,stripe');
  console.log('  npx @dabighomie/handoff-framework validate my-project --session checkout-refactor');
  console.log('  npx @dabighomie/handoff-framework tag-index my-project');
  console.log('');
}

run();
