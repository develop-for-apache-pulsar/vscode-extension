import { TPulsarAdmin } from "../../../types/tPulsarAdmin";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as vscode from "vscode";
import * as path from "path";
import {CONTEXT_VALUES, ExplorerMessageTypes} from "../../../common/constants";
import {TAllPulsarAdminExplorerNodeTypes} from "../../../types/tAllPulsarAdminExplorerNodeTypes";

export interface IConnectorSourceNode extends vscode.TreeItem {
  readonly pulsarAdmin: TPulsarAdmin;
}

export class ConnectorSourceNode extends vscode.TreeItem  implements IConnectorSourceNode {
  constructor(readonly pulsarAdmin: TPulsarAdmin, public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.contextValue = CONTEXT_VALUES.source;
    this.iconPath = {
      light: path.join(__dirname, '..', 'images', 'light', 'connector.svg'),
      dark: path.join(__dirname, '..', 'images', 'dark', 'connector.svg'),
    };
  }
}

export class ConnectorSourceTree {
  constructor(private readonly pulsarAdmin: TPulsarAdmin) {}

  async getChildren(tenantName: string, namespaceName: string): Promise<TAllPulsarAdminExplorerNodeTypes[]> {
    try{
      return this.pulsarAdmin.ListConnectorSourceNames(tenantName, namespaceName).then((connectorSourceName) => {
        if(connectorSourceName.length === 0) {
          return [new MessageNode(ExplorerMessageTypes.noConnectorSources)];
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
}
