# Guardrail for VS Code

**Real-time security scanning for AI-generated code.**

Detects vulnerabilities, bad patterns, and anti-patterns that ESLint and Snyk miss — right in your editor.

## Features

- **30 detection rules** across security, AI-codegen, quality, and performance
- **Real-time scanning** — see issues as you save (or as you type)
- **Inline diagnostics** — red/yellow squiggles on problematic lines
- **Quick fixes** — lightbulb actions to auto-fix or suppress issues
- **Status bar** — shows issue count with severity
- **Workspace scan** — scan all JS/TS files at once

## Commands

- `Guardrail: Scan Current File` — scan the active file
- `Guardrail: Scan Workspace` — scan all JS/TS files
- `Guardrail: Fix Current File` — auto-fix issues using AST transforms
- `Guardrail: Toggle Scan on Save` — enable/disable auto-scanning

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `guardrail.enable` | `true` | Enable Guardrail scanning |
| `guardrail.scanOnSave` | `true` | Scan files when saved |
| `guardrail.scanOnType` | `false` | Scan as you type (debounced) |
| `guardrail.severity` | `info` | Minimum severity to report |
| `guardrail.disabledRules` | `[]` | Rule IDs to disable |

## Quick Fixes

Click the lightbulb on any issue to:
- **Auto-fix** — applies safe AST transform (for fixable issues)
- **Suppress** — adds `// guardrail-ignore-next-line` comment
