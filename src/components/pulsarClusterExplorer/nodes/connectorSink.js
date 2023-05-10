"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorSinkTree = exports.ConnectorSinkNode = void 0;
const types_1 = require("./types");
const message_1 = require("./message");
const error_1 = require("./error");
const vscode = require("vscode");
const path = require("path");
class ConnectorSinkNode {
    constructor(pulsarAdmin, label) {
        this.pulsarAdmin = pulsarAdmin;
        this.label = label;
    }
}
exports.ConnectorSinkNode = ConnectorSinkNode;
class ConnectorSinkTree {
    constructor(pulsarAdmin) {
        this.pulsarAdmin = pulsarAdmin;
    }
    async getChildren(tenantName, namespaceName) {
        try {
            return this.pulsarAdmin.ListConnectorSinkNames(tenantName, namespaceName).then((connectorSinkNames) => {
                if (connectorSinkNames.length === 0) {
                    return [new message_1.MessageNode(types_1.MessageTypes.noConnectorSinks)];
                }
                return connectorSinkNames.map((connectorSinkName) => {
                    return new ConnectorSinkNode(this.pulsarAdmin, connectorSinkName);
                });
            }).catch((error) => {
                return [new error_1.ErrorNode(error)];
            });
        }
        catch (err) {
            return [new error_1.ErrorNode(err)];
        }
    }
    static getTreeItem(connectorSinkNode) {
        const treeItem = new vscode.TreeItem(connectorSinkNode.label, vscode.TreeItemCollapsibleState.None);
        treeItem.contextValue = types_1.CONTEXT_VALUES.sink;
        treeItem.iconPath = {
            light: path.join(__dirname, '..', 'images', 'light', 'connector.svg'),
            dark: path.join(__dirname, '..', 'images', 'dark', 'connector.svg'),
        };
        return treeItem;
    }
}
exports.ConnectorSinkTree = ConnectorSinkTree;
//# sourceMappingURL=connectorSink.js.map