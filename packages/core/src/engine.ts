import { readFile } from 'fs/promises';
import { parseSource } from './parser.js';
import { discoverFiles } from './file-discovery.js';
import { ScanCache } from './cache.js';
import { loadPlugins } from './plugin-loader.js';
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
  private cache: ScanCache | null = null;
  private pluginsLoaded = false;

  constructor(config: Partial<GuardrailConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  enableCache(basePath: string): void {
    this.cache = new ScanCache(basePath);
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

  private async ensurePluginsLoaded(): Promise<void> {
    if (this.pluginsLoaded) return;
    this.pluginsLoaded = true;

    if (this.config.plugins && this.config.plugins.length > 0) {
      const pluginRules = await loadPlugins(this.config.plugins);
      this.registerRules(pluginRules);
    }
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
    await this.ensurePluginsLoaded();
    const source = await readFile(filePath, 'utf-8');

    // Check cache first
    if (this.cache) {
      const cached = this.cache.get(filePath, source);
      if (cached) {
        return { filePath, violations: cached };
      }
    }

    const violations: Violation[] = [];

    let ast;
    try {
      ast = parseSource(source, filePath);
    } catch {
      return { filePath, violations: [] };
    }

    // Parse inline ignore comments: // guardrail-ignore or // guardrail-ignore rule-id
    const ignoreLines = this.parseIgnoreComments(source);

    const context: RuleContext = { filePath, source, ast };

    for (const rule of this.rules) {
      if (!this.isRuleEnabled(rule.id)) continue;

      try {
        const ruleViolations = rule.detect(context);
        for (const v of ruleViolations) {
          if (!this.meetsThreshold(v.severity)) continue;

          // Check inline suppression
          if (this.isSuppressed(v, ignoreLines)) continue;

          violations.push(v);
        }
      } catch {
        // Rule failed — skip silently to not block other rules
      }
    }

    // Store in cache
    if (this.cache) {
      this.cache.set(filePath, source, violations);
    }

    return { filePath, violations };
  }

  async scan(targetPath: string): Promise<ScanSummary> {
    await this.ensurePluginsLoaded();
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

    // Save cache after full scan
    if (this.cache) {
      this.cache.save();
    }

    return summary;
  }

  /**
   * Parse inline suppression comments from source code.
   * Supports:
   *   // guardrail-ignore
   *   // guardrail-ignore-next-line
   *   // guardrail-ignore security/sql-injection
   *   // guardrail-ignore-next-line security/sql-injection, security/xss-vulnerability
   */
  private parseIgnoreComments(source: string): Map<number, Set<string> | 'all'> {
    const ignores = new Map<number, Set<string> | 'all'>();
    const lines = source.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/\/\/\s*guardrail-ignore(?:-next-line)?\s*(.*)/);
      if (!match) continue;

      const isNextLine = line.includes('guardrail-ignore-next-line');
      const targetLine = isNextLine ? i + 2 : i + 1; // 1-indexed

      const ruleList = match[1].trim();
      if (ruleList.length === 0) {
        ignores.set(targetLine, 'all');
      } else {
        const ruleIds = new Set(ruleList.split(',').map((r) => r.trim()));
        const existing = ignores.get(targetLine);
        if (existing === 'all') continue;
        if (existing) {
          for (const r of ruleIds) existing.add(r);
        } else {
          ignores.set(targetLine, ruleIds);
        }
      }
    }

    return ignores;
  }

  private isSuppressed(v: Violation, ignoreLines: Map<number, Set<string> | 'all'>): boolean {
    const entry = ignoreLines.get(v.location.line);
    if (!entry) return false;
    if (entry === 'all') return true;
    return entry.has(v.ruleId);
  }
}
