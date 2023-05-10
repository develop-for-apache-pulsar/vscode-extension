"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterTree = exports.ClusterNode = void 0;
const types_1 = require("./types");
const message_1 = require("./message");
const vscode = require("vscode");
const path = require("path");
class ClusterNode {
    constructor(label, clusterInfo) {
        this.label = label;
        this.clusterInfo = clusterInfo;
    }
}
exports.ClusterNode = ClusterNode;
class ClusterTree {
    constructor() { }
    async getChildren(providerNode) {
        if (providerNode.providerConfig.pulsarAdminClusters.length === 0) {
            return [new message_1.MessageNode(types_1.MessageTypes.noClusters)];
        }
        return providerNode.providerConfig.pulsarAdminClusters.map((pulsarAdminCluster) => {
            return new ClusterNode(pulsarAdminCluster.name, pulsarAdminCluster);
        });
    }
    static getTreeItem(clusterNode) {
        const treeItem = new vscode.TreeItem(clusterNode.label, vscode.TreeItemCollapsibleState.Collapsed);
        treeItem.contextValue = types_1.CONTEXT_VALUES.cluster;
        treeItem.description = "cluster " + (clusterNode.clusterInfo.pulsarVersion !== undefined && clusterNode.clusterInfo.pulsarVersion !== '' ? `v${clusterNode.clusterInfo.pulsarVersion}` : ``);
        treeItem.iconPath = {
            light: path.join(__dirname, '..', 'images', 'light', 'cluster.svg'),
            dark: path.join(__dirname, '..', 'images', 'dark', 'cluster.svg'),
        };
        return treeItem;
    }
}
exports.ClusterTree = ClusterTree;
//# sourceMappingURL=cluster.js.map