import { resolve } from 'path';
import { GuardrailEngine, loadConfig, mergeConfigs } from '@guardrail-ai/core';
import type { Severity } from '@guardrail-ai/core';
import { builtinRules } from '@guardrail-ai/rules';
import { FixerEngine } from '@guardrail-ai/fixer';
import { formatDiff } from '../formatter.js';
import * as c from '../colors.js';

interface FixOptions {
  dryRun?: boolean;
  severity?: string;
  rules?: string;
}

export async function fixCommand(
  target: string,
  options: FixOptions,
): Promise<void> {
  const cwd = process.cwd();
  const targetPath = resolve(cwd, target);

  console.log('');
  console.log(
    c.bold(c.cyan('  Guardrail')) +
      c.dim(options.dryRun ? ' — dry-run fix mode' : ' — applying fixes...'),
  );
  console.log(c.dim(`  Target: ${targetPath}`));
  console.log('');

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

  const summary = await engine.scan(targetPath);

  const fixer = new FixerEngine();
  let totalFixed = 0;
  let totalFiles = 0;

  for (const result of summary.results) {
    const fixable = result.violations.filter((v) => v.fix);
    if (fixable.length === 0) continue;

    const fixResult = await fixer.applyFixes(
      result.filePath,
      result.violations,
      !options.dryRun,
    );

    if (fixResult.applied > 0) {
      totalFiles++;
      totalFixed += fixResult.applied;

      if (fixResult.diff) {
        console.log(formatDiff(fixResult.diff));
      }
    }
  }

  console.log('');
  if (totalFixed === 0) {
    console.log(c.dim('  No auto-fixable issues found.'));
  } else {
    const action = options.dryRun ? 'would fix' : 'fixed';
    console.log(
      c.bold(
        c.green(
          `  ${totalFixed} issues ${action} across ${totalFiles} files`,
        ),
      ),
    );
  }
  console.log('');
}
