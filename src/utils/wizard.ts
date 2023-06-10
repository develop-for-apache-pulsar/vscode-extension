import * as vscode from "vscode";
import {Uri} from "vscode";
import {TWebviewMessage} from "../types/tWebviewMessage";

export class Wizard{
  private webPanel: vscode.WebviewPanel | undefined = undefined;
  private _receivedMessageCallback: Function = (message: TWebviewMessage) => {};
  private _stateChangeCallback: Function = (e: vscode.WebviewPanelOnDidChangeViewStateEvent) => {};
  private extensionUri: Uri;

  constructor(context: vscode.ExtensionContext,
              readonly wizardId: string,
              readonly displayTitle: string,
              takeFocus: boolean = true){
    this.extensionUri = context.extensionUri;

    if(this.webPanel){
      this.webPanel.reveal(vscode.ViewColumn.One);
      return;
    }


    this.webPanel = vscode.window.createWebviewPanel(
      wizardId,
      displayTitle,
      {
        viewColumn: vscode.ViewColumn.One,
        preserveFocus: !takeFocus
      },
      {
        enableScripts: true,
        retainContextWhenHidden: false,
        enableCommandUris: false,
        enableFindWidget: false,
        enableForms: false,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, 'scripts'),
          vscode.Uri.joinPath(context.extensionUri, 'styles'),
        ]
      }
    );

    this.webPanel.onDidDispose(() => {
        this.webPanel = undefined;
      },
      undefined,
      context.subscriptions
    );

    this.webPanel.onDidChangeViewState(
      (e: vscode.WebviewPanelOnDidChangeViewStateEvent) => { this._stateChangeCallback(e); },
      null,
      context.subscriptions
    );

    this.webPanel.webview.onDidReceiveMessage(
      (message: TWebviewMessage) => { this._receivedMessageCallback(message); },
      undefined,
      context.subscriptions
    );
  }

  set receivedMessageCallback(callback: Function){
    this._receivedMessageCallback = callback;
  }

  set stateChangeCallback(callback: any){
    this._stateChangeCallback = callback;
  }

  public dispose(): void {
    this.webPanel?.dispose();
  }

  public postMessage(command: string, text: string): Thenable<boolean> {
    return this.webPanel!.webview.postMessage({ command: command, text: text, isError: false });
  }

  public postError(command: string, error: Error){
    return this.webPanel!.webview.postMessage({ command: command, text: error.message, isError: true });
  }

  public showPage(html: string){
    this.webPanel!.webview.html = this.buildWebview(html);
  }

  private buildWebview(content: string): string {
    const scriptPathOnDisk = vscode.Uri.joinPath(this.extensionUri, 'scripts','addProvider.js');
    const scriptUri = this.webPanel?.webview.asWebviewUri(scriptPathOnDisk);
    const stylePath = vscode.Uri.joinPath(this.extensionUri, 'styles','bootstrap.min.css');
    const stylesUri = this.webPanel?.webview.asWebviewUri(stylePath);

    return `
      <!DOCTYPE html>
      <html lang="en" data-bs-theme="dark">
      <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${this.webPanel?.webview.cspSource}; img-src ${this.webPanel?.webview.cspSource} https:; script-src 'unsafe-inline' ${this.webPanel?.webview.cspSource};">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${stylesUri}" rel="stylesheet">
        <meta charset="UTF-8">
        <title>${this.displayTitle}</title>
      </head>
      <body class="vsCodePulsarAdminWizard">
        <div class="container-fluid" style="height: 100vh;">
         <div class="row">
         <div class="col-12">
            <div class="alert alert-info d-none" role="alert" id="pageMessage"></div>
            <div class="alert alert-danger d-none" role="alert" id="pageError"></div>
         </div>
</div><div class="row h-100">
         <div class="col-12">${content}</div></div>
</div>
        </div>
        <script src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}

