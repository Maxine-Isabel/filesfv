import * as vscode from 'vscode';
import { ContextBridgeViewProvider } from './webview/provider';

export function activate(context: vscode.ExtensionContext) {
  const provider = new ContextBridgeViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'contextBridgeSidebar',
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((event) => {
      const selection = event.textEditor.document.getText(event.selections[0]);
      if (selection.trim().length > 0) {
        provider.updateContextForSelection(selection);
      }
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        const fileName = editor.document.fileName;
        provider.updateContextForFile(fileName);
      }
    })
  );
}

export function deactivate() {
  return undefined;
}
