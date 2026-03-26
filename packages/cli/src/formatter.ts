import { relative } from 'path';
import type { ScanSummary, ScanResult, Violation, Severity } from '@guardrail-ai/core';
import * as c from './colors.js';

const SEVERITY_ICON: Record<Severity, string> = {
  critical: c.bgRed(c.bold(' CRIT ')),
  high: c.red(c.bold(' HIGH ')),
  warning: c.yellow(' WARN '),
  info: c.blue(' INFO '),
};

const SEVERITY_COLOR: Record<Severity, (s: string) => string> = {
  critical: c.red,
  high: c.red,
  warning: c.yellow,
  info: c.blue,
};

export function formatViolation(v: Violation, cwd: string): string {
  const loc = `${relative(cwd, v.location.file)}:${v.location.line}:${v.location.column}`;
  const icon = SEVERITY_ICON[v.severity];
  const ruleId = c.dim(`[${v.ruleId}]`);
  const fixable = v.fix ? c.green(' (fixable)') : '';

  return `  ${icon} ${c.gray(loc)} ${v.message} ${ruleId}${fixable}`;
}

export function formatFileResult(result: ScanResult, cwd: string): string {
  if (result.violations.length === 0) return '';

  const relPath = relative(cwd, result.filePath);
  const lines = [
    '',
    c.underline(c.white(relPath)),
    ...result.violations.map((v) => formatViolation(v, cwd)),
  ];

  return lines.join('\n');
}

export function formatSummary(summary: ScanSummary, cwd: string, elapsed?: string): string {
  const sections: string[] = [];

  // File results
  for (const result of summary.results) {
    const formatted = formatFileResult(result, cwd);
    if (formatted) sections.push(formatted);
  }

  // Summary line
  const parts: string[] = [];

  if (summary.bySeverity.critical > 0) {
    parts.push(c.red(`${summary.bySeverity.critical} critical`));
  }
  if (summary.bySeverity.high > 0) {
    parts.push(c.red(`${summary.bySeverity.high} high`));
  }
  if (summary.bySeverity.warning > 0) {
    parts.push(c.yellow(`${summary.bySeverity.warning} warnings`));
  }
  if (summary.bySeverity.info > 0) {
    parts.push(c.blue(`${summary.bySeverity.info} info`));
  }

  const fixableCount = summary.results.reduce(
    (acc, r) => acc + r.violations.filter((v) => v.fix).length,
    0,
  );

  sections.push('');
  sections.push(
    c.bold(
      `${summary.totalViolations === 0 ? c.green('No issues found!') : `Found ${summary.totalViolations} issues`}` +
        ` in ${summary.totalFiles} files` +
        (elapsed ? c.dim(` (${elapsed}s)`) : ''),
    ),
  );

  if (parts.length > 0) {
    sections.push(`  ${parts.join(', ')}`);
  }

  if (fixableCount > 0) {
    sections.push(
      c.green(`  ${fixableCount} issues are auto-fixable (run ${c.bold('guardrail fix')})`),
    );
  }

  sections.push('');
  return sections.join('\n');
}

export function formatDiff(diff: string): string {
  return diff
    .split('\n')
    .map((line) => {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        return c.green(line);
      }
      if (line.startsWith('-') && !line.startsWith('---')) {
        return c.red(line);
      }
      if (line.startsWith('@@')) {
        return c.cyan(line);
      }
      return line;
    })
    .join('\n');
}
