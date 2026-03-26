import traverse from '@babel/traverse';
import generate from '@babel/generator';
// @ts-ignore — generator types
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

/**
 * Detects duplicate logic by comparing normalized AST representations
 * of function bodies and significant code blocks.
 *
 * Two functions with identical normalized bodies are flagged.
 */

const MIN_BODY_LENGTH = 50; // Minimum characters to consider

interface FunctionSignature {
  name: string;
  normalizedBody: string;
  line: number;
  column: number;
}

function normalizeName(code: string): string {
  // Replace all identifiers with generic placeholders
  // This is a simplified normalization — a production version would
  // walk the AST and alpha-rename variables
  return code.replace(/\s+/g, ' ').trim();
}

const duplicateLogicRule: Rule = {
  id: 'quality/duplicate-logic',
  name: 'Duplicate Logic',
  description:
    'Detects functions with identical or near-identical logic that could be refactored',
  severity: 'warning',
  category: 'quality',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;
    const functions: FunctionSignature[] = [];

    traverse(ast, {
      'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(
        path,
      ) {
        const node = path.node;

        let name = 'anonymous';
        if (node.type === 'FunctionDeclaration' && node.id) {
          name = node.id.name;
        } else if (
          path.parent.type === 'VariableDeclarator' &&
          path.parent.id.type === 'Identifier'
        ) {
          name = path.parent.id.name;
        }

        const body = 'body' in node ? node.body : null;
        if (!body) return;

        try {
          const generated = generate(body as any, { compact: true }).code;
          const normalized = normalizeName(generated);

          if (normalized.length >= MIN_BODY_LENGTH) {
            functions.push({
              name,
              normalizedBody: normalized,
              line: node.loc?.start.line ?? 0,
              column: node.loc?.start.column ?? 0,
            });
          }
        } catch {
          // Skip if generation fails
        }
      },
    });

    // Compare all pairs
    const reported = new Set<string>();
    for (let i = 0; i < functions.length; i++) {
      for (let j = i + 1; j < functions.length; j++) {
        const a = functions[i];
        const b = functions[j];

        if (a.normalizedBody === b.normalizedBody) {
          const key = `${a.line}:${b.line}`;
          if (reported.has(key)) continue;
          reported.add(key);

          violations.push({
            ruleId: 'quality/duplicate-logic',
            severity: 'warning',
            message: `Function "${b.name}" (line ${b.line}) has identical logic to "${a.name}" (line ${a.line}). Consider refactoring into a shared function.`,
            location: {
              file: filePath,
              line: b.line,
              column: b.column,
            },
          });
        }
      }
    }

    return violations;
  },
};

export default duplicateLogicRule;
