#!/usr/bin/env node

import { Command } from 'commander';
import { scanCommand } from './commands/scan.js';
import { fixCommand } from './commands/fix.js';

const program = new Command();

program
  .name('guardrail')
  .description(
    'Scan and fix AI-generated code for security, performance, and quality issues',
  )
  .version('0.1.0');

program
  .command('scan')
  .description('Scan a directory for code issues')
  .argument('[target]', 'Target directory to scan', '.')
  .option(
    '-s, --severity <level>',
    'Minimum severity to report (critical, high, warning, info)',
    'info',
  )
  .option('--json', 'Output results as JSON')
  .option(
    '--rules <rules>',
    'Comma-separated list of rule IDs to run',
  )
  .action(scanCommand);

program
  .command('fix')
  .description('Auto-fix issues in a directory')
  .argument('[target]', 'Target directory to fix', '.')
  .option('-d, --dry-run', 'Show diffs without applying changes')
  .option(
    '-s, --severity <level>',
    'Minimum severity to fix (critical, high, warning, info)',
    'info',
  )
  .option(
    '--rules <rules>',
    'Comma-separated list of rule IDs to fix',
  )
  .action(fixCommand);

program.parse();
