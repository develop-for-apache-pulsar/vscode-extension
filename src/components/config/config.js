"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.affectsUs = exports.removeClusterConfig = exports.addClusterConfig = exports.getClusterConfigs = exports.setConfigValue = exports.addPathToConfig = void 0;
const vscode = require("vscode");
const EXTENSION_CONFIG_KEY = "vs-pulsaradmin";
const CLUSTER_CONFIGS_KEY = "vs-pulsaradmin.clusterConfigs";
async function addPathToConfig(configKey, value) {
    await setConfigValue(configKey, value);
}
exports.addPathToConfig = addPathToConfig;
async function setConfigValue(configKey, value) {
    await atAllConfigScopes(addValueToConfigAtScope, configKey, value);
}
exports.setConfigValue = setConfigValue;
async function addValueToConfigAtScope(configKey, value, scope, valueAtScope, createIfNotExist) {
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
    await vscode.workspace.getConfiguration().update(EXTENSION_CONFIG_KEY, newValue, scope);
}
async function addValueToConfigArray(configKey, value) {
    await atAllConfigScopes(addValueToConfigArrayAtScope, configKey, value);
}
async function removeValueFromConfigArray(configKey, removeIndex) {
    await atAllConfigScopes(removeValueFromConfigArrayAtScope, configKey, removeIndex);
}
async function addValueToConfigArrayAtScope(configKey, value, scope, valueAtScope, createIfNotExist) {
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
    await vscode.workspace.getConfiguration().update(EXTENSION_CONFIG_KEY, newValue, scope);
}
async function removeValueFromConfigArrayAtScope(configKey, removeIndex, scope, valueAtScope, createIfNotExist) {
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
    await vscode.workspace.getConfiguration().update(EXTENSION_CONFIG_KEY, newValue, scope);
}
async function atAllConfigScopes(fn, configKey, value) {
    const config = vscode.workspace.getConfiguration().inspect(EXTENSION_CONFIG_KEY);
    await fn(configKey, value, vscode.ConfigurationTarget.Global, config.globalValue, true);
    await fn(configKey, value, vscode.ConfigurationTarget.Workspace, config.workspaceValue, false);
    await fn(configKey, value, vscode.ConfigurationTarget.WorkspaceFolder, config.workspaceFolderValue, false);
}
// Functions for working with the list of known cluster configs
function getClusterConfigs() {
    const savedConfigs = vscode.workspace.getConfiguration(EXTENSION_CONFIG_KEY)[CLUSTER_CONFIGS_KEY];
    return !savedConfigs || !savedConfigs.length ? [] : savedConfigs;
}
exports.getClusterConfigs = getClusterConfigs;
async function addClusterConfig(clusterConfiguration) {
    await addValueToConfigArray(CLUSTER_CONFIGS_KEY, clusterConfiguration);
}
exports.addClusterConfig = addClusterConfig;
async function removeClusterConfig(clusterConfiguration) {
    const removeIdx = vscode.workspace.getConfiguration(EXTENSION_CONFIG_KEY)[CLUSTER_CONFIGS_KEY].findIndex((config) => {
        return config === clusterConfiguration;
    });
    await removeValueFromConfigArray(CLUSTER_CONFIGS_KEY, removeIdx);
}
exports.removeClusterConfig = removeClusterConfig;
function affectsUs(change) {
    return change.affectsConfiguration(EXTENSION_CONFIG_KEY);
}
exports.affectsUs = affectsUs;
//# sourceMappingURL=config.js.map