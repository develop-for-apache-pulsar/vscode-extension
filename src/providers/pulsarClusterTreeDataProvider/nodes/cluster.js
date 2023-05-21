"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterTree = exports.ClusterNode = void 0;
const message_1 = require("./message");
const vscode = require("vscode");
const path = require("path");
const constants_1 = require("../../../common/constants");
class ClusterNode extends vscode.TreeItem {
    constructor(label, clusterInfo) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.label = label;
        this.clusterInfo = clusterInfo;
        this.contextValue = constants_1.CONTEXT_VALUES.cluster;
        this.description = "cluster " + (clusterInfo.pulsarVersion !== undefined && clusterInfo.pulsarVersion !== '' ? `v${clusterInfo.pulsarVersion}` : ``);
        this.iconPath = {
            light: path.join(__dirname, '..', 'images', 'light', 'cluster.svg'),
            dark: path.join(__dirname, '..', 'images', 'dark', 'cluster.svg'),
        };
    }
}
exports.ClusterNode = ClusterNode;
class ClusterTree {
    constructor() { }
    async getChildren(providerNode) {
        if (!providerNode) {
            return [];
        }
        if (providerNode.providerConfig.pulsarAdminClusters.length === 0) {
            return [new message_1.MessageNode(constants_1.ExplorerMessageTypes.noClusters)];
        }
        return providerNode.providerConfig.pulsarAdminClusters.map((pulsarAdminCluster) => {
            return new ClusterNode(pulsarAdminCluster.name, pulsarAdminCluster);
        });
    }
}
exports.ClusterTree = ClusterTree;
