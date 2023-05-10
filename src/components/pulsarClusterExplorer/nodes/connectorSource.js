"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorSourceTree = exports.ConnectorSourceNode = void 0;
const types_1 = require("./types");
const message_1 = require("./message");
const error_1 = require("./error");
const vscode = require("vscode");
const path = require("path");
class ConnectorSourceNode {
    constructor(pulsarAdmin, label) {
        this.pulsarAdmin = pulsarAdmin;
        this.label = label;
    }
}
exports.ConnectorSourceNode = ConnectorSourceNode;
class ConnectorSourceTree {
    constructor(pulsarAdmin) {
        this.pulsarAdmin = pulsarAdmin;
    }
    async getChildren(tenantName, namespaceName) {
        try {
            return this.pulsarAdmin.ListConnectorSourceNames(tenantName, namespaceName).then((connectorSourceName) => {
                if (connectorSourceName.length === 0) {
                    return [new message_1.MessageNode(types_1.MessageTypes.noConnectorSources)];
                }
                return connectorSourceName.map((connectorSourceName) => {
                    return new ConnectorSourceNode(this.pulsarAdmin, connectorSourceName);
                });
            }).catch((error) => {
                return [new error_1.ErrorNode(error)];
            });
        }
        catch (err) {
            return [new error_1.ErrorNode(err)];
        }
    }
    static getTreeItem(connectorSourceNode) {
        const treeItem = new vscode.TreeItem(connectorSourceNode.label, vscode.TreeItemCollapsibleState.None);
        treeItem.contextValue = types_1.CONTEXT_VALUES.source;
        treeItem.iconPath = {
            light: path.join(__dirname, '..', 'images', 'light', 'connector.svg'),
            dark: path.join(__dirname, '..', 'images', 'dark', 'connector.svg'),
        };
        return treeItem;
    }
}
exports.ConnectorSourceTree = ConnectorSourceTree;
//# sourceMappingURL=connectorSource.js.map