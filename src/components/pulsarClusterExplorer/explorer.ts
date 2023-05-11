import {IPulsarAdminProviderNode, PulsarAdminProviderTree} from "./nodes/pulsarAdminProvider";
import {Host} from "../../utils/host";
import * as vscode from "vscode";
import {affectsUs} from "../config/config";
import {ClusterTree, IClusterNode} from "./nodes/cluster";
import {ITenantNode, TenantTree} from "./nodes/tenant";
import {INamespaceNode, NamespaceTree} from "./nodes/namespace";
import {FolderNode} from "./nodes/folder";
import {TopicTree} from "./nodes/topic";
import {ConnectorSourceTree} from "./nodes/connectorSource";
import {ConnectorSinkTree} from "./nodes/connectorSink";
import {FunctionTree} from "./nodes/function";
import {AllPulsarAdminExplorerNodeTypes, CONTEXT_VALUES, FolderTypes} from "./nodes/types";
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

  constructor(host: Host, private readonly providerRegistry: PulsarAdminProviders, private readonly context: vscode.ExtensionContext) {
    host.onDidChangeConfiguration((change) => {
      if (affectsUs(change)) {
        this.refresh();
      }
    });
  }

  public async getChildren(parent: AllPulsarAdminExplorerNodeTypes | undefined): Promise<AllPulsarAdminExplorerNodeTypes[]> {
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
          new FolderNode(namespace.pulsarAdmin, 'Topics', FolderTypes.topicFolder, namespace.tenantName, namespace.label),
          new FolderNode(namespace.pulsarAdmin, 'Connectors', FolderTypes.connectorFolder, namespace.tenantName, namespace.label),
          new FolderNode(namespace.pulsarAdmin, 'Functions', FolderTypes.functionFolder, namespace.tenantName, namespace.label),
        ];
      case CONTEXT_VALUES.folder:
        const folderNode = parent as FolderNode;

        switch (folderNode.folderType) {
          case FolderTypes.topicFolder:
            return new TopicTree(folderNode.pulsarAdmin).getChildren(folderNode.tenantName, folderNode.namespace);
          case FolderTypes.connectorFolder:
            return [
              new FolderNode(folderNode.pulsarAdmin, 'Sources', FolderTypes.sourceFolder, folderNode.tenantName, folderNode.namespace),
              new FolderNode(folderNode.pulsarAdmin, 'Sinks', FolderTypes.sinkFolder, folderNode.tenantName, folderNode.namespace),
            ];
          case FolderTypes.sourceFolder:
            return new ConnectorSourceTree(folderNode.pulsarAdmin).getChildren(folderNode.tenantName, folderNode.namespace);
          case FolderTypes.sinkFolder:
            return new ConnectorSinkTree(folderNode.pulsarAdmin).getChildren(folderNode.tenantName, folderNode.namespace);
          case FolderTypes.functionFolder:
            return new FunctionTree(folderNode.pulsarAdmin).getChildren(folderNode.tenantName, folderNode.namespace);
        }
    }

    return []; // the parent type is unknown
  }

  public getTreeItem(element: AllPulsarAdminExplorerNodeTypes): AllPulsarAdminExplorerNodeTypes | Thenable<AllPulsarAdminExplorerNodeTypes> {
    return element;
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
