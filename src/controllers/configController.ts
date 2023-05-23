import { AddClusterConfigWizard } from "../wizards/addClusterConfig";
import ConfigurationProvider from "../providers/configurationProvider//configuration";
import { TSavedProviderConfig } from "../types/tSavedProviderConfig";
import * as vscode from "vscode";
import {PulsarAdminProviderNode} from "../providers/pulsarClusterTreeDataProvider/nodes/pulsarAdminProvider";
import {PulsarAdminProviders} from "../pulsarAdminProviders";
import {trace} from "../utils/traceDecorator";

export class ConfigController {
  @trace('Show Add Cluster Config Wizard')
  public static async showAddClusterConfigWizard(providerRegistry: PulsarAdminProviders, context: vscode.ExtensionContext): Promise<void> {
    await AddClusterConfigWizard.startWizard(context, providerRegistry);
  }

  @trace('Remove Saved Config')
  public static async removeSavedConfig(pulsarAdminProviderNode: PulsarAdminProviderNode): Promise<void> {
    const configs = ConfigurationProvider.getClusterConfigs() as TSavedProviderConfig[];
    const config: TSavedProviderConfig | undefined = configs.find((value) => value.providerId === pulsarAdminProviderNode.providerConfig.config.providerId );

    if(config === undefined){
      vscode.window.showErrorMessage(`Could not find config for ${pulsarAdminProviderNode.providerConfig.config.name}`);
      return;
    }

    await ConfigurationProvider.removeClusterConfig(config);
  }

}
