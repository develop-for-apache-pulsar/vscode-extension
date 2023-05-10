"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showWorkspaceFolderPick = void 0;
const vscode = require("vscode");
async function showWorkspaceFolderPick() {
    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage('This command requires an open folder.');
        return undefined;
    }
    else if (vscode.workspace.workspaceFolders.length === 1) {
        return vscode.workspace.workspaceFolders[0];
    }
    return await vscode.window.showWorkspaceFolderPick();
}
exports.showWorkspaceFolderPick = showWorkspaceFolderPick;
//# sourceMappingURL=hostutils.js.map