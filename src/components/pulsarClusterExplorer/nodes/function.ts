import * as vscode from "vscode";
import { TPulsarAdmin } from "../../../types/TPulsarAdmin";
import {CONTEXT_VALUES, MessageTypes, AllPulsarAdminExplorerNodeTypes, TBaseNode, TBaseNodeWithPulsarAdmin} from "./types";
import {MessageNode} from "./message";
import {ErrorNode} from "./error";
import * as path from "path";

export interface IFunctionNode extends TBaseNodeWithPulsarAdmin{}

export class FunctionNode implements IFunctionNode {
  constructor(readonly pulsarAdmin: TPulsarAdmin, public readonly label: string) {}
}

export class FunctionTree {
  constructor(private readonly pulsarAdmin: TPulsarAdmin) {
  }

  async getChildren(tenantName: string, namespaceName: string): Promise<AllPulsarAdminExplorerNodeTypes[]> {
    try{
      return this.pulsarAdmin.ListFunctionNames(tenantName, namespaceName).then((functionNames) => {
        if(functionNames.length === 0) {
          return [new MessageNode(MessageTypes.noFunctions)];
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

  static getTreeItem(functionNode: IFunctionNode): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(functionNode.label, vscode.TreeItemCollapsibleState.None);
    treeItem.contextValue = CONTEXT_VALUES.sink;
    treeItem.iconPath = {
      light: path.join(__dirname, '..', 'images', 'light', 'function.svg'),
      dark: path.join(__dirname, '..', 'images', 'dark', 'function.svg'),
    };

    return treeItem;
  }
}
