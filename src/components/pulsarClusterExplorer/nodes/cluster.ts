import {CONTEXT_VALUES, MessageTypes, AllPulsarAdminExplorerNodeTypes, TBaseNode} from "./types";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as vscode from "vscode";
import * as path from "path";
import {TPulsarAdminProviderCluster} from "../../../types/TPulsarAdminProviderCluster";
import {TPulsarAdminProviderTenant} from "../../../types/TPulsarAdminProviderTenant";
import {IPulsarAdminProviderNode} from "./pulsarAdminProvider";

export interface IClusterNode extends TBaseNode {
  readonly clusterInfo: TPulsarAdminProviderCluster;
}

export class ClusterNode implements IClusterNode {
  constructor(readonly label: string, readonly clusterInfo: TPulsarAdminProviderCluster) {}
}

export class ClusterTree {
  constructor(){}

  async getChildren(providerNode: IPulsarAdminProviderNode): Promise<AllPulsarAdminExplorerNodeTypes[]> {
    if(providerNode.providerConfig.pulsarAdminClusters.length === 0) {
      return [new MessageNode(MessageTypes.noClusters)];
    }

    return providerNode.providerConfig.pulsarAdminClusters.map((pulsarAdminCluster) => {
      return new ClusterNode(pulsarAdminCluster.name, pulsarAdminCluster);
    });
  }

  static getTreeItem(clusterNode: IClusterNode): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(clusterNode.label, vscode.TreeItemCollapsibleState.Collapsed);
    treeItem.contextValue = CONTEXT_VALUES.cluster;
    treeItem.description = "cluster " + (clusterNode.clusterInfo.pulsarVersion !== undefined && clusterNode.clusterInfo.pulsarVersion !== '' ? `v${clusterNode.clusterInfo.pulsarVersion}` : ``);
    treeItem.iconPath = {
      light: path.join(__dirname, '..',  'images', 'light', 'cluster.svg'),
      dark: path.join(__dirname, '..', 'images', 'dark', 'cluster.svg'),
    };

    return treeItem;
  }
}
