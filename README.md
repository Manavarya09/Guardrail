# Guardrail

> Ship fast. Stay safe.

A production-grade CLI + modular engine that scans codebases (especially AI-generated code) for security issues, performance problems, bad patterns, and dead or duplicated logic — with AST-based auto-fixing.

## Features

- **Security scanning** — Detects hardcoded API keys, SQL injection patterns
- **Code quality** — Finds dead code, duplicate logic, inefficient loops
- **Auto-fix** — AST-based transformations with diff output
- **Pluggable rules** — Easy to extend with custom rules
- **Developer-friendly** — Clean, colored CLI output

## Quick Start

```bash
# Install
npm install -g @guardrail/cli

# Scan a directory
guardrail scan ./src

# Scan with specific severity threshold
guardrail scan ./src --severity high

# Auto-fix issues
guardrail fix ./src

# Dry-run fixes (show diffs without applying)
guardrail fix ./src --dry-run
```

## Monorepo Structure

```
packages/
  cli/        — CLI interface (scan, fix commands)
  core/       — Rule engine, file discovery, reporting
  rules/      — Built-in rule implementations
  fixer/      — AST-based auto-fix engine
```

## Built-in Rules

| Rule | ID | Severity | Auto-fix |
|------|----|----------|----------|
| Hardcoded API Key | `security/hardcoded-api-key` | critical | No |
| SQL Injection | `security/sql-injection` | critical | No |
| Dead Code | `quality/dead-code` | warning | Yes |
| Duplicate Logic | `quality/duplicate-logic` | warning | No |
| Inefficient Loop | `performance/inefficient-loop` | warning | Yes |

## Writing Custom Rules

```typescript
import { Rule, RuleContext } from '@guardrail/core';

const myRule: Rule = {
  id: 'custom/my-rule',
  name: 'My Custom Rule',
  description: 'Detects something custom',
  severity: 'warning',
  category: 'quality',
  detect(context: RuleContext) {
    // Analyze context.ast, context.source, context.filePath
    // Return an array of violations
    return [];
  },
};

export default myRule;
```

## Development

```bash
# Clone and install
git clone https://github.com/Manavarya09/Guardrail.git
cd Guardrail
npm install
npm run build

# Run tests
npm test

# Run CLI in development
npm run dev -- scan ./examples
```

## Architecture

Guardrail uses a pipeline architecture:

1. **File Discovery** — Glob-based file collection with ignore patterns
2. **Parsing** — Babel AST parsing with TypeScript/JSX support
3. **Rule Engine** — Runs all enabled rules against each file's AST
4. **Reporting** — Aggregates violations, formats output
5. **Fixing** — Applies AST transformations, generates diffs

## License

MIT
