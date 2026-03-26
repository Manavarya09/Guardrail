import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

/**
 * Detects hardcoded API keys, secrets, and tokens in source code.
 *
 * Catches patterns like:
 *   const API_KEY = "sk-abc123..."
 *   headers: { Authorization: "Bearer eyJ..." }
 *   password = "hardcoded"
 */

const SUSPICIOUS_NAMES =
  /(?:api[_-]?key|secret|token|password|passwd|credentials|auth|bearer|private[_-]?key|access[_-]?key|client[_-]?secret)/i;

const KEY_PATTERNS = [
  /^sk-[a-zA-Z0-9]{20,}$/,             // OpenAI-style
  /^ghp_[a-zA-Z0-9]{36}$/,             // GitHub PAT
  /^github_pat_[a-zA-Z0-9_]{80,}$/,    // GitHub fine-grained PAT
  /^glpat-[a-zA-Z0-9\-_]{20,}$/,       // GitLab PAT
  /^xox[bposa]-[a-zA-Z0-9\-]{10,}$/,   // Slack tokens
  /^AKIA[0-9A-Z]{16}$/,                // AWS Access Key
  /^eyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/, // JWT
  /^Bearer\s+[a-zA-Z0-9\-_.]+$/,       // Bearer token
];

const MIN_SUSPICIOUS_LENGTH = 8;

function looksLikeSecret(value: string): boolean {
  if (value.length < MIN_SUSPICIOUS_LENGTH) return false;
  return KEY_PATTERNS.some((pattern) => pattern.test(value));
}

const hardcodedApiKeyRule: Rule = {
  id: 'security/hardcoded-api-key',
  name: 'Hardcoded API Key',
  description:
    'Detects hardcoded API keys, secrets, and tokens that should be stored in environment variables',
  severity: 'critical',
  category: 'security',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      VariableDeclarator(path) {
        const { id, init } = path.node;
        if (
          id.type === 'Identifier' &&
          init?.type === 'StringLiteral' &&
          SUSPICIOUS_NAMES.test(id.name)
        ) {
          const value = init.value;
          if (value.length >= MIN_SUSPICIOUS_LENGTH) {
            violations.push({
              ruleId: 'security/hardcoded-api-key',
              severity: 'critical',
              message: `Hardcoded secret in variable "${id.name}". Use environment variables instead.`,
              location: {
                file: filePath,
                line: id.loc?.start.line ?? 0,
                column: id.loc?.start.column ?? 0,
              },
            });
          }
        }
      },

      AssignmentExpression(path) {
        const { left, right } = path.node;
        if (
          left.type === 'MemberExpression' &&
          left.property.type === 'Identifier' &&
          SUSPICIOUS_NAMES.test(left.property.name) &&
          right.type === 'StringLiteral' &&
          right.value.length >= MIN_SUSPICIOUS_LENGTH
        ) {
          violations.push({
            ruleId: 'security/hardcoded-api-key',
            severity: 'critical',
            message: `Hardcoded secret assigned to "${left.property.name}". Use environment variables instead.`,
            location: {
              file: filePath,
              line: left.loc?.start.line ?? 0,
              column: left.loc?.start.column ?? 0,
            },
          });
        }
      },

      StringLiteral(path) {
        if (looksLikeSecret(path.node.value)) {
          // Avoid double-reporting if already caught above
          const parent = path.parent;
          if (
            parent.type === 'VariableDeclarator' ||
            parent.type === 'AssignmentExpression'
          ) {
            return;
          }

          violations.push({
            ruleId: 'security/hardcoded-api-key',
            severity: 'critical',
            message: `String literal looks like a hardcoded secret or token. Use environment variables instead.`,
            location: {
              file: filePath,
              line: path.node.loc?.start.line ?? 0,
              column: path.node.loc?.start.column ?? 0,
            },
          });
        }
      },

      ObjectProperty(path) {
        const { key, value } = path.node;
        const keyName =
          key.type === 'Identifier'
            ? key.name
            : key.type === 'StringLiteral'
              ? key.value
              : null;

        if (
          keyName &&
          SUSPICIOUS_NAMES.test(keyName) &&
          value.type === 'StringLiteral' &&
          value.value.length >= MIN_SUSPICIOUS_LENGTH
        ) {
          violations.push({
            ruleId: 'security/hardcoded-api-key',
            severity: 'critical',
            message: `Hardcoded secret in property "${keyName}". Use environment variables instead.`,
            location: {
              file: filePath,
              line: key.loc?.start.line ?? 0,
              column: key.loc?.start.column ?? 0,
            },
          });
        }
      },
    });

    return violations;
  },
};

export default hardcodedApiKeyRule;
