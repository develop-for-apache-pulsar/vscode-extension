"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplorerFolderTypes = exports.ExplorerMessageTypes = exports.CONTEXT_VALUES = exports.PROVIDER_CLUSTER_TREE = exports.COMMAND_REMOVE_CLUSTER_CONFIG = exports.COMMAND_ADD_CLUSTER_CONFIG = exports.COMMAND_REFRESH_EXPLORER = exports.CLUSTER_CONFIGS_KEY = exports.EXTENSION_CONFIG_KEY = exports.TELEM_KEY = void 0;
// TELEMETRY
exports.TELEM_KEY = 'd398a2a9-a129-4d5d-b6e9-3a47d5a146a1';
// CONFIG
exports.EXTENSION_CONFIG_KEY = "vs-delevopforpulsar";
exports.CLUSTER_CONFIGS_KEY = "vs-delevopforpulsar.clusterConfigs";
// COMMANDS
exports.COMMAND_REFRESH_EXPLORER = 'extension.vsDevelopPulsarRefreshExplorer';
exports.COMMAND_ADD_CLUSTER_CONFIG = 'extension.vsDevelopPulsarAddClusterConfig';
exports.COMMAND_REMOVE_CLUSTER_CONFIG = 'extension.vsDevelopPulsarRemoveClusterConfig';
// PROVIDERS
exports.PROVIDER_CLUSTER_TREE = 'extension.vsPulsarClusterExplorer';
exports.CONTEXT_VALUES = {
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
var ExplorerMessageTypes;
(function (ExplorerMessageTypes) {
    ExplorerMessageTypes[ExplorerMessageTypes["noTenants"] = 0] = "noTenants";
    ExplorerMessageTypes[ExplorerMessageTypes["noClusters"] = 1] = "noClusters";
    ExplorerMessageTypes[ExplorerMessageTypes["noNamespaces"] = 2] = "noNamespaces";
    ExplorerMessageTypes[ExplorerMessageTypes["noTopics"] = 3] = "noTopics";
    ExplorerMessageTypes[ExplorerMessageTypes["noConnectorSinks"] = 4] = "noConnectorSinks";
    ExplorerMessageTypes[ExplorerMessageTypes["noConnectorSources"] = 5] = "noConnectorSources";
    ExplorerMessageTypes[ExplorerMessageTypes["noFunctions"] = 6] = "noFunctions";
    ExplorerMessageTypes[ExplorerMessageTypes["customMessage"] = 7] = "customMessage";
})(ExplorerMessageTypes = exports.ExplorerMessageTypes || (exports.ExplorerMessageTypes = {}));
var ExplorerFolderTypes;
(function (ExplorerFolderTypes) {
    ExplorerFolderTypes[ExplorerFolderTypes["topicFolder"] = 0] = "topicFolder";
    ExplorerFolderTypes[ExplorerFolderTypes["connectorFolder"] = 1] = "connectorFolder";
    ExplorerFolderTypes[ExplorerFolderTypes["sourceFolder"] = 2] = "sourceFolder";
    ExplorerFolderTypes[ExplorerFolderTypes["sinkFolder"] = 3] = "sinkFolder";
    ExplorerFolderTypes[ExplorerFolderTypes["functionFolder"] = 4] = "functionFolder";
})(ExplorerFolderTypes = exports.ExplorerFolderTypes || (exports.ExplorerFolderTypes = {}));
