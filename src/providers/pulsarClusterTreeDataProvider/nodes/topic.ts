import * as vscode from "vscode";
import { TPulsarAdmin } from "../../../types/tPulsarAdmin";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as path from "path";
import {CONTEXT_VALUES, ExplorerMessageTypes} from "../../../common/constants";
import {TAllPulsarAdminExplorerNodeTypes} from "../../../types/tAllPulsarAdminExplorerNodeTypes";
import {GetSchemaResponse} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import TopicController from "../../../controllers/topicController";
import Logger from "../../../utils/logger";

export interface ITopicNode extends vscode.TreeItem {
  readonly pulsarAdmin: TPulsarAdmin;
  readonly providerTypeName: string;
  readonly clusterName: string;
  readonly tenantName: string;
  readonly namespaceName: string;
  readonly topicType: string;
  readonly topicSchema: GetSchemaResponse | undefined;
}

export class TopicNode extends vscode.TreeItem implements ITopicNode {
  constructor(readonly pulsarAdmin: TPulsarAdmin,
              public readonly label: string,
              public readonly topicType: string,
              public readonly providerTypeName: string,
              public readonly clusterName: string,
              public readonly tenantName: string,
              public readonly namespaceName: string,
              public readonly topicSchema: GetSchemaResponse | undefined) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.contextValue = `${CONTEXT_VALUES.topic}.${label}${topicSchema ? ".withSchema" : ""}`;
    this.iconPath = {
      light: path.join(__dirname, '..', 'images', 'light', 'topic.svg'),
      dark: path.join(__dirname, '..', 'images', 'dark', 'topic.svg'),
    };
  }

  public static async fromTopicAddress(pulsarAdmin: TPulsarAdmin, topicAddress: string, providerTypeName: string, clusterName: string): Promise<ITopicNode> {
    let parsedTopicAddress: URL;

    if(!topicAddress.startsWith('persistent') && !topicAddress.startsWith('non-persistent')) {
      // The topic address is not a full URL, so we need to attempt to fix
      const tenantName = topicAddress.split('/')[0];
      const namespaceName = topicAddress.split('/')[1];
      const topicName = topicAddress.split('/')[2];

      let exists = await pulsarAdmin.TopicExists('persistent', tenantName, namespaceName, topicName);
      if(exists){
        topicAddress = `persistent://${tenantName}/${namespaceName}/${topicName}`;
      }else{
        exists = await pulsarAdmin.TopicExists('non-persistent', tenantName, namespaceName, topicName);
        if(exists){
          topicAddress = `non-persistent://${tenantName}/${namespaceName}/${topicName}`;
        }
      }

      if(!exists) {
        throw new Error(`Could not find topic at address: ${topicAddress}`);
      }
    }

    try{
      parsedTopicAddress = TopicController.parseTopicAddress(topicAddress);
    } catch(e) {
      throw new Error(`Error parsing invalid topic address: ${topicAddress}`);
    }

    const topicName = TopicController.parseTopicName(parsedTopicAddress);

    if(topicName === undefined) {
      throw new Error(`Error parsing topic name: ${topicAddress}`);
    }

    const topicType = TopicController.parseTopicType(parsedTopicAddress);

    if(topicType === undefined) {
      throw new Error(`Error parsing topic type: ${topicAddress}`);
    }

    const topicTenant = TopicController.parseTopicTenant(parsedTopicAddress);

    if(topicTenant === undefined) {
      throw new Error(`Error parsing topic tenant: ${topicAddress}`);
    }

    const topicNamespace = TopicController.parseTopicNamespace(parsedTopicAddress);

    if(topicNamespace === undefined) {
      throw new Error(`Error parsing topic namespace: ${topicAddress}`);
    }

    return new TopicNode(pulsarAdmin,
      topicName,
      topicType,
      providerTypeName,
      clusterName,
      topicTenant,
      topicNamespace,
      undefined);
  }
}

export class TopicTree {
  constructor(private readonly pulsarAdmin: TPulsarAdmin) {
  }

  async getChildren(tenantName: string, namespaceName: string, providerTypeName: string, clusterName: string): Promise<TAllPulsarAdminExplorerNodeTypes[]> {
    try{
      const topics = await this.pulsarAdmin.ListTopicNames(tenantName, namespaceName);
      if(topics.length === 0) {
        return [new MessageNode(ExplorerMessageTypes.noTopics)];
      }

      const topicNodes: TopicNode[] = [];
      for (const topic of topics) {
        let schema;
        try{
          schema = await this.pulsarAdmin.GetTopicSchema(tenantName, namespaceName, topic.name);
        }catch(e:any){
          Logger.error(e);
        }

        topicNodes.push(new TopicNode(this.pulsarAdmin, topic.name, topic.type, providerTypeName, clusterName, tenantName, namespaceName, schema));
      }

      return topicNodes;
    }catch (err) {
      return [new ErrorNode(err)];
    }
  }
}
