import { TPulsarAdmin } from "../../../types/TPulsarAdmin";
import {CONTEXT_VALUES, MessageTypes, AllPulsarAdminExplorerNodeTypes} from "./types";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as vscode from "vscode";
import * as path from "path";

export interface IConnectorSinkNode extends vscode.TreeItem {
  readonly pulsarAdmin: TPulsarAdmin;
}

export class ConnectorSinkNode extends vscode.TreeItem implements IConnectorSinkNode {
  constructor(readonly pulsarAdmin: TPulsarAdmin, public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.contextValue = CONTEXT_VALUES.sink;
    this.iconPath = {
      light: path.join(__dirname, '..', 'images', 'light', 'connector.svg'),
      dark: path.join(__dirname, '..', 'images', 'dark', 'connector.svg'),
    };
  }
}

export class ConnectorSinkTree {
  constructor(private readonly pulsarAdmin: TPulsarAdmin) {
  }

  async getChildren(tenantName: string, namespaceName: string): Promise<AllPulsarAdminExplorerNodeTypes[]> {
    try{
      return this.pulsarAdmin.ListConnectorSinkNames(tenantName, namespaceName).then((connectorSinkNames) => {
        if(connectorSinkNames.length === 0) {
          return [new MessageNode(MessageTypes.noConnectorSinks)];
        }

        return connectorSinkNames.map((connectorSinkName) => {
          return new ConnectorSinkNode(this.pulsarAdmin, connectorSinkName);
        });
      }).catch((error) => {
        return [new ErrorNode(error)];
      });
    }catch (err) {
      return [new ErrorNode(err)];
    }
  }
}
