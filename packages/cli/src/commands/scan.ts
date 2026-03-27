import { resolve, join } from 'path';
import { GuardrailEngine, loadConfig, mergeConfigs } from '@guardrail-ai/core';
import type { Severity } from '@guardrail-ai/core';
import { builtinRules } from '@guardrail-ai/rules';
import { formatSummary } from '../formatter.js';
import { generateHtmlReport } from '../reporters/html-reporter.js';
import * as c from '../colors.js';
import { printBanner } from '../banner.js';

interface ScanOptions {
  severity?: string;
  json?: boolean;
  report?: string;
  rules?: string;
}

export async function scanCommand(
  target: string,
  options: ScanOptions,
): Promise<void> {
  const cwd = process.cwd();
  const targetPath = resolve(cwd, target);

  if (!options.json) {
    printBanner();
    console.log(c.dim(`  Target: ${targetPath}`));
    console.log('');
  }

  const fileConfig = loadConfig(targetPath);
  const config = mergeConfigs(fileConfig, {
    severityThreshold: (options.severity as Severity) ?? undefined,
  });

  const engine = new GuardrailEngine(config);

  let rules = builtinRules;
  if (options.rules) {
    const ruleIds = new Set(options.rules.split(',').map((r) => r.trim()));
    rules = builtinRules.filter((r) => ruleIds.has(r.id));
  }
  engine.registerRules(rules);

  const start = performance.now();
  const summary = await engine.scan(targetPath);
  const elapsed = ((performance.now() - start) / 1000).toFixed(2);

  if (options.json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(formatSummary(summary, cwd, elapsed));

  // Generate HTML report if requested
  if (options.report === 'html') {
    const reportPath = join(cwd, 'guardrail-report.html');
    generateHtmlReport(summary, cwd, reportPath);
    console.log(c.green(`  HTML report saved to ${reportPath}`));
    console.log('');
  }

  if (summary.bySeverity.critical > 0 || summary.bySeverity.high > 0) {
    process.exitCode = 1;
  }
}
