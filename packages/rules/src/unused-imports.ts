import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail/core';

const unusedImportsRule: Rule = {
  id: 'ai-codegen/unused-imports',
  name: 'Unused Imports',
  description: 'Detects imported identifiers that are never referenced in the file',
  severity: 'warning',
  category: 'ai-codegen',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      ImportDeclaration(path) {
        for (const specifier of path.node.specifiers) {
          const localName = specifier.local.name;
          const binding = path.scope.getBinding(localName);

          if (binding && binding.references === 0) {
            violations.push({
              ruleId: 'ai-codegen/unused-imports',
              severity: 'warning',
              message: `"${localName}" is imported but never used.`,
              location: {
                file: filePath,
                line: specifier.loc?.start.line ?? 0,
                column: specifier.loc?.start.column ?? 0,
              },
              fix: path.node.specifiers.length === 1
                ? {
                    description: `Remove unused import of "${localName}"`,
                    range: {
                      start: {
                        line: path.node.loc?.start.line ?? 0,
                        column: path.node.loc?.start.column ?? 0,
                      },
                      end: {
                        line: path.node.loc?.end.line ?? 0,
                        column: path.node.loc?.end.column ?? 0,
                      },
                    },
                    replacement: '',
                  }
                : undefined,
            });
          }
        }
      },
    });

    return violations;
  },
};

export default unusedImportsRule;
