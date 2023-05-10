import { TPulsarAdmin } from "../../../types/TPulsarAdmin";
import {CONTEXT_VALUES, MessageTypes, AllPulsarAdminExplorerNodeTypes} from "./types";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as vscode from "vscode";
import * as path from "path";

export interface IConnectorSourceNode {
  readonly label: string;
  readonly pulsarAdmin: TPulsarAdmin;
}

export class ConnectorSourceNode implements IConnectorSourceNode {
  constructor(readonly pulsarAdmin: TPulsarAdmin, public readonly label: string) {
  }
}

export class ConnectorSourceTree {
  constructor(private readonly pulsarAdmin: TPulsarAdmin) {
  }

  async getChildren(tenantName: string, namespaceName: string): Promise<AllPulsarAdminExplorerNodeTypes[]> {
    try{
      return this.pulsarAdmin.ListConnectorSourceNames(tenantName, namespaceName).then((connectorSourceName) => {
        if(connectorSourceName.length === 0) {
          return [new MessageNode(MessageTypes.noConnectorSources)];
        }

        return connectorSourceName.map((connectorSourceName) => {
          return new ConnectorSourceNode(this.pulsarAdmin, connectorSourceName);
        });
      }).catch((error) => {
        return [new ErrorNode(error)];
      });
    }catch (err) {
      return [new ErrorNode(err)];
    }
  }

  static getTreeItem(connectorSourceNode: IConnectorSourceNode): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(connectorSourceNode.label, vscode.TreeItemCollapsibleState.None);
    treeItem.contextValue = CONTEXT_VALUES.source;
    treeItem.iconPath = {
      light: path.join(__dirname, '..', 'images', 'light', 'connector.svg'),
      dark: path.join(__dirname, '..', 'images', 'dark', 'connector.svg'),
    };

    return treeItem;
  }
}
