import * as vscode from 'vscode';
import { TSavedProviderConfig } from "../../types/TSavedProviderConfig";

const EXTENSION_CONFIG_KEY = "vs-pulsaradmin";
const CLUSTER_CONFIGS_KEY = "vs-pulsaradmin.clusterConfigs";

export async function addPathToConfig(configKey: string, value: string): Promise<void> {
    await setConfigValue(configKey, value);
}

export async function setConfigValue(configKey: string, value: any): Promise<void> {
    await atAllConfigScopes(addValueToConfigAtScope, configKey, value);
}

async function addValueToConfigAtScope(configKey: string, value: any, scope: vscode.ConfigurationTarget, valueAtScope: any, createIfNotExist: boolean): Promise<void> {
    if (!createIfNotExist) {
        if (!valueAtScope || !(valueAtScope[configKey])) {
            return;
        }
    }

    let newValue: any = {};
    if (valueAtScope) {
        newValue = Object.assign({}, valueAtScope);
    }
    newValue[configKey] = value;
    await vscode.workspace.getConfiguration().update(EXTENSION_CONFIG_KEY, newValue, scope);
}
async function addValueToConfigArray(configKey: string, value: any): Promise<void> {
    await atAllConfigScopes(addValueToConfigArrayAtScope, configKey, value);
}

async function removeValueFromConfigArray(configKey: string, removeIndex: number): Promise<void> {
  await atAllConfigScopes(removeValueFromConfigArrayAtScope, configKey, removeIndex);
}

async function addValueToConfigArrayAtScope(configKey: string, value: any, scope: vscode.ConfigurationTarget, valueAtScope: any, createIfNotExist: boolean): Promise<void> {
    if (!createIfNotExist) {
        if (!valueAtScope || !(valueAtScope[configKey])) {
            return;
        }
    }

    let newValue: any = {};
    if (valueAtScope) {
        newValue = Object.assign({}, valueAtScope);
    }
    const arrayEntry: string[] = newValue[configKey] || [];
    arrayEntry.push(value);
    newValue[configKey] = arrayEntry;
    await vscode.workspace.getConfiguration().update(EXTENSION_CONFIG_KEY, newValue, scope);
}

async function removeValueFromConfigArrayAtScope(configKey: string, removeIndex: number, scope: vscode.ConfigurationTarget, valueAtScope: any, createIfNotExist: boolean): Promise<void> {
  if (!createIfNotExist) {
    if (!valueAtScope || !(valueAtScope[configKey])) {
      return;
    }
  }

  let newValue: any = {};
  if (valueAtScope) {
    newValue = Object.assign({}, valueAtScope);
  }
  const arrayEntry: string[] = newValue[configKey] || [];
  arrayEntry.splice(removeIndex, 1);
  newValue[configKey] = arrayEntry;
  await vscode.workspace.getConfiguration().update(EXTENSION_CONFIG_KEY, newValue, scope);
}

type ConfigUpdater<T> = (configKey: string, value: T, scope: vscode.ConfigurationTarget, valueAtScope: any, createIfNotExist: boolean) => Promise<void>;

async function atAllConfigScopes<T>(fn: ConfigUpdater<T>, configKey: string, value: T): Promise<void> {
    const config = vscode.workspace.getConfiguration().inspect(EXTENSION_CONFIG_KEY)!;
    await fn(configKey, value, vscode.ConfigurationTarget.Global, config.globalValue, true);
    await fn(configKey, value, vscode.ConfigurationTarget.Workspace, config.workspaceValue, false);
    await fn(configKey, value, vscode.ConfigurationTarget.WorkspaceFolder, config.workspaceFolderValue, false);
}

// Functions for working with the list of known cluster configs

export function getClusterConfigs(): TSavedProviderConfig[] {
  const savedConfigs = vscode.workspace.getConfiguration(EXTENSION_CONFIG_KEY)[CLUSTER_CONFIGS_KEY];
  return !savedConfigs || !savedConfigs.length ? [] : savedConfigs as TSavedProviderConfig[];
}

export async function addClusterConfig(clusterConfiguration: TSavedProviderConfig) {
    await addValueToConfigArray(CLUSTER_CONFIGS_KEY, clusterConfiguration);
}

export async function removeClusterConfig(clusterConfiguration: TSavedProviderConfig) {
  const removeIdx = vscode.workspace.getConfiguration(EXTENSION_CONFIG_KEY)[CLUSTER_CONFIGS_KEY].findIndex((config: TSavedProviderConfig) => {
    return config === clusterConfiguration;
  });

  await removeValueFromConfigArray(CLUSTER_CONFIGS_KEY, removeIdx);
}

export function affectsUs(change: vscode.ConfigurationChangeEvent) {
  return change.affectsConfiguration(EXTENSION_CONFIG_KEY);
}