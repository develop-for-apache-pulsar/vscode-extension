import * as vscode from "vscode";

export class TopicMessageEditorProvider implements vscode.CustomTextEditorProvider {
  constructor(
    private readonly context: vscode.ExtensionContext
  ) { }

  resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Thenable<void> | void {
    return undefined;
  }
}