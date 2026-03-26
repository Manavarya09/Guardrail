import { readFile, writeFile } from 'fs/promises';
import { createTwoFilesPatch } from 'diff';
import type { Violation, FixSuggestion } from '@guardrail-ai/core';

export interface FixResult {
  filePath: string;
  applied: number;
  skipped: number;
  diff: string;
  newSource: string;
}

/**
 * Applies fix suggestions to source files using line-based transformations.
 *
 * Fixes are applied bottom-to-top to preserve line numbers of earlier fixes.
 */
export class FixerEngine {
  /**
   * Apply all fixable violations to a file.
   * Returns the diff and new source without writing (dry-run by default).
   */
  async applyFixes(
    filePath: string,
    violations: Violation[],
    write = false,
  ): Promise<FixResult> {
    const source = await readFile(filePath, 'utf-8');
    const fixable = violations.filter((v) => v.fix != null);

    if (fixable.length === 0) {
      return {
        filePath,
        applied: 0,
        skipped: violations.length,
        diff: '',
        newSource: source,
      };
    }

    // Sort fixes bottom-to-top so applying them doesn't shift line numbers
    const sorted = [...fixable].sort((a, b) => {
      const aLine = a.fix!.range.start.line;
      const bLine = b.fix!.range.start.line;
      return bLine - aLine || b.fix!.range.start.column - a.fix!.range.start.column;
    });

    let lines = source.split('\n');
    let applied = 0;

    for (const violation of sorted) {
      const fix = violation.fix!;
      try {
        lines = applyFixToLines(lines, fix);
        applied++;
      } catch {
        // Skip fixes that can't be applied cleanly
      }
    }

    const newSource = lines.join('\n');
    const diff = createTwoFilesPatch(
      filePath,
      filePath,
      source,
      newSource,
      'original',
      'fixed',
    );

    if (write && newSource !== source) {
      await writeFile(filePath, newSource, 'utf-8');
    }

    return {
      filePath,
      applied,
      skipped: violations.length - applied,
      diff: source !== newSource ? diff : '',
      newSource,
    };
  }
}

function applyFixToLines(lines: string[], fix: FixSuggestion): string[] {
  const { range, replacement } = fix;
  const startLine = range.start.line - 1; // 0-indexed
  const endLine = range.end.line - 1;

  if (startLine < 0 || endLine >= lines.length) {
    throw new Error('Fix range out of bounds');
  }

  if (replacement === '') {
    // Delete the lines
    lines.splice(startLine, endLine - startLine + 1);
    return lines;
  }

  // Replace the range
  const before = lines[startLine].substring(0, range.start.column);
  const after = lines[endLine].substring(range.end.column);
  const replacementLines = replacement.split('\n');

  replacementLines[0] = before + replacementLines[0];
  replacementLines[replacementLines.length - 1] += after;

  lines.splice(startLine, endLine - startLine + 1, ...replacementLines);
  return lines;
}
