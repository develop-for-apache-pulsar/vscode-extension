import * as vscode from "vscode";
import TopicMessagesDocument from "./topicMessagesDocument";

export class TopicMessageEditorProvider implements vscode.CustomReadonlyEditorProvider<TopicMessagesDocument> {

  constructor(private readonly context: vscode.ExtensionContext) {}

  public openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): Thenable<TopicMessagesDocument> | TopicMessagesDocument {

    const document = new TopicMessagesDocument(uri);

    return document;
  }

  public resolveCustomEditor(document: TopicMessagesDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Thenable<void> | void {
    console.log(document);
    webviewPanel.webview.options = {
      enableScripts: true,
      enableCommandUris: true,
    };

    webviewPanel.webview.html = this.buildWebview();
  }

  private buildWebview(): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Pulsar Topic Messages</title>
    </head>
    <body>
      Hi there!
    </body>
    </html>`;
  }
}