# @guardrail-ai/cli

CLI for [Guardrail](https://github.com/Manavarya09/Guardrail) — scan and fix AI-generated code for security, performance, and quality issues.

## Install

```bash
npm install -g @guardrail-ai/cli
```

## Commands

```bash
# Scan a directory
guardrail scan ./src

# Auto-fix issues
guardrail fix ./src

# Dry-run (show diffs without applying)
guardrail fix ./src --dry-run

# Watch mode
guardrail watch ./src

# Generate HTML report
guardrail scan ./src --report html

# JSON output
guardrail scan ./src --json

# Filter by severity
guardrail scan ./src --severity high

# Filter by rules
guardrail scan ./src --rules "security/sql-injection,security/no-eval"

# Initialize config
guardrail init
```

## Output

```
  Guardrail — scanning for issues...

src/api/auth.ts
   CRIT  12:6   Hardcoded secret in variable "API_KEY"   [security/hardcoded-api-key]
   HIGH  28:2   cors() called with no arguments            [security/insecure-cors]
   WARN  45:4   Sequential await inside loop               [performance/inefficient-loop]
   WARN  52:0   console.log() call                         [ai-codegen/console-log-spam]  (fixable)

Found 4 issues in 1 file (0.03s)
  1 critical, 1 high, 2 warnings
  1 issue is auto-fixable (run guardrail fix)
```

## 22 rules across 4 categories

Security, AI-Codegen, Quality, and Performance. See the [full rules list](https://github.com/Manavarya09/Guardrail#22-built-in-rules).

## License

MIT
