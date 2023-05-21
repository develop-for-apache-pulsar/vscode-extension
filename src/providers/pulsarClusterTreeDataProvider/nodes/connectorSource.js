"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorSourceTree = exports.ConnectorSourceNode = void 0;
const message_1 = require("./message");
const error_1 = require("./error");
const vscode = require("vscode");
const path = require("path");
const constants_1 = require("../../../common/constants");
class ConnectorSourceNode extends vscode.TreeItem {
    constructor(pulsarAdmin, label) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.pulsarAdmin = pulsarAdmin;
        this.label = label;
        this.contextValue = constants_1.CONTEXT_VALUES.source;
        this.iconPath = {
            light: path.join(__dirname, '..', 'images', 'light', 'connector.svg'),
            dark: path.join(__dirname, '..', 'images', 'dark', 'connector.svg'),
        };
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
                    return [new message_1.MessageNode(constants_1.ExplorerMessageTypes.noConnectorSources)];
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
}
exports.ConnectorSourceTree = ConnectorSourceTree;
