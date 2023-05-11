import {CONTEXT_VALUES, AllPulsarAdminExplorerNodeTypes} from "./types";
import * as vscode from "vscode";
import {TPulsarAdminProviderConfigs} from "../../../types/TPulsarAdminProviderConfigs";

export interface IPulsarAdminProviderNode extends vscode.TreeItem {
  readonly providerConfig: TPulsarAdminProviderConfigs;
}

export class PulsarAdminProviderNode extends vscode.TreeItem implements IPulsarAdminProviderNode {
  constructor(readonly providerConfig: TPulsarAdminProviderConfigs, private readonly context: vscode.ExtensionContext) {
    super(providerConfig.config.name, vscode.TreeItemCollapsibleState.Collapsed);
    this.contextValue = CONTEXT_VALUES.provider;
    this.tooltip = providerConfig.config.providerTypeName;
    this.iconPath = {
      light:  vscode.Uri.joinPath(context.extensionUri, providerConfig.settings.lightIconFileName),
      dark:  vscode.Uri.joinPath(context.extensionUri, providerConfig.settings.darkIconFileName),
    };
    this.description = (providerConfig.config.name !== providerConfig.settings.displayName ? providerConfig.settings.displayName : undefined);
  }
}

export class PulsarAdminProviderTree {
  constructor(private readonly context: vscode.ExtensionContext){}
  async getChildren(pulsarAdminProviderConfigs: TPulsarAdminProviderConfigs[]): Promise<AllPulsarAdminExplorerNodeTypes[]> {
    if(!pulsarAdminProviderConfigs){ return [];  }

    if(pulsarAdminProviderConfigs.length === 0) {
      return []; //must be blank to show welcome message
    }

    return pulsarAdminProviderConfigs.map((providerConfig) => {
      return new PulsarAdminProviderNode(providerConfig, this.context);
    });
  }
}

