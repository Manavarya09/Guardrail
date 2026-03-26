# @guardrail-ai/mcp

Model Context Protocol (MCP) server for Guardrail. Use Guardrail as a Claude Code plugin or with any MCP-compatible AI assistant.

## Setup with Claude Code

Add to your Claude Code settings (`.claude/settings.json`):

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

## Available Tools

### guardrail_scan
Scan a directory or file for issues.

### guardrail_fix
Auto-fix detected issues (dry-run by default).

### guardrail_list_rules
List all 19 built-in detection rules.
