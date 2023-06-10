import * as vscode from "vscode";
import { TPulsarAdmin } from "../../../types/tPulsarAdmin";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as path from "path";
import {CONTEXT_VALUES, ExplorerMessageTypes} from "../../../common/constants";
import {TAllPulsarAdminExplorerNodeTypes} from "../../../types/tAllPulsarAdminExplorerNodeTypes";

export interface ITopicNode extends vscode.TreeItem {
  readonly pulsarAdmin: TPulsarAdmin;
  readonly providerTypeName: string;
  readonly clusterName: string;
  readonly tenantName: string;
  readonly namespaceName: string;
  readonly topicType: string;
}

export class TopicNode extends vscode.TreeItem implements ITopicNode {
  constructor(readonly pulsarAdmin: TPulsarAdmin,
              public readonly label: string,
              public readonly topicType: string,
              public readonly providerTypeName: string,
              public readonly clusterName: string,
              public readonly tenantName: string,
              public readonly namespaceName: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.contextValue = CONTEXT_VALUES.topic;
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
      return this.pulsarAdmin.ListTopicNames(tenantName, namespaceName).then((topicNames) => {
        if(topicNames.length === 0) {
          return [new MessageNode(ExplorerMessageTypes.noTopics)];
        }

        return topicNames.map((topicName) => {
          return new TopicNode(this.pulsarAdmin, topicName.name, topicName.type, providerTypeName, clusterName, tenantName, namespaceName);
        });
      }).catch((error) => {
        return [new ErrorNode(error)];
      });
    }catch (err) {
      return [new ErrorNode(err)];
    }
  }
}
