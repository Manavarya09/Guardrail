import type { File as BabelFile } from '@babel/types';

export type Severity = 'critical' | 'high' | 'warning' | 'info';

export type RuleCategory = 'security' | 'performance' | 'quality' | 'ai-codegen';

export interface Location {
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
}

export interface FixSuggestion {
  description: string;
  /** The range to replace */
  range: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  /** The replacement text */
  replacement: string;
}

export interface Violation {
  ruleId: string;
  severity: Severity;
  message: string;
  location: Location;
  fix?: FixSuggestion;
}

export interface RuleContext {
  filePath: string;
  source: string;
  ast: BabelFile;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  category: RuleCategory;
  detect(context: RuleContext): Violation[];
}

export interface ScanResult {
  filePath: string;
  violations: Violation[];
}

export interface ScanSummary {
  totalFiles: number;
  totalViolations: number;
  bySeverity: Record<Severity, number>;
  byRule: Record<string, number>;
  results: ScanResult[];
}

export interface GuardrailPlugin {
  name: string;
  rules: Rule[];
}

export interface GuardrailConfig {
  include: string[];
  exclude: string[];
  rules: Record<string, boolean | { enabled: boolean; severity?: Severity }>;
  severityThreshold?: Severity;
  plugins?: string[];
}

export const DEFAULT_CONFIG: GuardrailConfig = {
  include: ['**/*.{js,jsx,ts,tsx}'],
  exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
  rules: {},
  severityThreshold: 'info',
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  warning: 2,
  info: 3,
};
