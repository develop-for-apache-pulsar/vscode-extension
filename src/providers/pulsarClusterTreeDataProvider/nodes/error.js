"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorNode = void 0;
const vscode = require("vscode");
const constants_1 = require("../../../common/constants");
class ErrorNode extends vscode.TreeItem {
    constructor(errorObj) {
        super("", vscode.TreeItemCollapsibleState.None);
        this.errorObj = errorObj;
        this.contextValue = constants_1.CONTEXT_VALUES.error;
        if (errorObj.response && errorObj.response.data) {
            this.label = errorObj.response.data.message;
        }
        this.label += " (" + errorObj.message + ")";
    }
}
exports.ErrorNode = ErrorNode;
