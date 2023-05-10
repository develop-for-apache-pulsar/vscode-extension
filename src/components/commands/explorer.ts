import * as vscode from "vscode";
import {PulsarAdminExplorerTree} from "../pulsarClusterExplorer/explorer";
import {AllPulsarAdminExplorerNodeTypes} from "../pulsarClusterExplorer/nodes/types";
import {TopicNode} from "../pulsarClusterExplorer/nodes/topic";

export class PulsarAdminTreeCommands{
  public static refreshTreeProvider(treeProvider: PulsarAdminExplorerTree, context: vscode.ExtensionContext): void {
    treeProvider.refresh();
  }

  public static initializeTreeProvider(treeProvider: PulsarAdminExplorerTree, context: vscode.ExtensionContext): void {
    treeProvider.initialize();
  }

  static viewTopicDetails(explorerNode: AllPulsarAdminExplorerNodeTypes, context: vscode.ExtensionContext) {
    // This should be a topic node
    if(typeof explorerNode !== typeof TopicNode) {
      return;
    }
  }
}
