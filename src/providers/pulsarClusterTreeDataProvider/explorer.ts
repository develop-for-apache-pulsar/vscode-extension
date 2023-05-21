import {IPulsarAdminProviderNode, PulsarAdminProviderTree} from "./nodes/pulsarAdminProvider";
import * as vscode from "vscode";
import {ClusterTree, IClusterNode} from "./nodes/cluster";
import {ITenantNode, TenantTree} from "./nodes/tenant";
import {INamespaceNode, NamespaceTree} from "./nodes/namespace";
import {FolderNode} from "./nodes/folder";
import {TopicTree} from "./nodes/topic";
import {ConnectorSourceTree} from "./nodes/connectorSource";
import {ConnectorSinkTree} from "./nodes/connectorSink";
import {FunctionTree} from "./nodes/function";
import {BuildPulsarAdminProviderConfigs} from "../../pulsarAdminProviders/pulsarAdminProviders";
import {PulsarAdminProviders} from "../../pulsarAdminProviders";
import {CONTEXT_VALUES, ExplorerFolderTypes, PROVIDER_CLUSTER_TREE} from "../../common/constants";
import {TAllPulsarAdminExplorerNodeTypes} from "../../types/tAllPulsarAdminExplorerNodeTypes";

export class PulsarClusterTreeDataProvider implements vscode.TreeDataProvider<TAllPulsarAdminExplorerNodeTypes> {
  private onDidChangeTreeDataEmitter: vscode.EventEmitter<TAllPulsarAdminExplorerNodeTypes | undefined> = new vscode.EventEmitter<TAllPulsarAdminExplorerNodeTypes | undefined>();
  readonly onDidChangeTreeData: vscode.Event<TAllPulsarAdminExplorerNodeTypes | undefined> = this.onDidChangeTreeDataEmitter.event;

  public initialize() {
    const viewer = vscode.window.createTreeView(PROVIDER_CLUSTER_TREE, {
      treeDataProvider: this,
      showCollapseAll: true
    });
    return vscode.Disposable.from(
      viewer,
      viewer.onDidCollapseElement(this.onElementCollapsed, this),
      viewer.onDidExpandElement(this.onElementExpanded, this)
    );
  }

  constructor(private readonly providerRegistry: PulsarAdminProviders, private readonly context: vscode.ExtensionContext) {
  }

  public async getChildren(parent: TAllPulsarAdminExplorerNodeTypes | undefined): Promise<TAllPulsarAdminExplorerNodeTypes[]> {
    if (parent === undefined) {
      const pulsarAdminProviderConfigs = await BuildPulsarAdminProviderConfigs(this.providerRegistry);
      return new PulsarAdminProviderTree(this.context).getChildren(pulsarAdminProviderConfigs);
    }

    switch (parent.contextValue) {
      case CONTEXT_VALUES.provider:
        const provider = parent as IPulsarAdminProviderNode;
        return new ClusterTree().getChildren(provider);
      case CONTEXT_VALUES.cluster:
        const cluster = parent as IClusterNode;
        return new TenantTree().getChildren(cluster);
      case CONTEXT_VALUES.tenant:
        const tenant = parent as ITenantNode;
        return new NamespaceTree().getChildren(tenant);
      case CONTEXT_VALUES.namespace:
        const namespace = parent as INamespaceNode;
        // Build a tree of all the namespaced objects
        return [
          new FolderNode(namespace.pulsarAdmin, 'Topics', ExplorerFolderTypes.topicFolder, namespace.tenantName, namespace.label),
          new FolderNode(namespace.pulsarAdmin, 'Connectors', ExplorerFolderTypes.connectorFolder, namespace.tenantName, namespace.label),
          new FolderNode(namespace.pulsarAdmin, 'Functions', ExplorerFolderTypes.functionFolder, namespace.tenantName, namespace.label),
        ];
      case CONTEXT_VALUES.folder:
        const folderNode = parent as FolderNode;

        switch (folderNode.folderType) {
          case ExplorerFolderTypes.topicFolder:
            return new TopicTree(folderNode.pulsarAdmin).getChildren(folderNode.tenantName, folderNode.namespace);
          case ExplorerFolderTypes.connectorFolder:
            return [
              new FolderNode(folderNode.pulsarAdmin, 'Sources', ExplorerFolderTypes.sourceFolder, folderNode.tenantName, folderNode.namespace),
              new FolderNode(folderNode.pulsarAdmin, 'Sinks', ExplorerFolderTypes.sinkFolder, folderNode.tenantName, folderNode.namespace),
            ];
          case ExplorerFolderTypes.sourceFolder:
            return new ConnectorSourceTree(folderNode.pulsarAdmin).getChildren(folderNode.tenantName, folderNode.namespace);
          case ExplorerFolderTypes.sinkFolder:
            return new ConnectorSinkTree(folderNode.pulsarAdmin).getChildren(folderNode.tenantName, folderNode.namespace);
          case ExplorerFolderTypes.functionFolder:
            return new FunctionTree(folderNode.pulsarAdmin).getChildren(folderNode.tenantName, folderNode.namespace);
        }
    }

    return []; // the parent type is unknown
  }

  public getTreeItem(element: TAllPulsarAdminExplorerNodeTypes): TAllPulsarAdminExplorerNodeTypes | Thenable<TAllPulsarAdminExplorerNodeTypes> {
    return element;
  }

  public refresh(node?: any): void {
    this.onDidChangeTreeDataEmitter.fire(node);
  }

  private onElementCollapsed(e: vscode.TreeViewExpansionEvent<TAllPulsarAdminExplorerNodeTypes>) {
    this.collapse(e.element);
  }

  private onElementExpanded(e: vscode.TreeViewExpansionEvent<TAllPulsarAdminExplorerNodeTypes>) {
    this.expand(e.element);
  }

  private expand(node: TAllPulsarAdminExplorerNodeTypes) {
    //no op
  }

  private collapse(node: TAllPulsarAdminExplorerNodeTypes) {
    //no op
  }
}
