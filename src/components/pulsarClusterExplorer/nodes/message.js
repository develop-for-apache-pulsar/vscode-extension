"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageTree = exports.MessageNode = void 0;
const types_1 = require("./types");
const vscode = require("vscode");
class MessageNode {
    constructor(messageType, messageText = '') {
        this.messageType = messageType;
        this.messageText = messageText;
        this.label = '';
        this.command = undefined;
        switch (messageType) {
            case types_1.MessageTypes.noClusters:
                this.messageText = "(no clusters)";
                break;
            case types_1.MessageTypes.noTenants:
                this.messageText = "(no tenants)";
                break;
            case types_1.MessageTypes.noNamespaces:
                this.messageText = "(no namespaces)";
                break;
            case types_1.MessageTypes.noTopics:
                this.messageText = "(no topics)";
                break;
            case types_1.MessageTypes.noConnectorSinks:
                this.messageText = "(no sinks)";
                break;
            case types_1.MessageTypes.noConnectorSources:
                this.messageText = "(no sources)";
                break;
            case types_1.MessageTypes.noFunctions:
                this.messageText = "(no functions)";
                break;
            case types_1.MessageTypes.customMessage:
                break;
            default:
                this.messageText = "Unknown";
        }
    }
}
exports.MessageNode = MessageNode;
class MessageTree {
    static getTreeItem(messageNode) {
        const treeItem = new vscode.TreeItem(messageNode.messageText, vscode.TreeItemCollapsibleState.None);
        treeItem.contextValue = types_1.CONTEXT_VALUES.message;
        treeItem.command = messageNode.command;
        return treeItem;
    }
}
exports.MessageTree = MessageTree;
//# sourceMappingURL=message.js.map