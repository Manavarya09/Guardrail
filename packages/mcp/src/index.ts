#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { GuardrailEngine } from '@guardrail-ai/core';
import { builtinRules } from '@guardrail-ai/rules';
import { FixerEngine } from '@guardrail-ai/fixer';

const server = new McpServer({
  name: 'guardrail',
  version: '0.1.0',
});

// ── Tool: scan ──────────────────────────────────────────────────────────────

server.tool(
  'guardrail_scan',
  'Scan a directory or file for security issues, performance problems, bad patterns, and AI-generated code anti-patterns. Returns structured violations with file, line, severity, and rule ID.',
  {
    target: z.string().describe('Path to a file or directory to scan'),
    severity: z
      .enum(['critical', 'high', 'warning', 'info'])
      .optional()
      .describe('Minimum severity threshold (default: info)'),
  },
  async ({ target, severity }) => {
    const engine = new GuardrailEngine({
      severityThreshold: severity ?? 'info',
    });
    engine.registerRules(builtinRules);

    const summary = await engine.scan(target);

    const lines: string[] = [];
    lines.push(
      `Scanned ${summary.totalFiles} files. Found ${summary.totalViolations} issues.`,
    );
    lines.push(
      `  Critical: ${summary.bySeverity.critical}, High: ${summary.bySeverity.high}, Warning: ${summary.bySeverity.warning}, Info: ${summary.bySeverity.info}`,
    );
    lines.push('');

    for (const result of summary.results) {
      if (result.violations.length === 0) continue;
      lines.push(`${result.filePath}:`);
      for (const v of result.violations) {
        const fix = v.fix ? ' (fixable)' : '';
        lines.push(
          `  ${v.severity.toUpperCase()} ${v.location.line}:${v.location.column} ${v.message} [${v.ruleId}]${fix}`,
        );
      }
      lines.push('');
    }

    return {
      content: [{ type: 'text' as const, text: lines.join('\n') }],
    };
  },
);

// ── Tool: fix ───────────────────────────────────────────────────────────────

server.tool(
  'guardrail_fix',
  'Auto-fix detected issues in a directory or file using AST transformations. Returns diffs of applied changes.',
  {
    target: z.string().describe('Path to a file or directory to fix'),
    dryRun: z
      .boolean()
      .optional()
      .describe('If true, show diffs without applying changes (default: true)'),
  },
  async ({ target, dryRun = true }) => {
    const engine = new GuardrailEngine();
    engine.registerRules(builtinRules);

    const summary = await engine.scan(target);
    const fixer = new FixerEngine();
    const lines: string[] = [];
    let totalFixed = 0;

    for (const result of summary.results) {
      const fixable = result.violations.filter((v) => v.fix);
      if (fixable.length === 0) continue;

      const fixResult = await fixer.applyFixes(
        result.filePath,
        result.violations,
        !dryRun,
      );

      if (fixResult.applied > 0) {
        totalFixed += fixResult.applied;
        if (fixResult.diff) {
          lines.push(fixResult.diff);
        }
      }
    }

    if (totalFixed === 0) {
      lines.push('No auto-fixable issues found.');
    } else {
      const action = dryRun ? 'would fix' : 'fixed';
      lines.push(`\n${totalFixed} issues ${action}.`);
    }

    return {
      content: [{ type: 'text' as const, text: lines.join('\n') }],
    };
  },
);

// ── Tool: list-rules ────────────────────────────────────────────────────────

server.tool(
  'guardrail_list_rules',
  'List all available Guardrail detection rules with their IDs, categories, and severities.',
  {},
  async () => {
    const lines = builtinRules.map(
      (r) => `${r.id} | ${r.category} | ${r.severity} | ${r.description}`,
    );
    return {
      content: [
        {
          type: 'text' as const,
          text: `ID | Category | Severity | Description\n${'-'.repeat(80)}\n${lines.join('\n')}`,
        },
      ],
    };
  },
);

// ── Start ───────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
