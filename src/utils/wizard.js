"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wizard = void 0;
const vscode = require("vscode");
class Wizard {
    constructor(context, wizardId, displayTitle, takeFocus = true) {
        this.wizardId = wizardId;
        this.displayTitle = displayTitle;
        this.webPanel = undefined;
        this._receivedMessageCallback = (message) => { };
        this._stateChangeCallback = (e) => { };
        if (this.webPanel) {
            this.webPanel.reveal(vscode.ViewColumn.One);
            return;
        }
        this.webPanel = vscode.window.createWebviewPanel(wizardId, displayTitle, {
            viewColumn: vscode.ViewColumn.One,
            preserveFocus: !takeFocus
        }, {
            enableScripts: true,
            retainContextWhenHidden: false,
            enableCommandUris: false,
            enableFindWidget: false,
            enableForms: false,
            // localResourceRoots: [
            //   vscode.Uri.joinPath(context.extensionUri, 'src', 'components', 'wizards'),
            // ]
        });
        this.webPanel.onDidDispose(() => {
            this.webPanel = undefined;
        }, undefined, context.subscriptions);
        this.webPanel.onDidChangeViewState((e) => { this._stateChangeCallback(e); }, null, context.subscriptions);
        this.webPanel.webview.onDidReceiveMessage((message) => { this._receivedMessageCallback(message); }, undefined, context.subscriptions);
        const scriptPathOnDisk = vscode.Uri.joinPath(context.extensionUri, 'src', 'components', 'wizards', 'js', 'script.js');
        this.scriptUri = this.webPanel?.webview.asWebviewUri(scriptPathOnDisk);
        const stylePath = vscode.Uri.joinPath(context.extensionUri, 'src', 'components', 'wizards', 'css', 'bootstrap.min.css');
        this.stylesUri = this.webPanel?.webview.asWebviewUri(stylePath);
    }
    set receivedMessageCallback(callback) {
        this._receivedMessageCallback = callback;
    }
    set stateChangeCallback(callback) {
        this._stateChangeCallback = callback;
    }
    dispose() {
        this.webPanel?.dispose();
    }
    postMessage(command, text) {
        return this.webPanel.webview.postMessage({ command: command, text: text, isError: false });
    }
    postError(command, error) {
        return this.webPanel.webview.postMessage({ command: command, text: error.message, isError: true });
    }
    showPage(html) {
        this.webPanel.webview.html = this.buildWebview(html);
    }
    buildWebview(content) {
        const nonce = this.getNonce();
        return `
      <!DOCTYPE html>
      <html lang="en" data-bs-theme="dark">
      <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${this.webPanel?.webview.cspSource}; img-src ${this.webPanel?.webview.cspSource} https:; script-src 'unsafe-inline' ${this.webPanel?.webview.cspSource};">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${this.stylesUri}" rel="stylesheet">
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
        <script src="${this.scriptUri}"></script>
      </body>
      </html>
    `;
    }
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
exports.Wizard = Wizard;
//# sourceMappingURL=wizard.js.map