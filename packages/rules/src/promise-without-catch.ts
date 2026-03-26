import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail/core';

const promiseWithoutCatchRule: Rule = {
  id: 'ai-codegen/promise-without-catch',
  name: 'Promise Without Catch',
  description: 'Detects .then() chains without a .catch() handler',
  severity: 'warning',
  category: 'ai-codegen',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;

        // Look for .then() calls
        if (
          callee.type !== 'MemberExpression' ||
          callee.property.type !== 'Identifier' ||
          callee.property.name !== 'then'
        ) {
          return;
        }

        // Walk up the chain to see if there's a .catch() anywhere
        let current = path.parentPath;
        let hasCatch = false;

        // Check if this .then() is itself chained with .catch()
        while (current) {
          if (
            current.isCallExpression() &&
            current.node.callee.type === 'MemberExpression' &&
            current.node.callee.property.type === 'Identifier' &&
            current.node.callee.property.name === 'catch'
          ) {
            hasCatch = true;
            break;
          }
          // If the parent is a member expression accessing .then/.catch/.finally, keep walking
          if (
            current.isMemberExpression() &&
            current.parentPath?.isCallExpression()
          ) {
            current = current.parentPath;
            continue;
          }
          break;
        }

        // Also check if the .then() is inside a try block
        if (!hasCatch) {
          for (const anc of path.getAncestry()) {
            if (anc.isTryStatement()) {
              hasCatch = true;
              break;
            }
          }
        }

        if (!hasCatch) {
          violations.push({
            ruleId: 'ai-codegen/promise-without-catch',
            severity: 'warning',
            message:
              '.then() chain without .catch() handler. Add error handling to prevent unhandled rejections.',
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

export default promiseWithoutCatchRule;
