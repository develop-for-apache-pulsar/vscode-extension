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
exports.ConfigController = void 0;
const addClusterConfig_1 = require("../wizards/addClusterConfig");
const configuration_1 = require("../providers/configurationProvider//configuration");
const vscode = require("vscode");
const pulsarAdminProvider_1 = require("../providers/pulsarClusterTreeDataProvider/nodes/pulsarAdminProvider");
const pulsarAdminProviders_1 = require("../pulsarAdminProviders");
const traceDecorator_1 = require("../utils/traceDecorator");
class ConfigController {
    static async showAddClusterConfigWizard(providerRegistry) {
        const context = global.extensionContext;
        await addClusterConfig_1.AddClusterConfigWizard.startWizard(context, providerRegistry);
    }
    static async removeSavedConfig(pulsarAdminProviderNode) {
        const configs = configuration_1.default.getClusterConfigs();
        const config = configs.find((value) => value.providerId === pulsarAdminProviderNode.providerConfig.config.providerId);
        if (config === undefined) {
            vscode.window.showErrorMessage(`Could not find config for ${pulsarAdminProviderNode.providerConfig.config.name}`);
            return;
        }
        await configuration_1.default.removeClusterConfig(config);
    }
}
__decorate([
    (0, traceDecorator_1.trace)('Show Add Cluster Config Wizard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pulsarAdminProviders_1.PulsarAdminProviders]),
    __metadata("design:returntype", Promise)
], ConfigController, "showAddClusterConfigWizard", null);
__decorate([
    (0, traceDecorator_1.trace)('Remove Saved Config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pulsarAdminProvider_1.PulsarAdminProviderNode]),
    __metadata("design:returntype", Promise)
], ConfigController, "removeSavedConfig", null);
exports.ConfigController = ConfigController;
