import {CONTEXT_VALUES, MessageTypes, AllPulsarAdminExplorerNodeTypes} from "./types";
import {MessageNode} from "./message";
import * as vscode from "vscode";
import * as path from "path";
import {TPulsarAdminProviderCluster} from "../../../types/TPulsarAdminProviderCluster";
import {IPulsarAdminProviderNode} from "./pulsarAdminProvider";

export interface IClusterNode extends vscode.TreeItem {
  readonly clusterInfo: TPulsarAdminProviderCluster;
}

export class ClusterNode extends vscode.TreeItem implements IClusterNode {
  constructor(readonly label: string, readonly clusterInfo: TPulsarAdminProviderCluster) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.contextValue = CONTEXT_VALUES.cluster;
    this.description = "cluster " + (clusterInfo.pulsarVersion !== undefined && clusterInfo.pulsarVersion !== '' ? `v${clusterInfo.pulsarVersion}` : ``);
    this.iconPath = {
      light: path.join(__dirname, '..',  'images', 'light', 'cluster.svg'),
      dark: path.join(__dirname, '..', 'images', 'dark', 'cluster.svg'),
    };
  }
}

export class ClusterTree {
  constructor(){}

  async getChildren(providerNode: IPulsarAdminProviderNode): Promise<AllPulsarAdminExplorerNodeTypes[]> {
    if(!providerNode) { return []; }

    if(providerNode.providerConfig.pulsarAdminClusters.length === 0) {
      return [new MessageNode(MessageTypes.noClusters)];
    }

    return providerNode.providerConfig.pulsarAdminClusters.map((pulsarAdminCluster) => {
      return new ClusterNode(pulsarAdminCluster.name, pulsarAdminCluster);
    });
  }
}
