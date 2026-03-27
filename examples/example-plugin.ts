/**
 * Example Guardrail plugin.
 *
 * To use:
 *   1. Build: npx tsc examples/example-plugin.ts --outDir examples/dist --module ESNext --moduleResolution bundler
 *   2. Add to .guardrailrc.json: { "plugins": ["./examples/dist/example-plugin.js"] }
 *   3. Run: guardrail scan .
 */

import type { Rule, GuardrailPlugin } from '@guardrail-ai/core';

const noTodoCommentsRule: Rule = {
  id: 'custom/no-todo-comments',
  name: 'No TODO Comments',
  description: 'Flags TODO/FIXME/HACK comments that should be tracked as issues',
  severity: 'info',
  category: 'quality',

  detect(context) {
    const violations = [];
    const lines = context.source.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/\/\/\s*(TODO|FIXME|HACK|XXX)\b/i);
      if (match) {
        violations.push({
          ruleId: 'custom/no-todo-comments',
          severity: 'info' as const,
          message: `${match[1]} comment found — track this as an issue instead.`,
          location: {
            file: context.filePath,
            line: i + 1,
            column: lines[i].indexOf(match[0]),
          },
        });
      }
    }

    return violations;
  },
};

const plugin: GuardrailPlugin = {
  name: 'example-plugin',
  rules: [noTodoCommentsRule],
};

export default plugin;
