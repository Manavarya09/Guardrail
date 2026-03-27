import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

/**
 * Detects insecure cookie configurations.
 *
 * Catches patterns like:
 *   res.cookie('session', token, { httpOnly: false })
 *   res.cookie('auth', token)  — missing secure/httpOnly flags
 *   document.cookie = 'session=' + token  — client-side cookie setting
 */

const SENSITIVE_COOKIE_NAMES = /\b(session|auth|token|jwt|sid|csrf|ssid|refresh)\b/i;

const insecureCookieRule: Rule = {
  id: 'security/insecure-cookie',
  name: 'Insecure Cookie',
  description:
    'Detects cookies set without httpOnly, secure, or sameSite flags — especially for session/auth cookies',
  severity: 'high',
  category: 'security',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;

        // res.cookie('name', value, options?)
        if (
          callee.type === 'MemberExpression' &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'cookie'
        ) {
          const args = path.node.arguments;
          if (args.length < 2) return;

          const nameArg = args[0];
          const cookieName =
            nameArg.type === 'StringLiteral' ? nameArg.value : '';

          const isSensitive = SENSITIVE_COOKIE_NAMES.test(cookieName);

          // No options object provided
          if (args.length < 3 || args[2].type !== 'ObjectExpression') {
            if (isSensitive) {
              violations.push({
                ruleId: 'security/insecure-cookie',
                severity: 'high',
                message: `Cookie "${cookieName}" is set without security flags. Add { httpOnly: true, secure: true, sameSite: 'strict' }.`,
                location: {
                  file: filePath,
                  line: path.node.loc?.start.line ?? 0,
                  column: path.node.loc?.start.column ?? 0,
                },
                fix: path.node.loc
                  ? {
                      description: `Add security flags to "${cookieName}" cookie`,
                      range: {
                        start: {
                          line: path.node.loc.end.line,
                          column: path.node.loc.end.column - 1,
                        },
                        end: {
                          line: path.node.loc.end.line,
                          column: path.node.loc.end.column - 1,
                        },
                      },
                      replacement:
                        ", { httpOnly: true, secure: true, sameSite: 'strict' }",
                    }
                  : undefined,
              });
            }
            return;
          }

          // Check options object
          const options = args[2] as any;
          const props = new Map<string, any>();
          for (const prop of options.properties) {
            if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier') {
              props.set(prop.key.name, prop.value);
            }
          }

          const issues: string[] = [];

          // httpOnly
          const httpOnly = props.get('httpOnly');
          if (!httpOnly || (httpOnly.type === 'BooleanLiteral' && !httpOnly.value)) {
            issues.push('httpOnly should be true');
          }

          // secure
          const secure = props.get('secure');
          if (!secure || (secure.type === 'BooleanLiteral' && !secure.value)) {
            issues.push('secure should be true');
          }

          // sameSite
          if (!props.has('sameSite')) {
            issues.push("sameSite should be 'strict' or 'lax'");
          }

          if (issues.length > 0 && isSensitive) {
            violations.push({
              ruleId: 'security/insecure-cookie',
              severity: 'high',
              message: `Cookie "${cookieName}" has insecure flags: ${issues.join('; ')}.`,
              location: {
                file: filePath,
                line: options.loc?.start.line ?? path.node.loc?.start.line ?? 0,
                column: options.loc?.start.column ?? path.node.loc?.start.column ?? 0,
              },
              fix: options.loc
                ? {
                    description: `Fix security flags on "${cookieName}" cookie`,
                    range: {
                      start: {
                        line: options.loc.start.line,
                        column: options.loc.start.column,
                      },
                      end: {
                        line: options.loc.end.line,
                        column: options.loc.end.column,
                      },
                    },
                    replacement:
                      "{ httpOnly: true, secure: true, sameSite: 'strict' }",
                  }
                : undefined,
            });
          }
        }
      },

      // document.cookie = '...' — client-side cookie is always risky
      AssignmentExpression(path) {
        const left = path.node.left;
        if (
          left.type === 'MemberExpression' &&
          left.object.type === 'Identifier' &&
          left.object.name === 'document' &&
          left.property.type === 'Identifier' &&
          left.property.name === 'cookie'
        ) {
          violations.push({
            ruleId: 'security/insecure-cookie',
            severity: 'warning',
            message:
              'Setting document.cookie directly — cookies set this way cannot have httpOnly flag. Use server-side cookie setting.',
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

export default insecureCookieRule;
