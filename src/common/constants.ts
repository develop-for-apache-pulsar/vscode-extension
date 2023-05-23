// TELEMETRY
export const TELEM_KEY: string = 'd398a2a9-a129-4d5d-b6e9-3a47d5a146a1';

// CONFIG
export const EXTENSION_CONFIG_KEY = "vs-delevopforpulsar";
export const PROVIDER_CONFIGS_KEY = "providerConfigs";

// COMMANDS
export const COMMAND_REFRESH_EXPLORER = 'extension.vsDevelopPulsarRefreshExplorer';
export const COMMAND_ADD_CLUSTER_CONFIG = 'extension.vsDevelopPulsarAddClusterConfig';
export const COMMAND_REMOVE_CLUSTER_CONFIG = 'extension.vsDevelopPulsarRemoveClusterConfig';

// PROVIDERS
export const PROVIDER_CLUSTER_TREE = 'extension.vsPulsarClusterExplorer';
export const CONTEXT_VALUES = {
  error: 'vsDevelopPulsar.error',
  message: 'vsDevelopPulsar.message',
  provider: 'vsDevelopPulsar.provider',
  cluster: 'vsDevelopPulsar.cluster',
  tenant: 'vsDevelopPulsar.tenant',
  namespace: 'vsDevelopPulsar.namespace',
  topicFolder: 'vsDevelopPulsar.topicFolder',
  topic: 'vsDevelopPulsar.topic',
  connectorFolder: 'vsDevelopPulsar.connectorFolder',
  sourceFolder: 'vsDevelopPulsar.sourceFolder',
  sinkFolder: 'vsDevelopPulsar.sinkFolder',
  functionFolder: 'vsDevelopPulsar.functionFolder',
  schemaFolder: 'vsDevelopPulsar.schemaFolder',
  source: 'vsDevelopPulsar.source',
  sink: 'vsDevelopPulsar.sink',
  function: 'vsDevelopPulsar.function',
  folder: 'vsDevelopPulsar.folder',
};

export enum ExplorerMessageTypes {
  noTenants,
  noClusters,
  noNamespaces,
  noTopics,
  noConnectorSinks,
  noConnectorSources,
  noFunctions,
  customMessage,
}

export enum ExplorerFolderTypes {
  topicFolder,
  connectorFolder,
  sourceFolder,
  sinkFolder,
  functionFolder,
}