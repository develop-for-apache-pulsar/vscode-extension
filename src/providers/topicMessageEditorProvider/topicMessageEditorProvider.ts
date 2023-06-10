import * as vscode from "vscode";
import TopicMessagesDocument from "./topicMessagesDocument";
import WebSocketReader from "../../pulsarWebSocketReader/webSocketReader";
import {AllMessageTypes} from "../../types/allMessageTypes";
import ReaderMessage from "../../pulsarWebSocketReader/readerMessage";
import {WebviewPanel} from "vscode";
import TopicMessage from "../../pulsarWebSocketReader/topicMessage";

export class TopicMessageEditorProvider implements vscode.CustomReadonlyEditorProvider<TopicMessagesDocument> {
  private webSocketReader: WebSocketReader | undefined = undefined;

  constructor(private readonly context: vscode.ExtensionContext) {}

  public openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): Thenable<TopicMessagesDocument> | TopicMessagesDocument {
    console.debug("Opening custom document: %o", uri);
    return TopicMessagesDocument.create(uri, openContext.backupId); //let vscode catch errors
  }

  public async resolveCustomEditor(topicMessagesDocument: TopicMessagesDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Promise<void> {
    console.debug("Resolving custom editor: %o", topicMessagesDocument);

    this.webSocketReader = new WebSocketReader(topicMessagesDocument.content.webSocketUrl, topicMessagesDocument.content.pulsarToken, topicMessagesDocument.content.topicSchema);

    webviewPanel.webview.options = {
      enableScripts: true,
      enableCommandUris: true,
    };

    webviewPanel.onDidChangeViewState(
      (e: vscode.WebviewPanelOnDidChangeViewStateEvent) => {
        if(!e.webviewPanel.visible){
          this.webSocketReader?.pause();
          return;
        }

        this.webSocketReader?.resume();
      },
      null,
      this.context.subscriptions
    );

    webviewPanel.onDidDispose(async () => {
      this.webSocketReader?.close();
      topicMessagesDocument?.dispose();
    }, null, this.context.subscriptions);

    webviewPanel.webview.html = this.buildView(webviewPanel, `Topic Messages: ${topicMessagesDocument.content.topicName}`);
    console.debug("Built panel");

    // Load the existing messages into the web view
    console.debug("Loading existing messages");
    topicMessagesDocument.content.messages.forEach((message) => {
      this.postMessage(webviewPanel, message);
    });

    this.webSocketReader?.open().subscribe({
      next: (message: AllMessageTypes) => {
        this.postMessage(webviewPanel, message);

        if(message.hasOwnProperty("messageId")){
          message = message as TopicMessage;
          topicMessagesDocument.content.lastMessageId = message.messageId;
          topicMessagesDocument.content.addMessage(message);
        }
      },
      error: (error: ReaderMessage) => {
        this.postMessage(webviewPanel, error);
      },
      complete: () => {
        console.debug("Websocket closed");
      }
    });
  }

  private postMessage(panel: vscode.WebviewPanel, message: AllMessageTypes): void {
    panel.webview.postMessage(message);
  }

  private buildView(panel: WebviewPanel, displayTitle: string): string {
    const scriptPathOnDisk = vscode.Uri.joinPath(this.context.extensionUri, 'scripts','topicMessages.js');
    const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk);
    const listMinPathOnDisk = vscode.Uri.joinPath(this.context.extensionUri, 'scripts','list.min.js');
    const listMinUri = panel.webview.asWebviewUri(listMinPathOnDisk);
    const topicMrgPathOnDisk = vscode.Uri.joinPath(this.context.extensionUri, 'scripts','messageManager.js');
    const topicMrgUri = panel.webview.asWebviewUri(topicMrgPathOnDisk);
    const stylePath = vscode.Uri.joinPath(this.context.extensionUri, 'styles','bootstrap.min.css');
    const stylesUri = panel.webview.asWebviewUri(stylePath);

    return `
      <!DOCTYPE html>
      <html lang="en" data-bs-theme="dark">
      <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${panel.webview.cspSource}; img-src ${panel.webview.cspSource} https:; script-src 'unsafe-inline' ${panel.webview.cspSource};">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${stylesUri}" rel="stylesheet">
        <meta charset="UTF-8">
        <title>${displayTitle}</title>
        <style>
        #messages-container {
  height: 80%;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
}
</style>

      </head>
      <body class="vsCodePulsarAdminWizard">
        <div class="container-fluid" style="height: 100vh;">
           <div class="row">
             <div class="col-12">
                <div class="alert alert-info d-none" role="alert" id="pageMessage"></div>
                <div class="alert alert-danger d-none" role="alert" id="pageError"></div>
             </div>
           </div>
           <div class="row pb-2 border-bottom">
<div class="col-6">
  <div class="card">
      <div class="card-header text-muted">Search</div>
      <div class="card-body p-4">
        <div class="input-group">
          <span class="input-group-text fs-6" id="message-payload">Message<br />Payload</span>
          <input type="text" id="search-message-payload" class="form-control" placeholder="" aria-label="" aria-describedby="message-payload" onkeyup="messagesList.search()">
        </div>
      </div>
  </div>
</div>
<div class="col-3">
  <div class="card">
      <div class="card-header text-muted">Filter</div>
      <div class="card-body p-4 text-center">
          <div class="btn-group" role="group" aria-label="Message publish date">
            <input type="radio" class="btn-check" name="publishDate" id="publishDate1h" autocomplete="off" value="1h" onchange="messagesList.filter()">
            <label class="btn btn-outline-primary" for="publishDate1h">1h</label>
          
            <input type="radio" class="btn-check" name="publishDate" id="publishDate3h" autocomplete="off" value="3h" onchange="messagesList.filter()">
            <label class="btn btn-outline-primary" for="publishDate3h">3h</label>
          
            <input type="radio" class="btn-check" name="publishDate" id="publishDate12h" autocomplete="off" value="12h" onchange="messagesList.filter()">
            <label class="btn btn-outline-primary" for="publishDate12h">12h</label>
          
            <input type="radio" class="btn-check" name="publishDate" id="publishDate1d" autocomplete="off" value="1d" onchange="messagesList.filter()">
            <label class="btn btn-outline-primary" for="publishDate1d">1d</label>
          
            <input type="radio" class="btn-check" name="publishDate" id="publishDate1w" autocomplete="off" value="1w" onchange="messagesList.filter()">
            <label class="btn btn-outline-primary" for="publishDate1w">1w</label>
          
            <input type="radio" class="btn-check" name="publishDate" id="publishDateAll" autocomplete="off" value="all" checked onchange="messagesList.filter()">
            <label class="btn btn-outline-primary" for="publishDateAll">All</label>
          </div>
          <div class="pt-2 text-center">
            <input type="checkbox" class="btn-check" id="redeliveredOnly" autocomplete="off" onchange="messagesList.filter()">
            <label class="btn btn-outline-primary" for="redeliveredOnly">Redelivered Only</label>
          </div>
      </div>
  </div>
</div>
<div class="col-3">
  <div class="card">
      <div class="card-header text-muted">Info</div>
      <div class="card-body p-2">
       <table class="table table-borderless table-sm">
          <tbody>
            <tr>
                <td>Status:</td>
                <td><span id="websocketStatus"></span></td>
            </tr>
            <tr>
                <td>Messages Read:</td>
                <td><span id="messagesCount"></span></td>
            </tr>
            <tr>
                <td>Avg Message Size:</td>
                <td><span id="avgMessageSize"></span></td>
            </tr>
          </tbody>
       </table>
      </div>
  </div>
</div>
          </div>
           <div class="row" id="messages-container">
            <div class="col-12" id="messages-list" class="list-group"><ul class="list"></ul></div>
           </div>
        </div>
        <script src="${listMinUri}"></script>
        <script src="${topicMrgUri}"></script>
        <script src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}