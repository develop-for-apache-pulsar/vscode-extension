"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PulsarAdminConfigCommands = void 0;
const addClusterConfig_1 = require("../wizards/addClusterConfig");
const config_1 = require("../config/config");
const general_1 = require("./general");
class PulsarAdminConfigCommands {
    static async showAddClusterConfigWizard(needsActivationDebouncing = true, context, providerRegistry) {
        await general_1.PulsarAdminCommandUtils.debounceActivation(needsActivationDebouncing);
        await addClusterConfig_1.AddClusterConfigWizard.startWizard(context, providerRegistry);
    }
    static async removeSavedConfig(host, pulsarAdminProviderNode, context) {
        const configs = (0, config_1.getClusterConfigs)();
        const config = configs.find((value) => value.providerId === pulsarAdminProviderNode.providerConfig.config.providerId);
        if (config === undefined) {
            host.showErrorMessage(`Could not find config for ${pulsarAdminProviderNode.providerConfig.config.name}`);
            return;
        }
        await (0, config_1.removeClusterConfig)(config);
    }
}
exports.PulsarAdminConfigCommands = PulsarAdminConfigCommands;
//# sourceMappingURL=config.js.map