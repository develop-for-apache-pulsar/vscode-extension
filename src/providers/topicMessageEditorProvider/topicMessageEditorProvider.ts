import * as vscode from "vscode";
import TopicMessagesDocument from "./topicMessagesDocument";
import {WebviewPanel} from "vscode";
import {TWebviewMessage} from "../../types/tWebviewMessage";
import {ErrorEvent, MessageEvent, WebSocket} from "ws";
import {TTopicMessage} from "../../types/tTopicMessage";
import TopicMessage from "./topicMessage";
import {ClientRequestArgs} from "http";

export class TopicMessageEditorProvider implements vscode.CustomReadonlyEditorProvider<TopicMessagesDocument> {
  constructor(private readonly context: vscode.ExtensionContext) {}

  public openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): Thenable<TopicMessagesDocument> | TopicMessagesDocument {
    //console.log("Opening custom document: %o", uri);
    return TopicMessagesDocument.create(uri, openContext.backupId); //let vscode catch errors
  }

  public async resolveCustomEditor(topicMessagesDocument: TopicMessagesDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Promise<void> {
    let websocket: WebSocket | undefined = undefined;
    let webRequestArgs: ClientRequestArgs | undefined = undefined;

    webviewPanel.webview.options = {
      enableScripts: true,
      enableCommandUris: true
    };

    webviewPanel.onDidDispose(async () => {
      try{
        console.log("Close topic " + topicMessagesDocument.content.topicName);
        websocket?.close();
      }catch(e){
        console.log(e);
      }
    });

    token.onCancellationRequested(() => {
      webviewPanel.dispose();
    });

    webviewPanel.webview.onDidReceiveMessage((message: TWebviewMessage) => {
      switch(message.command){
        case "ready":
          if(websocket){
            // The webview has been reset, re-send the messages
            topicMessagesDocument.content.messages.forEach((message: TTopicMessage) => {
              webviewPanel.webview.postMessage(message);
            });

            switch(websocket.readyState){
              case WebSocket.OPEN:
                webviewPanel.webview.postMessage({command: "connection", text: "opened"});
                break;
              case WebSocket.CLOSED:
                webviewPanel.webview.postMessage({command: "connection", text: "closed"});
                break;
              case WebSocket.CLOSING:
                webviewPanel.webview.postMessage({command: "connection", text: "closing"});
                break;
              case WebSocket.CONNECTING:
                webviewPanel.webview.postMessage({command: "connection", text: "connecting"});
                break;
            }

            break; //The websocket is already open, most likely because the user moved the tab
          }

          if(topicMessagesDocument.content.pulsarToken !== undefined){
            webRequestArgs = {
              headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Authorization: `Bearer ${topicMessagesDocument.content.pulsarToken}`
              }
            };
          }

          websocket = new WebSocket(topicMessagesDocument.content.webSocketUrl, webRequestArgs);

          websocket.onopen = () => {
            webviewPanel.webview.postMessage({command: "connection", text: "opened"});
          };

          websocket.onerror = (e: ErrorEvent) => {
            webviewPanel.webview.postMessage({command: "connection", text: "errored - " + e.message});
          };

          websocket.onclose = () => {
            webviewPanel.webview.postMessage({command: "connection", text: "closed"});
          };

          websocket.onmessage = async (e: MessageEvent) => {
            const readerMessage: TTopicMessage = TopicMessage.fromWsMessage(e, topicMessagesDocument.content.topicSchema);
            webviewPanel.webview.postMessage(readerMessage);

            topicMessagesDocument.content.addMessage(readerMessage);

            setTimeout(function timeout() {
              const ackMsg = {"messageId" : readerMessage.messageId};
              websocket?.send(JSON.stringify(ackMsg));
            }, 500);
          };

          break;
      }
    });

    webviewPanel.webview.html = this.buildView(webviewPanel, `Topic Messages: ${topicMessagesDocument.content.topicName}`);
  }

  private buildView(panel: WebviewPanel, displayTitle: string): string {
    const scriptPathOnDisk = vscode.Uri.joinPath(this.context.extensionUri, 'scripts','topicMessages.js');
    const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk);
    const listMinPathOnDisk = vscode.Uri.joinPath(this.context.extensionUri, 'scripts','list.min.js');
    const listMinUri = panel.webview.asWebviewUri(listMinPathOnDisk);
    const topicMrgPathOnDisk = vscode.Uri.joinPath(this.context.extensionUri, 'scripts','messageManager.js');
    const topicMrgUri = panel.webview.asWebviewUri(topicMrgPathOnDisk);
    const bootstrapJsOnDisk = vscode.Uri.joinPath(this.context.extensionUri, 'scripts','bootstrap.bundle.min.js');
    const bootstrapJsUri = panel.webview.asWebviewUri(bootstrapJsOnDisk);
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
<div class="col">
  <div class="card">
      <div class="card-header text-muted">Search</div>
      <div class="card-body p-4">
        <div class="input-group">
          <span class="input-group-text fs-6 d-none d-lg-flex" id="message-payload">Message<br />Payload</span>
          <input type="text" id="search-message-payload" class="form-control" placeholder="" aria-label="" aria-describedby="message-payload" onkeyup="messageManager.search()">
        </div>
      </div>
  </div>
