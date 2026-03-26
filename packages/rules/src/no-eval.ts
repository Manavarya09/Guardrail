import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

const DANGEROUS_GLOBALS = new Set(['eval', 'Function']);

const noEvalRule: Rule = {
  id: 'security/no-eval',
  name: 'No Eval',
  description: 'Detects usage of eval() and new Function() which can lead to code injection',
  severity: 'critical',
  category: 'security',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      CallExpression(path) {
        if (
          path.node.callee.type === 'Identifier' &&
          path.node.callee.name === 'eval'
        ) {
          violations.push({
            ruleId: 'security/no-eval',
            severity: 'critical',
            message: 'eval() is dangerous and can lead to code injection. Use safer alternatives.',
            location: {
              file: filePath,
              line: path.node.loc?.start.line ?? 0,
              column: path.node.loc?.start.column ?? 0,
            },
          });
        }
      },

      NewExpression(path) {
        if (
          path.node.callee.type === 'Identifier' &&
          path.node.callee.name === 'Function'
        ) {
          violations.push({
            ruleId: 'security/no-eval',
            severity: 'critical',
            message: 'new Function() is equivalent to eval() and can lead to code injection.',
            location: {
              file: filePath,
              line: path.node.loc?.start.line ?? 0,
              column: path.node.loc?.start.column ?? 0,
            },
          });
        }
      },
    });

    return violations;
  },
};

export default noEvalRule;
