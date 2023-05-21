import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as vscode from "vscode";
import * as path from "path";
import {IClusterNode} from "./cluster";
import {TPulsarAdminProviderTenant} from "../../../types/tPulsarAdminProviderTenant";
import {CONTEXT_VALUES, ExplorerMessageTypes} from "../../../common/constants";
import {TAllPulsarAdminExplorerNodeTypes} from "../../../types/tAllPulsarAdminExplorerNodeTypes";

export interface ITenantNode extends vscode.TreeItem{
  readonly tenant: TPulsarAdminProviderTenant;
}

export class TenantNode extends vscode.TreeItem implements ITenantNode {
  constructor(readonly label: string, readonly tenant: TPulsarAdminProviderTenant) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.contextValue = CONTEXT_VALUES.tenant;
    this.description = "tenant";
    this.iconPath = {
      light: path.join(__dirname, '..', 'images', 'light', 'tenant.svg'),
      dark: path.join(__dirname, '..', 'images', 'dark', 'tenant.svg'),
    };
  }
}

export class TenantTree {
  constructor(){}

  async getChildren(clusterNode: IClusterNode): Promise<TAllPulsarAdminExplorerNodeTypes[]> {
    if(!clusterNode) { return []; }

    if(clusterNode.clusterInfo.tenants.length === 0) {
      return [new MessageNode(ExplorerMessageTypes.noTenants)];
    }

    try{
      return clusterNode.clusterInfo.tenants.map((tenant) => {
        return new TenantNode(tenant.name, tenant);
      });
    }catch (err) {
      return [new ErrorNode(err)];
    }
  }
}
