import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail/core';

const LOG_METHODS = new Set(['log', 'debug', 'info', 'warn', 'error', 'trace']);
const RESPONSE_METHODS = new Set(['json', 'send', 'write', 'end']);

const envVarLeakRule: Rule = {
  id: 'security/env-var-leak',
  name: 'Environment Variable Leak',
  description:
    'Detects process.env values being passed to console.log or HTTP response methods',
  severity: 'high',
  category: 'security',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;

        // Check if this is console.log(process.env.X) or res.json(process.env.X)
        if (callee.type !== 'MemberExpression') return;
        if (callee.property.type !== 'Identifier') return;

        const isLogCall =
          callee.object.type === 'Identifier' &&
          callee.object.name === 'console' &&
          LOG_METHODS.has(callee.property.name);

        const isResponseCall = RESPONSE_METHODS.has(callee.property.name);

        if (!isLogCall && !isResponseCall) return;

        // Check if any argument references process.env
        for (const arg of path.node.arguments) {
          if (arg.type === 'SpreadElement') continue;
          if (containsProcessEnv(arg)) {
            violations.push({
              ruleId: 'security/env-var-leak',
              severity: 'high',
              message: `process.env value passed to ${isLogCall ? 'console' : 'response'} — may leak secrets.`,
              location: {
                file: filePath,
                line: path.node.loc?.start.line ?? 0,
                column: path.node.loc?.start.column ?? 0,
              },
            });
            break;
          }
        }
      },
    });

    return violations;
  },
};

function containsProcessEnv(node: any): boolean {
  if (!node || typeof node !== 'object') return false;

  // process.env.X
  if (
    node.type === 'MemberExpression' &&
    node.object?.type === 'MemberExpression' &&
    node.object.object?.type === 'Identifier' &&
    node.object.object.name === 'process' &&
    node.object.property?.type === 'Identifier' &&
    node.object.property.name === 'env'
  ) {
    return true;
  }

  // Recurse into child nodes
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end' || key === 'type') continue;
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (containsProcessEnv(item)) return true;
      }
    } else if (child && typeof child === 'object' && child.type) {
      if (containsProcessEnv(child)) return true;
    }
  }

  return false;
}

export default envVarLeakRule;
