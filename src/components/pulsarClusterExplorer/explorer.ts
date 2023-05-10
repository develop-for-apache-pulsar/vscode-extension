import {IPulsarAdminProviderNode, PulsarAdminProviderNode, PulsarAdminProviderTree} from "./nodes/pulsarAdminProvider";
import {Host} from "../../utils/host";
import * as vscode from "vscode";
import {affectsUs} from "../config/config";
import {ClusterNode, ClusterTree, IClusterNode} from "./nodes/cluster";
import {ITenantNode, TenantNode, TenantTree} from "./nodes/tenant";
import {INamespaceNode, NamespaceNode, NamespaceTree} from "./nodes/namespace";
import {FolderNode} from "./nodes/folder";
import {ITopicNode, TopicNode, TopicTree} from "./nodes/topic";
import {ConnectorSourceNode, ConnectorSourceTree, IConnectorSourceNode} from "./nodes/connectorSource";
import {ConnectorSinkNode, ConnectorSinkTree, IConnectorSinkNode} from "./nodes/connectorSink";
import {FunctionNode, FunctionTree, IFunctionNode} from "./nodes/function";
import {FolderTypes, AllPulsarAdminExplorerNodeTypes} from "./nodes/types";
import {IMessageNode, MessageNode, MessageTree} from "./nodes/message";
import {ErrorNode, ErrorTree, IErrorNode} from "./nodes/error";
import {BuildPulsarAdminProviderConfigs} from "../pulsarAdminProvider/pulsarAdminProviders";
import {PulsarAdminProviders} from "../pulsarAdminProvider";

export class PulsarAdminExplorerTree implements vscode.TreeDataProvider<AllPulsarAdminExplorerNodeTypes> {
  private onDidChangeTreeDataEmitter: vscode.EventEmitter<AllPulsarAdminExplorerNodeTypes | undefined> = new vscode.EventEmitter<AllPulsarAdminExplorerNodeTypes | undefined>();
  readonly onDidChangeTreeData: vscode.Event<AllPulsarAdminExplorerNodeTypes | undefined> = this.onDidChangeTreeDataEmitter.event;

  public initialize() {
    const viewer = vscode.window.createTreeView('extension.vsPulsarClusterExplorer', {
      treeDataProvider: this,
      showCollapseAll: true
    });
    return vscode.Disposable.from(
      viewer,
      viewer.onDidCollapseElement(this.onElementCollapsed, this),
      viewer.onDidExpandElement(this.onElementExpanded, this)
    );
  }

  constructor(host: Host, private readonly providerRegistry: PulsarAdminProviders) {
    host.onDidChangeConfiguration((change) => {
      if (affectsUs(change)) {
        this.refresh();
      }
    });
  }

