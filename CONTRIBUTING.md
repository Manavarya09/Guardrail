# Contributing to Guardrail

Thanks for your interest in contributing! Guardrail is built to be extensible, and adding new rules is one of the best ways to contribute.

## Development Setup

```bash
git clone https://github.com/Manavarya09/Guardrail.git
cd Guardrail
npm install
npm run build
npm test
```

## Project Structure

```
packages/
  core/       Rule engine, parser, file discovery, types
  rules/      Built-in rule implementations
  fixer/      AST-based auto-fix engine
  cli/        CLI interface
```

## Writing a New Rule

1. Create a new file in `packages/rules/src/`:

```typescript
import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail-ai/core';

const myRule: Rule = {
  id: 'category/rule-name',       // e.g. security/xss-vulnerability
  name: 'Human Readable Name',
  description: 'What this rule detects',
  severity: 'warning',            // critical | high | warning | info
  category: 'quality',            // security | performance | quality | ai-codegen

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      // Add your AST visitors here
    });

    return violations;
  },
};

export default myRule;
```

2. Register it in `packages/rules/src/index.ts`
3. Add tests in `packages/rules/src/__tests__/your-rule.test.ts`
4. Run `npm run build && npm test`

## Testing Pattern

Each test should cover:
- **Detection**: Code that should trigger the rule
- **Clean pass**: Code that should NOT trigger the rule
- **Edge cases**: Boundary conditions

```typescript
import { describe, it, expect } from 'vitest';
import { parseSource } from '@guardrail-ai/core';
import rule from '../your-rule.js';

function detect(source: string) {
  const ast = parseSource(source, 'test.js');
  return rule.detect({ filePath: 'test.js', source, ast });
}

describe('category/rule-name', () => {
  it('detects the bad pattern', () => {
    const v = detect('// bad code here');
    expect(v.length).toBeGreaterThanOrEqual(1);
  });

  it('passes clean code', () => {
    const v = detect('// good code here');
    expect(v).toHaveLength(0);
  });
});
```

## Pull Request Process

1. Fork the repo and create a branch
2. Make your changes
3. Ensure `npm run build && npm test` passes
4. Submit a PR with a clear description

## Rule Naming Conventions

- **Security rules**: `security/rule-name`
- **Performance rules**: `performance/rule-name`
- **Quality rules**: `quality/rule-name`
- **AI-codegen rules**: `ai-codegen/rule-name`

## Code Style

- TypeScript with strict mode
- Use `@babel/traverse` for AST walking
- Keep rules focused on a single concern
- Provide auto-fix suggestions when feasible
