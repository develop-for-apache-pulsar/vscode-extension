import * as vscode from "vscode";
import { TPulsarAdmin } from "../../../types/TPulsarAdmin";
import {CONTEXT_VALUES, MessageTypes, AllPulsarAdminExplorerNodeTypes, TBaseNode, TBaseNodeWithPulsarAdmin} from "./types";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as path from "path";
import {TTopic} from "../../../types/TTopic";

export interface ITopicNode extends TBaseNodeWithPulsarAdmin {
  readonly topicData: TTopic;
}

export class TopicNode implements ITopicNode {
  constructor(readonly pulsarAdmin: TPulsarAdmin, public readonly label: string, public readonly topicData: TTopic) {}
}

export class TopicTree {
  constructor(private readonly pulsarAdmin: TPulsarAdmin) {
  }

  async getChildren(tenantName: string, namespaceName: string): Promise<AllPulsarAdminExplorerNodeTypes[]> {
    try{
      return this.pulsarAdmin.ListTopics(tenantName, namespaceName).then((topics) => {
        if(topics.length === 0) {
          return [new MessageNode(MessageTypes.noTopics)];
        }

        return topics.map((topic) => {
          return new TopicNode(this.pulsarAdmin, topic.Name, topic);
        });
      }).catch((error) => {
        return [new ErrorNode(error)];
      });
    }catch (err) {
      return [new ErrorNode(err)];
    }
  }

  static getTreeItem(topicNode: ITopicNode): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(topicNode.topicData.Name, vscode.TreeItemCollapsibleState.None);
    treeItem.contextValue = CONTEXT_VALUES.topic;
    treeItem.description = topicNode.topicData.Type;
    treeItem.iconPath = {
      light: path.join(__dirname, '..', 'images', 'light', 'topic.svg'),
      dark: path.join(__dirname, '..', 'images', 'dark', 'topic.svg'),
    };

    return treeItem;
  }
}
