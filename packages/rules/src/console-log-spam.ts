import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

const DEBUG_METHODS = new Set(['log', 'debug', 'info', 'trace', 'dir', 'table']);

const consoleLogSpamRule: Rule = {
  id: 'ai-codegen/console-log-spam',
  name: 'Console Log Spam',
  description:
    'Detects console.log/debug/info calls that should be removed or replaced with proper logging',
  severity: 'info',
  category: 'ai-codegen',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'console' &&
          callee.property.type === 'Identifier' &&
          DEBUG_METHODS.has(callee.property.name)
        ) {
          const stmt = path.findParent((p) => p.isExpressionStatement());
          const stmtNode = stmt?.node;

          violations.push({
            ruleId: 'ai-codegen/console-log-spam',
            severity: 'info',
            message: `console.${callee.property.name}() call — remove or replace with a proper logger.`,
            location: {
              file: filePath,
              line: path.node.loc?.start.line ?? 0,
              column: path.node.loc?.start.column ?? 0,
            },
            fix: stmtNode?.loc
              ? {
                  description: `Remove console.${callee.property.name}() statement`,
                  range: {
                    start: {
                      line: stmtNode.loc.start.line,
                      column: stmtNode.loc.start.column,
                    },
                    end: {
                      line: stmtNode.loc.end.line,
                      column: stmtNode.loc.end.column,
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

export default consoleLogSpamRule;
