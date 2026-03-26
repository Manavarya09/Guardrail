import { describe, it, expect } from 'vitest';
import { parseSource } from '@guardrail/core';

import hallucinatedImport from '../hallucinated-import.js';
import placeholderCode from '../placeholder-code.js';
import hardcodedLocalhost from '../hardcoded-localhost.js';
import consoleLogSpam from '../console-log-spam.js';
import overlyBroadCatch from '../overly-broad-catch.js';
import unusedImports from '../unused-imports.js';
import anyTypeAbuse from '../any-type-abuse.js';
import fetchWithoutErrorHandling from '../fetch-without-error-handling.js';
import promiseWithoutCatch from '../promise-without-catch.js';
import magicNumbers from '../magic-numbers.js';
import insecureCors from '../insecure-cors.js';
import envVarLeak from '../env-var-leak.js';
import noRateLimiting from '../no-rate-limiting.js';
import nPlusOneQuery from '../n-plus-one-query.js';

function detect(rule: any, source: string, file = 'test.js') {
  const ast = parseSource(source, file);
  return rule.detect({ filePath: file, source, ast });
}

// --- AI-Codegen Rules ---

describe('ai-codegen/hallucinated-import', () => {
  it('detects known hallucinated package', () => {
    const v = detect(hallucinatedImport, 'import { foo } from "validation-utils";');
    expect(v.length).toBeGreaterThanOrEqual(1);
  });

  it('ignores real packages', () => {
    const v = detect(hallucinatedImport, 'import express from "express";');
    expect(v).toHaveLength(0);
  });

  it('ignores relative imports', () => {
    const v = detect(hallucinatedImport, 'import { foo } from "./utils";');
    expect(v).toHaveLength(0);
  });
});

describe('ai-codegen/placeholder-code', () => {
  it('detects TODO comments', () => {
    const v = detect(placeholderCode, '// TODO: implement this');
    expect(v.length).toBeGreaterThanOrEqual(1);
  });

  it('detects example.com URLs', () => {
    const v = detect(placeholderCode, 'const url = "https://example.com/api";');
    expect(v.length).toBeGreaterThanOrEqual(1);
  });

  it('ignores normal strings', () => {
    const v = detect(placeholderCode, 'const name = "production-api.myapp.com";');
    expect(v).toHaveLength(0);
  });
});

describe('ai-codegen/hardcoded-localhost', () => {
  it('detects localhost URL', () => {
    const v = detect(hardcodedLocalhost, 'const url = "http://localhost:3000/api";');
    expect(v).toHaveLength(1);
  });

  it('detects 127.0.0.1', () => {
    const v = detect(hardcodedLocalhost, 'fetch("http://127.0.0.1:8080");');
    expect(v).toHaveLength(1);
  });

  it('ignores production URLs', () => {
    const v = detect(hardcodedLocalhost, 'const url = "https://api.myapp.com";');
    expect(v).toHaveLength(0);
  });
});

describe('ai-codegen/console-log-spam', () => {
  it('detects console.log', () => {
    const v = detect(consoleLogSpam, 'console.log("test");');
    expect(v).toHaveLength(1);
    expect(v[0].fix).toBeDefined();
  });

  it('ignores console.error', () => {
    const v = detect(consoleLogSpam, 'console.error("critical failure");');
    expect(v).toHaveLength(0);
  });

  it('ignores console.warn', () => {
    const v = detect(consoleLogSpam, 'console.warn("deprecated");');
    expect(v).toHaveLength(0);
  });
});

describe('ai-codegen/overly-broad-catch', () => {
  it('detects catch with only console.log', () => {
    const v = detect(overlyBroadCatch, 'try { x(); } catch (e) { console.log(e); }');
    expect(v).toHaveLength(1);
  });

  it('ignores catch with rethrow', () => {
    const v = detect(overlyBroadCatch, 'try { x(); } catch (e) { console.log(e); throw e; }');
    expect(v).toHaveLength(0);
  });
});

