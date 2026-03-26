import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

/**
 * Detects regex patterns vulnerable to ReDoS (Regular Expression Denial of Service).
 * Flags patterns with nested quantifiers like (a+)+ or (a|b|c)* that cause exponential backtracking.
 */

const REDOS_PATTERNS = [
  /\(.+\+\)\+/,     // (x+)+
  /\(.+\*\)\*/,     // (x*)*
  /\(.+\+\)\*/,     // (x+)*
  /\(.+\*\)\+/,     // (x*)+
  /\(.+\{.+\}\)\+/, // (x{n})+
  /\(.+\{.+\}\)\*/, // (x{n})*
];

const unsafeRegexRule: Rule = {
  id: 'security/unsafe-regex',
  name: 'Unsafe Regex',
  description: 'Detects regex patterns vulnerable to ReDoS (catastrophic backtracking)',
  severity: 'high',
  category: 'security',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      RegExpLiteral(path) {
        const pattern = path.node.pattern;
        for (const redos of REDOS_PATTERNS) {
          if (redos.test(pattern)) {
            violations.push({
              ruleId: 'security/unsafe-regex',
              severity: 'high',
              message: `Regex "/${pattern}/" is vulnerable to ReDoS. Simplify the pattern or add input length limits.`,
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

      NewExpression(path) {
        if (
          path.node.callee.type === 'Identifier' &&
          path.node.callee.name === 'RegExp' &&
          path.node.arguments.length > 0 &&
          path.node.arguments[0].type === 'StringLiteral'
        ) {
          const pattern = path.node.arguments[0].value;
          for (const redos of REDOS_PATTERNS) {
            if (redos.test(pattern)) {
              violations.push({
                ruleId: 'security/unsafe-regex',
                severity: 'high',
                message: `Regex pattern "${pattern}" is vulnerable to ReDoS. Simplify the pattern or add input length limits.`,
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

export default unsafeRegexRule;
