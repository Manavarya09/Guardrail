import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

const SENSITIVE_PATTERNS = /(?:password|secret|token|key|auth|credential|private|ssn|credit.?card)/i;
const LOG_METHODS = new Set(['log', 'info', 'debug', 'warn', 'error', 'trace']);

const noSecretsInLogsRule: Rule = {
  id: 'security/no-secrets-in-logs',
  name: 'No Secrets in Logs',
  description: 'Detects potentially sensitive variable names being passed to logging functions',
  severity: 'high',
  category: 'security',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        if (
          callee.type !== 'MemberExpression' ||
          callee.object.type !== 'Identifier' ||
          callee.object.name !== 'console' ||
          callee.property.type !== 'Identifier' ||
          !LOG_METHODS.has(callee.property.name)
        ) {
          return;
        }

        for (const arg of path.node.arguments) {
          if (arg.type === 'SpreadElement') continue;
          const names = extractIdentifierNames(arg);
          for (const name of names) {
            if (SENSITIVE_PATTERNS.test(name)) {
              violations.push({
                ruleId: 'security/no-secrets-in-logs',
                severity: 'high',
                message: `Variable "${name}" may contain sensitive data and is being logged. Redact before logging.`,
                location: {
                  file: filePath,
                  line: path.node.loc?.start.line ?? 0,
                  column: path.node.loc?.start.column ?? 0,
                },
              });
              break;
            }
          }
        }
      },
    });

    return violations;
  },
};

function extractIdentifierNames(node: any): string[] {
  const names: string[] = [];
  if (!node) return names;

  if (node.type === 'Identifier') {
    names.push(node.name);
  } else if (node.type === 'MemberExpression' && node.property?.type === 'Identifier') {
    names.push(node.property.name);
  } else if (node.type === 'TemplateLiteral') {
    for (const expr of node.expressions || []) {
      names.push(...extractIdentifierNames(expr));
    }
  }

  return names;
}

export default noSecretsInLogsRule;
