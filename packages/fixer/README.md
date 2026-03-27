# @guardrail-ai/fixer

AST-based auto-fix engine for [Guardrail](https://github.com/Manavarya09/Guardrail). Applies fixes from rule violations and outputs unified diffs.

## Install

```bash
npm install @guardrail-ai/fixer
```

## Usage

```typescript
import { FixerEngine } from '@guardrail-ai/fixer';

const fixer = new FixerEngine();

// Dry run — returns diff without writing
const result = await fixer.applyFixes(filePath, violations, false);
console.log(result.diff);
console.log(`${result.applied} fixes applied`);

// Write fixes to disk
await fixer.applyFixes(filePath, violations, true);
```

## How it works

1. Sorts fixes bottom-to-top to preserve line numbers
2. Applies line-based replacements from violation fix suggestions
3. Generates unified diffs via the `diff` package
4. Optionally writes the fixed file to disk

## License

MIT
