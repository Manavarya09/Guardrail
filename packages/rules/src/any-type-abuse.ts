import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

const anyTypeAbuseRule: Rule = {
  id: 'ai-codegen/any-type-abuse',
  name: 'Any Type Abuse',
  description:
    'Detects explicit `: any` type annotations and `as any` casts in TypeScript files',
  severity: 'warning',
  category: 'ai-codegen',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    // Only check TypeScript files
    if (!/\.tsx?$/.test(filePath)) return violations;

    traverse(ast, {
      TSAnyKeyword(path) {
        violations.push({
          ruleId: 'ai-codegen/any-type-abuse',
          severity: 'warning',
          message:
            'Explicit `any` type — use a specific type, `unknown`, or a generic instead.',
          location: {
            file: filePath,
            line: path.node.loc?.start.line ?? 0,
            column: path.node.loc?.start.column ?? 0,
          },
        });
      },
    });

    return violations;
  },
};

export default anyTypeAbuseRule;
