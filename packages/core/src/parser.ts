import { parse, type ParserPlugin } from '@babel/parser';
import type { File as BabelFile } from '@babel/types';

const PARSER_PLUGINS: ParserPlugin[] = [
  'typescript',
  'jsx',
  'decorators-legacy',
  'classProperties',
  'classPrivateProperties',
  'classPrivateMethods',
  'optionalChaining',
  'nullishCoalescingOperator',
  'dynamicImport',
  'exportDefaultFrom',
  'exportNamespaceFrom',
  'objectRestSpread',
  'asyncGenerators',
  'optionalCatchBinding',
];

export function parseSource(source: string, filePath: string): BabelFile {
  const isTS = /\.tsx?$/.test(filePath);

  return parse(source, {
    sourceType: 'module',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    allowSuperOutsideMethod: true,
    plugins: isTS
      ? PARSER_PLUGINS
      : PARSER_PLUGINS.filter((p) => p !== 'typescript'),
    errorRecovery: true,
  });
}
