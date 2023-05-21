"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorSinkTree = exports.ConnectorSinkNode = void 0;
const message_1 = require("./message");
const error_1 = require("./error");
const vscode = require("vscode");
const path = require("path");
const constants_1 = require("../../../common/constants");
class ConnectorSinkNode extends vscode.TreeItem {
    constructor(pulsarAdmin, label) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.pulsarAdmin = pulsarAdmin;
        this.label = label;
        this.contextValue = constants_1.CONTEXT_VALUES.sink;
        this.iconPath = {
            light: path.join(__dirname, '..', 'images', 'light', 'connector.svg'),
            dark: path.join(__dirname, '..', 'images', 'dark', 'connector.svg'),
        };
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
                    return [new message_1.MessageNode(constants_1.ExplorerMessageTypes.noConnectorSinks)];
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
}
exports.ConnectorSinkTree = ConnectorSinkTree;
