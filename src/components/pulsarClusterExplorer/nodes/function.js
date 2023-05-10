"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionTree = exports.FunctionNode = void 0;
const vscode = require("vscode");
const types_1 = require("./types");
const message_1 = require("./message");
const error_1 = require("./error");
const path = require("path");
class FunctionNode {
    constructor(pulsarAdmin, label) {
        this.pulsarAdmin = pulsarAdmin;
        this.label = label;
    }
}
exports.FunctionNode = FunctionNode;
class FunctionTree {
    constructor(pulsarAdmin) {
        this.pulsarAdmin = pulsarAdmin;
    }
    async getChildren(tenantName, namespaceName) {
        try {
            return this.pulsarAdmin.ListFunctionNames(tenantName, namespaceName).then((functionNames) => {
                if (functionNames.length === 0) {
                    return [new message_1.MessageNode(types_1.MessageTypes.noFunctions)];
                }
                return functionNames.map((functionName) => {
                    return new FunctionNode(this.pulsarAdmin, functionName);
                });
            }).catch((error) => {
                return [new error_1.ErrorNode(error)];
            });
        }
        catch (err) {
            return [new error_1.ErrorNode(err)];
        }
    }
    static getTreeItem(functionNode) {
        const treeItem = new vscode.TreeItem(functionNode.label, vscode.TreeItemCollapsibleState.None);
        treeItem.contextValue = types_1.CONTEXT_VALUES.sink;
        treeItem.iconPath = {
            light: path.join(__dirname, '..', 'images', 'light', 'function.svg'),
            dark: path.join(__dirname, '..', 'images', 'dark', 'function.svg'),
        };
        return treeItem;
    }
}
exports.FunctionTree = FunctionTree;
//# sourceMappingURL=function.js.map