import {TopicMessageEditorProvider} from "../providers/topicMessageEditorProvider/topicMessageEditorProvider";
import * as vscode from "vscode";
import {TopicNode} from "../providers/pulsarClusterTreeDataProvider/nodes/topic";
import * as Constants from "../common/constants";

export default class TopicMessageController {
  public static createTopicMessageEditorProvider(context: vscode.ExtensionContext): TopicMessageEditorProvider {
    return new TopicMessageEditorProvider(context);
  }

  static async watchTopicMessages(topicNode: TopicNode, context: vscode.ExtensionContext): Promise<void> {
    const t = topicNode.topicData;

    const uri = vscode.Uri.from({
      scheme: 'untitled',
      path: `${t.providerTypeName}/${t.clusterName}/${t.tenantName}/${t.namespaceName}/${t.type.toLowerCase()}/${t.name}.pulsar`
    });

    vscode.commands.executeCommand('vscode.openWith', uri, Constants.TOPIC_MESSAGE_CUSTOM_EDITOR_VIEW_TYPE);
  }
}