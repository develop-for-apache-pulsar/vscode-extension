import { AddClusterConfigWizard } from "../wizards/addClusterConfig";
import { getClusterConfigs, removeClusterConfig } from "../config/config";
import { TSavedProviderConfig } from "../../types/TSavedProviderConfig";
import * as vscode from "vscode";
import { PulsarAdminCommandUtils } from "./general";
import {Host} from '../../utils/host';
import {PulsarAdminProviderNode} from "../pulsarClusterExplorer/nodes/pulsarAdminProvider";
import {PulsarAdminProviders} from "../pulsarAdminProvider";

export class PulsarAdminConfigCommands{
  public static async showAddClusterConfigWizard(needsActivationDebouncing: boolean = true, context: vscode.ExtensionContext, providerRegistry: PulsarAdminProviders) {
    await PulsarAdminCommandUtils.debounceActivation(needsActivationDebouncing);
    await AddClusterConfigWizard.startWizard(context, providerRegistry);
  }

  public static async removeSavedConfig(host: Host, pulsarAdminProviderNode: PulsarAdminProviderNode, context: vscode.ExtensionContext): Promise<void> {
    const configs = getClusterConfigs() as TSavedProviderConfig[];
    const config: TSavedProviderConfig | undefined = configs.find((value) => value.providerId === pulsarAdminProviderNode.providerConfig.config.providerId );

    if(config === undefined){
      host.showErrorMessage(`Could not find config for ${pulsarAdminProviderNode.providerConfig.config.name}`);
      return;
    }

    await removeClusterConfig(config);
  }

}
