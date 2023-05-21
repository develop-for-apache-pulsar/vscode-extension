"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PulsarClusterTreeDataProvider = void 0;
const pulsarAdminProvider_1 = require("./nodes/pulsarAdminProvider");
const vscode = require("vscode");
const cluster_1 = require("./nodes/cluster");
const tenant_1 = require("./nodes/tenant");
const namespace_1 = require("./nodes/namespace");
const folder_1 = require("./nodes/folder");
const topic_1 = require("./nodes/topic");
const connectorSource_1 = require("./nodes/connectorSource");
const connectorSink_1 = require("./nodes/connectorSink");
const function_1 = require("./nodes/function");
const pulsarAdminProviders_1 = require("../../pulsarAdminProviders/pulsarAdminProviders");
const constants_1 = require("../../common/constants");
class PulsarClusterTreeDataProvider {
    initialize() {
        const viewer = vscode.window.createTreeView(constants_1.PROVIDER_CLUSTER_TREE, {
            treeDataProvider: this,
            showCollapseAll: true
        });
        return vscode.Disposable.from(viewer, viewer.onDidCollapseElement(this.onElementCollapsed, this), viewer.onDidExpandElement(this.onElementExpanded, this));
    }
    constructor(providerRegistry, context) {
        this.providerRegistry = providerRegistry;
        this.context = context;
        this.onDidChangeTreeDataEmitter = new vscode.EventEmitter();
        this.onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
    }
    async getChildren(parent) {
        if (parent === undefined) {
            const pulsarAdminProviderConfigs = await (0, pulsarAdminProviders_1.BuildPulsarAdminProviderConfigs)(this.providerRegistry);
            return new pulsarAdminProvider_1.PulsarAdminProviderTree(this.context).getChildren(pulsarAdminProviderConfigs);
        }
        switch (parent.contextValue) {
            case constants_1.CONTEXT_VALUES.provider:
                const provider = parent;
                return new cluster_1.ClusterTree().getChildren(provider);
            case constants_1.CONTEXT_VALUES.cluster:
                const cluster = parent;
                return new tenant_1.TenantTree().getChildren(cluster);
            case constants_1.CONTEXT_VALUES.tenant:
                const tenant = parent;
                return new namespace_1.NamespaceTree().getChildren(tenant);
            case constants_1.CONTEXT_VALUES.namespace:
                const namespace = parent;
                // Build a tree of all the namespaced objects
                return [
                    new folder_1.FolderNode(namespace.pulsarAdmin, 'Topics', constants_1.ExplorerFolderTypes.topicFolder, namespace.tenantName, namespace.label),
                    new folder_1.FolderNode(namespace.pulsarAdmin, 'Connectors', constants_1.ExplorerFolderTypes.connectorFolder, namespace.tenantName, namespace.label),
                    new folder_1.FolderNode(namespace.pulsarAdmin, 'Functions', constants_1.ExplorerFolderTypes.functionFolder, namespace.tenantName, namespace.label),
                ];
            case constants_1.CONTEXT_VALUES.folder:
                const folderNode = parent;
                switch (folderNode.folderType) {
                    case constants_1.ExplorerFolderTypes.topicFolder:
                        return new topic_1.TopicTree(folderNode.pulsarAdmin).getChildren(folderNode.tenantName, folderNode.namespace);
                    case constants_1.ExplorerFolderTypes.connectorFolder:
                        return [
                            new folder_1.FolderNode(folderNode.pulsarAdmin, 'Sources', constants_1.ExplorerFolderTypes.sourceFolder, folderNode.tenantName, folderNode.namespace),
                            new folder_1.FolderNode(folderNode.pulsarAdmin, 'Sinks', constants_1.ExplorerFolderTypes.sinkFolder, folderNode.tenantName, folderNode.namespace),
                        ];
                    case constants_1.ExplorerFolderTypes.sourceFolder:
                        return new connectorSource_1.ConnectorSourceTree(folderNode.pulsarAdmin).getChildren(folderNode.tenantName, folderNode.namespace);
                    case constants_1.ExplorerFolderTypes.sinkFolder:
                        return new connectorSink_1.ConnectorSinkTree(folderNode.pulsarAdmin).getChildren(folderNode.tenantName, folderNode.namespace);
                    case constants_1.ExplorerFolderTypes.functionFolder:
                        return new function_1.FunctionTree(folderNode.pulsarAdmin).getChildren(folderNode.tenantName, folderNode.namespace);
                }
        }
        return []; // the parent type is unknown
    }
    getTreeItem(element) {
        return element;
    }
    refresh(node) {
        this.onDidChangeTreeDataEmitter.fire(node);
    }
    onElementCollapsed(e) {
        this.collapse(e.element);
    }
    onElementExpanded(e) {
        this.expand(e.element);
    }
    expand(node) {
        //no op
    }
    collapse(node) {
        //no op
    }
}
exports.PulsarClusterTreeDataProvider = PulsarClusterTreeDataProvider;
