import {CONTEXT_VALUES, TBaseNode} from "./types";
import * as vscode from "vscode";

export interface IErrorNode extends TBaseNode {
  readonly errorText: string;
}

export class ErrorNode implements IErrorNode {
  constructor(private readonly errorObj: any) {
    if(errorObj.response && errorObj.response.data) {
      this.errorText = errorObj.response.data.message;
    }

    this.errorText += " ("+errorObj.message+")";
  }

  readonly errorText: string = '';
  readonly label: string = '';
}

export class ErrorTree {
  static getTreeItem(errorNode: IErrorNode): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(errorNode.errorText, vscode.TreeItemCollapsibleState.None);
    treeItem.contextValue = CONTEXT_VALUES.error;

    return treeItem;
  }
}