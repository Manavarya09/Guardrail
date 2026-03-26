import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

const insecureCorsRule: Rule = {
  id: 'security/insecure-cors',
  name: 'Insecure CORS',
  description: 'Detects cors({ origin: "*" }) or cors() with no restrictions',
  severity: 'high',
  category: 'security',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;

        // Match cors() or cors({...})
        const isCorsCall =
          (callee.type === 'Identifier' && callee.name === 'cors') ||
          (callee.type === 'MemberExpression' &&
            callee.property.type === 'Identifier' &&
            callee.property.name === 'cors');

        if (!isCorsCall) return;

        const args = path.node.arguments;

        // cors() with no arguments — allows all origins
        if (args.length === 0) {
          violations.push({
            ruleId: 'security/insecure-cors',
            severity: 'high',
            message:
              'cors() called with no arguments — allows all origins. Specify allowed origins explicitly.',
            location: {
              file: filePath,
              line: path.node.loc?.start.line ?? 0,
              column: path.node.loc?.start.column ?? 0,
            },
          });
          return;
        }

        // cors({ origin: '*' })
        const firstArg = args[0];
        if (firstArg.type === 'ObjectExpression') {
          for (const prop of firstArg.properties) {
            if (
              prop.type === 'ObjectProperty' &&
              prop.key.type === 'Identifier' &&
              prop.key.name === 'origin' &&
              prop.value.type === 'StringLiteral' &&
              prop.value.value === '*'
            ) {
              violations.push({
                ruleId: 'security/insecure-cors',
                severity: 'high',
                message:
                  'CORS origin set to "*" — allows all origins. Specify allowed origins explicitly.',
                location: {
                  file: filePath,
                  line: prop.loc?.start.line ?? 0,
                  column: prop.loc?.start.column ?? 0,
                },
              });
            }
          }
        }
      },

      // Also check for Access-Control-Allow-Origin: * header
      StringLiteral(path) {
        if (path.node.value === 'Access-Control-Allow-Origin') {
          // Check if the next sibling/value is '*'
          if (
            path.parent.type === 'ObjectProperty' &&
            path.parent.value.type === 'StringLiteral' &&
            path.parent.value.value === '*'
          ) {
            violations.push({
              ruleId: 'security/insecure-cors',
              severity: 'high',
              message:
                'Access-Control-Allow-Origin header set to "*". Restrict to specific origins.',
              location: {
                file: filePath,
                line: path.node.loc?.start.line ?? 0,
                column: path.node.loc?.start.column ?? 0,
              },
            });
          }
        }
      },
    });

    return violations;
  },
};

export default insecureCorsRule;
