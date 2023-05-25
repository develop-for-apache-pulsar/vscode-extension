import * as vscode from "vscode";
import TopicMessagesDocument from "./topicMessagesDocument";
import {webSocket} from "rxjs/webSocket";

export class TopicMessageEditorProvider implements vscode.CustomReadonlyEditorProvider<TopicMessagesDocument> {

  constructor(private readonly context: vscode.ExtensionContext) {}

  public openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): Thenable<TopicMessagesDocument> | TopicMessagesDocument {
    return TopicMessagesDocument.create(uri, openContext.backupId);
  }

  public async resolveCustomEditor(document: TopicMessagesDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Promise<void> {
    //console.log(document);

    if(document.clusterInfo.websocketUrl === undefined) {
      vscode.window.showErrorMessage("To watch topic messages the cluster must have websocket services running. Please ensure that the service is running and add the cluster again.");
      webviewPanel.dispose();
      return;
    }

    const websocketAddress = `${document.clusterInfo.websocketUrl}/reader/${document.topicType}/${document.tenantInfo.name}/${document.namespaceName}/${document.topicName}?messageId=latest`;

    webviewPanel.webview.options = {
      enableScripts: true,
      enableCommandUris: true,
    };

    webviewPanel.onDidDispose(() => {
      document?.dispose();
    }, null, this.context.subscriptions);

    webviewPanel.webview.html = this.buildView();

    const subject = webSocket(websocketAddress);

    // Load the existing messages into the web view
    document.messages.forEach((message) => {
      this.postMessage(webviewPanel, message);
    });

    // Start observing messages from the last read timestamp
    subject.subscribe({
      next: (message: any) => {
        this.postMessage(webviewPanel, message);
      },
      error: (message: any) => {
        this.postMessage(webviewPanel, message);
      },
      complete: () => {
        console.debug("Reader completed");
      }
    });
  }

  private postMessage(panel: vscode.WebviewPanel, message: any): void {
    panel.webview.postMessage(message);
  }

  private buildView(): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Pulsar Topic Messages</title>
    </head>
    <body>
      <h3>Loading messages...</h3>
    </body>
    </html>`;
  }
}