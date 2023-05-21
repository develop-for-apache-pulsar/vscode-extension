"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PulsarAdminProviderTree = exports.PulsarAdminProviderNode = void 0;
const vscode = require("vscode");
const constants_1 = require("../../../common/constants");
class PulsarAdminProviderNode extends vscode.TreeItem {
    constructor(providerConfig, context) {
        super(providerConfig.config.name, vscode.TreeItemCollapsibleState.Collapsed);
        this.providerConfig = providerConfig;
        this.context = context;
        this.contextValue = constants_1.CONTEXT_VALUES.provider;
        this.tooltip = providerConfig.config.providerTypeName;
        this.iconPath = {
            light: vscode.Uri.joinPath(context.extensionUri, providerConfig.settings.lightIconFileName),
            dark: vscode.Uri.joinPath(context.extensionUri, providerConfig.settings.darkIconFileName),
        };
        this.description = (providerConfig.config.name !== providerConfig.settings.displayName ? providerConfig.settings.displayName : undefined);
    }
}
exports.PulsarAdminProviderNode = PulsarAdminProviderNode;
class PulsarAdminProviderTree {
    constructor(context) {
        this.context = context;
    }
    async getChildren(pulsarAdminProviderConfigs) {
        if (!pulsarAdminProviderConfigs) {
            return [];
        }
        if (pulsarAdminProviderConfigs.length === 0) {
            return []; //must be blank to show welcome message
        }
        return pulsarAdminProviderConfigs.map((providerConfig) => {
            return new PulsarAdminProviderNode(providerConfig, this.context);
        });
    }
}
exports.PulsarAdminProviderTree = PulsarAdminProviderTree;
