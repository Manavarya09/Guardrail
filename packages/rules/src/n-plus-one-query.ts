import traverse from '@babel/traverse';
import type { Rule, RuleContext, Violation } from '@guardrail/core';

const QUERY_METHODS = new Set([
  'query',
  'execute',
  'findOne',
  'findById',
  'findFirst',
  'findUnique',
  'findMany',
  'find',
  'get',
  'fetch',
  'select',
  'delete',
  'update',
  'create',
  'insert',
  'remove',
  'count',
  'aggregate',
]);

// Objects that commonly hold DB methods
const DB_OBJECTS = new Set([
  'db',
  'database',
  'connection',
  'conn',
  'pool',
  'client',
  'prisma',
  'knex',
  'sequelize',
  'mongoose',
  'Model',
  'collection',
  'repository',
  'repo',
]);

const nPlusOneQueryRule: Rule = {
  id: 'performance/n-plus-one-query',
  name: 'N+1 Query',
  description:
    'Detects database query calls inside loops, indicating potential N+1 query problems',
  severity: 'high',
  category: 'performance',

  detect(context: RuleContext): Violation[] {
    const violations: Violation[] = [];
    const { ast, filePath } = context;

    traverse(ast, {
      'ForStatement|ForOfStatement|ForInStatement|WhileStatement|DoWhileStatement'(
        loopPath,
      ) {
        loopPath.traverse({
          CallExpression(callPath) {
            const callee = callPath.node.callee;
            if (callee.type !== 'MemberExpression') return;
            if (callee.property.type !== 'Identifier') return;

            const method = callee.property.name;
            if (!QUERY_METHODS.has(method)) return;

            // Check if the object looks like a DB object
            const obj = callee.object;
            let objName = '';
            if (obj.type === 'Identifier') {
              objName = obj.name;
            } else if (
              obj.type === 'MemberExpression' &&
              obj.property.type === 'Identifier'
            ) {
              objName = obj.property.name;
            }

            if (objName && DB_OBJECTS.has(objName.toLowerCase())) {
              violations.push({
                ruleId: 'performance/n-plus-one-query',
                severity: 'high',
                message: `Database call "${objName}.${method}()" inside a loop — potential N+1 query problem. Batch the query outside the loop.`,
                location: {
                  file: filePath,
                  line: callPath.node.loc?.start.line ?? 0,
                  column: callPath.node.loc?.start.column ?? 0,
                },
              });
            }
          },
        });
      },
    });

    return violations;
  },
};

export default nPlusOneQueryRule;
