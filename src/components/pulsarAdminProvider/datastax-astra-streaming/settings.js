"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const astra_api_1 = require("./astra-api");
const clusterConfigBuilder_1 = require("../../config/clusterConfigBuilder");
const provider_1 = require("./provider");
class Settings {
    constructor() {
        this.typeName = 'datastax-astra-streaming';
        this.displayName = 'Astra Streaming';
        this.description = 'A tenant hosted on DataStax Astra Streaming, using JWT token auth. Note: you\'ll need your Astra token to complete this wizard.';
        this.darkIconFileName = 'Astra-Logo-dark.svg';
        this.lightIconFileName = 'Astra-Logo-light.svg';
        this.saveProviderWizard = class {
            constructor(wizard) {
                this.wizard = wizard;
                this.clusterTenantSeparator = "|||";
                this.astraToken = "";
                this.streamingClusters = [];
                this.streamingTenants = [];
            }
            startWizard() {
                return this.astraTokenPage();
            }
            async receivedMessage(message) {
                switch (message.command) {
                    case SaveProviderMessageCommand.setAstraToken:
                        this.astraToken = message.text;
                        this.wizard.showPage(await this.providerSummaryPage());
                        break;
                    case SaveProviderMessageCommand.saveConfigOverride:
                        const clusterTenants = message.text;
                        await this.saveConfig(clusterTenants);
                        break;
                    case SaveProviderMessageCommand.cancel:
                        this.wizard.dispose();
                        break;
                }
            }
            astraTokenPage() {
                return `
        <div class="row h-75">
          <div class="col-12 align-self-center text-center"><h4>Provide your Astra token to discover your clusters and tenants.</h4></div>
          <div class="offset-2 col-8 text-center">
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" id="basic-addon1">&nbsp;</span>
                </div>
                <input type="text" id="astraToken" class="form-control" placeholder="AstraCS:xxxx" aria-label="astraToken" aria-describedby="basic-addon1">
              </div>
          </div>
          <div class="col-2 text-center">&nbsp;</div>
        </div>
        <div class="row h-25 align-items-center">
          <div class="offset-4 col-2">
              <button class="btn btn-primary btn-lg" onclick='sendMsg("${SaveProviderMessageCommand.setAstraToken}",document.getElementById("astraToken").value)'>Next >></button>
            </div>
          <div class="col-2">
              <button class="btn btn-secondary btn-lg" onclick='sendMsg("${SaveProviderMessageCommand.cancel}","")'>Cancel</button>
          </div>
          <div class="col-4">&nbsp;</div>
        </div>`;
            }
            buildTenantCheckItem(clusterName, tenantName) {
                return `<div class="form-check">
      <input class="form-check-input" type="checkbox" value="${clusterName}${this.clusterTenantSeparator}${tenantName}" checked>
      <label class="form-check-label" for="defaultCheck1">${tenantName}</label>
    </div>`;
            }
            async providerSummaryPage() {
                const clustersAndTenants = [];
                try {
                    const astraApi = new astra_api_1.AstraApi(this.astraToken);
                    this.streamingClusters = await astraApi.getStreamingClusters();
                    this.streamingTenants = await astraApi.getStreamingTenants();
                    for (const streamingCluster of this.streamingClusters) {
                        clustersAndTenants.push([streamingCluster.clusterName, []]);
                    }
                    for (const streamingTenant of this.streamingTenants) {
                        clustersAndTenants.find((clusterAndTenants) => clusterAndTenants[0] === streamingTenant.clusterName)[1].push(streamingTenant.tenantName);
                    }
                }
                catch (err) {
                    console.error(err);
                    this.wizard.postMessage(SaveProviderMessageError.pulsarAdminError, err.message);
                }
                let str = "";
                for (const clusterAndTenant of clustersAndTenants) {
                    const tenants = clusterAndTenant[1];
                    if (tenants.length === 0) {
                        continue;
                    }
                    str += `<div class="row"><div class="col-12"><span class="text-capitalize">${clusterAndTenant[0]}</span>&nbsp;<span class="text-muted text-sm-left">(cluster)</span></div>`;
                    for (const tenant of tenants) {
                        str += `<div class="col-1"></div><div class="col-11">`;
                        str += this.buildTenantCheckItem(clusterAndTenant[0], tenant);
                        str += `</div>`;
                    }
                    str += `</div><hr />`;
                }
                return `
      <div class="row h-75 mt-3">
        <div class="col-6 align-self-center text-center"><h4>Choose the tenants you would like to manage in your workspace.</h4></div>
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
            <button class="btn btn-primary btn-lg" onclick='sendMsg("${SaveProviderMessageCommand.saveConfigOverride}",buildClusterTenants())'>Save Configuration</button>
          </div>
        <div class="col-2">
            <button class="btn btn-secondary btn-lg" onclick='sendMsg("${SaveProviderMessageCommand.cancel}","")'>Cancel</button>
        </div>
        <div class="col-4">&nbsp;</div>
      </div>`;
            }
            async saveConfig(clusterTenants) {
                const providerTypeName = `datastax-astra-streaming`;
                const clusterConfigBuilder = new clusterConfigBuilder_1.ClusterConfigBuilder(providerTypeName);
                if (!clusterTenants || clusterTenants.length === 0) {
                    throw new Error('Choose at least one tenant');
                }
                let currentClusterName = "";
                for (const clusterTenant of clusterTenants) {
                    const nameSplit = clusterTenant.split(this.clusterTenantSeparator);
                    if (nameSplit.length !== 2) {
                        this.wizard.postError(SaveProviderMessageError.noTenantsSelected, new Error(`Could not parse cluster/tenant "${clusterTenant}".`));
                        return;
                    }
                    const clusterName = nameSplit[0];
                    const tenantName = nameSplit[1];
                    const tenantDetails = this.streamingTenants.find((tenant) => tenant.clusterName === clusterName && tenant.tenantName === tenantName);
                    if (tenantDetails === undefined) {
                        this.wizard.postError(SaveProviderMessageError.noTenantsSelected, new Error(`Could not find tenant details for "${clusterTenant}".`));
                        return;
                    }
                    if (currentClusterName !== clusterName) {
                        currentClusterName = clusterName;
                        try {
                            const cluster = await clusterConfigBuilder.initCluster(clusterName, tenantDetails.brokerServiceUrl, tenantDetails.webServiceUrl, tenantDetails.pulsarVersion);
                            clusterConfigBuilder.addCluster(cluster);
                        }
                        catch (err) {
                            this.wizard.postError(SaveProviderMessageError.couldNotSave, err);
                            return;
                        }
                    }
                    try {
                        const pulsarAdmin = new provider_1.Provider(tenantDetails.webServiceUrl, tenantDetails.pulsarToken);
                        clusterConfigBuilder.addTenant(clusterName, tenantName, pulsarAdmin, tenantDetails.pulsarToken);
                    }
                    catch (err) {
                        this.wizard.postError(SaveProviderMessageError.couldNotSave, err);
                    }
                }
                //TODO: what if they all errored out?
                try {
                    await clusterConfigBuilder.saveConfig();
                }
                catch (err) {
                    this.wizard.postError(SaveProviderMessageError.couldNotSave, err);
                    return;
                }
                this.wizard.dispose();
            }
        };
    }
}
exports.Settings = Settings;
var SaveProviderMessageCommand;
(function (SaveProviderMessageCommand) {
    SaveProviderMessageCommand["cancel"] = "cancel";
    SaveProviderMessageCommand["setAstraToken"] = "setAstraToken";
    SaveProviderMessageCommand["saveConfigOverride"] = "saveConfigOverride";
})(SaveProviderMessageCommand || (SaveProviderMessageCommand = {}));
var SaveProviderMessageError;
(function (SaveProviderMessageError) {
    SaveProviderMessageError["pulsarAdminError"] = "pulsarAdminError";
    SaveProviderMessageError["couldNotSave"] = "couldNotSave";
    SaveProviderMessageError["noTenantsSelected"] = "noTenantsSelected";
})(SaveProviderMessageError || (SaveProviderMessageError = {}));
//# sourceMappingURL=settings.js.map