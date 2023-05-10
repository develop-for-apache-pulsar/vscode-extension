"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PulsarAdminProviderTree = exports.PulsarAdminProviderNode = void 0;
const types_1 = require("./types");
const vscode = require("vscode");
const path = require("path");
class PulsarAdminProviderNode {
    constructor(label, providerConfig) {
        this.label = label;
        this.providerConfig = providerConfig;
    }
}
exports.PulsarAdminProviderNode = PulsarAdminProviderNode;
class PulsarAdminProviderTree {
    constructor() { }
    async getChildren(pulsarAdminProviderConfigs) {
        if (pulsarAdminProviderConfigs.length === 0) {
            return []; //must be blank to show welcome message
        }
        return pulsarAdminProviderConfigs.map((providerConfig) => {
            return new PulsarAdminProviderNode(providerConfig.settings.displayName, providerConfig);
        });
    }
    static getTreeItem(pulsarAdminProviderNode) {
        const providerTypeName = pulsarAdminProviderNode.providerConfig.config.providerTypeName;
        const treeItem = new vscode.TreeItem(pulsarAdminProviderNode.label, vscode.TreeItemCollapsibleState.Collapsed);
        treeItem.contextValue = types_1.CONTEXT_VALUES.provider;
        treeItem.tooltip = providerTypeName;
        treeItem.iconPath = {
            light: path.join(__dirname, '..', 'src', 'components', 'pulsarAdminProvider', providerTypeName, pulsarAdminProviderNode.providerConfig.settings.lightIconFileName),
            dark: path.join(__dirname, '..', 'src', 'components', 'pulsarAdminProvider', providerTypeName, pulsarAdminProviderNode.providerConfig.settings.darkIconFileName),
        };
        treeItem.description = pulsarAdminProviderNode.providerConfig.settings.description;
        return treeItem;
    }
}
exports.PulsarAdminProviderTree = PulsarAdminProviderTree;
//# sourceMappingURL=pulsarAdminProvider.js.map