  public async getChildren(parent: AllPulsarAdminExplorerNodeTypes | undefined): Promise<AllPulsarAdminExplorerNodeTypes[]> {
    // If a parent is provided as this level of the tree, then we need to get the children
    if (parent !== undefined) {
      switch (parent.constructor.name) {
        case PulsarAdminProviderNode.name:
          const provider = parent as PulsarAdminProviderNode;
          return new ClusterTree().getChildren(provider);
        case ClusterNode.name:
          const cluster = parent as ClusterNode;
          return new TenantTree().getChildren(cluster);
        case TenantNode.name:
          const tenant = parent as TenantNode;
          return new NamespaceTree().getChildren(tenant);
        case NamespaceNode.name:
          const namespace = parent as NamespaceNode;
          // Build a tree of all the namespaced objects
          return [
            new FolderNode(namespace.pulsarAdmin, 'Topics', FolderTypes.topicFolder, namespace.tenantName, namespace.label),
            new FolderNode(namespace.pulsarAdmin, 'Connectors', FolderTypes.connectorFolder, namespace.tenantName, namespace.label),
            new FolderNode(namespace.pulsarAdmin, 'Functions', FolderTypes.functionFolder, namespace.tenantName, namespace.label),
          ];
        case FolderNode.name:
          const topicFolder = parent as FolderNode;
          switch (topicFolder.folderType) {
            case FolderTypes.topicFolder:
              const topicFolder = parent as FolderNode;
              return new TopicTree(topicFolder.pulsarAdmin).getChildren(topicFolder.tenantName, topicFolder.namespace);
            case FolderTypes.connectorFolder:
              const connectorFolder = parent as FolderNode;
              return [
                new FolderNode(connectorFolder.pulsarAdmin, 'Sources', FolderTypes.sourceFolder, connectorFolder.tenantName, connectorFolder.namespace),
                new FolderNode(connectorFolder.pulsarAdmin, 'Sinks', FolderTypes.sinkFolder, connectorFolder.tenantName, connectorFolder.namespace),
              ];
            case FolderTypes.sourceFolder:
              const sourceFolder = parent as FolderNode;
              return new ConnectorSourceTree(sourceFolder.pulsarAdmin).getChildren(sourceFolder.tenantName, sourceFolder.namespace);
            case FolderTypes.sinkFolder:
              const sinkFolder = parent as FolderNode;
              return new ConnectorSinkTree(sinkFolder.pulsarAdmin).getChildren(sinkFolder.tenantName, sinkFolder.namespace);
            case FolderTypes.functionFolder:
              const functionFolder = parent as FolderNode;
              return new FunctionTree(functionFolder.pulsarAdmin).getChildren(functionFolder.tenantName, functionFolder.namespace);
          }
      }

      return []; // the parent type is unknown
    }

    // Otherwise if there is no parent, then we need to get the saved configs
    const pulsarAdminProviderConfigs = await BuildPulsarAdminProviderConfigs(this.providerRegistry);
    return new PulsarAdminProviderTree().getChildren(pulsarAdminProviderConfigs);
  }

  public getTreeItem(element: AllPulsarAdminExplorerNodeTypes): vscode.TreeItem | Thenable<vscode.TreeItem> {
    switch (element.constructor.name) {
      case PulsarAdminProviderNode.name:
        return PulsarAdminProviderTree.getTreeItem(element as IPulsarAdminProviderNode);
      case ClusterNode.name:
        return ClusterTree.getTreeItem(element as IClusterNode);
      case TenantNode.name:
        return TenantTree.getTreeItem(element as ITenantNode);
      case NamespaceNode.name:
        return NamespaceTree.getTreeItem(element as INamespaceNode);
      case TopicNode.name:
        return TopicTree.getTreeItem(element as ITopicNode);
      case ConnectorSourceNode.name:
        return ConnectorSourceTree.getTreeItem(element as IConnectorSourceNode);
      case ConnectorSinkNode.name:
        return ConnectorSinkTree.getTreeItem(element as IConnectorSinkNode);
      case FunctionNode.name:
        return FunctionTree.getTreeItem(element as IFunctionNode);
      case MessageNode.name:
        return MessageTree.getTreeItem(element as IMessageNode);
      case ErrorNode.name:
        return ErrorTree.getTreeItem(element as IErrorNode);
      case FolderNode.name:
        return new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.Collapsed);
      default:
        return new vscode.TreeItem("unknown element", vscode.TreeItemCollapsibleState.Collapsed);
    }
  }

  public refresh(node?: any): void {
    this.onDidChangeTreeDataEmitter.fire(node);
  }

  private onElementCollapsed(e: vscode.TreeViewExpansionEvent<AllPulsarAdminExplorerNodeTypes>) {
    this.collapse(e.element);
  }

  private onElementExpanded(e: vscode.TreeViewExpansionEvent<AllPulsarAdminExplorerNodeTypes>) {
    this.expand(e.element);
  }

  private expand(node: AllPulsarAdminExplorerNodeTypes) {
    //no op
  }

  private collapse(node: AllPulsarAdminExplorerNodeTypes) {
    //no op
  }
}
