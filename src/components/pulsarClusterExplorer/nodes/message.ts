import {CONTEXT_VALUES, MessageTypes, TBaseNode} from "./types";
import {Command} from "vscode";
import * as vscode from "vscode";

export interface IMessageNode extends TBaseNode {
  readonly messageText: string;
  readonly messageType: MessageTypes;
  readonly command: Command | undefined;
}

export class MessageNode implements IMessageNode {
  constructor(public readonly messageType: MessageTypes, public readonly messageText: string = '') {
    switch (messageType) {
      case MessageTypes.noClusters:
        this.messageText = "(no clusters)";
        break;
      case MessageTypes.noTenants:
        this.messageText = "(no tenants)";
        break;
      case MessageTypes.noNamespaces:
        this.messageText = "(no namespaces)";
        break;
      case MessageTypes.noTopics:
        this.messageText = "(no topics)";
        break;
      case MessageTypes.noConnectorSinks:
        this.messageText = "(no sinks)";
        break;
      case MessageTypes.noConnectorSources:
        this.messageText = "(no sources)";
        break;
      case MessageTypes.noFunctions:
        this.messageText = "(no functions)";
        break;
      case MessageTypes.customMessage:
        break;
      default:
        this.messageText = "Unknown";
    }
  }

  readonly label: string = '';
  readonly command: Command | undefined = undefined;
}

export class MessageTree {
  static getTreeItem(messageNode: IMessageNode): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(messageNode.messageText, vscode.TreeItemCollapsibleState.None);
    treeItem.contextValue = CONTEXT_VALUES.message;
    treeItem.command = messageNode.command;

    return treeItem;
  }
}
