import * as vscode from "vscode";
import { TPulsarAdmin } from "../../../types/tPulsarAdmin";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as path from "path";
import {CONTEXT_VALUES, ExplorerMessageTypes} from "../../../common/constants";
import {TAllPulsarAdminExplorerNodeTypes} from "../../../types/tAllPulsarAdminExplorerNodeTypes";
import {GetSchemaResponse} from "@apache-pulsar/pulsar-admin/dist/gen/models";

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
          console.log(e);
        }

        topicNodes.push(new TopicNode(this.pulsarAdmin, topic.name, topic.type, providerTypeName, clusterName, tenantName, namespaceName, schema));
      }

      return topicNodes;
    }catch (err) {
      return [new ErrorNode(err)];
    }
  }
}
