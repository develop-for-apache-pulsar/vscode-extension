"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamespaceTree = exports.NamespaceNode = void 0;
const types_1 = require("./types");
const message_1 = require("./message");
const error_1 = require("./error");
const vscode = require("vscode");
const path = require("path");
class NamespaceNode {
    constructor(pulsarAdmin, label, tenantName) {
        this.pulsarAdmin = pulsarAdmin;
        this.label = label;
        this.tenantName = tenantName;
    }
}
exports.NamespaceNode = NamespaceNode;
class NamespaceTree {
    constructor() {
    }
    async getChildren(tenantNode) {
        try {
            return tenantNode.tenant.pulsarAdmin.ListNamespaceNames(tenantNode.tenant.name).then((namespaceNames) => {
                if (namespaceNames.length === 0) {
                    return [new message_1.MessageNode(types_1.MessageTypes.noNamespaces)];
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
    static getTreeItem(namespaceNode) {
        const treeItem = new vscode.TreeItem(namespaceNode.label, vscode.TreeItemCollapsibleState.Collapsed);
        treeItem.contextValue = types_1.CONTEXT_VALUES.tenant;
        treeItem.description = "namespace";
        treeItem.iconPath = {
            light: path.join(__dirname, '..', 'images', 'light', 'namespace.svg'),
            dark: path.join(__dirname, '..', 'images', 'dark', 'namespace.svg'),
        };
        return treeItem;
    }
}
exports.NamespaceTree = NamespaceTree;
//# sourceMappingURL=namespace.js.map