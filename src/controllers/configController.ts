import { AddClusterConfigWizard } from "../wizards/addClusterConfig";
import ConfigurationProvider from "../providers/configurationProvider//configuration";
import { TSavedProviderConfig } from "../types/tSavedProviderConfig";
import * as vscode from "vscode";
import {PulsarAdminProviderNode} from "../providers/pulsarClusterTreeDataProvider/nodes/pulsarAdminProvider";
import {PulsarAdminProviders} from "../pulsarAdminProviders";
import {trace} from "../utils/traceDecorator";
import {PulsarClusterTreeDataProvider} from "../providers/pulsarClusterTreeDataProvider/explorer";
import {TreeExplorerController} from "./treeExplorerController";

export class ConfigController {
  @trace('Show Add Cluster Config Wizard')
  public static showAddClusterConfigWizard(providerRegistry: PulsarAdminProviders,
                                                 context: vscode.ExtensionContext,
                                                 treeProvider: PulsarClusterTreeDataProvider): void {
    AddClusterConfigWizard.startWizard(context, providerRegistry, () => {
      vscode.window.showInformationMessage(`Cluster saved successfully`);
      TreeExplorerController.refreshTreeProvider(treeProvider);
    });
  }

  @trace('Remove Saved Config')
  public static removeSavedConfig(pulsarAdminProviderNode: PulsarAdminProviderNode, treeProvider: PulsarClusterTreeDataProvider): void {
    const configs = ConfigurationProvider.getClusterConfigs() as TSavedProviderConfig[];
    const config: TSavedProviderConfig | undefined = configs.find((value) => value.providerId === pulsarAdminProviderNode.providerConfig.config.providerId );

    if(config === undefined){
      vscode.window.showErrorMessage(`Could not find config for ${pulsarAdminProviderNode.providerConfig.config.name}`);
      return;
    }

    ConfigurationProvider.removeClusterConfig(config).then(() => {
      vscode.window.showInformationMessage(`Cluster removed successfully`);
      TreeExplorerController.refreshTreeProvider(treeProvider);
    });
  }

}
