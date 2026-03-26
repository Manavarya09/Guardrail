import { describe, it, expect } from 'vitest';
import { parseSource } from '@guardrail-ai/core';
import unsafeRegex from '../unsafe-regex.js';
import noEval from '../no-eval.js';
import noSecretsInLogs from '../no-secrets-in-logs.js';

function detect(rule: any, source: string, file = 'test.js') {
  const ast = parseSource(source, file);
  return rule.detect({ filePath: file, source, ast });
}

describe('security/unsafe-regex', () => {
  it('detects ReDoS patterns', () => {
    const v = detect(unsafeRegex, 'const re = /(a+)+$/;');
    expect(v).toHaveLength(1);
    expect(v[0].ruleId).toBe('security/unsafe-regex');
  });

  it('detects ReDoS in new RegExp', () => {
    const v = detect(unsafeRegex, 'const re = new RegExp("(a+)+");');
    expect(v).toHaveLength(1);
  });

  it('ignores safe regex', () => {
    const v = detect(unsafeRegex, 'const re = /^[a-z]+$/;');
    expect(v).toHaveLength(0);
  });
});

describe('security/no-eval', () => {
  it('detects eval()', () => {
    const v = detect(noEval, 'eval("console.log(1)");');
    expect(v).toHaveLength(1);
    expect(v[0].severity).toBe('critical');
  });

  it('detects new Function()', () => {
    const v = detect(noEval, 'const fn = new Function("return 1");');
    expect(v).toHaveLength(1);
  });

  it('ignores safe code', () => {
    const v = detect(noEval, 'const x = JSON.parse("{}");');
    expect(v).toHaveLength(0);
  });
});

describe('security/no-secrets-in-logs', () => {
  it('detects sensitive variable in console.log', () => {
    const v = detect(noSecretsInLogs, 'console.log(password);');
    expect(v).toHaveLength(1);
  });

  it('detects sensitive property in console.log', () => {
    const v = detect(noSecretsInLogs, 'console.log(user.secretKey);');
    expect(v).toHaveLength(1);
  });

  it('ignores non-sensitive logging', () => {
    const v = detect(noSecretsInLogs, 'console.log(username);');
    expect(v).toHaveLength(0);
  });
});
