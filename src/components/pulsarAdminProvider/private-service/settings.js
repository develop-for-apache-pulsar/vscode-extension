"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const provider_1 = require("./provider");
class Settings {
    constructor() {
        this.typeName = 'private-service';
        this.displayName = 'Private Service';
        this.description = 'A private Pulsar service usually hosted in a private cloud or on-premises. Infrastructures are typically dedicated virtual machines or Kubernetes, using JWT token auth.';
        this.darkIconFileName = 'Pulsar-Logo.svg';
        this.lightIconFileName = 'Pulsar-Logo.svg';
        this.saveProviderWizard = class {
            constructor(wizard) {
                this.wizard = wizard;
                this.tempCreds = { webServiceUrl: "", pulsarToken: "" };
                this.clusterTenantSeparator = "|||";
            }
            startWizard() {
                return this.webServiceUrlPage();
            }
            async receivedMessage(message) {
                switch (message.command) {
                    case SaveProviderMessageCommand.setWebServiceUrl:
                        const webServiceUrl = message.text;
                        this.tempCreds.webServiceUrl = webServiceUrl;
                        this.wizard.webServiceUrl = webServiceUrl;
                        try {
                            this.pulsarAdminProvider = new provider_1.Provider(webServiceUrl);
                            const needToken = await this.needTokenWithWebServiceUrl(this.pulsarAdminProvider);
                            if (needToken === true) {
                                this.wizard.showPage(this.tokenPage());
                            }
                            else {
                                this.wizard.showPage(await this.providerSummaryPage());
                            }
                        }
                        catch (err) {
                            this.wizard.postError(SaveProviderMessageError.needTokenError, err);
                        }
                        break;
                    case SaveProviderMessageCommand.setToken:
                        const pulsarToken = message.text;
                        this.tempCreds.pulsarToken = pulsarToken;
                        this.wizard.pulsarToken = pulsarToken;
                        this.pulsarAdminProvider = new provider_1.Provider(this.tempCreds.webServiceUrl, pulsarToken);
                        this.wizard.showPage(await this.providerSummaryPage());
                        break;
                    case SaveProviderMessageCommand.cancel:
                        this.wizard.dispose();
                        break;
                }
            }
            async needTokenWithWebServiceUrl(pulsarAdminProvider) {
                try {
                    await pulsarAdminProvider.ListClusterNames();
                    return false;
                }
                catch (err) {
                    if (err.status && err.status === 401) {
                        return true;
                    }
                    throw err;
                }
            }
            webServiceUrlPage() {
                return `
        <div class="row h-75">
          <div class="col-12 align-self-center text-center"><h4>What is the Pulsar web service url?</h4></div>
          <div class="offset-2 col-8 text-center">
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" id="basic-addon1">&nbsp;</span>
                </div>
                <input type="text" id="webServiceUrl" class="form-control" placeholder="" aria-label="webServiceUrl" aria-describedby="basic-addon1">
              </div>
          </div>
          <div class="col-2 text-center">&nbsp;</div>
        </div>
        <div class="row h-25 align-items-center">
          <div class="offset-4 col-2">
              <button class="btn btn-primary btn-lg" onclick='sendMsg("${SaveProviderMessageCommand.setWebServiceUrl}",document.getElementById("webServiceUrl").value)'>Next >></button>
            </div>
          <div class="col-2">
              <button class="btn btn-secondary btn-lg" onclick='sendMsg("${SaveProviderMessageCommand.cancel}","")'>Cancel</button>
          </div>
          <div class="col-4">&nbsp;</div>
        </div>`;
            }
            tokenPage() {
                return `<div class="row">
        <div class="col-12 text-lg-center">Looks like you need a token.</div>
        <div class="col-12 text-center">
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1">&nbsp;</span>
              </div>
              <input type="text" id="pulsarToken" class="form-control" placeholder="" aria-label="pulsartoken" aria-describedby="basic-addon1">
            </div>
        </div>
        </div>
        <div class="row">
        <div class="col-6 text-center">
        <button class="btn btn-success" onclick='sendMsg("${SaveProviderMessageCommand.setToken}",document.getElementById("pulsarToken").value())'>Next >></button>
        </div>
        <div class="col-6 text-center">
        <button class="btn btn-light" onclick='sendMsg("${SaveProviderMessageCommand.cancel}","")'>Cancel</button>
        </div>
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
                    if (this.pulsarAdminProvider === undefined) {
                        throw new Error("No Pulsar Admin Provider instance is available");
                    }
                    const clusterNames = await this.pulsarAdminProvider.ListClusterNames();
                    for (const clusterName of clusterNames) {
                        const clusterDetails = await this.pulsarAdminProvider.GetClusterDetails(clusterName);
                        if (clusterDetails === undefined) {
                            clustersAndTenants.push([clusterName, ['clusterDetailsError']]);
                            continue;
                        }
                        const tenantNames = await this.pulsarAdminProvider.ListTenantNames(clusterName);
                        clustersAndTenants.push([clusterName, tenantNames]);
                    }
                }
                catch (err) {
                    console.error(err);
                    this.wizard.postMessage(SaveProviderMessageError.pulsarAdminError, err.message);
                }
                let str = "";
                for (const clusterAndTenant of clustersAndTenants) {
                    str += `<div class="row"><div class="col-12"><span class="text-capitalize">${clusterAndTenant[0]}</span>&nbsp;<span class="text-muted text-sm-left">(cluster)</span></div>`;
                    const tenants = clusterAndTenant[1];
                    if (tenants.length === 0) {
                        str += `(no tenants found)`;
                        continue;
                    }
                    if (tenants[0] === 'clusterDetailsError') {
                        str += `(error getting cluster details)`;
                        continue;
                    }
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
            <button class="btn btn-primary btn-lg" onclick='sendMsg("${SaveProviderMessageCommand.saveConfig}",buildClusterTenants())'>Save Configuration</button>
          </div>
        <div class="col-2">
            <button class="btn btn-secondary btn-lg" onclick='sendMsg("${SaveProviderMessageCommand.cancel}","")'>Cancel</button>
        </div>
        <div class="col-4">&nbsp;</div>
      </div>`;
            }
        };
    }
}
exports.Settings = Settings;
var SaveProviderMessageCommand;
(function (SaveProviderMessageCommand) {
    SaveProviderMessageCommand["setWebServiceUrl"] = "setWebServiceUrl";
    SaveProviderMessageCommand["saveConfig"] = "saveConfig";
    SaveProviderMessageCommand["cancel"] = "cancel";
    SaveProviderMessageCommand["setToken"] = "setToken";
})(SaveProviderMessageCommand || (SaveProviderMessageCommand = {}));
var SaveProviderMessageError;
(function (SaveProviderMessageError) {
    SaveProviderMessageError["pulsarAdminError"] = "pulsarAdminError";
    SaveProviderMessageError["needTokenError"] = "needTokenError";
})(SaveProviderMessageError || (SaveProviderMessageError = {}));
//# sourceMappingURL=settings.js.map