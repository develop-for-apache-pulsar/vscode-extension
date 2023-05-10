"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTEXT_VALUES = exports.FolderTypes = exports.MessageTypes = void 0;
var MessageTypes;
(function (MessageTypes) {
    MessageTypes[MessageTypes["noTenants"] = 0] = "noTenants";
    MessageTypes[MessageTypes["noClusters"] = 1] = "noClusters";
    MessageTypes[MessageTypes["noNamespaces"] = 2] = "noNamespaces";
    MessageTypes[MessageTypes["noTopics"] = 3] = "noTopics";
    MessageTypes[MessageTypes["noConnectorSinks"] = 4] = "noConnectorSinks";
    MessageTypes[MessageTypes["noConnectorSources"] = 5] = "noConnectorSources";
    MessageTypes[MessageTypes["noFunctions"] = 6] = "noFunctions";
    MessageTypes[MessageTypes["customMessage"] = 7] = "customMessage";
})(MessageTypes = exports.MessageTypes || (exports.MessageTypes = {}));
var FolderTypes;
(function (FolderTypes) {
    FolderTypes[FolderTypes["topicFolder"] = 0] = "topicFolder";
    FolderTypes[FolderTypes["connectorFolder"] = 1] = "connectorFolder";
    FolderTypes[FolderTypes["sourceFolder"] = 2] = "sourceFolder";
    FolderTypes[FolderTypes["sinkFolder"] = 3] = "sinkFolder";
    FolderTypes[FolderTypes["functionFolder"] = 4] = "functionFolder";
})(FolderTypes = exports.FolderTypes || (exports.FolderTypes = {}));
exports.CONTEXT_VALUES = {
    error: 'vsPulsarAdmin.error',
    message: 'vsPulsarAdmin.message',
    provider: 'vsPulsarAdmin.provider',
    cluster: 'vsPulsarAdmin.cluster',
    tenant: 'vsPulsarAdmin.tenant',
    namespace: 'vsPulsarAdmin.namespace',
    topicFolder: 'vsPulsarAdmin.topicFolder',
    topic: 'vsPulsarAdmin.topic',
    connectorFolder: 'vsPulsarAdmin.connectorFolder',
    sourceFolder: 'vsPulsarAdmin.sourceFolder',
    sinkFolder: 'vsPulsarAdmin.sinkFolder',
    functionFolder: 'vsPulsarAdmin.functionFolder',
    schemaFolder: 'vsPulsarAdmin.schemaFolder',
    source: 'vsPulsarAdmin.source',
    sink: 'vsPulsarAdmin.sink',
    function: 'vsPulsarAdmin.function',
};
//# sourceMappingURL=types.js.map