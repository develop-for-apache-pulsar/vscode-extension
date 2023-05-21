import * as vscode from "vscode";
import { TPulsarAdmin } from "../../../types/tPulsarAdmin";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as path from "path";
import {CONTEXT_VALUES, ExplorerMessageTypes} from "../../../common/constants";
import {TAllPulsarAdminExplorerNodeTypes} from "../../../types/tAllPulsarAdminExplorerNodeTypes";

export interface IFunctionNode extends vscode.TreeItem{}

export class FunctionNode extends vscode.TreeItem implements IFunctionNode {
  constructor(readonly pulsarAdmin: TPulsarAdmin, public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.contextValue = CONTEXT_VALUES.function;
    this.iconPath = {
      light: path.join(__dirname, '..', 'images', 'light', 'function.svg'),
      dark: path.join(__dirname, '..', 'images', 'dark', 'function.svg'),
    };
  }
}

export class FunctionTree {
  constructor(private readonly pulsarAdmin: TPulsarAdmin) {
  }

  async getChildren(tenantName: string, namespaceName: string): Promise<TAllPulsarAdminExplorerNodeTypes[]> {
    try{
      return this.pulsarAdmin.ListFunctionNames(tenantName, namespaceName).then((functionNames) => {
        if(functionNames.length === 0) {
          return [new MessageNode(ExplorerMessageTypes.noFunctions)];
        }

        return functionNames.map((functionName) => {
          return new FunctionNode(this.pulsarAdmin, functionName);
        });
      }).catch((error) => {
        return [new ErrorNode(error)];
      });
    }catch (err) {
      return [new ErrorNode(err)];
    }
  }
}
