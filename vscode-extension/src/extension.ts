import * as vscode from 'vscode';
import { GuardrailEngine, parseSource } from '@guardrail-ai/core';
import type { Violation, Severity, ScanResult } from '@guardrail-ai/core';
import { builtinRules } from '@guardrail-ai/rules';
import { FixerEngine } from '@guardrail-ai/fixer';

// ─── Globals ──────────────────────────────────────────────

let diagnosticCollection: vscode.DiagnosticCollection;
let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;
let scanOnSave = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// ─── Activation ───────────────────────────────────────────

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('Guardrail');
  diagnosticCollection = vscode.languages.createDiagnosticCollection('guardrail');

  // Status bar
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'guardrail.scanFile';
  statusBarItem.text = '$(shield) Guardrail';
  statusBarItem.tooltip = 'Click to scan current file';
  statusBarItem.show();

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('guardrail.scanFile', () => scanActiveFile()),
    vscode.commands.registerCommand('guardrail.scanWorkspace', () => scanWorkspace()),
    vscode.commands.registerCommand('guardrail.fixFile', () => fixActiveFile()),
    vscode.commands.registerCommand('guardrail.toggleOnSave', () => toggleScanOnSave()),
  );

  // Scan on save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (!getConfig().get<boolean>('scanOnSave', true)) return;
      if (!isSupported(doc)) return;
      scanDocument(doc);
    }),
  );

  // Scan on type (debounced)
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (!getConfig().get<boolean>('scanOnType', false)) return;
      if (!isSupported(e.document)) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => scanDocument(e.document), 500);
    }),
  );

  // Clear diagnostics when file is closed
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => {
      diagnosticCollection.delete(doc.uri);
    }),
  );

  // Code action provider (quick fixes)
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      [
        { language: 'javascript' },
        { language: 'typescript' },
        { language: 'javascriptreact' },
        { language: 'typescriptreact' },
      ],
      new GuardrailCodeActionProvider(),
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] },
    ),
  );

  // Scan active file on activation
  if (vscode.window.activeTextEditor) {
    const doc = vscode.window.activeTextEditor.document;
    if (isSupported(doc)) {
      scanDocument(doc);
    }
  }

  // Scan when switching tabs
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && isSupported(editor.document)) {
        scanDocument(editor.document);
      }
    }),
  );

  context.subscriptions.push(diagnosticCollection, statusBarItem, outputChannel);
  outputChannel.appendLine('Guardrail activated — 30 rules, 4 categories');
}

export function deactivate() {
  if (debounceTimer) clearTimeout(debounceTimer);
}

// ─── Config ───────────────────────────────────────────────

function getConfig() {
  return vscode.workspace.getConfiguration('guardrail');
}

function isSupported(doc: vscode.TextDocument): boolean {
  if (!getConfig().get<boolean>('enable', true)) return false;
  return ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'].includes(doc.languageId);
}

// ─── Scanning ─────────────────────────────────────────────

function createEngine(): GuardrailEngine {
  const config = getConfig();
  const severity = config.get<string>('severity', 'info') as Severity;
  const disabledRules = new Set(config.get<string[]>('disabledRules', []));

  const ruleConfig: Record<string, boolean> = {};
  for (const ruleId of disabledRules) {
    ruleConfig[ruleId] = false;
  }

  const engine = new GuardrailEngine({
    severityThreshold: severity,
    rules: ruleConfig,
  });

  engine.registerRules(builtinRules);
  return engine;
}

async function scanDocument(doc: vscode.TextDocument): Promise<ScanResult | null> {
  if (!isSupported(doc)) return null;

  const source = doc.getText();
  const filePath = doc.uri.fsPath;
  const engine = createEngine();

  let ast;
  try {
    ast = parseSource(source, filePath);
  } catch {
    return null;
  }

  const context = { filePath, source, ast };
  const violations: Violation[] = [];

  for (const rule of engine.getRegisteredRules()) {
    try {
      const ruleViolations = rule.detect(context);
      violations.push(...ruleViolations);
    } catch {
      // Skip failing rules
    }
  }

  const result: ScanResult = { filePath, violations };

  // Convert to VS Code diagnostics
  const diagnostics = violations.map((v) => violationToDiagnostic(v, doc));
  diagnosticCollection.set(doc.uri, diagnostics);

  // Update status bar
  updateStatusBar(violations);

  return result;
}

