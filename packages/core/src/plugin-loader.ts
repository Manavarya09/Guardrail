import type { Rule, GuardrailPlugin } from './types.js';

export async function loadPlugins(pluginNames: string[]): Promise<Rule[]> {
  const rules: Rule[] = [];

  for (const name of pluginNames) {
    try {
      const mod = await import(name);
      const plugin: GuardrailPlugin = mod.default ?? mod;

      if (!plugin || !plugin.rules || !Array.isArray(plugin.rules)) {
        console.warn(
          `Warning: Plugin "${name}" does not export a valid { rules: Rule[] } object. Skipping.`,
        );
        continue;
      }

      for (const rule of plugin.rules) {
        if (!rule.id || !rule.detect || typeof rule.detect !== 'function') {
          console.warn(
            `Warning: Plugin "${name}" contains an invalid rule (missing id or detect). Skipping rule.`,
          );
          continue;
        }
        rules.push(rule);
      }
    } catch (err) {
      console.warn(
        `Warning: Failed to load plugin "${name}": ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  return rules;
}
