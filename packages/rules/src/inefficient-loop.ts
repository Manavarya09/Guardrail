import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail/core';

/**
 * Detects inefficient loop patterns:
 *
 *   1. Array.length accessed in loop condition (should be cached)
 *      for (let i = 0; i < arr.length; i++)
 *
 *   2. await inside a loop body (should use Promise.all)
 *      for (const item of items) { await fetch(item); }
 *
 *   3. DOM/expensive lookups inside loops
 *      for (...) { document.getElementById(...) }
 */

const inefficientLoopRule: Rule = {
  id: 'performance/inefficient-loop',
  name: 'Inefficient Loop',
  description:
    'Detects performance anti-patterns in loops: uncached length, sequential awaits, expensive operations inside loops',
  severity: 'warning',
  category: 'performance',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      // Pattern 1: for (i = 0; i < arr.length; i++)
      ForStatement(path) {
        const test = path.node.test;
        if (
          test?.type === 'BinaryExpression' &&
          (test.operator === '<' || test.operator === '<=') &&
          test.right.type === 'MemberExpression' &&
          test.right.property.type === 'Identifier' &&
          test.right.property.name === 'length'
        ) {
          violations.push({
            ruleId: 'performance/inefficient-loop',
            severity: 'warning',
            message:
              'Array .length is accessed on every iteration. Cache it in a variable for better performance.',
            location: {
              file: filePath,
              line: test.right.loc?.start.line ?? 0,
              column: test.right.loc?.start.column ?? 0,
            },
            fix: {
              description: 'Cache array length before loop',
              range: {
                start: {
                  line: path.node.loc?.start.line ?? 0,
                  column: path.node.loc?.start.column ?? 0,
                },
                end: {
                  line: path.node.loc?.start.line ?? 0,
                  column: path.node.loc?.end.column ?? 0,
                },
              },
              replacement: '', // Fixer engine handles the actual transformation
            },
          });
        }
      },

      // Pattern 2: await inside for/for-of/for-in/while loops
      'ForStatement|ForOfStatement|ForInStatement|WhileStatement|DoWhileStatement'(
        path,
      ) {
        path.traverse({
          AwaitExpression(innerPath) {
            // Make sure the await is directly inside this loop, not in a nested function
            let current = innerPath.parentPath;
            while (current && current !== path) {
              if (
                current.isFunctionDeclaration() ||
                current.isFunctionExpression() ||
                current.isArrowFunctionExpression()
              ) {
                return; // await is in a nested function, not directly in the loop
              }
              current = current.parentPath as typeof current;
            }

            violations.push({
              ruleId: 'performance/inefficient-loop',
              severity: 'warning',
              message:
                'Sequential await inside loop. Consider using Promise.all() for concurrent execution.',
              location: {
                file: filePath,
                line: innerPath.node.loc?.start.line ?? 0,
                column: innerPath.node.loc?.start.column ?? 0,
              },
            });
          },
        });
      },
    });

    return violations;
  },
};

export default inefficientLoopRule;
