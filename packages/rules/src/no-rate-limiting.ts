import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail/core';

const RATE_LIMIT_PACKAGES = new Set([
  'express-rate-limit',
  'rate-limiter-flexible',
  'express-slow-down',
  'express-brute',
  'koa-ratelimit',
]);

const noRateLimitingRule: Rule = {
  id: 'security/no-rate-limiting',
  name: 'No Rate Limiting',
  description:
    'Detects Express/HTTP server apps without rate limiting middleware',
  severity: 'info',
  category: 'security',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    let hasExpress = false;
    let hasRateLimiting = false;
    let expressLine = 0;
    let expressColumn = 0;

    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        if (source === 'express' || source === 'koa') {
          hasExpress = true;
          expressLine = path.node.loc?.start.line ?? 0;
          expressColumn = path.node.loc?.start.column ?? 0;
        }
        if (RATE_LIMIT_PACKAGES.has(source)) {
          hasRateLimiting = true;
        }
      },

      CallExpression(path) {
        if (
          path.node.callee.type === 'Identifier' &&
          path.node.callee.name === 'require' &&
          path.node.arguments.length === 1 &&
          path.node.arguments[0].type === 'StringLiteral'
        ) {
          const source = path.node.arguments[0].value;
          if (source === 'express' || source === 'koa') {
            hasExpress = true;
            expressLine = path.node.loc?.start.line ?? 0;
            expressColumn = path.node.loc?.start.column ?? 0;
          }
          if (RATE_LIMIT_PACKAGES.has(source)) {
            hasRateLimiting = true;
          }
        }
      },
    });

    if (hasExpress && !hasRateLimiting) {
      violations.push({
        ruleId: 'security/no-rate-limiting',
        severity: 'info',
        message:
          'Express/HTTP server without rate limiting. Consider adding express-rate-limit or similar.',
        location: {
          file: filePath,
          line: expressLine,
          column: expressColumn,
        },
      });
    }

    return violations;
  },
};

export default noRateLimitingRule;
