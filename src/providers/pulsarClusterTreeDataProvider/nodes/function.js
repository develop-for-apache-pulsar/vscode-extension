"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionTree = exports.FunctionNode = void 0;
const vscode = require("vscode");
const message_1 = require("./message");
const error_1 = require("./error");
const path = require("path");
const constants_1 = require("../../../common/constants");
class FunctionNode extends vscode.TreeItem {
    constructor(pulsarAdmin, label) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.pulsarAdmin = pulsarAdmin;
        this.label = label;
        this.contextValue = constants_1.CONTEXT_VALUES.function;
        this.iconPath = {
            light: path.join(__dirname, '..', 'images', 'light', 'function.svg'),
            dark: path.join(__dirname, '..', 'images', 'dark', 'function.svg'),
        };
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
                    return [new message_1.MessageNode(constants_1.ExplorerMessageTypes.noFunctions)];
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
}
exports.FunctionTree = FunctionTree;
