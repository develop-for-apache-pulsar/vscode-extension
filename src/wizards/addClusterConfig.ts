import * as vscode from "vscode";
import {Wizard} from "../utils/wizard";
import {ClusterConfigBuilder} from "../providers/configurationProvider/clusterConfigBuilder";
import {TPulsarAdmin} from "../types/tPulsarAdmin";
import {PulsarAdminProviders, TProviderInfo} from "../pulsarAdminProviders";
import {TPulsarAdminProviderCluster} from "../types/tPulsarAdminProviderCluster";
import {trace} from "../utils/traceDecorator";
import {TWizardMessage} from "../types/tWizardMessage";

enum MessageCommand {
  loaded = 'loaded',
  setProviderType = 'setProviderType',
  saveConfig = 'saveConfig',
}

enum MessageError {
  couldNotSave = 'couldNotSave',
  noTenantsSelected = 'noTenantsSelected',
}

export class AddClusterConfigWizard extends Wizard {
  private clusterConfigBuilder: ClusterConfigBuilder;
  private tempCreds: { configName: string, webServiceUrl: string, pulsarToken: string, providerTypeName: string };
  private clusterTenantSeparator: string = "|||";
  private providerWizard: any;

  constructor(context: vscode.ExtensionContext, private readonly providerRegistry: PulsarAdminProviders) {
    super(context, "addClusterConfig", "Save Cluster Configuration");
    this.receivedMessageCallback = this.receivedMessage;

    this.clusterConfigBuilder = {} as ClusterConfigBuilder;
    this.tempCreds = { configName: "", webServiceUrl: "", pulsarToken: "", providerTypeName: "" };
  }

  @trace('Start add cluster config wizard')
  public static startWizard(context: vscode.ExtensionContext, providerRegistry: PulsarAdminProviders) {
    const wizard = new AddClusterConfigWizard(context, providerRegistry);
    wizard.showWizardStartPage();
  }

  private showWizardStartPage() {
    this.showPage(this.chooseProviderTypePage());
  }

  private async receivedMessage(message: TWizardMessage): Promise<void> {
    switch (message.command) {
      case MessageCommand.loaded:
        // no op
        break;
      case MessageCommand.setProviderType:
        const providerTypeName = message.text as string;
        this.tempCreds.providerTypeName = providerTypeName;

        const providerSettings = this.providerRegistry.getProvider(providerTypeName);
        this.providerWizard = new providerSettings.saveProviderWizard(this);
        this.showPage(this.providerWizard.startWizard());

        break;
      case MessageCommand.saveConfig:
        const clusterTenants = message.text as string[];
        await this.saveConfig(clusterTenants);
        break;
      default:
        this.providerWizard?.receivedMessage(message);
        break;
    }
  }

  set webServiceUrl(webServiceUrl: string) {
    this.tempCreds.webServiceUrl = webServiceUrl;
  }

  set pulsarToken(pulsarToken: string) {
    this.tempCreds.pulsarToken = pulsarToken;
  }

  set configName(configName: string) {
    this.tempCreds.configName = configName;
  }

  @trace('Save cluster config')
  private async saveConfig(clusterTenants: string[]): Promise<void>{
    this.clusterConfigBuilder = new ClusterConfigBuilder(this.tempCreds.providerTypeName, this.tempCreds.configName);

    if(!clusterTenants || clusterTenants.length === 0){
      throw new Error('Choose at least one tenant');
    }

    const providerClass = require(`../pulsarAdminProviders/${this.tempCreds.providerTypeName}/provider`);
    const pulsarAdminProvider = new providerClass.Provider(this.tempCreds.webServiceUrl, this.tempCreds.pulsarToken) as TPulsarAdmin;

    let currentClusterName = "";
    for(const clusterTenant of clusterTenants){
      const nameSplit = clusterTenant.split(this.clusterTenantSeparator);

      if(nameSplit.length !== 2){
        this.postError(MessageError.noTenantsSelected,new Error(`Could not parse cluster/tenant "${clusterTenant}".`));
        return;
      }

      const clusterName = nameSplit[0];
      const tenantName = nameSplit[1];

      if(currentClusterName !== clusterName) {
        currentClusterName = clusterName;

        try {
          const clusterDetails = await pulsarAdminProvider.GetClusterDetails(clusterName);
          let clusterVersion:string;

          try{
            clusterVersion = await pulsarAdminProvider.GetBrokerVersion();
          }catch{
            clusterVersion = "";
          }

          const cluster: TPulsarAdminProviderCluster = await this.clusterConfigBuilder.initCluster(clusterName,
            (clusterDetails!.tlsAllowInsecureConnection ? clusterDetails!.brokerServiceUrl : clusterDetails!.brokerServiceUrlTls) as string,
                                                                                              this.tempCreds.webServiceUrl,
                                                                                              clusterVersion);
          this.clusterConfigBuilder.addCluster(cluster);
        } catch (err: any) {
          this.postError(MessageError.couldNotSave, err);
          return;
        }
      }

      try {
        this.clusterConfigBuilder.addTenant(clusterName, tenantName, pulsarAdminProvider, this.tempCreds.pulsarToken);
      } catch (err: any) {
        this.postError(MessageError.couldNotSave, err);
      }
    }

    //TODO: what if they all errored out?
    try{
      await this.clusterConfigBuilder.saveConfig();
    } catch (err: any) {
      this.postError(MessageError.couldNotSave, err);
      return;
    }

    this.dispose();
  }

  private chooseProviderTypePage(): string {
    let providerTypesStr = "";

    this.providerRegistry.allProviderInfo.forEach((providerInfo: TProviderInfo) => {
      providerTypesStr += `<div class="col-12"><div class="row"><div class="offset-3 col-2">
                  <button style="width: 100%;" class="btn btn-lg btn-primary pt-2 pb-2" onclick='sendMsg("${MessageCommand.setProviderType}","${providerInfo.typeName}")'>${providerInfo.displayName}</button>
              </div>
            <div class="col-5 text-muted">${providerInfo.description}</div></div></div>`;
    });

    return `
      <div class="row h-100">
        <div class="col-12 align-self-center text-center"><h4>Where is your cluster hosted?</h4></div>
        <div class="col-12 text-center">
            <div class="row h-75">
               ${providerTypesStr}
            </div>
        </div>
      </div>`;
  }
}