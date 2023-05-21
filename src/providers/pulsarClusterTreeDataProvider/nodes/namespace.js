"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamespaceTree = exports.NamespaceNode = void 0;
const message_1 = require("./message");
const error_1 = require("./error");
const vscode = require("vscode");
const path = require("path");
const constants_1 = require("../../../common/constants");
class NamespaceNode extends vscode.TreeItem {
    constructor(pulsarAdmin, label, tenantName) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.pulsarAdmin = pulsarAdmin;
        this.label = label;
        this.tenantName = tenantName;
        this.contextValue = constants_1.CONTEXT_VALUES.namespace;
        this.description = "namespace";
        this.iconPath = {
            light: path.join(__dirname, '..', 'images', 'light', 'namespace.svg'),
            dark: path.join(__dirname, '..', 'images', 'dark', 'namespace.svg'),
        };
    }
}
exports.NamespaceNode = NamespaceNode;
class NamespaceTree {
    async getChildren(tenantNode) {
        if (!tenantNode) {
            return [];
        }
        try {
            return tenantNode.tenant.pulsarAdmin.ListNamespaceNames(tenantNode.tenant.name).then((namespaceNames) => {
                if (namespaceNames.length === 0) {
                    return [new message_1.MessageNode(constants_1.ExplorerMessageTypes.noNamespaces)];
                }
                return namespaceNames.map((namespaceName) => {
                    return new NamespaceNode(tenantNode.tenant.pulsarAdmin, namespaceName, tenantNode.tenant.name);
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
exports.NamespaceTree = NamespaceTree;
