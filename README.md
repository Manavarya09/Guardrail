<div align="center">

# Guardrail

**The safety layer for AI-generated code.**

Scan and fix security issues, performance problems, bad patterns, and AI-specific anti-patterns -- before they ship.

[![CI](https://github.com/Manavarya09/Guardrail/actions/workflows/ci.yml/badge.svg)](https://github.com/Manavarya09/Guardrail/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@guardrail-ai/cli.svg)](https://www.npmjs.com/package/@guardrail-ai/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Guardrail-blue?logo=github)](https://github.com/marketplace/actions/guardrail-code-scanner)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

```bash
npx @guardrail-ai/cli scan .
```

```
  Guardrail -- scanning for issues...

src/api/auth.ts
   CRIT  12:6   Hardcoded secret in variable "API_KEY"        [security/hardcoded-api-key]
   CRIT  18:18  Potential SQL injection                        [security/sql-injection]
   HIGH  28:2   cors() called with no arguments                [security/insecure-cors]
   HIGH  35:0   Potentially hallucinated import "auth-utils"   [ai-codegen/hallucinated-import]
   WARN  45:4   Sequential await inside loop                   [performance/inefficient-loop]
   WARN  52:0   console.log() call                             [ai-codegen/console-log-spam]  (fixable)
   WARN  61:2   fetch() without error handling                 [ai-codegen/fetch-without-error-handling]

Found 7 issues in 1 file (0.03s)
  2 critical, 2 high, 3 warnings
  1 issue is auto-fixable (run guardrail fix)
```

---

## Why Guardrail?

AI code generators (Copilot, ChatGPT, Claude) are fast -- but they produce patterns that traditional linters miss.

| Feature | ESLint | SonarQube | Snyk | **Guardrail** |
|---------|--------|-----------|------|---------------|
| Hardcoded secrets | Plugin | Yes | No | **Yes** |
| SQL injection | No | Yes | No | **Yes** |
| eval() / new Function() | Plugin | Yes | No | **Yes** |
| Unsafe regex (ReDoS) | Plugin | No | No | **Yes** |
| AI-hallucinated imports | No | No | No | **Yes** |
| Placeholder/TODO detection | No | Partial | No | **Yes** |
| Hardcoded localhost URLs | No | No | No | **Yes** |
| console.log auto-removal | Plugin | No | No | **Yes (auto-fix)** |
| Unused import detection | Plugin | Yes | No | **Yes (auto-fix)** |
| `any` type abuse in TS | Plugin | Yes | No | **Yes** |
| Fetch without error handling | No | No | No | **Yes** |
| Promise without .catch() | No | Partial | No | **Yes** |
| N+1 query detection | No | No | No | **Yes** |
| Secrets leaked in logs | No | No | No | **Yes** |
| Insecure CORS | No | Yes | No | **Yes** |
| Env variable leaks | No | Partial | No | **Yes** |
| AST-based auto-fix | No | No | No | **Yes** |
| Zero config | No | No | Yes | **Yes** |
| < 1s scan time | No | No | N/A | **Yes** |

---

## Quick Start

```bash
# Install globally
npm install -g @guardrail-ai/cli

# Or run directly with npx
npx @guardrail-ai/cli scan ./src

# Auto-fix issues
guardrail fix ./src

# Dry-run fixes (show diffs without applying)
guardrail fix ./src --dry-run

# Watch mode
guardrail watch ./src

# Generate HTML report
guardrail scan ./src --report html

# JSON output (for CI)
guardrail scan ./src --json

# Initialize config
guardrail init
```

---

## 22 Built-in Rules

### Security (8 rules)

| Rule | ID | Severity | Auto-fix |
|------|----|----------|----------|
| Hardcoded API Key | `security/hardcoded-api-key` | critical | No |
| SQL Injection | `security/sql-injection` | critical | No |
| No Eval | `security/no-eval` | critical | No |
| Insecure CORS | `security/insecure-cors` | high | No |
| Environment Variable Leak | `security/env-var-leak` | high | No |
| Unsafe Regex (ReDoS) | `security/unsafe-regex` | high | No |
| No Secrets in Logs | `security/no-secrets-in-logs` | high | No |
| No Rate Limiting | `security/no-rate-limiting` | info | No |

### AI-Codegen (10 rules) -- unique to Guardrail

| Rule | ID | Severity | Auto-fix |
|------|----|----------|----------|
| Hallucinated Import | `ai-codegen/hallucinated-import` | high | No |
| Placeholder Code | `ai-codegen/placeholder-code` | warning | No |
| Hardcoded Localhost | `ai-codegen/hardcoded-localhost` | warning | No |
| Overly Broad Catch | `ai-codegen/overly-broad-catch` | warning | No |
| Unused Imports | `ai-codegen/unused-imports` | warning | Yes |
| Any Type Abuse | `ai-codegen/any-type-abuse` | warning | No |
| Fetch Without Error Handling | `ai-codegen/fetch-without-error-handling` | warning | No |
| Promise Without Catch | `ai-codegen/promise-without-catch` | warning | No |
| Console Log Spam | `ai-codegen/console-log-spam` | info | Yes |
| Magic Numbers | `ai-codegen/magic-numbers` | info | No |

### Quality (2 rules)

| Rule | ID | Severity | Auto-fix |
|------|----|----------|----------|
| Dead Code | `quality/dead-code` | warning | Yes |
| Duplicate Logic | `quality/duplicate-logic` | warning | No |

### Performance (2 rules)

| Rule | ID | Severity | Auto-fix |
|------|----|----------|----------|
| Inefficient Loop | `performance/inefficient-loop` | warning | Yes |
| N+1 Query | `performance/n-plus-one-query` | high | No |

---

## GitHub Action

Add Guardrail to your CI pipeline:

```yaml
- uses: Manavarya09/Guardrail@v0.1.0
  with:
    target: './src'
    severity: 'warning'
```

Issues appear as PR annotations with file and line context. Supports `fail-on`, `rules`, and `report` inputs.

---

## Claude Code Plugin (MCP)

Use Guardrail directly inside Claude Code as an MCP server:

```json
{
  "mcpServers": {
    "guardrail": {
      "command": "npx",
      "args": ["@guardrail-ai/mcp"]
    }
  }
}
```

This gives Claude Code three tools: `guardrail_scan`, `guardrail_fix`, and `guardrail_list_rules`.

---

## Configuration

Create a `.guardrailrc.json` (or run `guardrail init`):

```json
{
  "include": ["src/**/*.{js,jsx,ts,tsx}"],
  "exclude": ["**/*.test.ts"],
  "severityThreshold": "warning",
  "rules": {
    "ai-codegen/magic-numbers": false,
    "security/hardcoded-api-key": { "enabled": true, "severity": "critical" }
  }
}
```

Also supports `.guardrailrc`, `.guardrailrc.yaml`, `guardrail.config.js`, and `package.json` `"guardrail"` key.

---

## Plugin System

Write custom rules as npm packages:

```typescript
import type { GuardrailPlugin } from '@guardrail-ai/core';

const plugin: GuardrailPlugin = {
  name: 'my-rules',
  rules: [{
    id: 'custom/no-todo',
    name: 'No TODO',
    description: 'Disallow TODO comments in production',
    severity: 'warning',
    category: 'quality',
    detect(context) {
      // AST analysis here
      return [];
    },
  }],
};

export default plugin;
```

```json
{
  "plugins": ["guardrail-plugin-my-rules"]
}
```

---

## Architecture

```
packages/
  core/       Rule engine, Babel AST parser, file discovery, caching
  rules/      22 built-in rules across 4 categories
  fixer/      AST-based auto-fix engine with unified diff output
  cli/        CLI with scan, fix, watch, init commands
  mcp/        Model Context Protocol server (Claude Code plugin)
```

Pipeline: File Discovery -> Babel AST Parsing -> Rule Engine -> Reporting/Fixing

---

## Development

```bash
git clone https://github.com/Manavarya09/Guardrail.git
cd Guardrail
npm install
npm run build
npm test          # 88 tests
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the rule authoring guide.

---

## License

[MIT](LICENSE)
