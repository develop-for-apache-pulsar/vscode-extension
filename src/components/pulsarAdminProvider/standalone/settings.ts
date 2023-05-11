import {TPulsarAdmin} from "../../../types/TPulsarAdmin";
import {Provider} from "./provider";
import {TProviderSettings} from "../../../types/TProviderSettings";

export class Settings implements TProviderSettings {
  public typeName = 'standalone';
  public displayName ='Standalone';
  public description = 'A Pulsar cluster running in standalone mode on your desktop. This is a single instance of Pulsar running in a single JVM process with no token auth.';
  public darkIconFileName = 'images/Pulsar-Logo.svg';
  public lightIconFileName = 'images/Pulsar-Logo.svg';

  public saveProviderWizard = class {
    private pulsarAdminProvider: TPulsarAdmin | undefined;
    private tempCreds: {webServiceUrl: string} = {webServiceUrl: ""};
    private clusterTenantSeparator: string = "|||";

    constructor(private readonly wizard: any) {}

    public startWizard(): string {
      return this.webServiceUrlPage();
    }

    public async receivedMessage(message: any): Promise<void> {
      switch (message.command) {
        case SaveProviderMessageCommand.SetWebServiceUrl:
          const webServiceUrl = message.text as string;
          this.tempCreds.webServiceUrl = webServiceUrl;
          this.wizard.webServiceUrl = webServiceUrl;

          try {
            this.pulsarAdminProvider = new Provider(webServiceUrl) as TPulsarAdmin;
            await this.validateWebServiceUrl(this.pulsarAdminProvider);
            this.wizard.showPage(await this.providerSummaryPage());
          } catch (err: any) {
            this.wizard.postError(SaveProviderMessageError.NeedTokenError, err);
          }

          break;
        case SaveProviderMessageCommand.setConfigName:
          const providerName = message.text as string;
          this.wizard.configName = providerName;
          break;
        case SaveProviderMessageCommand.Cancel:
          this.wizard.dispose();
          break;
      }
    }

    private async validateWebServiceUrl(pulsarAdminProvider: TPulsarAdmin): Promise<void> {
      await pulsarAdminProvider.ListClusterNames();
    }

    private webServiceUrlPage(): string {
      return `
        <div class="row h-75">
          <div class="col-12 align-self-center text-center"><h4>What is the Pulsar web service url?</h4></div>
          <div class="offset-2 col-8 text-center">
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" id="basic-addon1">&nbsp;</span>
                </div>
                <input type="text" id="webServiceUrl" class="form-control" value="http://localhost:8080" aria-label="webServiceUrl" aria-describedby="basic-addon1">
              </div>
          </div>
          <div class="col-2 text-center">&nbsp;</div>
        </div>
        <div class="row h-25 align-items-center">
          <div class="offset-4 col-2">
              <button class="btn btn-primary btn-lg" onclick='sendMsg("${SaveProviderMessageCommand.SetWebServiceUrl}",document.getElementById("webServiceUrl").value)'>Next >></button>
            </div>
          <div class="col-2">
              <button class="btn btn-secondary btn-lg" onclick='sendMsg("${SaveProviderMessageCommand.Cancel}","")'>Cancel</button>
          </div>
          <div class="col-4">&nbsp;</div>
        </div>`;
    }

    private buildTenantCheckItem(clusterName: string, tenantName: string) {
      return `<div class="form-check">
      <input class="form-check-input" type="checkbox" value="${clusterName}${this.clusterTenantSeparator}${tenantName}" checked>
      <label class="form-check-label" for="defaultCheck1">${tenantName}</label>
    </div>`;
    }

    private async providerSummaryPage(): Promise<string> {
      const clustersAndTenants: [string, string[]][] = [];

      try {
        if(this.pulsarAdminProvider === undefined){
          throw new Error("No Pulsar Admin Provider instance is available");
        }

        const clusterNames = await this.pulsarAdminProvider.ListClusterNames();
        for (const clusterName of clusterNames) {
          const clusterDetails = await this.pulsarAdminProvider.GetClusterDetails(clusterName);
          if(clusterDetails === undefined){
            clustersAndTenants.push([clusterName,['clusterDetailsError']]);
            continue;
          }

          const tenantNames = await this.pulsarAdminProvider.ListTenantNames(clusterName);
          clustersAndTenants.push([clusterName,tenantNames]);
        }
      } catch (err: any) {
        console.error(err);
        this.wizard.postMessage(SaveProviderMessageError.PulsarAdminError, err.message);
      }

      let str = "";
      for (const clusterAndTenant of clustersAndTenants) {
        str += `<div class="row"><div class="col-12"><span class="text-capitalize">${clusterAndTenant[0]}</span>&nbsp;<span class="text-muted text-sm-left">(cluster)</span></div>`;

        const tenants = clusterAndTenant[1];
        if(tenants.length === 0) {
          str += `(no tenants found)`;
          continue;
        }

        if(tenants[0] === 'clusterDetailsError') {
          str += `(error getting cluster details)`;
          continue;
        }

        for(const tenant of tenants) {
          str += `<div class="col-1"></div><div class="col-11">`;
          str += this.buildTenantCheckItem(clusterAndTenant[0], tenant);
          str += `</div>`;
        }
        str += `</div><hr />`;
      }

      return `
      <div class="row h-75 mt-3">
        <div class="col-6 align-self-center text-center">
          <div class="row">
              <div class="col-12 align-self-center text-center"><h4>Choose the tenants you would like to manage in your workspace.</h4></div>
          </div>
          <div class="row">
              <div class="col-12 align-self-center text-center"><h5 class="text-muted">Optionally, name this saved configuration.</h5></div>
              <div class="offset-3 col-6">
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" id="basic-addon1">&nbsp;</span>
                </div>
                <input type="text" id="providerName" class="form-control" value="Private Service" aria-label="providerName" aria-describedby="basic-addon1">
              </div>
            </div>
          </div>
        </div>
        <div class="col-5 offset-1" style="overflow-y: auto;">
          <div class="card h-100">
            <div class="card-header">
              Clusters and Tenants
            </div>
            <div class="card-body">
            ${str}
            </div>
          </div>
        </div>
      </div>
      <div class="row h-25 align-items-center">
        <div class="offset-3 col-3">
            <button class="btn btn-primary btn-lg" onclick='sendMsg("${SaveProviderMessageCommand.setConfigName}",document.getElementById("providerName").value); sendMsg("${SaveProviderMessageCommand.SaveConfig}",buildClusterTenants())'>Save Configuration</button>
          </div>
        <div class="col-2">
            <button class="btn btn-secondary btn-lg" onclick='sendMsg("${SaveProviderMessageCommand.Cancel}","")'>Cancel</button>
        </div>
        <div class="col-4">&nbsp;</div>
      </div>`;
    }
  };
}

enum SaveProviderMessageCommand {
  Loaded = 'loaded',
  SetWebServiceUrl = 'setWebServiceUrl',
  SaveConfig = 'saveConfig',
  Cancel = 'cancel',
  setConfigName = 'setConfigName',
}

enum SaveProviderMessageError {
  PulsarAdminError = 'pulsarAdminError',
  InvalidWebServiceUrl = 'invalidWebServiceUrl',
  CouldNotSave = 'couldNotSave',
  ValidateWebServiceError = 'validateWebServiceError',
  NeedTokenError = 'needTokenError',
  NoTenantsSelected = 'noTenantsSelected',
}