import { describe, it, expect } from 'vitest';
import { parseSource } from '@guardrail-ai/core';
import rule from '../inefficient-loop.js';

function detect(source: string) {
  const ast = parseSource(source, 'test.js');
  return rule.detect({ filePath: 'test.js', source, ast });
}

describe('performance/inefficient-loop', () => {
  it('detects uncached array length', () => {
    const src = 'var arr = [1,2,3]; for (var i = 0; i < arr.length; i++) { console.log(arr[i]); }';
    const v = detect(src);
    expect(v.length).toBeGreaterThanOrEqual(1);
    expect(v[0].ruleId).toBe('performance/inefficient-loop');
  });

  it('ignores cached array length', () => {
    const src = 'var arr = [1,2,3]; var len = arr.length; for (var i = 0; i < len; i++) { console.log(arr[i]); }';
    const v = detect(src);
    expect(v).toHaveLength(0);
  });

  it('detects sequential await in loop', () => {
    const v = detect(`
async function f(urls) {
  for (const url of urls) {
    await fetch(url);
  }
}
f([]);
`);
    expect(v.some((x) => x.message.includes('Sequential await'))).toBe(true);
  });

  it('ignores await in nested function inside loop', () => {
    const v = detect(`
async function f(items) {
  for (const item of items) {
    const handler = async () => { await process(item); };
    handler();
  }
}
f([]);
`);
    expect(v.filter((x) => x.message.includes('Sequential await'))).toHaveLength(0);
  });
});
