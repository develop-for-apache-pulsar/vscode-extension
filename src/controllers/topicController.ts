import {trace} from "../utils/traceDecorator";
import * as vscode from "vscode";
import {NamespaceNode} from "../providers/pulsarClusterTreeDataProvider/nodes/namespace";
import {CreateTopicWizard} from "../wizards/createTopic";
import {PulsarClusterTreeDataProvider} from "../providers/pulsarClusterTreeDataProvider/explorer";
import {TreeExplorerController} from "./treeExplorerController";
import {TopicNode} from "../providers/pulsarClusterTreeDataProvider/nodes/topic";
import * as YAML from "yaml";
import TextDocumentHelper from "../utils/textDocumentHelper";
import {FunctionNode} from "../providers/pulsarClusterTreeDataProvider/nodes/function";

export default class TopicController {
  @trace('Show Add Cluster Config Wizard')
  public static showNewTopicWizard(namespaceNode: NamespaceNode, context: vscode.ExtensionContext, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): void {
    CreateTopicWizard.startWizard(context,
      namespaceNode.providerTypeName,
      namespaceNode.clusterName,
      namespaceNode.tenantName,
      namespaceNode.label,
      namespaceNode.pulsarAdmin,
      (topicType: string, numPartitions: number, topicName: string, topicProperties: {}) => {
        vscode.window.showInformationMessage(`The ${topicType} topic named ${topicName} was created successfully`);
        TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
      });
  }

  @trace('Show topic schema details')
  public static showTopicSchemaDetails(topicNode: TopicNode): void {
    if(!topicNode.topicSchema) {
      return;
    }

    if(topicNode.topicSchema.data) {
      topicNode.topicSchema.data = JSON.parse(topicNode.topicSchema.data);
    }

    const docOptions = {
      content: JSON.stringify(topicNode.topicSchema, null, 2),
      language: 'json'
    };

    vscode.workspace.openTextDocument(docOptions).then((doc) => {
      vscode.window.showTextDocument(doc, { preview: false });
    });
  }

  public static parseTopicAddress(topicAddress: string): URL {
    return new URL(topicAddress);
  }

  public static parseTopicType(topicUrl: URL): string | undefined {
    try {
      return topicUrl.protocol.replace(':', '');
    } catch (e) {
      return undefined;
    }
  }

  public static parseTopicTenant(topicUrl: URL): string | undefined {
    try {
      return topicUrl.host;
    } catch (e) {
      return undefined;
    }
  }

  public static parseTopicNamespace(topicUrl: URL): string | undefined {
    try {
      const pathSplit = topicUrl.pathname.split('/');
      if(pathSplit.length < 2) { // there is a leading slash
        return undefined;
      }
      return pathSplit[1];
    } catch (e) {
      return undefined;
    }
  }

  public static parseTopicName(topicUrl: URL): string | undefined {
    try {
      const pathSplit = topicUrl.pathname.split('/');
      if(pathSplit.length < 3) {
        return undefined;
      }
      return pathSplit[2];
    } catch (e) {
      return undefined;
    }
  }

  public static showTopicStatistics(topicNode: TopicNode) {
    topicNode.pulsarAdmin.TopicStats(topicNode.topicType, topicNode.tenantName, topicNode.namespaceName, topicNode.label).then(async (stats) => {
      if (stats === undefined) {
        vscode.window.showErrorMessage(`Error occurred getting topic statistics`);
        return;
      }

      const documentContent = YAML.stringify(stats, null, 2);
      await TextDocumentHelper.openDocument(documentContent, 'yaml');
    }).catch((e) => {
      vscode.window.showErrorMessage(`Error occurred getting topic statistics: ${e}`);
      console.log(e);
    });
  }

  public static showTopicProperties(topicNode: TopicNode) {
    topicNode.pulsarAdmin.TopicProperties(topicNode.topicType, topicNode.tenantName, topicNode.namespaceName, topicNode.label).then(async (props) => {
      if (props === undefined) {
        vscode.window.showErrorMessage(`Error occurred getting topic properties`);
        return;
      }

      const documentContent = YAML.stringify(props, null, 2);
      await TextDocumentHelper.openDocument(documentContent, 'yaml');
    }).catch((e) => {
      vscode.window.showErrorMessage(`Error occurred getting topic properties: ${e}`);
      console.log(e);
    });
  }

  public static deleteTopic(topicNode: TopicNode, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): void {
    topicNode.pulsarAdmin.DeleteTopic(topicNode.topicType, topicNode.tenantName, topicNode.namespaceName, topicNode.label).then(() => {
      vscode.window.showInformationMessage(`Topic '${topicNode.label}' deleted`);
      TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
    }).catch((e) => {
      vscode.window.showErrorMessage(`Error deleting topic: ${e}`);
      console.log(e);
    });
  }
}