describe('ai-codegen/unused-imports', () => {
  it('detects unused import', () => {
    const v = detect(unusedImports, 'import { unused } from "mod"; const x = 1;');
    expect(v).toHaveLength(1);
  });

  it('ignores used import', () => {
    const v = detect(unusedImports, 'import { used } from "mod"; used();');
    expect(v).toHaveLength(0);
  });
});

describe('ai-codegen/any-type-abuse', () => {
  it('detects : any in TS files', () => {
    const v = detect(anyTypeAbuse, 'const x: any = 1;', 'test.ts');
    expect(v).toHaveLength(1);
  });

  it('skips JS files', () => {
    const v = detect(anyTypeAbuse, 'const x = 1;', 'test.js');
    expect(v).toHaveLength(0);
  });
});

describe('ai-codegen/fetch-without-error-handling', () => {
  it('detects unhandled fetch', () => {
    const v = detect(fetchWithoutErrorHandling, 'async function f() { const r = await fetch("/api"); }');
    expect(v.length).toBeGreaterThanOrEqual(1);
  });

  it('ignores fetch in try/catch', () => {
    const v = detect(fetchWithoutErrorHandling, 'async function f() { try { await fetch("/api"); } catch(e) { throw e; } }');
    expect(v).toHaveLength(0);
  });
});

describe('ai-codegen/promise-without-catch', () => {
  it('detects .then without .catch', () => {
    const v = detect(promiseWithoutCatch, 'fetch("/api").then(r => r.json());');
    expect(v.length).toBeGreaterThanOrEqual(1);
  });

  it('ignores .then with .catch', () => {
    const v = detect(promiseWithoutCatch, 'fetch("/api").then(r => r.json()).catch(e => console.error(e));');
    expect(v).toHaveLength(0);
  });
});

describe('ai-codegen/magic-numbers', () => {
  it('detects magic numbers', () => {
    const v = detect(magicNumbers, 'const result = value * 3.14159;');
    expect(v).toHaveLength(1);
  });

  it('ignores 0 and 1', () => {
    const v = detect(magicNumbers, 'const x = arr[0]; const y = x + 1;');
    expect(v).toHaveLength(0);
  });
});

// --- Security Rules ---

describe('security/insecure-cors', () => {
  it('detects cors() with no args', () => {
    const v = detect(insecureCors, 'app.use(cors());');
    expect(v).toHaveLength(1);
  });

  it('detects cors({ origin: "*" })', () => {
    const v = detect(insecureCors, 'app.use(cors({ origin: "*" }));');
    expect(v).toHaveLength(1);
  });

  it('ignores cors with specific origin', () => {
    const v = detect(insecureCors, 'app.use(cors({ origin: "https://myapp.com" }));');
    expect(v).toHaveLength(0);
  });
});

describe('security/env-var-leak', () => {
  it('detects process.env in console.log', () => {
    const v = detect(envVarLeak, 'console.log(process.env.SECRET);');
    expect(v).toHaveLength(1);
  });

  it('ignores non-env console.log', () => {
    const v = detect(envVarLeak, 'console.log("hello");');
    expect(v).toHaveLength(0);
  });
});

describe('security/no-rate-limiting', () => {
  it('detects express without rate limiting', () => {
    const v = detect(noRateLimiting, 'import express from "express"; const app = express();');
    expect(v).toHaveLength(1);
  });

  it('passes when rate limiting is present', () => {
    const v = detect(noRateLimiting, 'import express from "express"; import rateLimit from "express-rate-limit";');
    expect(v).toHaveLength(0);
  });
});

describe('performance/n-plus-one-query', () => {
  it('detects query inside loop', () => {
    const v = detect(nPlusOneQuery, `
for (const id of ids) {
  db.query("SELECT * FROM posts WHERE user_id = ?", [id]);
}
`);
    expect(v).toHaveLength(1);
  });

  it('ignores query outside loop', () => {
    const v = detect(nPlusOneQuery, 'db.query("SELECT * FROM posts");');
    expect(v).toHaveLength(0);
  });
});
