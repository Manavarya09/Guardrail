import { readFile } from 'fs/promises';
import { parseSource } from './parser.js';
import { discoverFiles } from './file-discovery.js';
import type {
  Rule,
  RuleContext,
  ScanResult,
  ScanSummary,
  GuardrailConfig,
  Severity,
  Violation,
} from './types.js';
import { DEFAULT_CONFIG, SEVERITY_ORDER } from './types.js';

export class GuardrailEngine {
  private rules: Rule[] = [];
  private config: GuardrailConfig;

  constructor(config: Partial<GuardrailConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  registerRule(rule: Rule): void {
    this.rules.push(rule);
  }

  registerRules(rules: Rule[]): void {
    rules.forEach((r) => this.registerRule(r));
  }

  getRegisteredRules(): Rule[] {
    return [...this.rules];
  }

  private isRuleEnabled(ruleId: string): boolean {
    const config = this.config.rules[ruleId];
    if (config === undefined) return true; // enabled by default
    if (typeof config === 'boolean') return config;
    return config.enabled;
  }

  private getRuleSeverity(rule: Rule): Severity {
    const config = this.config.rules[rule.id];
    if (config && typeof config === 'object' && config.severity) {
      return config.severity;
    }
    return rule.severity;
  }

  private meetsThreshold(severity: Severity): boolean {
    const threshold = this.config.severityThreshold ?? 'info';
    return SEVERITY_ORDER[severity] <= SEVERITY_ORDER[threshold];
  }

  async scanFile(filePath: string): Promise<ScanResult> {
    const source = await readFile(filePath, 'utf-8');
    const violations: Violation[] = [];

    let ast;
    try {
      ast = parseSource(source, filePath);
    } catch {
      return { filePath, violations: [] };
    }

    const context: RuleContext = { filePath, source, ast };

    for (const rule of this.rules) {
      if (!this.isRuleEnabled(rule.id)) continue;

      try {
        const ruleViolations = rule.detect(context);
        for (const v of ruleViolations) {
          if (this.meetsThreshold(v.severity)) {
            violations.push(v);
          }
        }
      } catch {
        // Rule failed — skip silently to not block other rules
      }
    }

    return { filePath, violations };
  }

  async scan(targetPath: string): Promise<ScanSummary> {
    const files = await discoverFiles(targetPath, this.config);
    const results: ScanResult[] = [];

    // Process files concurrently in batches
    const BATCH_SIZE = 20;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((f) => this.scanFile(f)),
      );
      results.push(...batchResults);
    }

    const summary: ScanSummary = {
      totalFiles: files.length,
      totalViolations: 0,
      bySeverity: { critical: 0, high: 0, warning: 0, info: 0 },
      byRule: {},
      results,
    };

    for (const result of results) {
      for (const v of result.violations) {
        summary.totalViolations++;
        summary.bySeverity[v.severity]++;
        summary.byRule[v.ruleId] = (summary.byRule[v.ruleId] || 0) + 1;
      }
    }

    return summary;
  }
}
