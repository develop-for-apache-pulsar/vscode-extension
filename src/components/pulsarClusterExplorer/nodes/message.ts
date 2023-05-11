import {CONTEXT_VALUES, MessageTypes} from "./types";
import {Command} from "vscode";
import * as vscode from "vscode";

export interface IMessageNode extends vscode.TreeItem{
  readonly messageText: string;
  readonly messageType: MessageTypes;
  readonly command: Command | undefined;
}

export class MessageNode extends vscode.TreeItem implements IMessageNode {
  constructor(public readonly messageType: MessageTypes, readonly messageText: string = '', readonly command: Command | undefined = undefined) {
    super("", vscode.TreeItemCollapsibleState.None);
    this.contextValue = CONTEXT_VALUES.message;
    this.command = command;

    switch (messageType) {
      case MessageTypes.noClusters:
        this.label = "(no clusters)";
        break;
      case MessageTypes.noTenants:
        this.label = "(no tenants)";
        break;
      case MessageTypes.noNamespaces:
        this.label = "(no namespaces)";
        break;
      case MessageTypes.noTopics:
        this.label = "(no topics)";
        break;
      case MessageTypes.noConnectorSinks:
        this.label = "(no sinks)";
        break;
      case MessageTypes.noConnectorSources:
        this.label = "(no sources)";
        break;
      case MessageTypes.noFunctions:
        this.label = "(no functions)";
        break;
      case MessageTypes.customMessage:
        this.label = messageText || "";
        break;
      default:
        this.label = "Unknown";
    }
  }
}