async function scanActiveFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage('No active file to scan.');
    return;
  }

  const result = await scanDocument(editor.document);
  if (!result) return;

  const count = result.violations.length;
  if (count === 0) {
    vscode.window.showInformationMessage('Guardrail: No issues found! ✓');
  } else {
    const crits = result.violations.filter((v) => v.severity === 'critical').length;
    const highs = result.violations.filter((v) => v.severity === 'high').length;
    const warns = result.violations.filter((v) => v.severity === 'warning').length;

    const parts = [];
    if (crits > 0) parts.push(`${crits} critical`);
    if (highs > 0) parts.push(`${highs} high`);
    if (warns > 0) parts.push(`${warns} warnings`);

    const fixable = result.violations.filter((v) => v.fix).length;
    const fixMsg = fixable > 0 ? ` (${fixable} auto-fixable)` : '';

    vscode.window.showWarningMessage(
      `Guardrail: ${count} issues — ${parts.join(', ')}${fixMsg}`,
      'Fix All',
      'Show Output',
    ).then((action) => {
      if (action === 'Fix All') fixActiveFile();
      if (action === 'Show Output') outputChannel.show();
    });
  }
}

async function scanWorkspace() {
  const engine = createEngine();
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Guardrail: Scanning workspace...',
      cancellable: true,
    },
    async (progress, token) => {
      let totalIssues = 0;
      let filesScanned = 0;

      for (const folder of workspaceFolders) {
        if (token.isCancellationRequested) break;

        const files = await vscode.workspace.findFiles(
          new vscode.RelativePattern(folder, '**/*.{js,jsx,ts,tsx}'),
          '**/node_modules/**',
          500,
        );

        for (const file of files) {
          if (token.isCancellationRequested) break;

          try {
            const doc = await vscode.workspace.openTextDocument(file);
            const result = await scanDocument(doc);
            if (result) {
              totalIssues += result.violations.length;
            }
            filesScanned++;
            progress.report({
              message: `${filesScanned}/${files.length} files`,
              increment: (1 / files.length) * 100,
            });
          } catch {
            // Skip files that can't be opened
          }
        }
      }

      vscode.window.showInformationMessage(
        `Guardrail: Scanned ${filesScanned} files — ${totalIssues} issues found`,
      );
    },
  );
}

// ─── Fixing ───────────────────────────────────────────────

async function fixActiveFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const doc = editor.document;
  const result = await scanDocument(doc);
  if (!result) return;

  const fixable = result.violations.filter((v) => v.fix);
  if (fixable.length === 0) {
    vscode.window.showInformationMessage('Guardrail: No auto-fixable issues.');
    return;
  }

  const fixer = new FixerEngine();
  const fixResult = await fixer.applyFixes(doc.uri.fsPath, result.violations, true);

  if (fixResult.applied > 0) {
    // Reload the document to show changes
    const newDoc = await vscode.workspace.openTextDocument(doc.uri);
    await vscode.window.showTextDocument(newDoc);

    // Re-scan to update diagnostics
    await scanDocument(newDoc);

    vscode.window.showInformationMessage(
      `Guardrail: Fixed ${fixResult.applied} issues ✓`,
    );
  }
}

// ─── Toggle ───────────────────────────────────────────────

function toggleScanOnSave() {
  const config = getConfig();
  const current = config.get<boolean>('scanOnSave', true);
  config.update('scanOnSave', !current, vscode.ConfigurationTarget.Workspace);
  const status = !current ? 'enabled' : 'disabled';
  vscode.window.showInformationMessage(`Guardrail: Scan on save ${status}`);
}

// ─── Diagnostics ──────────────────────────────────────────

