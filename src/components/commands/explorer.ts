import * as vscode from "vscode";
import {PulsarAdminExplorerTree} from "../pulsarClusterExplorer/explorer";
import {AllPulsarAdminExplorerNodeTypes} from "../pulsarClusterExplorer/nodes/types";
import {ITopicNode, TopicNode} from "../pulsarClusterExplorer/nodes/topic";
import {WatchConfig, WatchTopic} from "../views/watchTopic";

export class PulsarAdminTreeCommands{
  public static refreshTreeProvider(treeProvider: PulsarAdminExplorerTree, context: vscode.ExtensionContext): void {
    treeProvider.refresh();
  }

  public static initializeTreeProvider(treeProvider: PulsarAdminExplorerTree, context: vscode.ExtensionContext): void {
    treeProvider.initialize();
  }

  public static watchTopicMessages(topicExplorerNode: ITopicNode, context: vscode.ExtensionContext): void {
    const watchTopicView = new WatchTopic(context,
      topicExplorerNode.topicData,
      topicExplorerNode.pulsarAdmin);

    watchTopicView.showPage();
  }
}
