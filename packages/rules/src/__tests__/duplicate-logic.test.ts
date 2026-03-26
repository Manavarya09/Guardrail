import { describe, it, expect } from 'vitest';
import { parseSource } from '@guardrail-ai/core';
import rule from '../duplicate-logic.js';

function detect(source: string) {
  const ast = parseSource(source, 'test.js');
  return rule.detect({ filePath: 'test.js', source, ast });
}

describe('quality/duplicate-logic', () => {
  it('detects identical function bodies', () => {
    const v = detect(`
function calcA(amount) {
  const rate = 0.15;
  const base = amount * rate;
  const surcharge = base > 1000 ? base * 0.05 : 0;
  return base + surcharge;
}
function calcB(amount) {
  const rate = 0.15;
  const base = amount * rate;
  const surcharge = base > 1000 ? base * 0.05 : 0;
  return base + surcharge;
}
`);
    expect(v.length).toBeGreaterThanOrEqual(1);
    expect(v[0].ruleId).toBe('quality/duplicate-logic');
  });

  it('does not flag different function bodies', () => {
    const v = detect(`
function add(a, b) { return a + b; }
function sub(a, b) { return a - b; }
`);
    expect(v).toHaveLength(0);
  });

  it('ignores small functions', () => {
    const v = detect(`
function a() { return 1; }
function b() { return 1; }
`);
    expect(v).toHaveLength(0);
  });
});
