import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail/core';

const overlyBroadCatchRule: Rule = {
  id: 'ai-codegen/overly-broad-catch',
  name: 'Overly Broad Catch',
  description:
    'Detects catch blocks that only log errors without proper handling or rethrowing',
  severity: 'warning',
  category: 'ai-codegen',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      CatchClause(path) {
        const body = path.node.body.body;

        // Empty catch — already handled by dead-code rule
        if (body.length === 0) return;

        // Only a single console.log/console.error statement
        if (body.length === 1) {
          const stmt = body[0];
          if (
            stmt.type === 'ExpressionStatement' &&
            stmt.expression.type === 'CallExpression' &&
            stmt.expression.callee.type === 'MemberExpression' &&
            stmt.expression.callee.object.type === 'Identifier' &&
            stmt.expression.callee.object.name === 'console'
          ) {
            violations.push({
              ruleId: 'ai-codegen/overly-broad-catch',
              severity: 'warning',
              message:
                'Catch block only logs the error without proper handling. Consider rethrowing, returning an error state, or implementing recovery logic.',
              location: {
                file: filePath,
                line: path.node.loc?.start.line ?? 0,
                column: path.node.loc?.start.column ?? 0,
              },
            });
          }
        }
      },
    });

    return violations;
  },
};

export default overlyBroadCatchRule;
