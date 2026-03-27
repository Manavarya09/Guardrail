# @guardrail-ai/rules

22 built-in detection rules for [Guardrail](https://github.com/Manavarya09/Guardrail).

## Install

```bash
npm install @guardrail-ai/rules
```

## Usage

```typescript
import { builtinRules } from '@guardrail-ai/rules';
import { GuardrailEngine } from '@guardrail-ai/core';

const engine = new GuardrailEngine();
engine.registerRules(builtinRules);
```

## Rules

### Security (8)
| Rule | Severity |
|------|----------|
| `security/hardcoded-api-key` | critical |
| `security/sql-injection` | critical |
| `security/no-eval` | critical |
| `security/insecure-cors` | high |
| `security/env-var-leak` | high |
| `security/unsafe-regex` | high |
| `security/no-secrets-in-logs` | high |
| `security/no-rate-limiting` | info |

### AI-Codegen (10)
| Rule | Severity |
|------|----------|
| `ai-codegen/hallucinated-import` | high |
| `ai-codegen/placeholder-code` | warning |
| `ai-codegen/hardcoded-localhost` | warning |
| `ai-codegen/overly-broad-catch` | warning |
| `ai-codegen/unused-imports` | warning |
| `ai-codegen/any-type-abuse` | warning |
| `ai-codegen/fetch-without-error-handling` | warning |
| `ai-codegen/promise-without-catch` | warning |
| `ai-codegen/console-log-spam` | info |
| `ai-codegen/magic-numbers` | info |

### Quality (2)
| Rule | Severity |
|------|----------|
| `quality/dead-code` | warning |
| `quality/duplicate-logic` | warning |

### Performance (2)
| Rule | Severity |
|------|----------|
| `performance/inefficient-loop` | warning |
| `performance/n-plus-one-query` | high |

## License

MIT
