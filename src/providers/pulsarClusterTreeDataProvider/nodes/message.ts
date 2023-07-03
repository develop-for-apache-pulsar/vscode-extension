import {Command} from "vscode";
import * as vscode from "vscode";
import {CONTEXT_VALUES, ExplorerMessageTypes} from "../../../common/constants";

export interface IMessageNode extends vscode.TreeItem{
  readonly messageText: string;
  readonly messageType: ExplorerMessageTypes;
  readonly command: Command | undefined;
}

export class MessageNode extends vscode.TreeItem implements IMessageNode {
  constructor(public readonly messageType: ExplorerMessageTypes, readonly messageText: string = '', readonly command: Command | undefined = undefined) {
    super("", vscode.TreeItemCollapsibleState.None);
    this.contextValue = CONTEXT_VALUES.message;
    this.command = command;

    switch (messageType) {
      case ExplorerMessageTypes.noClusters:
        this.label = "(no clusters)";
        break;
      case ExplorerMessageTypes.noTenants:
        this.label = "(no tenants)";
        break;
      case ExplorerMessageTypes.noNamespaces:
        this.label = "(no namespaces)";
        break;
      case ExplorerMessageTypes.noTopics:
        this.label = "(no topics)";
        break;
      case ExplorerMessageTypes.noConnectorSinks:
        this.label = "(no sinks)";
        break;
      case ExplorerMessageTypes.noConnectorSources:
        this.label = "(no sources)";
        break;
      case ExplorerMessageTypes.noFunctions:
        this.label = "(no functions)";
        break;
      case ExplorerMessageTypes.noFunctionInstances:
        this.label = "(no instances)";
        break;
      case ExplorerMessageTypes.customMessage:
        this.label = messageText || "";
        break;
      default:
        this.label = "Unknown";
    }
  }
}
