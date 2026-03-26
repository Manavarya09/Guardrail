import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

/**
 * Detects dead code patterns:
 *   - Unreachable code after return/throw/break/continue
 *   - Unused function declarations (within module scope)
 *   - Empty catch blocks that swallow errors
 */

const deadCodeRule: Rule = {
  id: 'quality/dead-code',
  name: 'Dead Code',
  description:
    'Detects unreachable code, unused declarations, and empty error handlers',
  severity: 'warning',
  category: 'quality',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath, source } = context;

    // Track function declarations and their references
    const declaredFunctions = new Map<
      string,
      { line: number; column: number; binding: any }
    >();
    const exportedNames = new Set<string>();

    traverse(ast, {
      // Detect unreachable code after return/throw
      'ReturnStatement|ThrowStatement|BreakStatement|ContinueStatement'(
        path,
      ) {
        const siblings = (path.container as any[]);
        if (!Array.isArray(siblings)) return;

        const idx = siblings.indexOf(path.node);
        if (idx === -1 || idx >= siblings.length - 1) return;

        const nextSibling = siblings[idx + 1];
        // Skip if next is a function/class declaration (hoisted)
        if (
          nextSibling.type === 'FunctionDeclaration' ||
          nextSibling.type === 'ClassDeclaration'
        ) {
          return;
        }

        violations.push({
          ruleId: 'quality/dead-code',
          severity: 'warning',
          message: `Unreachable code after ${path.node.type.replace('Statement', '').toLowerCase()} statement`,
          location: {
            file: filePath,
            line: nextSibling.loc?.start.line ?? 0,
            column: nextSibling.loc?.start.column ?? 0,
          },
          fix: {
            description: 'Remove unreachable code',
            range: {
              start: {
                line: nextSibling.loc?.start.line ?? 0,
                column: nextSibling.loc?.start.column ?? 0,
              },
              end: {
                line: nextSibling.loc?.end.line ?? 0,
                column: nextSibling.loc?.end.column ?? 0,
              },
            },
            replacement: '',
          },
        });
      },

      // Track exports
      ExportNamedDeclaration(path) {
        const decl = path.node.declaration;
        if (decl?.type === 'FunctionDeclaration' && decl.id) {
          exportedNames.add(decl.id.name);
        }
        if (decl?.type === 'VariableDeclaration') {
          for (const d of decl.declarations) {
            if (d.id.type === 'Identifier') {
              exportedNames.add(d.id.name);
            }
          }
        }
        for (const spec of path.node.specifiers) {
          if (spec.type === 'ExportSpecifier' && spec.exported.type === 'Identifier') {
            exportedNames.add(spec.exported.name);
          }
        }
      },

      ExportDefaultDeclaration(path) {
        const decl = path.node.declaration;
        if (decl.type === 'Identifier') {
          exportedNames.add(decl.name);
        }
        if (
          (decl.type === 'FunctionDeclaration' ||
            decl.type === 'ClassDeclaration') &&
          decl.id
        ) {
          exportedNames.add(decl.id.name);
        }
      },

      // Track function declarations at module level
      FunctionDeclaration(path) {
        if (
          path.parent.type === 'Program' &&
          path.node.id
        ) {
          const name = path.node.id.name;
          declaredFunctions.set(name, {
            line: path.node.loc?.start.line ?? 0,
            column: path.node.loc?.start.column ?? 0,
            binding: path.scope.getBinding(name),
          });
        }
      },

      // Detect empty catch blocks
      CatchClause(path) {
        if (
          path.node.body.body.length === 0
        ) {
          // Check if there's at least a comment
          const startLine = path.node.body.loc?.start.line ?? 0;
          const endLine = path.node.body.loc?.end.line ?? 0;
          const lines = source.split('\n').slice(startLine - 1, endLine);
          const hasComment = lines.some((l) => /\/\/|\/\*/.test(l));

          if (!hasComment) {
            violations.push({
              ruleId: 'quality/dead-code',
              severity: 'warning',
              message:
                'Empty catch block swallows errors silently. Add error handling or a comment explaining why.',
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

    // Check for unused module-level functions
    for (const [name, info] of declaredFunctions) {
      if (exportedNames.has(name)) continue;

      const binding = info.binding;
      if (binding && binding.references === 0) {
        violations.push({
          ruleId: 'quality/dead-code',
          severity: 'warning',
          message: `Function "${name}" is declared but never used`,
          location: {
            file: filePath,
            line: info.line,
            column: info.column,
          },
        });
      }
    }

    return violations;
  },
};

export default deadCodeRule;
