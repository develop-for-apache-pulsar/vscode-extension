import { TPulsarAdmin } from "../../../types/TPulsarAdmin";
import {CONTEXT_VALUES, MessageTypes, AllPulsarAdminExplorerNodeTypes, TBaseNodeWithPulsarAdmin} from "./types";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as vscode from "vscode";
import * as path from "path";
import {ITenantNode} from "./tenant";

export interface INamespaceNode extends TBaseNodeWithPulsarAdmin {
  readonly tenantName: string;
}

export class NamespaceNode implements INamespaceNode {
  constructor(readonly pulsarAdmin: TPulsarAdmin, public readonly label: string, public readonly tenantName: string) {}
}

export class NamespaceTree {
  constructor() {
  }

  async getChildren(tenantNode: ITenantNode): Promise<AllPulsarAdminExplorerNodeTypes[]> {
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

  static getTreeItem(namespaceNode: INamespaceNode): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(namespaceNode.label, vscode.TreeItemCollapsibleState.Collapsed);
    treeItem.contextValue = CONTEXT_VALUES.tenant;
    treeItem.description = "namespace";
    treeItem.iconPath = {
      light: path.join(__dirname, '..', 'images', 'light', 'namespace.svg'),
      dark: path.join(__dirname, '..', 'images', 'dark', 'namespace.svg'),
    };

    return treeItem;
  }
}
