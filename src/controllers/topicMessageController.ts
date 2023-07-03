import {TopicMessageEditorProvider} from "../providers/topicMessageEditorProvider/topicMessageEditorProvider";
import * as vscode from "vscode";
import {ITopicNode} from "../providers/pulsarClusterTreeDataProvider/nodes/topic";
import * as Constants from "../common/constants";
import * as path from "path";

export default class TopicMessageController {
  public static createTopicMessageEditorProvider(context: vscode.ExtensionContext): TopicMessageEditorProvider {
    return new TopicMessageEditorProvider(context);
  }

  static async watchTopicMessages(topicNode: ITopicNode): Promise<void> {
    const virtualFilePath = path.join(topicNode.pulsarAdmin.providerTypeName,
      topicNode.clusterName,
      topicNode.tenantName,
      topicNode.namespaceName,
      topicNode.topicType,
      `${topicNode.label}.pulsar`
    );

    const uri = vscode.Uri.from({
      scheme: 'untitled',
      path: virtualFilePath.toLowerCase()
    });

    vscode.commands.executeCommand('vscode.openWith', uri, Constants.TOPIC_MESSAGE_CUSTOM_EDITOR_VIEW_TYPE);
  }
}