import * as vscode from "vscode";
import TopicMessagesDocument from "./topicMessagesDocument";
import TopicMessageReader from "./topicMessageReader";
import {TTopicMessage} from "../../types/tTopicMessage";
import {TReaderMessage} from "../../types/tReaderMessage";

export class TopicMessageEditorProvider implements vscode.CustomReadonlyEditorProvider<TopicMessagesDocument> {

  constructor(private readonly context: vscode.ExtensionContext) {}

  public openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): Thenable<TopicMessagesDocument> | TopicMessagesDocument {
    return TopicMessagesDocument.create(uri, openContext.backupId);
  }

  public async resolveCustomEditor(document: TopicMessagesDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Promise<void> {
    //console.log(document);
    let lastReadTimestamp: number | undefined = Date.now();

    if(document.clusterInfo.brokerServiceUrl === undefined) {
      vscode.window.showErrorMessage("The broker service information was not found when this cluster was saved. To watch topic messages, please ensure that the cluster is saved with the broker service information.");
      webviewPanel.dispose();
      return;
    }

    webviewPanel.webview.options = {
      enableScripts: true,
      enableCommandUris: true,
    };

    webviewPanel.onDidDispose(() => {
      document?.dispose();
    }, null, this.context.subscriptions);

    // Make sure a reader is created before getting too far. If the namespace/topic does not exist, this will fail.
    const topicMessageReader = new TopicMessageReader(this.context, document.clusterInfo.brokerServiceUrl, document.tenantInfo.pulsarToken);

    webviewPanel.webview.html = this.buildView();

    await topicMessageReader.createReader(`vs-code-reader`, document.topicAddress);

    // All checks have passed

    // Load the existing messages into the web view
    document.messages.forEach((message) => {
      lastReadTimestamp = message.publishTimestamp; //use the timestamp of the last message as the starting point for the reader
      this.postMessage(webviewPanel, message);
    });

    // Start the reader
    const observer = topicMessageReader.startReader(lastReadTimestamp, undefined, undefined, token);

    if(!observer){
      vscode.window.showErrorMessage("Could not start reading messages");
      webviewPanel.dispose();
      document.dispose();
      return;
    }

    // Start observing messages from the last read timestamp
    observer.subscribe({
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

  private postMessage(panel: vscode.WebviewPanel, message: TTopicMessage | TReaderMessage): void {
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