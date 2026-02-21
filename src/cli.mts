#!/usr/bin/env node --no-warnings
/**
 * cli.mts — CLI entry point for the Handoff Framework
 *
 * Usage: npx tsx src/cli.mts <command> [args]
 *
 * Commands:
 *   init <project>       Initialize handoff docs in a project
 *   generate <project>   Auto-generate CO-01-PROJECT_STATE
 *   validate <project>   Validate doc standards and naming
 *   migrate <project>    Migrate v1 docs to v2 FSD naming
 *   version              Show framework version
 *   help                 Show help
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { log } from './utils.js';
import { getVersionString, VERSION } from './version.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMMANDS: Record<string, { description: string; usage: string; script: string }> = {
  init: {
    description: 'Initialize handoff docs in a project (creates docs/handoff/ with FSD templates)',
    usage: 'npx tsx src/cli.mts init <project-name>',
    script: 'init-project.mts',
  },
  generate: {
    description: 'Auto-generate CO-01-PROJECT_STATE from codebase analysis',
    usage: 'npx tsx src/cli.mts generate <project-name>',
    script: 'generate-state.mts',
  },
  validate: {
    description: 'Validate handoff docs (naming convention, quality, completeness)',
    usage: 'npx tsx src/cli.mts validate <project-name>',
    script: 'validate-docs.mts',
  },
  'validate:naming': {
    description: 'Validate FSD naming convention only',
    usage: 'npx tsx src/cli.mts validate:naming <project-name>',
    script: 'validate-naming.mts',
  },
  migrate: {
    description: 'Migrate v1 handoff docs to v2 FSD naming convention',
    usage: 'npx tsx src/cli.mts migrate <project-name>',
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
  console.log('Usage: npx tsx src/cli.mts <command> [project-name]');
  console.log('');
  console.log('Commands:');
  for (const [name, cmd] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(20)} ${cmd.description}`);
  }
  console.log('');
  console.log('Examples:');
  console.log('  npx tsx src/cli.mts init damieus-com-migration');
  console.log('  npx tsx src/cli.mts validate one4three-co-next-app');
  console.log('  npx tsx src/cli.mts generate flipflops-sundays-reboot');
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
