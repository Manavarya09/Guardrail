import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail/core';

const LOCALHOST_PATTERN =
  /https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/;

const hardcodedLocalhostRule: Rule = {
  id: 'ai-codegen/hardcoded-localhost',
  name: 'Hardcoded Localhost',
  description:
    'Detects hardcoded localhost/127.0.0.1 URLs that should use environment variables',
  severity: 'warning',
  category: 'ai-codegen',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      StringLiteral(path) {
        if (LOCALHOST_PATTERN.test(path.node.value)) {
          violations.push({
            ruleId: 'ai-codegen/hardcoded-localhost',
            severity: 'warning',
            message: `Hardcoded localhost URL "${path.node.value.substring(0, 50)}". Use an environment variable for the base URL.`,
            location: {
              file: filePath,
              line: path.node.loc?.start.line ?? 0,
              column: path.node.loc?.start.column ?? 0,
            },
          });
        }
      },

      TemplateLiteral(path) {
        for (const quasi of path.node.quasis) {
          if (LOCALHOST_PATTERN.test(quasi.value.raw)) {
            violations.push({
              ruleId: 'ai-codegen/hardcoded-localhost',
              severity: 'warning',
              message:
                'Hardcoded localhost URL in template literal. Use an environment variable for the base URL.',
              location: {
                file: filePath,
                line: quasi.loc?.start.line ?? 0,
                column: quasi.loc?.start.column ?? 0,
              },
            });
          }
        }
      },
    });

    return violations;
  },
};

export default hardcodedLocalhostRule;
