"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantTree = exports.TenantNode = void 0;
const message_1 = require("./message");
const error_1 = require("./error");
const vscode = require("vscode");
const path = require("path");
const constants_1 = require("../../../common/constants");
class TenantNode extends vscode.TreeItem {
    constructor(label, tenant) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.label = label;
        this.tenant = tenant;
        this.contextValue = constants_1.CONTEXT_VALUES.tenant;
        this.description = "tenant";
        this.iconPath = {
            light: path.join(__dirname, '..', 'images', 'light', 'tenant.svg'),
            dark: path.join(__dirname, '..', 'images', 'dark', 'tenant.svg'),
        };
    }
}
exports.TenantNode = TenantNode;
class TenantTree {
    constructor() { }
    async getChildren(clusterNode) {
        if (!clusterNode) {
            return [];
        }
        if (clusterNode.clusterInfo.tenants.length === 0) {
            return [new message_1.MessageNode(constants_1.ExplorerMessageTypes.noTenants)];
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
}
exports.TenantTree = TenantTree;
