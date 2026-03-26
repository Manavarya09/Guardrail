import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

const fetchWithoutErrorHandlingRule: Rule = {
  id: 'ai-codegen/fetch-without-error-handling',
  name: 'Fetch Without Error Handling',
  description: 'Detects fetch() calls not wrapped in try/catch or without .catch()',
  severity: 'warning',
  category: 'ai-codegen',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;

        // Match fetch() or window.fetch()
        const isFetch =
          (callee.type === 'Identifier' && callee.name === 'fetch') ||
          (callee.type === 'MemberExpression' &&
            callee.property.type === 'Identifier' &&
            callee.property.name === 'fetch');

        if (!isFetch) return;

        // Check if it's inside a try block
        let inTry = false;
        let hasCatch = false;

        // Walk up ancestors
        const ancestors = path.getAncestry();
        for (const anc of ancestors) {
          if (anc.isTryStatement()) {
            inTry = true;
            break;
          }
          if (
            anc.isCallExpression() &&
            anc.node.callee.type === 'MemberExpression' &&
            anc.node.callee.property.type === 'Identifier' &&
            anc.node.callee.property.name === 'catch'
          ) {
            hasCatch = true;
            break;
          }
        }

        if (!inTry && !hasCatch) {
          violations.push({
            ruleId: 'ai-codegen/fetch-without-error-handling',
            severity: 'warning',
            message:
              'fetch() call without error handling. Wrap in try/catch or chain .catch().',
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

export default fetchWithoutErrorHandlingRule;
