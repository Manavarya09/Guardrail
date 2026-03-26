import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

const ALLOWED_NUMBERS = new Set([0, 1, -1, 2, 10, 100, 1000, 24, 60, 1024]);

const magicNumbersRule: Rule = {
  id: 'ai-codegen/magic-numbers',
  name: 'Magic Numbers',
  description:
    'Detects unnamed numeric literals in logic that should be extracted to named constants',
  severity: 'info',
  category: 'ai-codegen',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      NumericLiteral(path) {
        const value = path.node.value;
        if (ALLOWED_NUMBERS.has(value)) return;

        // Skip if it's in a variable declaration (i.e., it IS being named)
        if (path.parent.type === 'VariableDeclarator') return;

        // Skip array indices
        if (path.parent.type === 'MemberExpression' && path.parent.computed) return;

        // Skip default parameter values
        if (path.parent.type === 'AssignmentPattern') return;

        // Skip object property values (often config objects)
        if (path.parent.type === 'ObjectProperty') return;

        // Skip return statements with simple values
        if (path.parent.type === 'ReturnStatement') return;

        violations.push({
          ruleId: 'ai-codegen/magic-numbers',
          severity: 'info',
          message: `Magic number ${value} — extract to a named constant for readability.`,
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

export default magicNumbersRule;
