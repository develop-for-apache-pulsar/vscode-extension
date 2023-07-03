import * as vscode from "vscode";
import {TPulsarAdmin} from "../../../types/tPulsarAdmin";
import {CONTEXT_VALUES, ExplorerMessageTypes} from "../../../common/constants";
import {FunctionInstanceStatusData, FunctionStatus} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import {TAllPulsarAdminExplorerNodeTypes} from "../../../types/tAllPulsarAdminExplorerNodeTypes";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";

export interface IFunctionInstanceNode extends vscode.TreeItem{
  readonly tenantName: string;
  readonly namespaceName: string;
  readonly pulsarAdmin: TPulsarAdmin;
  readonly label: string;
  readonly instanceStatus: FunctionInstanceStatusData | undefined;
}

export class FunctionInstanceNode extends vscode.TreeItem implements IFunctionInstanceNode {
constructor(readonly pulsarAdmin: TPulsarAdmin,
              public readonly label: string,
              public readonly tenantName: string,
              public readonly namespaceName: string,
              public readonly functionName: string,
              public readonly instanceStatus: FunctionInstanceStatusData | undefined) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = "instance";
    let status = instanceStatus?.running === true ? 'Running' : 'Stopped';

    if(instanceStatus?.error !== undefined && instanceStatus?.error !== '') {
      this.description = 'ERROR - check function status';
      status = instanceStatus.error;
    }

    this.tooltip = `Status: ${status}`;
    this.contextValue = `${CONTEXT_VALUES.functionInstance}.${label}.${instanceStatus?.running === true ? 'started' : 'stopped'}`;
  }
}

export class FunctionInstanceTree {
  constructor(private readonly pulsarAdmin: TPulsarAdmin) {}

  async getChildren(tenantName: string, namespaceName: string, functionName: string): Promise<TAllPulsarAdminExplorerNodeTypes[]> {
    try{
      const functionStatus: any | undefined = await this.pulsarAdmin.FunctionStatus(tenantName, namespaceName, functionName);
      if(functionStatus === undefined) {
        return [new MessageNode(ExplorerMessageTypes.noFunctionInstances)];
      }

      const functionStatusData = functionStatus as FunctionStatus;

      if(!functionStatusData.instances || functionStatusData.instances.length === 0) {
        return [new MessageNode(ExplorerMessageTypes.noFunctionInstances)];
      }
      const functionInstanceNodes: FunctionInstanceNode[] = [];
      for(const functionInstance of functionStatusData.instances) {
        if(functionInstance.instanceId === undefined) {
          continue;
        }

        const node = new FunctionInstanceNode(this.pulsarAdmin, functionInstance.instanceId.toString(), tenantName, namespaceName, functionName, functionInstance.status);
        functionInstanceNodes.push(node);
      }

      return functionInstanceNodes;
    }catch (err) {
      return [new ErrorNode(err)];
    }
  }
}