function violationToDiagnostic(v: Violation, doc: vscode.TextDocument): vscode.Diagnostic {
  const line = Math.max(0, v.location.line - 1); // VS Code is 0-indexed
  const col = Math.max(0, v.location.column);
  const endCol = v.location.endColumn ?? col + 20;

  const range = new vscode.Range(
    new vscode.Position(line, col),
    new vscode.Position(v.location.endLine ? v.location.endLine - 1 : line, endCol),
  );

  const severity = severityToVscode(v.severity);
  const diagnostic = new vscode.Diagnostic(range, v.message, severity);

  diagnostic.source = 'guardrail';
  diagnostic.code = {
    value: v.ruleId,
    target: vscode.Uri.parse(`https://github.com/Manavarya09/Guardrail#${v.ruleId.replace('/', '')}`),
  };

  // Store fix data for code actions
  if (v.fix) {
    (diagnostic as any)._guardrailFix = v.fix;
    (diagnostic as any)._guardrailViolation = v;
  }

  return diagnostic;
}

function severityToVscode(sev: Severity): vscode.DiagnosticSeverity {
  switch (sev) {
    case 'critical': return vscode.DiagnosticSeverity.Error;
    case 'high': return vscode.DiagnosticSeverity.Error;
    case 'warning': return vscode.DiagnosticSeverity.Warning;
    case 'info': return vscode.DiagnosticSeverity.Information;
    default: return vscode.DiagnosticSeverity.Information;
  }
}

// ─── Status Bar ───────────────────────────────────────────

function updateStatusBar(violations: Violation[]) {
  const count = violations.length;
  const crits = violations.filter((v) => v.severity === 'critical').length;
  const highs = violations.filter((v) => v.severity === 'high').length;

  if (count === 0) {
    statusBarItem.text = '$(shield) Guardrail ✓';
    statusBarItem.backgroundColor = undefined;
    statusBarItem.tooltip = 'No issues found';
  } else if (crits > 0) {
    statusBarItem.text = `$(shield) Guardrail: ${crits} critical`;
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    statusBarItem.tooltip = `${count} total issues (${crits} critical)`;
  } else if (highs > 0) {
    statusBarItem.text = `$(shield) Guardrail: ${highs} high`;
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    statusBarItem.tooltip = `${count} total issues (${highs} high)`;
  } else {
    statusBarItem.text = `$(shield) Guardrail: ${count}`;
    statusBarItem.backgroundColor = undefined;
    statusBarItem.tooltip = `${count} issues found`;
  }
}

// ─── Code Actions (Quick Fixes) ───────────────────────────

class GuardrailCodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== 'guardrail') continue;

      // Add "ignore this line" action
      const ignoreLine = new vscode.CodeAction(
        `Suppress: // guardrail-ignore-next-line ${diagnostic.code && typeof diagnostic.code === 'object' ? (diagnostic.code as any).value : ''}`,
        vscode.CodeActionKind.QuickFix,
      );
      ignoreLine.diagnostics = [diagnostic];
      ignoreLine.edit = new vscode.WorkspaceEdit();
      const lineNum = diagnostic.range.start.line;
      const lineText = document.lineAt(lineNum).text;
      const indent = lineText.match(/^(\s*)/)?.[1] ?? '';
      const ruleId = diagnostic.code && typeof diagnostic.code === 'object' ? (diagnostic.code as any).value : '';
      ignoreLine.edit.insert(
        document.uri,
        new vscode.Position(lineNum, 0),
        `${indent}// guardrail-ignore-next-line ${ruleId}\n`,
      );
      actions.push(ignoreLine);

      // Add auto-fix action if available
      const fix = (diagnostic as any)._guardrailFix;
      if (fix) {
        const fixAction = new vscode.CodeAction(
          `Fix: ${fix.description}`,
          vscode.CodeActionKind.QuickFix,
        );
        fixAction.diagnostics = [diagnostic];
        fixAction.isPreferred = true;
        fixAction.edit = new vscode.WorkspaceEdit();

        const startPos = new vscode.Position(
          fix.range.start.line - 1,
          fix.range.start.column,
        );
        const endPos = new vscode.Position(
          fix.range.end.line - 1,
          fix.range.end.column,
        );

        fixAction.edit.replace(
          document.uri,
          new vscode.Range(startPos, endPos),
          fix.replacement,
        );
        actions.push(fixAction);
      }
    }

    return actions;
  }
}
