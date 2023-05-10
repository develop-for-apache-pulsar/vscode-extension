import {
  CONTEXT_VALUES,
  MessageTypes,
  AllPulsarAdminExplorerNodeTypes,
  TBaseNode
} from "./types";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as vscode from "vscode";
import * as path from "path";
import {IClusterNode} from "./cluster";
import {TPulsarAdminProviderTenant} from "../../../types/TPulsarAdminProviderTenant";

export interface ITenantNode extends TBaseNode{
  readonly tenant: TPulsarAdminProviderTenant;
}

export class TenantNode implements ITenantNode {
  constructor(readonly label: string, readonly tenant: TPulsarAdminProviderTenant) {}
}

export class TenantTree {
  constructor(){}

  async getChildren(clusterNode: IClusterNode): Promise<AllPulsarAdminExplorerNodeTypes[]> {
    if(clusterNode.clusterInfo.tenants.length === 0) {
      return [new MessageNode(MessageTypes.noTenants)];
    }

    try{
      return clusterNode.clusterInfo.tenants.map((tenant) => {
        return new TenantNode(tenant.name, tenant);
      });
    }catch (err) {
      return [new ErrorNode(err)];
    }
  }

  static getTreeItem(tenantNode: ITenantNode): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(tenantNode.label, vscode.TreeItemCollapsibleState.Collapsed);
    treeItem.contextValue = CONTEXT_VALUES.tenant;
    treeItem.description = "tenant";
    treeItem.iconPath = {
      light: path.join(__dirname, '..', 'images', 'light', 'tenant.svg'),
      dark: path.join(__dirname, '..', 'images', 'dark', 'tenant.svg'),
    };

    return treeItem;
  }
}
