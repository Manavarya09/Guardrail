import { statSync } from 'fs';
import { resolve } from 'path';
import fg from 'fast-glob';
import type { GuardrailConfig } from './types.js';

export async function discoverFiles(
  targetPath: string,
  config: GuardrailConfig,
): Promise<string[]> {
  const stat = statSync(targetPath);

  // If target is a single file, return it directly
  if (stat.isFile()) {
    return [resolve(targetPath)];
  }

  const files = await fg(config.include, {
    cwd: targetPath,
    ignore: config.exclude,
    absolute: true,
    onlyFiles: true,
    dot: false,
  });

  return files.sort();
}
