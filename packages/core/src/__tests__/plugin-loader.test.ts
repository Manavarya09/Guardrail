import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadPlugins } from '../plugin-loader.js';

describe('loadPlugins', () => {
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  afterEach(() => {
    warnSpy.mockClear();
  });

  it('returns empty array for empty plugin list', async () => {
    const rules = await loadPlugins([]);
    expect(rules).toEqual([]);
  });

  it('warns and skips missing plugins', async () => {
    const rules = await loadPlugins(['nonexistent-guardrail-plugin-xyz']);
    expect(rules).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load plugin "nonexistent-guardrail-plugin-xyz"'),
    );
  });

  it('warns for plugin without rules array', async () => {
    vi.doMock('fake-plugin-no-rules', () => ({ default: { name: 'bad-plugin' } }));
    const rules = await loadPlugins(['fake-plugin-no-rules']);
    expect(rules).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('does not export a valid'),
    );
    vi.doUnmock('fake-plugin-no-rules');
  });

  it('warns for plugin with invalid rule (missing detect)', async () => {
    vi.doMock('fake-plugin-invalid-rule', () => ({
      default: {
        name: 'partial-plugin',
        rules: [{ id: 'test-rule', name: 'Test' }],
      },
    }));
    const rules = await loadPlugins(['fake-plugin-invalid-rule']);
    expect(rules).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('invalid rule'),
    );
    vi.doUnmock('fake-plugin-invalid-rule');
  });

  it('loads valid plugin rules', async () => {
    const mockRule = {
      id: 'test/mock-rule',
      name: 'Mock Rule',
      description: 'A test rule',
      severity: 'warning',
      category: 'quality',
      detect: () => [],
    };
    vi.doMock('fake-valid-plugin', () => ({
      default: { name: 'valid-plugin', rules: [mockRule] },
    }));
    const rules = await loadPlugins(['fake-valid-plugin']);
    expect(rules).toHaveLength(1);
    expect(rules[0].id).toBe('test/mock-rule');
    vi.doUnmock('fake-valid-plugin');
  });
});
