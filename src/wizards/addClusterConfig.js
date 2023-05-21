"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddClusterConfigWizard = void 0;
const vscode = require("vscode");
const wizard_1 = require("../utils/wizard");
const clusterConfigBuilder_1 = require("../providers/configurationProvider/clusterConfigBuilder");
const pulsarAdminProviders_1 = require("../pulsarAdminProviders");
const traceDecorator_1 = require("../utils/traceDecorator");
var MessageCommand;
(function (MessageCommand) {
    MessageCommand["loaded"] = "loaded";
    MessageCommand["setProviderType"] = "setProviderType";
    MessageCommand["saveConfig"] = "saveConfig";
})(MessageCommand || (MessageCommand = {}));
var MessageError;
(function (MessageError) {
    MessageError["couldNotSave"] = "couldNotSave";
    MessageError["noTenantsSelected"] = "noTenantsSelected";
})(MessageError || (MessageError = {}));
class AddClusterConfigWizard extends wizard_1.Wizard {
    constructor(context, providerRegistry) {
        super(context, "addClusterConfig", "Save Cluster Configuration");
        this.providerRegistry = providerRegistry;
        this.clusterTenantSeparator = "|||";
        this.receivedMessageCallback = this.receivedMessage;
        this.clusterConfigBuilder = {};
        this.tempCreds = { configName: "", webServiceUrl: "", pulsarToken: "", providerTypeName: "" };
    }
    static startWizard(context, providerRegistry) {
        const wizard = new AddClusterConfigWizard(context, providerRegistry);
        wizard.showWizardStartPage();
    }
    showWizardStartPage() {
        this.showPage(this.chooseProviderTypePage());
    }
    async receivedMessage(message) {
        switch (message.command) {
            case MessageCommand.loaded:
                // no op
                break;
            case MessageCommand.setProviderType:
                const providerTypeName = message.text;
                this.tempCreds.providerTypeName = providerTypeName;
                const providerSettings = this.providerRegistry.getProvider(providerTypeName);
                this.providerWizard = new providerSettings.saveProviderWizard(this);
                this.showPage(this.providerWizard.startWizard());
                break;
            case MessageCommand.saveConfig:
                const clusterTenants = message.text;
                await this.saveConfig(clusterTenants);
                break;
            default:
                this.providerWizard?.receivedMessage(message);
                break;
        }
    }
    set webServiceUrl(webServiceUrl) {
        this.tempCreds.webServiceUrl = webServiceUrl;
    }
    set pulsarToken(pulsarToken) {
        this.tempCreds.pulsarToken = pulsarToken;
    }
    set configName(configName) {
        this.tempCreds.configName = configName;
    }
    async saveConfig(clusterTenants) {
        this.clusterConfigBuilder = new clusterConfigBuilder_1.ClusterConfigBuilder(this.tempCreds.providerTypeName, this.tempCreds.configName);
        if (!clusterTenants || clusterTenants.length === 0) {
            throw new Error('Choose at least one tenant');
        }
        const providerClass = require(`../pulsarAdminProviders/${this.tempCreds.providerTypeName}/provider`);
        const pulsarAdminProvider = new providerClass.Provider(this.tempCreds.webServiceUrl, this.tempCreds.pulsarToken);
        let currentClusterName = "";
        for (const clusterTenant of clusterTenants) {
            const nameSplit = clusterTenant.split(this.clusterTenantSeparator);
            if (nameSplit.length !== 2) {
                this.postError(MessageError.noTenantsSelected, new Error(`Could not parse cluster/tenant "${clusterTenant}".`));
                return;
            }
            const clusterName = nameSplit[0];
            const tenantName = nameSplit[1];
            if (currentClusterName !== clusterName) {
                currentClusterName = clusterName;
                try {
                    const clusterDetails = await pulsarAdminProvider.GetClusterDetails(clusterName);
                    let clusterVersion;
                    try {
                        clusterVersion = await pulsarAdminProvider.GetBrokerVersion();
                    }
                    catch {
                        clusterVersion = "";
                    }
                    const cluster = await this.clusterConfigBuilder.initCluster(clusterName, (clusterDetails.tlsAllowInsecureConnection ? clusterDetails.brokerServiceUrl : clusterDetails.brokerServiceUrlTls), this.tempCreds.webServiceUrl, clusterVersion);
                    this.clusterConfigBuilder.addCluster(cluster);
                }
                catch (err) {
                    this.postError(MessageError.couldNotSave, err);
                    return;
                }
            }
            try {
                this.clusterConfigBuilder.addTenant(clusterName, tenantName, pulsarAdminProvider, this.tempCreds.pulsarToken);
            }
            catch (err) {
                this.postError(MessageError.couldNotSave, err);
            }
        }
        //TODO: what if they all errored out?
        try {
            await this.clusterConfigBuilder.saveConfig();
        }
        catch (err) {
            this.postError(MessageError.couldNotSave, err);
            return;
        }
        this.dispose();
    }
    chooseProviderTypePage() {
        let providerTypesStr = "";
        this.providerRegistry.allProviderInfo.forEach((providerInfo) => {
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
__decorate([
    (0, traceDecorator_1.trace)('Save cluster config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AddClusterConfigWizard.prototype, "saveConfig", null);
__decorate([
    (0, traceDecorator_1.trace)('Start add cluster config wizard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pulsarAdminProviders_1.PulsarAdminProviders]),
    __metadata("design:returntype", void 0)
], AddClusterConfigWizard, "startWizard", null);
exports.AddClusterConfigWizard = AddClusterConfigWizard;
