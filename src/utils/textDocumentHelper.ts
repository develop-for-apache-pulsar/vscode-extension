import * as vscode from 'vscode';

export default class TextDocumentHelper {
  public static async openDocument(content: string, language: string): Promise<void> {
    const docOptions = {
      content: content,
      language: language,
    };

    const doc = await vscode.workspace.openTextDocument(docOptions);
    const showOptions: vscode.TextDocumentShowOptions = {
      preview: false,
    };

    await vscode.window.showTextDocument(doc, showOptions);
  }
}