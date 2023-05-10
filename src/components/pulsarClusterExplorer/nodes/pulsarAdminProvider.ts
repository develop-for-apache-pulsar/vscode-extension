import {CONTEXT_VALUES, AllPulsarAdminExplorerNodeTypes, TBaseNode} from "./types";
import {TSavedProviderConfig} from "../../../types/TSavedProviderConfig";
import * as vscode from "vscode";
import * as path from "path";
import {TProviderSettings} from "../../../types/TProviderSettings";
import {TPulsarAdminProviderConfigs} from "../../../types/TPulsarAdminProviderConfigs";
import {TPulsarAdminProviderCluster} from "../../../types/TPulsarAdminProviderCluster";

export interface IPulsarAdminProviderNode extends TBaseNode {
  readonly providerConfig: TPulsarAdminProviderConfigs;
}

export class PulsarAdminProviderNode implements IPulsarAdminProviderNode {
  constructor(readonly label: string, readonly providerConfig: TPulsarAdminProviderConfigs) {}
}

export class PulsarAdminProviderTree {
  constructor(){}
  async getChildren(pulsarAdminProviderConfigs: TPulsarAdminProviderConfigs[]): Promise<AllPulsarAdminExplorerNodeTypes[]> {
    if(pulsarAdminProviderConfigs.length === 0) {
      return []; //must be blank to show welcome message
    }

    return pulsarAdminProviderConfigs.map((providerConfig) => {
      return new PulsarAdminProviderNode("", providerConfig);
    });
  }

  static getTreeItem(pulsarAdminProviderNode: IPulsarAdminProviderNode): vscode.TreeItem {
    const providerTypeName = pulsarAdminProviderNode.providerConfig.config.providerTypeName;
    const treeItem = new vscode.TreeItem(pulsarAdminProviderNode.providerConfig.config.name, vscode.TreeItemCollapsibleState.Collapsed);
    treeItem.contextValue = CONTEXT_VALUES.provider;
    treeItem.tooltip = providerTypeName;
    treeItem.iconPath = {
      light: path.join(__dirname, '..', 'src', 'components', 'pulsarAdminProvider',providerTypeName, pulsarAdminProviderNode.providerConfig.settings.lightIconFileName),
      dark: path.join(__dirname, '..', 'src', 'components', 'pulsarAdminProvider', providerTypeName, pulsarAdminProviderNode.providerConfig.settings.darkIconFileName),
    };
    treeItem.description = (pulsarAdminProviderNode.providerConfig.config.name !== pulsarAdminProviderNode.providerConfig.settings.displayName ? pulsarAdminProviderNode.providerConfig.settings.displayName : undefined);

    return treeItem;
  }
}

