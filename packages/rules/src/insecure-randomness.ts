import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

/**
 * Detects Math.random() used in security-sensitive contexts.
 *
 * Catches patterns like:
 *   const token = Math.random().toString(36)
 *   const id = Math.random()
 *   password = generateWith(Math.random())
 */

const SENSITIVE_NAMES =
  /\b(token|secret|key|password|pass|pwd|hash|salt|nonce|csrf|session|auth|otp|code|id|uuid|guid)\b/i;

const insecureRandomnessRule: Rule = {
  id: 'security/insecure-randomness',
  name: 'Insecure Randomness',
  description:
    'Detects Math.random() usage which is not cryptographically secure. Use crypto.randomUUID() or crypto.getRandomValues() instead.',
  severity: 'high',
  category: 'security',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;

        // Match Math.random()
        if (
          callee.type !== 'MemberExpression' ||
          callee.object.type !== 'Identifier' ||
          callee.object.name !== 'Math' ||
          callee.property.type !== 'Identifier' ||
          callee.property.name !== 'random'
        ) {
          return;
        }

        // Check if assigned to a security-sensitive variable
        let isSensitive = false;

        // Walk up parent chain to find the variable declarator or assignment
        let current: any = path.parentPath;
        while (current) {
          if (current.node.type === 'VariableDeclarator') {
            const declarator = current.node as any;
            if (
              declarator.id?.type === 'Identifier' &&
              SENSITIVE_NAMES.test(declarator.id.name)
            ) {
              isSensitive = true;
            }
            break;
          }
          if (current.node.type === 'AssignmentExpression') {
            const assignment = current.node as any;
            if (
              assignment.left?.type === 'Identifier' &&
              SENSITIVE_NAMES.test(assignment.left.name)
            ) {
              isSensitive = true;
            }
            break;
          }
          current = current.parentPath;
        }

        // Only flag security-sensitive contexts — not UI/animation usage
        if (!isSensitive) return;

        violations.push({
          ruleId: 'security/insecure-randomness',
          severity: 'high',
          message:
            'Math.random() is not cryptographically secure. Use crypto.randomUUID() or crypto.getRandomValues() for security-sensitive values.',
          location: {
            file: filePath,
            line: path.node.loc?.start.line ?? 0,
            column: path.node.loc?.start.column ?? 0,
          },
          fix: path.node.loc
            ? {
                description: 'Replace Math.random() with crypto.randomUUID()',
                range: {
                  start: {
                    line: path.node.loc.start.line,
                    column: path.node.loc.start.column,
                  },
                  end: {
                    line: path.node.loc.end.line,
                    column: path.node.loc.end.column,
                  },
                },
                replacement: 'crypto.randomUUID()',
              }
            : undefined,
        });
      },
    });

    return violations;
  },
};

export default insecureRandomnessRule;
