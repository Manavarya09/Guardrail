import type { Rule } from '@guardrail/core';
import hardcodedApiKeyRule from './hardcoded-api-key.js';
import sqlInjectionRule from './sql-injection.js';
import deadCodeRule from './dead-code.js';
import duplicateLogicRule from './duplicate-logic.js';
import inefficientLoopRule from './inefficient-loop.js';

export const builtinRules: Rule[] = [
  hardcodedApiKeyRule,
  sqlInjectionRule,
  deadCodeRule,
  duplicateLogicRule,
  inefficientLoopRule,
];

export {
  hardcodedApiKeyRule,
  sqlInjectionRule,
  deadCodeRule,
  duplicateLogicRule,
  inefficientLoopRule,
};
