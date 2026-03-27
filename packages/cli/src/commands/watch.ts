import { resolve, relative } from 'path';
import { watch } from 'chokidar';
import { GuardrailEngine, loadConfig, mergeConfigs } from '@guardrail-ai/core';
import type { Severity } from '@guardrail-ai/core';
import { builtinRules } from '@guardrail-ai/rules';
import { formatFileResult } from '../formatter.js';
import * as c from '../colors.js';
import { printBanner } from '../banner.js';

interface WatchOptions {
  severity?: string;
}

export async function watchCommand(
  target: string,
  options: WatchOptions,
): Promise<void> {
  const cwd = process.cwd();
  const targetPath = resolve(cwd, target);

  const fileConfig = loadConfig(targetPath);
  const config = mergeConfigs(fileConfig, {
    severityThreshold: (options.severity as Severity) ?? undefined,
  });

  const engine = new GuardrailEngine(config);
  engine.registerRules(builtinRules);

  printBanner();
  console.log(c.dim('  Watching for changes...'));
  console.log(c.dim(`  Target: ${targetPath}`));
  console.log('');

  const watcher = watch(targetPath, {
    ignored: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
    persistent: true,
    ignoreInitial: true,
  });

  const scanFile = async (filePath: string) => {
    if (!/\.(js|jsx|ts|tsx)$/.test(filePath)) return;

    try {
      const result = await engine.scanFile(filePath);
      const output = formatFileResult(result, cwd);

      if (output) {
        console.log(c.dim(`  [${new Date().toLocaleTimeString()}] Changed: ${relative(cwd, filePath)}`));
        console.log(output);
        console.log('');
      } else {
        console.log(
          c.dim(`  [${new Date().toLocaleTimeString()}] `) +
            c.green(`${relative(cwd, filePath)} — no issues`),
        );
      }
    } catch {
      // Skip files that can't be scanned
    }
  };

  watcher.on('change', scanFile);
  watcher.on('add', scanFile);

  // Keep process alive
  process.on('SIGINT', () => {
    console.log(c.dim('\n  Stopping watcher...'));
    watcher.close();
    process.exit(0);
  });
}
