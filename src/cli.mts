#!/usr/bin/env node --no-warnings
/**
 * cli.mts — CLI entry point for the Handoff Framework
 *
 * Usage: npx tsx src/cli.mts <command> [args]
 *
 * Commands:
 *   init <project> [--session <slug>] [--tags <csv>]  Initialize handoff docs
 *   generate <project> [--session <slug>]              Auto-generate 01-PROJECT_STATE
 *   validate <project> [--session <slug>]              Validate doc standards and naming
 *   migrate <project> [--session <slug>]               Migrate legacy docs to numeric naming
 *   tag-index <project>                                Generate cross-session tag index
 *   version                                            Show framework version
 *   help                                               Show help
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { log } from './utils.js';
import { getVersionString, VERSION } from './version.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMMANDS: Record<string, { description: string; usage: string; script: string }> = {
  init: {
    description: 'Initialize handoff docs (creates docs/handoff-{session}/ with numbered templates)',
    usage: 'npx tsx src/cli.mts init <project-name> [--session <slug>] [--tags <csv>]',
    script: 'init-project.mts',
  },
  'tag-index': {
    description: 'Generate cross-session tag index (scans all handoff-* folders)',
    usage: 'npx tsx src/cli.mts tag-index <project-name>',
    script: 'tag-index.mts',
  },
  generate: {
    description: 'Auto-generate 01-PROJECT_STATE from codebase analysis',
    usage: 'npx tsx src/cli.mts generate <project-name> [--session <slug>]',
    script: 'generate-state.mts',
  },
  validate: {
    description: 'Validate handoff docs (naming convention, quality, completeness)',
    usage: 'npx tsx src/cli.mts validate <project-name> [--session <slug>]',
    script: 'validate-docs.mts',
  },
  'validate:naming': {
    description: 'Validate numeric naming convention only',
    usage: 'npx tsx src/cli.mts validate:naming <project-name> [--session <slug>]',
    script: 'validate-naming.mts',
  },
  migrate: {
    description: 'Migrate legacy (v1/FSD) docs to numeric naming convention',
    usage: 'npx tsx src/cli.mts migrate <project-name> [--session <slug>]',
    script: 'migrate-existing.mts',
  },
  version: {
    description: 'Show framework version',
    usage: 'npx tsx src/cli.mts version',
    script: '',
  },
  help: {
    description: 'Show this help message',
    usage: 'npx tsx src/cli.mts help',
    script: '',
  },
};

function showHelp(): void {
  console.log('');
  log.header(`Handoff Framework v${VERSION}`);
  console.log('Usage: npx tsx src/cli.mts <command> [project-name] [--session <slug>] [--tags <csv>]');
  console.log('');
  console.log('Commands:');
  for (const [name, cmd] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(20)} ${cmd.description}`);
  }
  console.log('');
  console.log('Options:');
  console.log('  --session <slug>    Session name for folder (e.g. "20x-e2e-integration")');
  console.log('                      Creates: docs/handoff-{slug}/ instead of docs/handoff/');
  console.log('  --tags <csv>        Comma-separated topic tags (e.g. "checkout,stripe,db-migration")');
  console.log('                      Tags are added to YAML frontmatter in each generated doc');
  console.log('');
  console.log('Examples:');
  console.log('  npx tsx src/cli.mts init damieus-com-migration --session 20x-e2e-integration');
  console.log('  npx tsx src/cli.mts init damieus-com-migration --session checkout --tags checkout,stripe,payments');
  console.log('  npx tsx src/cli.mts init one4three-co-next-app');
  console.log('  npx tsx src/cli.mts tag-index damieus-com-migration');
  console.log('  npx tsx src/cli.mts validate flipflops-sundays-reboot --session checkout-refactor');
  console.log('  npx tsx src/cli.mts version');
  console.log('');
}

async function main(): Promise<void> {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  if (command === 'version' || command === '--version' || command === '-v') {
    console.log(getVersionString());
    return;
  }

  const cmd = COMMANDS[command];
  if (!cmd) {
    log.error(`Unknown command: "${command}"`);
    showHelp();
    process.exit(1);
  }

  if (!cmd.script) {
    showHelp();
    return;
  }

  // Re-invoke the specific script with the remaining args
  const scriptPath = join(__dirname, cmd.script);
  const { execAsync } = await import('./utils.js');

  try {
    const fullArgs = [scriptPath, ...args].map((a) => `"${a}"`).join(' ');
    const { stdout, stderr } = await execAsync(`npx tsx ${fullArgs}`, {
      cwd: join(__dirname, '..'),
      env: { ...process.env },
    });
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
  } catch (err: unknown) {
    const execErr = err as { stdout?: string; stderr?: string; code?: number };
    if (execErr.stdout) process.stdout.write(execErr.stdout);
    if (execErr.stderr) process.stderr.write(execErr.stderr);
    process.exit(execErr.code || 1);
  }
}

main().catch((err) => {
  log.error(`CLI error: ${err.message}`);
  process.exit(1);
});
