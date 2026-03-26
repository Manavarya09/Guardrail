import { describe, it, expect } from 'vitest';
import { FixerEngine } from '../fixer-engine.js';
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { Violation } from '@guardrail-ai/core';

function makeTempFile(content: string): { path: string; cleanup: () => void } {
  const dir = join(tmpdir(), `guardrail-fix-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, 'test.js');
  writeFileSync(path, content);
  return { path, cleanup: () => rmSync(dir, { recursive: true }) };
}

describe('FixerEngine', () => {
  it('applies a fix and returns diff', async () => {
    const { path, cleanup } = makeTempFile('line1\nline2\nline3\n');
    const fixer = new FixerEngine();

    const violations: Violation[] = [{
      ruleId: 'test',
      severity: 'warning',
      message: 'test',
      location: { file: path, line: 2, column: 0 },
      fix: {
        description: 'Remove line 2',
        range: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
        replacement: '',
      },
    }];

    const result = await fixer.applyFixes(path, violations, false);
    expect(result.applied).toBe(1);
    expect(result.diff).toContain('-line2');
    cleanup();
  });

  it('writes file when write=true', async () => {
    const { path, cleanup } = makeTempFile('line1\nREMOVE\nline3\n');
    const fixer = new FixerEngine();

    const violations: Violation[] = [{
      ruleId: 'test',
      severity: 'warning',
      message: 'test',
      location: { file: path, line: 2, column: 0 },
      fix: {
        description: 'Remove',
        range: { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } },
        replacement: '',
      },
    }];

    await fixer.applyFixes(path, violations, true);
    const content = readFileSync(path, 'utf-8');
    expect(content).not.toContain('REMOVE');
    cleanup();
  });

  it('returns empty diff when no fixes available', async () => {
    const { path, cleanup } = makeTempFile('const x = 1;\n');
    const fixer = new FixerEngine();

    const violations: Violation[] = [{
      ruleId: 'test',
      severity: 'warning',
      message: 'no fix',
      location: { file: path, line: 1, column: 0 },
    }];

    const result = await fixer.applyFixes(path, violations, false);
    expect(result.applied).toBe(0);
    expect(result.diff).toBe('');
    cleanup();
  });
});
