import { describe, it, expect } from 'vitest';
import { parseSource } from '@guardrail-ai/core';
import rule from '../dead-code.js';

function detect(source: string) {
  const ast = parseSource(source, 'test.js');
  return rule.detect({ filePath: 'test.js', source, ast });
}

describe('quality/dead-code', () => {
  it('detects unreachable code after return', () => {
    const v = detect(`
function foo() {
  return 1;
  console.log("dead");
}
foo();
`);
    expect(v.some((x) => x.message.includes('Unreachable'))).toBe(true);
  });

  it('detects unreachable code after throw', () => {
    const v = detect(`
function foo() {
  throw new Error("x");
  console.log("dead");
}
foo();
`);
    expect(v.some((x) => x.message.includes('Unreachable'))).toBe(true);
  });

  it('detects empty catch block', () => {
    const v = detect(`
try { x(); } catch (e) {}
`);
    expect(v.some((x) => x.message.includes('Empty catch'))).toBe(true);
  });

  it('allows catch block with comment', () => {
    const v = detect(`
try { x(); } catch (e) { /* intentionally empty */ }
`);
    expect(v.filter((x) => x.message.includes('Empty catch'))).toHaveLength(0);
  });

  it('detects unused function', () => {
    const v = detect(`
function unused() { return 1; }
`);
    expect(v.some((x) => x.message.includes('never used'))).toBe(true);
  });

  it('does not flag exported functions', () => {
    const v = detect(`
export function used() { return 1; }
`);
    expect(v.filter((x) => x.message.includes('never used'))).toHaveLength(0);
  });

  it('does not flag called functions', () => {
    const v = detect(`
function helper() { return 1; }
helper();
`);
    expect(v.filter((x) => x.message.includes('never used'))).toHaveLength(0);
  });
});
