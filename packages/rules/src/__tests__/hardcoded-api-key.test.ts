import { describe, it, expect } from 'vitest';
import { parseSource } from '@guardrail-ai/core';
import rule from '../hardcoded-api-key.js';

function detect(source: string) {
  const ast = parseSource(source, 'test.js');
  return rule.detect({ filePath: 'test.js', source, ast });
}

describe('security/hardcoded-api-key', () => {
  it('detects hardcoded API key in variable', () => {
    const v = detect('const API_KEY = "sk-abc12345678901234567890123456789";');
    expect(v.length).toBeGreaterThanOrEqual(1);
    expect(v[0].ruleId).toBe('security/hardcoded-api-key');
  });

  it('detects hardcoded password', () => {
    const v = detect('const password = "super-secret-password-123";');
    expect(v.length).toBeGreaterThanOrEqual(1);
  });

  it('detects hardcoded token in object property', () => {
    const v = detect('const cfg = { secret_token: "abcdefghijklmnop" };');
    expect(v.length).toBeGreaterThanOrEqual(1);
  });

  it('detects JWT-like string literal', () => {
    const v = detect('fetch("/api", { headers: { Authorization: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc123def456" } });');
    expect(v.length).toBeGreaterThanOrEqual(1);
  });

  it('ignores short strings', () => {
    const v = detect('const password = "short";');
    expect(v).toHaveLength(0);
  });

  it('ignores env variable usage', () => {
    const v = detect('const apiKey = process.env.API_KEY;');
    expect(v).toHaveLength(0);
  });

  it('ignores non-suspicious variable names', () => {
    const v = detect('const greeting = "hello world and some extra text";');
    expect(v).toHaveLength(0);
  });
});
