import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { Rule, RuleContext, Violation } from '@guardrail/core';

/**
 * Detects SQL injection vulnerabilities from string concatenation
 * or template literals used in database query calls.
 *
 * Catches patterns like:
 *   db.query("SELECT * FROM users WHERE id = " + userId)
 *   db.query(`SELECT * FROM users WHERE id = ${userId}`)
 *   connection.execute("DELETE FROM " + table)
 */

const SQL_KEYWORDS =
  /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|WHERE|FROM|INTO|VALUES|SET|TABLE|DATABASE)\b/i;

const QUERY_METHOD_NAMES = new Set([
  'query',
  'execute',
  'exec',
  'raw',
  'rawQuery',
  'prepare',
  'run',
]);

function containsSqlKeyword(value: string): boolean {
  return SQL_KEYWORDS.test(value);
}

function isQueryCall(path: any): boolean {
  const callee = path.node.callee;

  // db.query(...)
  if (
    callee.type === 'MemberExpression' &&
    callee.property.type === 'Identifier' &&
    QUERY_METHOD_NAMES.has(callee.property.name)
  ) {
    return true;
  }

  // query(...)
  if (
    callee.type === 'Identifier' &&
    QUERY_METHOD_NAMES.has(callee.name)
  ) {
    return true;
  }

  return false;
}

function hasDynamicParts(node: t.Node): boolean {
  // Template literal with expressions
  if (
    node.type === 'TemplateLiteral' &&
    node.expressions.length > 0
  ) {
    return true;
  }

  // String concatenation with non-literal
  if (
    node.type === 'BinaryExpression' &&
    node.operator === '+'
  ) {
    return true;
  }

  return false;
}

function extractStaticSqlParts(node: t.Node): string {
  if (node.type === 'StringLiteral') {
    return node.value;
  }
  if (node.type === 'TemplateLiteral') {
    return node.quasis.map((q) => q.value.raw).join('');
  }
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    return (
      extractStaticSqlParts(node.left) +
      extractStaticSqlParts(node.right)
    );
  }
  return '';
}

const sqlInjectionRule: Rule = {
  id: 'security/sql-injection',
  name: 'SQL Injection',
  description:
    'Detects potential SQL injection from string concatenation or template literals in database queries',
  severity: 'critical',
  category: 'security',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      CallExpression(path) {
        if (!isQueryCall(path)) return;

        const args = path.node.arguments;
        if (args.length === 0) return;

        const firstArg = args[0];
        if (firstArg.type === 'SpreadElement') return;

        const staticSql = extractStaticSqlParts(firstArg);

        if (containsSqlKeyword(staticSql) && hasDynamicParts(firstArg)) {
          violations.push({
            ruleId: 'security/sql-injection',
            severity: 'critical',
            message:
              'Potential SQL injection: dynamic values in SQL query string. Use parameterized queries instead.',
            location: {
              file: filePath,
              line: firstArg.loc?.start.line ?? 0,
              column: firstArg.loc?.start.column ?? 0,
            },
          });
        }
      },
    });

    return violations;
  },
};

export default sqlInjectionRule;
