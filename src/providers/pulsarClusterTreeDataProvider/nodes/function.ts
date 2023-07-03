import * as vscode from "vscode";
import { TPulsarAdmin } from "../../../types/tPulsarAdmin";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as path from "path";
import {CONTEXT_VALUES, ExplorerMessageTypes} from "../../../common/constants";
import {TAllPulsarAdminExplorerNodeTypes} from "../../../types/tAllPulsarAdminExplorerNodeTypes";
import {FunctionConfig, FunctionStatus} from "@apache-pulsar/pulsar-admin/dist/gen/models";

export interface IFunctionNode extends vscode.TreeItem{
  readonly tenantName: string;
  readonly namespaceName: string;
  readonly pulsarAdmin: TPulsarAdmin;
  readonly label: string;
  readonly functionConfig: FunctionConfig | undefined;
  readonly providerTypeName: string;
  readonly clusterName: string;
}

export class FunctionNode extends vscode.TreeItem implements IFunctionNode {
  constructor(readonly pulsarAdmin: TPulsarAdmin,
              public readonly label: string,
              public readonly tenantName: string,
              public readonly namespaceName: string,
              public readonly functionConfig: FunctionConfig | undefined,
              public readonly providerTypeName: string,
              public readonly clusterName: string) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.description = `${functionConfig?.runtime?.toLowerCase()} function`;

    this.contextValue = `${CONTEXT_VALUES.function}.${label}`;

    this.iconPath = {
      light: path.join(__dirname, '..', 'images', 'light', 'function.svg'),
      dark: path.join(__dirname, '..', 'images', 'dark', 'function.svg'),
    };

    switch(functionConfig?.runtime?.toLowerCase()) {
      case 'java':
        this.iconPath = {
          light: path.join(__dirname, '..', 'images', 'light', 'java.png'),
          dark: path.join(__dirname, '..', 'images', 'light', 'java.png'),
        };
        break;
      case 'python':
        this.iconPath = {
          light: path.join(__dirname, '..', 'images', 'light', 'python.png'),
          dark: path.join(__dirname, '..', 'images', 'light', 'python.png'),
        };
        break;
      case 'go':
        this.iconPath = {
          light: path.join(__dirname, '..', 'images', 'light', 'go.png'),
          dark: path.join(__dirname, '..', 'images', 'light', 'go.png'),
        };
        break;
    }
  }

  async setContext() {
    const status: any | undefined = await this.pulsarAdmin.FunctionStatus(this.tenantName, this.namespaceName, this.label);
    if(status === undefined) {
      return;
    }

    const functionStatus = status as FunctionStatus;

    if(!functionStatus.numRunning) {
      functionStatus.numRunning = 0;
    }

    if(!functionStatus.numInstances){
      functionStatus.numInstances = 0;
    }

    switch (functionStatus.numRunning) {
      case 0:
        this.contextValue += '.stopped';
        break;
      default:
        this.contextValue += '.started';
        break;
    }

    this.tooltip = `Instances: ${functionStatus.numInstances}\nRunning: ${functionStatus.numRunning}`;
  }
}

export class FunctionTree {
  constructor(private readonly pulsarAdmin: TPulsarAdmin) {}

  async getChildren(tenantName: string, namespaceName: string, providerTypeName: string, clusterName: string): Promise<TAllPulsarAdminExplorerNodeTypes[]> {
    try{
      const functionNames = await this.pulsarAdmin.ListFunctionNames(tenantName, namespaceName);

      if(functionNames.length === 0) {
        return [new MessageNode(ExplorerMessageTypes.noFunctions)];
      }

      const functionNodes: FunctionNode[] = [];
      for(const functionName of functionNames) {
        const info: any = await this.pulsarAdmin.GetFunctionInfo(tenantName, namespaceName, functionName);

        if(info === undefined) {
          continue;
        }

        const functionConfig = info as FunctionConfig;

        const node = new FunctionNode(this.pulsarAdmin, functionName, tenantName, namespaceName, functionConfig, providerTypeName, clusterName);
        await node.setContext();
        functionNodes.push(node);
      }

      return functionNodes;
    }catch (err) {
      return [new ErrorNode(err)];
    }
  }
}
