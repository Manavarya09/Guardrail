import type { Rule } from '@guardrail-ai/core';

// Security
import hardcodedApiKeyRule from './hardcoded-api-key.js';
import sqlInjectionRule from './sql-injection.js';
import insecureCorsRule from './insecure-cors.js';
import envVarLeakRule from './env-var-leak.js';
import noRateLimitingRule from './no-rate-limiting.js';
import unsafeRegexRule from './unsafe-regex.js';
import noEvalRule from './no-eval.js';
import noSecretsInLogsRule from './no-secrets-in-logs.js';

// Quality
import deadCodeRule from './dead-code.js';
import duplicateLogicRule from './duplicate-logic.js';

// Performance
import inefficientLoopRule from './inefficient-loop.js';
import nPlusOneQueryRule from './n-plus-one-query.js';

// AI-Codegen
import hallucinatedImportRule from './hallucinated-import.js';
import placeholderCodeRule from './placeholder-code.js';
import hardcodedLocalhostRule from './hardcoded-localhost.js';
import consoleLogSpamRule from './console-log-spam.js';
import overlyBroadCatchRule from './overly-broad-catch.js';
import unusedImportsRule from './unused-imports.js';
import anyTypeAbuseRule from './any-type-abuse.js';
import fetchWithoutErrorHandlingRule from './fetch-without-error-handling.js';
import promiseWithoutCatchRule from './promise-without-catch.js';
import magicNumbersRule from './magic-numbers.js';

export const builtinRules: Rule[] = [
  // Security
  hardcodedApiKeyRule,
  sqlInjectionRule,
  insecureCorsRule,
  envVarLeakRule,
  noRateLimitingRule,
  unsafeRegexRule,
  noEvalRule,
  noSecretsInLogsRule,

  // Quality
  deadCodeRule,
  duplicateLogicRule,

  // Performance
  inefficientLoopRule,
  nPlusOneQueryRule,

  // AI-Codegen
  hallucinatedImportRule,
  placeholderCodeRule,
  hardcodedLocalhostRule,
  consoleLogSpamRule,
  overlyBroadCatchRule,
  unusedImportsRule,
  anyTypeAbuseRule,
  fetchWithoutErrorHandlingRule,
  promiseWithoutCatchRule,
  magicNumbersRule,
];

export {
  hardcodedApiKeyRule,
  sqlInjectionRule,
  insecureCorsRule,
  envVarLeakRule,
  noRateLimitingRule,
  deadCodeRule,
  duplicateLogicRule,
  inefficientLoopRule,
  nPlusOneQueryRule,
  hallucinatedImportRule,
  placeholderCodeRule,
  hardcodedLocalhostRule,
  consoleLogSpamRule,
  overlyBroadCatchRule,
  unusedImportsRule,
  anyTypeAbuseRule,
  fetchWithoutErrorHandlingRule,
  promiseWithoutCatchRule,
  magicNumbersRule,
  unsafeRegexRule,
  noEvalRule,
  noSecretsInLogsRule,
};
