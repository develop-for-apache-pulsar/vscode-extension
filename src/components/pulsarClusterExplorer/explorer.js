"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PulsarAdminExplorerTree = void 0;
const pulsarAdminProvider_1 = require("./nodes/pulsarAdminProvider");
const vscode = require("vscode");
const config_1 = require("../config/config");
const cluster_1 = require("./nodes/cluster");
const tenant_1 = require("./nodes/tenant");
const namespace_1 = require("./nodes/namespace");
const folder_1 = require("./nodes/folder");
const topic_1 = require("./nodes/topic");
const connectorSource_1 = require("./nodes/connectorSource");
const connectorSink_1 = require("./nodes/connectorSink");
const function_1 = require("./nodes/function");
const types_1 = require("./nodes/types");
const message_1 = require("./nodes/message");
const error_1 = require("./nodes/error");
const pulsarAdminProviders_1 = require("../pulsarAdminProvider/pulsarAdminProviders");
class PulsarAdminExplorerTree {
    initialize() {
        const viewer = vscode.window.createTreeView('extension.vsPulsarClusterExplorer', {
            treeDataProvider: this,
            showCollapseAll: true
        });
        return vscode.Disposable.from(viewer, viewer.onDidCollapseElement(this.onElementCollapsed, this), viewer.onDidExpandElement(this.onElementExpanded, this));
    }
    constructor(host, providerRegistry) {
        this.providerRegistry = providerRegistry;
        this.onDidChangeTreeDataEmitter = new vscode.EventEmitter();
        this.onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
        host.onDidChangeConfiguration((change) => {
            if ((0, config_1.affectsUs)(change)) {
                this.refresh();
            }
        });
    }
    async getChildren(parent) {
        // If a parent is provided as this level of the tree, then we need to get the children
        if (parent !== undefined) {
            switch (parent.constructor.name) {
                case pulsarAdminProvider_1.PulsarAdminProviderNode.name:
                    const provider = parent;
                    return new cluster_1.ClusterTree().getChildren(provider);
                case cluster_1.ClusterNode.name:
                    const cluster = parent;
                    return new tenant_1.TenantTree().getChildren(cluster);
                case tenant_1.TenantNode.name:
                    const tenant = parent;
                    return new namespace_1.NamespaceTree().getChildren(tenant);
                case namespace_1.NamespaceNode.name:
                    const namespace = parent;
                    // Build a tree of all the namespaced objects
                    return [
                        new folder_1.FolderNode(namespace.pulsarAdmin, 'Topics', types_1.FolderTypes.topicFolder, namespace.tenantName, namespace.label),
                        new folder_1.FolderNode(namespace.pulsarAdmin, 'Connectors', types_1.FolderTypes.connectorFolder, namespace.tenantName, namespace.label),
                        new folder_1.FolderNode(namespace.pulsarAdmin, 'Functions', types_1.FolderTypes.functionFolder, namespace.tenantName, namespace.label),
                    ];
                case folder_1.FolderNode.name:
                    const topicFolder = parent;
                    switch (topicFolder.folderType) {
                        case types_1.FolderTypes.topicFolder:
                            const topicFolder = parent;
                            return new topic_1.TopicTree(topicFolder.pulsarAdmin).getChildren(topicFolder.tenantName, topicFolder.namespace);
                        case types_1.FolderTypes.connectorFolder:
                            const connectorFolder = parent;
                            return [
                                new folder_1.FolderNode(connectorFolder.pulsarAdmin, 'Sources', types_1.FolderTypes.sourceFolder, connectorFolder.tenantName, connectorFolder.namespace),
                                new folder_1.FolderNode(connectorFolder.pulsarAdmin, 'Sinks', types_1.FolderTypes.sinkFolder, connectorFolder.tenantName, connectorFolder.namespace),
                            ];
                        case types_1.FolderTypes.sourceFolder:
                            const sourceFolder = parent;
                            return new connectorSource_1.ConnectorSourceTree(sourceFolder.pulsarAdmin).getChildren(sourceFolder.tenantName, sourceFolder.namespace);
                        case types_1.FolderTypes.sinkFolder:
                            const sinkFolder = parent;
                            return new connectorSink_1.ConnectorSinkTree(sinkFolder.pulsarAdmin).getChildren(sinkFolder.tenantName, sinkFolder.namespace);
                        case types_1.FolderTypes.functionFolder:
                            const functionFolder = parent;
                            return new function_1.FunctionTree(functionFolder.pulsarAdmin).getChildren(functionFolder.tenantName, functionFolder.namespace);
                    }
            }
            return []; // the parent type is unknown
        }
        // Otherwise if there is no parent, then we need to get the saved configs
        const pulsarAdminProviderConfigs = await (0, pulsarAdminProviders_1.BuildPulsarAdminProviderConfigs)(this.providerRegistry);
        return new pulsarAdminProvider_1.PulsarAdminProviderTree().getChildren(pulsarAdminProviderConfigs);
    }
    getTreeItem(element) {
        switch (element.constructor.name) {
            case pulsarAdminProvider_1.PulsarAdminProviderNode.name:
                return pulsarAdminProvider_1.PulsarAdminProviderTree.getTreeItem(element);
            case cluster_1.ClusterNode.name:
                return cluster_1.ClusterTree.getTreeItem(element);
            case tenant_1.TenantNode.name:
                return tenant_1.TenantTree.getTreeItem(element);
            case namespace_1.NamespaceNode.name:
                return namespace_1.NamespaceTree.getTreeItem(element);
            case topic_1.TopicNode.name:
                return topic_1.TopicTree.getTreeItem(element);
            case connectorSource_1.ConnectorSourceNode.name:
                return connectorSource_1.ConnectorSourceTree.getTreeItem(element);
            case connectorSink_1.ConnectorSinkNode.name:
                return connectorSink_1.ConnectorSinkTree.getTreeItem(element);
            case function_1.FunctionNode.name:
                return function_1.FunctionTree.getTreeItem(element);
            case message_1.MessageNode.name:
                return message_1.MessageTree.getTreeItem(element);
            case error_1.ErrorNode.name:
                return error_1.ErrorTree.getTreeItem(element);
            case folder_1.FolderNode.name:
                return new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.Collapsed);
            default:
                return new vscode.TreeItem("unknown element", vscode.TreeItemCollapsibleState.Collapsed);
        }
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
exports.PulsarAdminExplorerTree = PulsarAdminExplorerTree;
//# sourceMappingURL=explorer.js.map