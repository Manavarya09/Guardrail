import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail/core';
import hallucinatedPackages from './data/hallucinated-packages.json';

const HALLUCINATED_SET = new Set(hallucinatedPackages);

// Heuristic: packages ending in -utils, -helpers, -tools with generic prefixes
const SUSPICIOUS_SUFFIX = /^[a-z]+-(?:utils|helpers|tools|lib|common|shared|base)$/;

function isSuspicious(source: string): boolean {
  // Skip relative imports and builtins
  if (source.startsWith('.') || source.startsWith('/')) return false;

  // Get bare package name (strip deep imports)
  const pkg = source.startsWith('@')
    ? source.split('/').slice(0, 2).join('/')
    : source.split('/')[0];

  if (HALLUCINATED_SET.has(pkg)) return true;
  if (SUSPICIOUS_SUFFIX.test(pkg)) return true;

  return false;
}

const hallucinatedImportRule: Rule = {
  id: 'ai-codegen/hallucinated-import',
  name: 'Hallucinated Import',
  description:
    'Detects imports of npm packages commonly hallucinated by AI code generators',
  severity: 'high',
  category: 'ai-codegen',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        if (isSuspicious(source)) {
          violations.push({
            ruleId: 'ai-codegen/hallucinated-import',
            severity: 'high',
            message: `Potentially hallucinated import "${source}". Verify this package exists on npm.`,
            location: {
              file: filePath,
              line: path.node.loc?.start.line ?? 0,
              column: path.node.loc?.start.column ?? 0,
            },
          });
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
          if (isSuspicious(source)) {
            violations.push({
              ruleId: 'ai-codegen/hallucinated-import',
              severity: 'high',
              message: `Potentially hallucinated require "${source}". Verify this package exists on npm.`,
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

export default hallucinatedImportRule;
