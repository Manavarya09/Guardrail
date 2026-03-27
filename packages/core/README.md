# @guardrail-ai/core

Core rule engine, AST parser, file discovery, and types for [Guardrail](https://github.com/Manavarya09/Guardrail).

## Install

```bash
npm install @guardrail-ai/core
```

## Usage

```typescript
import { GuardrailEngine, parseSource } from '@guardrail-ai/core';

const engine = new GuardrailEngine({ severityThreshold: 'warning' });
engine.registerRules(myRules);

const summary = await engine.scan('./src');
console.log(`Found ${summary.totalViolations} issues`);
```

## API

- **`GuardrailEngine`** — Main scanning engine. Register rules, scan files/directories.
- **`parseSource(source, filePath)`** — Babel AST parser with TypeScript/JSX support.
- **`discoverFiles(path, config)`** — Glob-based file discovery with ignore patterns.
- **`loadConfig(searchFrom?)`** — Load `.guardrailrc.json` or `guardrail.config.js` via cosmiconfig.
- **`ScanCache`** — Content-hash based file caching for incremental scans.

## Types

```typescript
interface Rule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'warning' | 'info';
  category: 'security' | 'performance' | 'quality' | 'ai-codegen';
  detect(context: RuleContext): Violation[];
}
```

## License

MIT
