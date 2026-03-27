import { resolve, join } from 'path';
import { execSync } from 'child_process';
import { GuardrailEngine, loadConfig, mergeConfigs, discoverFiles } from '@guardrail-ai/core';
import type { Severity, ScanSummary } from '@guardrail-ai/core';
import { builtinRules } from '@guardrail-ai/rules';
import { FixerEngine } from '@guardrail-ai/fixer';
import { formatSummary, formatDiff } from '../formatter.js';
import { generateHtmlReport } from '../reporters/html-reporter.js';
import { generateMdReport } from '../reporters/md-reporter.js';
import { generateSarifReport } from '../reporters/sarif-reporter.js';
import { loadBaseline, filterBaseline } from './baseline.js';
import { showMenu } from '../interactive.js';
import * as c from '../colors.js';
import { printBanner, printScanHeader } from '../banner.js';

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

  const fileConfig = loadConfig(targetPath);
  const config = mergeConfigs(fileConfig, {
    severityThreshold: (options.severity as Severity) ?? undefined,
  });

  const engine = new GuardrailEngine(config);
  engine.enableCache(cwd);

  let rules = builtinRules;
  if (options.rules) {
    const ruleIds = new Set(options.rules.split(',').map((r) => r.trim()));
    rules = builtinRules.filter((r) => ruleIds.has(r.id));
  }
  engine.registerRules(rules);

  // Load plugin rules from config
  if (config.plugins && config.plugins.length > 0) {
    const { loadPlugins } = await import('@guardrail-ai/core');
    const pluginRules = await loadPlugins(config.plugins);
    engine.registerRules(pluginRules);
    if (!options.json && pluginRules.length > 0) {
      console.log(c.dim(`  Loaded ${pluginRules.length} plugin rule${pluginRules.length > 1 ? 's' : ''}`));
    }
  }

  if (!options.json) {
    printBanner();
    const files = await discoverFiles(targetPath, config);
    printScanHeader(targetPath, rules.length, files.length);
  }

  const start = performance.now();
  let summary = await engine.scan(targetPath);
  const elapsed = ((performance.now() - start) / 1000).toFixed(2);

  // Apply baseline filtering
  const baseline = loadBaseline(cwd);
  let suppressed = 0;
  if (baseline) {
    const result = filterBaseline(summary, baseline, cwd);
    summary = result.filtered;
    suppressed = result.suppressed;
  }

  if (options.json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(formatSummary(summary, cwd, elapsed));

  if (suppressed > 0) {
    console.log(c.dim(`  ${suppressed} baseline issues suppressed. Run ${c.bold('guardrail baseline status')} for details.`));
    console.log('');
  }

  // Generate reports if --report flag passed
  if (options.report) {
    generateReports(options.report, summary, cwd);
  }

  if (summary.bySeverity.critical > 0 || summary.bySeverity.high > 0) {
    process.exitCode = 1;
  }

  // Interactive menu — only in TTY and when there are issues
  if (process.stdout.isTTY && summary.totalViolations > 0 && !options.report) {
    const fixableCount = summary.results.reduce(
      (acc, r) => acc + r.violations.filter((v) => v.fix).length,
      0,
    );

    const menuOptions = [];

    if (fixableCount > 0) {
      menuOptions.push({
        label: `Auto-fix ${fixableCount} issues`,
        hint: 'applies safe AST transforms',
        action: async () => {
          const fixer = new FixerEngine();
          let totalFixed = 0;
          for (const result of summary.results) {
            const fixable = result.violations.filter((v) => v.fix);
            if (fixable.length === 0) continue;
            const fixResult = await fixer.applyFixes(result.filePath, result.violations, true);
            if (fixResult.applied > 0) {
              totalFixed += fixResult.applied;
              const rel = result.filePath.replace(cwd + '/', '');
              console.log(`  ${c.brightGreen('✓')} ${c.white(rel)} — ${fixResult.applied} fixed`);
              if (fixResult.diff) {
                console.log(formatDiff(fixResult.diff));
              }
            }
          }
          console.log('');
          console.log(`  ${c.brightGreen(c.bold(`${totalFixed} issues fixed.`))}`);
          console.log('');
        },
      });
    }

    menuOptions.push({
      label: 'Generate AI fix guide (Markdown)',
      hint: 'paste into Claude/ChatGPT to fix everything',
      action: () => {
        const p = join(cwd, 'GUARDRAIL-AUDIT.md');
        generateMdReport(summary, cwd, p);
        console.log(`  ${c.brightGreen('✓')} Saved: ${c.white(p)}`);
        console.log(`  ${c.dim('Paste this file into your AI assistant to fix all issues.')}`);
        console.log('');
      },
    });

    menuOptions.push({
      label: 'Generate HTML report',
      hint: 'visual report you can share',
      action: () => {
        const p = join(cwd, 'guardrail-report.html');
        generateHtmlReport(summary, cwd, p);
        console.log(`  ${c.brightGreen('✓')} Saved: ${c.white(p)}`);
        console.log('');
      },
    });

    menuOptions.push({
      label: 'Generate SARIF report',
      hint: 'for GitHub Code Scanning',
      action: () => {
        const p = join(cwd, 'guardrail.sarif');
        generateSarifReport(summary, cwd, p);
        console.log(`  ${c.brightGreen('✓')} Saved: ${c.white(p)}`);
        console.log('');
      },
    });

    menuOptions.push({
      label: 'Create baseline (suppress current issues)',
      hint: 'adopt guardrail gradually',
      action: async () => {
        const { baselineCommand } = await import('./baseline.js');
        await baselineCommand('create', { severity: options.severity });
      },
    });

    menuOptions.push({
      label: 'Install pre-commit hook',
      hint: 'block bad code from being committed',
      action: async () => {
        const { hookCommand } = await import('./hook.js');
        await hookCommand('install');
      },
    });

    await showMenu(menuOptions);
  }
}

function generateReports(report: string, summary: ScanSummary, cwd: string): void {
  const formats = report.split(',').map((f) => f.trim());
  for (const fmt of formats) {
    if (fmt === 'html') {
      const p = join(cwd, 'guardrail-report.html');
      generateHtmlReport(summary, cwd, p);
      console.log(c.green(`  ✓ HTML report: ${p}`));
    }
    if (fmt === 'md') {
      const p = join(cwd, 'GUARDRAIL-AUDIT.md');
      generateMdReport(summary, cwd, p);
      console.log(c.green(`  ✓ Audit report: ${p}`));
      console.log(c.dim(`    Feed this file to Claude/ChatGPT to fix all issues.`));
    }
    if (fmt === 'sarif') {
      const p = join(cwd, 'guardrail.sarif');
      generateSarifReport(summary, cwd, p);
      console.log(c.green(`  ✓ SARIF report: ${p}`));
    }
  }
  console.log('');
}
