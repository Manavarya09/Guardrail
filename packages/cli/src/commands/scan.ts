import { resolve } from 'path';
import { GuardrailEngine, SEVERITY_ORDER } from '@guardrail/core';
import type { Severity } from '@guardrail/core';
import { builtinRules } from '@guardrail/rules';
import { formatSummary } from '../formatter.js';
import * as c from '../colors.js';

interface ScanOptions {
  severity?: string;
  json?: boolean;
  rules?: string;
}

export async function scanCommand(
  target: string,
  options: ScanOptions,
): Promise<void> {
  const cwd = process.cwd();
  const targetPath = resolve(cwd, target);

  console.log('');
  console.log(c.bold(c.cyan('  Guardrail')) + c.dim(' — scanning for issues...'));
  console.log(c.dim(`  Target: ${targetPath}`));
  console.log('');

  const engine = new GuardrailEngine({
    severityThreshold: (options.severity as Severity) ?? 'info',
  });

  // Register rules
  let rules = builtinRules;
  if (options.rules) {
    const ruleIds = new Set(options.rules.split(',').map((r) => r.trim()));
    rules = builtinRules.filter((r) => ruleIds.has(r.id));
  }
  engine.registerRules(rules);

  const summary = await engine.scan(targetPath);

  if (options.json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(formatSummary(summary, cwd));

  // Exit with non-zero code if critical/high issues found
  if (summary.bySeverity.critical > 0 || summary.bySeverity.high > 0) {
    process.exitCode = 1;
  }
}
