"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorTree = exports.ErrorNode = void 0;
const types_1 = require("./types");
const vscode = require("vscode");
class ErrorNode {
    constructor(errorObj) {
        this.errorObj = errorObj;
        this.errorText = '';
        this.label = '';
        if (errorObj.response && errorObj.response.data) {
            this.errorText = errorObj.response.data.message;
        }
        this.errorText += " (" + errorObj.message + ")";
    }
}
exports.ErrorNode = ErrorNode;
class ErrorTree {
    static getTreeItem(errorNode) {
        const treeItem = new vscode.TreeItem(errorNode.errorText, vscode.TreeItemCollapsibleState.None);
        treeItem.contextValue = types_1.CONTEXT_VALUES.error;
        return treeItem;
    }
}
exports.ErrorTree = ErrorTree;
//# sourceMappingURL=error.js.map