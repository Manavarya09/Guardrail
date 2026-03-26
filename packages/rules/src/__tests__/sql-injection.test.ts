import { describe, it, expect } from 'vitest';
import { parseSource } from '@guardrail-ai/core';
import rule from '../sql-injection.js';

function detect(source: string) {
  const ast = parseSource(source, 'test.js');
  return rule.detect({ filePath: 'test.js', source, ast });
}

describe('security/sql-injection', () => {
  it('detects string concatenation in query', () => {
    const v = detect('db.query("SELECT * FROM users WHERE id = " + userId);');
    expect(v).toHaveLength(1);
    expect(v[0].ruleId).toBe('security/sql-injection');
  });

  it('detects template literal in query', () => {
    const v = detect('db.query(`SELECT * FROM users WHERE id = ${userId}`);');
    expect(v).toHaveLength(1);
  });

  it('detects execute method', () => {
    const v = detect('conn.execute("DELETE FROM users WHERE name = " + name);');
    expect(v).toHaveLength(1);
  });

  it('ignores parameterized queries', () => {
    const v = detect('db.query("SELECT * FROM users WHERE id = $1", [userId]);');
    expect(v).toHaveLength(0);
  });

  it('ignores static string queries', () => {
    const v = detect('db.query("SELECT * FROM users");');
    expect(v).toHaveLength(0);
  });

  it('ignores non-SQL method calls', () => {
    const v = detect('console.log("SELECT * FROM " + table);');
    expect(v).toHaveLength(0);
  });
});
