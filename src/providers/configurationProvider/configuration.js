"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../../common/constants");
class ConfigurationProvider {
    static getConfigValue(configKey) {
        return vscode.workspace.getConfiguration(constants_1.EXTENSION_CONFIG_KEY)[configKey];
    }
    static async addPathToConfig(configKey, value) {
        await this.setConfigValue(configKey, value);
    }
    static async setConfigValue(configKey, value) {
        await this.atAllConfigScopes(this.addValueToConfigAtScope, configKey, value);
    }
    static async atAllConfigScopes(fn, configKey, value) {
        const config = vscode.workspace.getConfiguration().inspect(constants_1.EXTENSION_CONFIG_KEY);
        await fn(configKey, value, vscode.ConfigurationTarget.Global, config.globalValue, true);
        await fn(configKey, value, vscode.ConfigurationTarget.Workspace, config.workspaceValue, false);
        await fn(configKey, value, vscode.ConfigurationTarget.WorkspaceFolder, config.workspaceFolderValue, false);
    }
    static async addValueToConfigAtScope(configKey, value, scope, valueAtScope, createIfNotExist) {
        if (!createIfNotExist) {
            if (!valueAtScope || !(valueAtScope[configKey])) {
                return;
            }
        }
        let newValue = {};
        if (valueAtScope) {
            newValue = Object.assign({}, valueAtScope);
        }
        newValue[configKey] = value;
        await vscode.workspace.getConfiguration().update(constants_1.EXTENSION_CONFIG_KEY, newValue, scope);
    }
    static async addValueToConfigArray(configKey, value) {
        await this.atAllConfigScopes(this.addValueToConfigArrayAtScope, configKey, value);
    }
    static async removeValueFromConfigArray(configKey, removeIndex) {
        await this.atAllConfigScopes(this.removeValueFromConfigArrayAtScope, configKey, removeIndex);
    }
    static async addValueToConfigArrayAtScope(configKey, value, scope, valueAtScope, createIfNotExist) {
        if (!createIfNotExist) {
            if (!valueAtScope || !(valueAtScope[configKey])) {
                return;
            }
        }
        let newValue = {};
        if (valueAtScope) {
            newValue = Object.assign({}, valueAtScope);
        }
        const arrayEntry = newValue[configKey] || [];
        arrayEntry.push(value);
        newValue[configKey] = arrayEntry;
        await vscode.workspace.getConfiguration().update(constants_1.EXTENSION_CONFIG_KEY, newValue, scope);
    }
    static async removeValueFromConfigArrayAtScope(configKey, removeIndex, scope, valueAtScope, createIfNotExist) {
        if (!createIfNotExist) {
            if (!valueAtScope || !(valueAtScope[configKey])) {
                return;
            }
        }
        let newValue = {};
        if (valueAtScope) {
            newValue = Object.assign({}, valueAtScope);
        }
        const arrayEntry = newValue[configKey] || [];
        arrayEntry.splice(removeIndex, 1);
        newValue[configKey] = arrayEntry;
        await vscode.workspace.getConfiguration().update(constants_1.EXTENSION_CONFIG_KEY, newValue, scope);
    }
    static getClusterConfigs() {
        const savedConfigs = vscode.workspace.getConfiguration(constants_1.EXTENSION_CONFIG_KEY)[constants_1.CLUSTER_CONFIGS_KEY];
        return !savedConfigs || !savedConfigs.length ? [] : savedConfigs;
    }
    static async addClusterConfig(clusterConfiguration) {
        await this.addValueToConfigArray(constants_1.CLUSTER_CONFIGS_KEY, clusterConfiguration);
    }
    static async removeClusterConfig(clusterConfiguration) {
        const removeIdx = vscode.workspace.getConfiguration(constants_1.EXTENSION_CONFIG_KEY)[constants_1.CLUSTER_CONFIGS_KEY].findIndex((config) => {
            return config === clusterConfiguration;
        });
        await this.removeValueFromConfigArray(constants_1.CLUSTER_CONFIGS_KEY, removeIdx);
    }
    affectsUs(change) {
        return change.affectsConfiguration(constants_1.EXTENSION_CONFIG_KEY);
    }
}
exports.default = ConfigurationProvider;
