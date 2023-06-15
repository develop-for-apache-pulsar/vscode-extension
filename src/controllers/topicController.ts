import {trace} from "../utils/traceDecorator";
import * as vscode from "vscode";
import {NamespaceNode} from "../providers/pulsarClusterTreeDataProvider/nodes/namespace";
import {CreateTopicWizard} from "../wizards/createTopic";
import {PulsarClusterTreeDataProvider} from "../providers/pulsarClusterTreeDataProvider/explorer";

export default class TopicController {
  @trace('Show Add Cluster Config Wizard')
  public static async showNewTopicWizard(namespaceNode: NamespaceNode, context: vscode.ExtensionContext, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): Promise<void> {
    await CreateTopicWizard.startWizard(context,
      namespaceNode.providerTypeName,
      namespaceNode.clusterName,
      namespaceNode.tenantName,
      namespaceNode.label,
      namespaceNode.pulsarAdmin,
      async (topicType: string, numPartitions: number, topicName: string, topicProperties: {}) => {
      vscode.window.showInformationMessage(`The ${topicType} topic named ${topicName} was created successfully`);
      await pulsarClusterTreeProvider.refresh();
    });
  }
}