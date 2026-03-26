import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail/core';

const COMMENT_PATTERNS =
  /\b(TODO|FIXME|HACK|PLACEHOLDER|XXX|TEMP|implement\s*(this|later|here)|add\s*(logic|code|implementation)\s*here|replace\s*(this|with)|your[_\s-]*(code|logic|implementation)\s*here)\b/i;

const STRING_PATTERNS =
  /^(placeholder|example\.com|your[_-]api[_-]key[_-]here|your[_-].*[_-]here|test123|lorem\s*ipsum|foo|bar|baz|changeme|replace[_-]me)$/i;

const URL_PATTERNS = /^https?:\/\/example\.(com|org|net)/;

const placeholderCodeRule: Rule = {
  id: 'ai-codegen/placeholder-code',
  name: 'Placeholder Code',
  description:
    'Detects TODO/FIXME comments, placeholder strings, and example.com URLs left by AI generators',
  severity: 'warning',
  category: 'ai-codegen',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    // Check comments
    if (ast.comments) {
      for (const comment of ast.comments) {
        if (COMMENT_PATTERNS.test(comment.value)) {
          violations.push({
            ruleId: 'ai-codegen/placeholder-code',
            severity: 'warning',
            message: `Placeholder comment found: "${comment.value.trim().substring(0, 60)}..."`,
            location: {
              file: filePath,
              line: comment.loc?.start.line ?? 0,
              column: comment.loc?.start.column ?? 0,
            },
          });
        }
      }
    }

    // Check string literals
    traverse(ast, {
      StringLiteral(path) {
        const val = path.node.value;
        if (STRING_PATTERNS.test(val) || URL_PATTERNS.test(val)) {
          violations.push({
            ruleId: 'ai-codegen/placeholder-code',
            severity: 'warning',
            message: `Placeholder string "${val.substring(0, 40)}" — likely needs to be replaced with real values.`,
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

export default placeholderCodeRule;
