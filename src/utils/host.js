"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.host = void 0;
const vscode = require("vscode");
const hostutils_1 = require("./hostutils");
const dictionary_1 = require("./dictionary");
exports.host = {
    showErrorMessage: showErrorMessage,
    showWarningMessage: showWarningMessage,
    showInformationMessage: showInformationMessage,
    showQuickPick: showQuickPickAny,
    withProgress: withProgress,
    getConfiguration: getConfiguration,
    onDidCloseTerminal: onDidCloseTerminal,
    onDidChangeConfiguration: onDidChangeConfiguration,
    showInputBox: showInputBox,
    activeDocument: activeDocument,
    showDocument: showDocument,
    readDocument: readDocument,
    selectRootFolder: selectRootFolder,
    longRunning: longRunning
};
function showInputBox(options, token) {
    return vscode.window.showInputBox(options, token);
}
function showErrorMessage(message, ...items) {
    return vscode.window.showErrorMessage(message, ...items);
}
function showWarningMessage(message, ...items) {
    return vscode.window.showWarningMessage(message, ...items);
}
function showInformationMessage(message, ...items) {
    return vscode.window.showInformationMessage(message, ...items);
}
function showQuickPickStr(items, options) {
    return vscode.window.showQuickPick(items, options);
}
function showQuickPickT(items, options) {
    return vscode.window.showQuickPick(items, options);
}
function showQuickPickAny(items, options) {
    if (!Array.isArray(items)) {
        throw 'unexpected type passed to showQuickPick';
    }
    if (items.length === 0) {
        return showQuickPickStr(items, options);
    }
    const item = items[0];
    if (typeof item === 'string' || item instanceof String) {
        return showQuickPickStr(items, options);
    }
    else {
        return showQuickPickT(items, options);
    }
}
function withProgress(task) {
    return vscode.window.withProgress({ location: vscode.ProgressLocation.Window }, task);
}
function getConfiguration(key) {
    return vscode.workspace.getConfiguration(key);
}
function onDidCloseTerminal(listener) {
    return vscode.window.onDidCloseTerminal(listener);
}
function onDidChangeConfiguration(listener) {
    return vscode.workspace.onDidChangeConfiguration(listener);
}
function activeDocument() {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        return activeEditor.document;
    }
    return undefined;
}
async function showDocument(uri) {
    const document = await vscode.workspace.openTextDocument(uri);
    if (document) {
        await vscode.window.showTextDocument(document);
    }
    return document;
}
async function readDocument(uri) {
    return await vscode.workspace.openTextDocument(uri);
}
async function selectRootFolder() {
    const folder = await (0, hostutils_1.showWorkspaceFolderPick)();
    if (!folder) {
        return undefined;
    }
    if (folder.uri.scheme !== 'file') {
        vscode.window.showErrorMessage("This command requires a filesystem folder"); // TODO: make it not
        return undefined;
    }
    return folder.uri.fsPath;
}
const ACTIVE_LONG_RUNNING_OPERATIONS = dictionary_1.Dictionary.of();
async function longRunning(uiOptions, action) {
    const uiOptionsObj = uiOptionsObjectOf(uiOptions);
    const options = {
        location: vscode.ProgressLocation.Notification,
        title: uiOptionsObj.title
    };
    return await underLongRunningOperationKeyGuard(uiOptionsObj.operationKey, async (alreadyShowingUI) => alreadyShowingUI ?
        await action() :
        await vscode.window.withProgress(options, (_) => action()));
}
async function underLongRunningOperationKeyGuard(operationKey, action) {
    const alreadyShowingUI = !!operationKey && (ACTIVE_LONG_RUNNING_OPERATIONS[operationKey] || false);
    if (operationKey) {
        ACTIVE_LONG_RUNNING_OPERATIONS[operationKey] = true;
    }
    try {
        const result = await action(alreadyShowingUI);
        return result;
    }
    finally {
        if (operationKey) {
            delete ACTIVE_LONG_RUNNING_OPERATIONS[operationKey];
        }
    }
}
function uiOptionsObjectOf(uiOptions) {
    if (isLongRunningUIOptions(uiOptions)) {
        return uiOptions;
    }
    return { title: uiOptions };
}
function isLongRunningUIOptions(obj) {
    return !!(obj.title);
}
//# sourceMappingURL=host.js.map