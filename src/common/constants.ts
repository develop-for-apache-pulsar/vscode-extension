// TELEMETRY
export const TELEM_KEY: string = 'd398a2a9-a129-4d5d-b6e9-3a47d5a146a1';

// CONFIG
export const EXTENSION_CONFIG_KEY = "vs-delevopforpulsar";
export const PROVIDER_CONFIGS_KEY = "providerConfigs";

// LANGUAGE
export const LANGUAGE_NAME: string = 'pulsar';
export const LANGUAGE_SCHEME: string = 'vs-pulsar';

// COMMANDS
export const COMMAND_REFRESH_EXPLORER = 'extension.vsDevelopPulsarRefreshExplorer';
export const COMMAND_ADD_CLUSTER_CONFIG = 'extension.vsDevelopPulsarAddClusterConfig';
export const COMMAND_REMOVE_CLUSTER_CONFIG = 'extension.vsDevelopPulsarRemoveClusterConfig';
export const COMMAND_WATCH_TOPIC_MESSAGES = 'extension.vsDevelopPulsarWatchTopicMessages';
export const COMMAND_CREATE_TOPIC = 'extension.vsDevelopPulsarCreateTopic';
export const COMMAND_CREATE_FUNCTION = 'extension.vsDevelopPulsarCreateFunction';
export const COMMAND_SHOW_TOPIC_SCHEMA = 'extension.vsDevelopPulsarShowTopicSchema';
export const COMMAND_TOPIC_STATISTICS = 'extension.vsDevelopPulsarTopicStatistics';
export const COMMAND_TOPIC_PROPERTIES = 'extension.vsDevelopPulsarTopicProperties';
export const COMMAND_TOPIC_COPY_ADDRESS = 'extension.vsDevelopPulsarTopicCopyAddress';
export const COMMAND_DELETE_TOPIC = 'extension.vsDevelopPulsarDeleteTopic';
export const COMMAND_STOP_FUNCTION = 'extension.vsDevelopPulsarStopFunction';
export const COMMAND_RESTART_FUNCTION = 'extension.vsDevelopPulsarRestartFunction';
export const COMMAND_START_FUNCTION = 'extension.vsDevelopPulsarStartFunction';
export const COMMAND_FUNCTION_STATISTICS = 'extension.vsDevelopPulsarFunctionStatistics';
export const COMMAND_FUNCTION_STATUS = 'extension.vsDevelopPulsarFunctionStatus';
export const COMMAND_FUNCTION_INFO = 'extension.vsDevelopPulsarFunctionInfo';
export const COMMAND_FUNCTION_DELETE = 'extension.vsDevelopPulsarFunctionDelete';
export const COMMAND_FUNCTION_WATCH_TOPICS = 'extension.vsDevelopPulsarWatchFunctionTopics';
export const COMMAND_DEPLOY_FUNCTION = 'extension.vsDevelopPulsarDeployFunction';
export const COMMAND_STOP_FUNCTION_INSTANCE = 'extension.vsDevelopPulsarStopFunctionInstance';
export const COMMAND_RESTART_FUNCTION_INSTANCE = 'extension.vsDevelopPulsarRestartFunctionInstance';
export const COMMAND_START_FUNCTION_INSTANCE = 'extension.vsDevelopPulsarStartFunctionInstance';
export const COMMAND_FUNCTION_PACKAGE_CHOOSER = 'extension.vsDevelopPulsarFunctionPackageChooser';

// PROVIDERS
export const PROVIDER_CLUSTER_TREE = 'extension.vsPulsarClusterExplorer';
export const TOPIC_MESSAGE_CUSTOM_EDITOR_VIEW_TYPE = 'extension.topicMessageView';

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
  function: 'vsDevelopPulsar.function.function',
  folder: 'vsDevelopPulsar.folder',
  functionInstance: 'vsDevelopPulsar.function.instance',
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
  noFunctionInstances,
}

export enum ExplorerFolderTypes {
  topicFolder,
  connectorFolder,
  sourceFolder,
  sinkFolder,
  functionFolder,
}