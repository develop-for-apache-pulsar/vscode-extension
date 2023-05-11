import { TPulsarAdmin } from "../../../types/TPulsarAdmin";
import {CONTEXT_VALUES, MessageTypes, AllPulsarAdminExplorerNodeTypes} from "./types";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as vscode from "vscode";
import * as path from "path";
import {ITenantNode} from "./tenant";

export interface INamespaceNode extends vscode.TreeItem{
  readonly tenantName: string;
  readonly pulsarAdmin: TPulsarAdmin;
  readonly label: string;
}

export class NamespaceNode extends vscode.TreeItem implements INamespaceNode {
  constructor(public readonly pulsarAdmin: TPulsarAdmin, public readonly label: string, public readonly tenantName: string) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.contextValue = CONTEXT_VALUES.namespace;
    this.description = "namespace";
    this.iconPath = {
      light: path.join(__dirname, '..', 'images', 'light', 'namespace.svg'),
      dark: path.join(__dirname, '..', 'images', 'dark', 'namespace.svg'),
    };
  }
}

export class NamespaceTree {
  async getChildren(tenantNode: ITenantNode): Promise<AllPulsarAdminExplorerNodeTypes[]> {
    if(!tenantNode){ return [];  }

    try{
      return tenantNode.tenant.pulsarAdmin.ListNamespaceNames(tenantNode.tenant.name).then((namespaceNames) => {
        if(namespaceNames.length === 0) {
          return [new MessageNode(MessageTypes.noNamespaces)];
        }

        return namespaceNames.map((namespaceName) => {
          return new NamespaceNode(tenantNode.tenant.pulsarAdmin, namespaceName, tenantNode.tenant.name);
        });
      }).catch((error) => {
        return [new ErrorNode(error)];
      });
    }catch (err) {
      return [new ErrorNode(err)];
    }
  }
}
