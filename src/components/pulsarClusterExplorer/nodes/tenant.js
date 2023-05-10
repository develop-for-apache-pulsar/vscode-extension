"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantTree = exports.TenantNode = void 0;
const types_1 = require("./types");
const message_1 = require("./message");
const error_1 = require("./error");
const vscode = require("vscode");
const path = require("path");
class TenantNode {
    constructor(label, tenant) {
        this.label = label;
        this.tenant = tenant;
    }
}
exports.TenantNode = TenantNode;
class TenantTree {
    constructor() { }
    async getChildren(clusterNode) {
        if (clusterNode.clusterInfo.tenants.length === 0) {
            return [new message_1.MessageNode(types_1.MessageTypes.noTenants)];
        }
        try {
            return clusterNode.clusterInfo.tenants.map((tenant) => {
                return new TenantNode(tenant.name, tenant);
            });
        }
        catch (err) {
            return [new error_1.ErrorNode(err)];
        }
    }
    static getTreeItem(tenantNode) {
        const treeItem = new vscode.TreeItem(tenantNode.label, vscode.TreeItemCollapsibleState.Collapsed);
        treeItem.contextValue = types_1.CONTEXT_VALUES.tenant;
        treeItem.description = "tenant";
        treeItem.iconPath = {
            light: path.join(__dirname, '..', 'images', 'light', 'tenant.svg'),
            dark: path.join(__dirname, '..', 'images', 'dark', 'tenant.svg'),
        };
        return treeItem;
    }
}
exports.TenantTree = TenantTree;
//# sourceMappingURL=tenant.js.map