</div>
<div class="col">
  <div class="card">
      <div class="card-header text-muted">Filter</div>
      <div class="card-body p-4 text-center">
          <div class="btn-group d-none d-md-flex" role="group" aria-label="Message publish date">
            <input type="radio" class="btn-check" name="publishDate" id="publishDate1h" autocomplete="off" value="1h" onchange="messageManager.filter()">
            <label class="btn btn-outline-primary" for="publishDate1h">1h</label>
          
            <input type="radio" class="btn-check" name="publishDate" id="publishDate3h" autocomplete="off" value="3h" onchange="messageManager.filter()">
            <label class="btn btn-outline-primary" for="publishDate3h">3h</label>
          
            <input type="radio" class="btn-check" name="publishDate" id="publishDate12h" autocomplete="off" value="12h" onchange="messageManager.filter()">
            <label class="btn btn-outline-primary" for="publishDate12h">12h</label>
          
            <input type="radio" class="btn-check" name="publishDate" id="publishDate1d" autocomplete="off" value="1d" onchange="messageManager.filter()">
            <label class="btn btn-outline-primary" for="publishDate1d">1d</label>
          
            <input type="radio" class="btn-check" name="publishDate" id="publishDate1w" autocomplete="off" value="1w" onchange="messageManager.filter()">
            <label class="btn btn-outline-primary" for="publishDate1w">1w</label>
          
            <input type="radio" class="btn-check" name="publishDate" id="publishDateAll" autocomplete="off" value="all" checked onchange="messageManager.filter()">
            <label class="btn btn-outline-primary" for="publishDateAll">All</label>
          </div>
          
          <div class="d-md-none" aria-label="Message publish date">
            <select class="form-select" id="publishDateSelect" onchange="document.getElementById(document.getElementById('publishDateSelect').value).checked = true;messageManager.filter()">
              <option value="publishDate1h">1h</option>
              <option value="publishDate3h">3h</option>
              <option value="publishDate12h">12h</option>
              <option value="publishDate1d">1d</option>
              <option value="publishDate1w">1w</option>
              <option value="publishDateAll" selected>All</option>
            </select>
          </div>
          <div class="pt-2 text-center">
            <input type="checkbox" class="btn-check" id="redeliveredOnly" autocomplete="off" onchange="messageManager.filter()">
            <label class="btn btn-outline-primary" for="redeliveredOnly">Redelivered Only</label>
          </div>
      </div>
  </div>
</div>
<div class="col-lg-3 col-sm col-md d-none d-md-grid">
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
        <script src="${bootstrapJsUri}"></script>
        <script src="${listMinUri}"></script>
        <script src="${topicMrgUri}"></script>
        <script src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}