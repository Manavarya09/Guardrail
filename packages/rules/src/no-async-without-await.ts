import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

/**
 * Detects async functions that never use await.
 *
 * AI code generators frequently mark functions as async unnecessarily,
 * which adds overhead and misleads readers about the function's behavior.
 *
 * Catches patterns like:
 *   async function getData() { return cache[key]; }
 *   const fn = async () => { return 42; }
 */

const noAsyncWithoutAwaitRule: Rule = {
  id: 'ai-codegen/no-async-without-await',
  name: 'No Async Without Await',
  description:
    'Detects async functions that never use await — a common AI codegen pattern that adds unnecessary overhead',
  severity: 'warning',
  category: 'ai-codegen',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      'FunctionDeclaration|ArrowFunctionExpression|FunctionExpression'(path: any) {
        if (!path.node.async) return;

        // Skip empty functions
        const body = path.node.body;
        if (!body) return;

        // Arrow function with expression body (no block)
        if (body.type !== 'BlockStatement') return;

        // Skip empty body
        if (body.body.length === 0) return;

        // Check if any descendant uses await or for-await
        let hasAwait = false;

        path.traverse({
          AwaitExpression() {
            hasAwait = true;
          },
          ForOfStatement(innerPath: any) {
            if (innerPath.node.await) {
              hasAwait = true;
            }
          },
          // Don't descend into nested functions — their await doesn't count
          'FunctionDeclaration|ArrowFunctionExpression|FunctionExpression'(innerPath: any) {
            innerPath.skip();
          },
        });

        if (!hasAwait) {
          const name =
            path.node.id?.name ??
            (path.parent?.type === 'VariableDeclarator' && path.parent.id?.type === 'Identifier'
              ? path.parent.id.name
              : 'anonymous');

          violations.push({
            ruleId: 'ai-codegen/no-async-without-await',
            severity: 'warning',
            message: `Function "${name}" is async but never uses await. Remove the async keyword.`,
            location: {
              file: filePath,
              line: path.node.loc?.start.line ?? 0,
              column: path.node.loc?.start.column ?? 0,
            },
            fix: path.node.loc
              ? {
                  description: `Remove unnecessary async keyword from "${name}"`,
                  range: {
                    start: {
                      line: path.node.loc.start.line,
                      column: path.node.loc.start.column,
                    },
                    end: {
                      line: path.node.loc.start.line,
                      column: path.node.loc.start.column + 6,
                    },
                  },
                  replacement: '',
                }
              : undefined,
          });
        }
      },
    });

    return violations;
  },
};

export default noAsyncWithoutAwaitRule;
