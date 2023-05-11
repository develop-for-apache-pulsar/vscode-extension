import * as vscode from "vscode";
import { TPulsarAdmin } from "../../../types/TPulsarAdmin";
import {CONTEXT_VALUES, FolderTypes} from "./types";

export interface IFolderNode extends vscode.TreeItem {
  readonly folderType: FolderTypes;
  readonly namespace: string;
  readonly tenantName: string;
  readonly pulsarAdmin: TPulsarAdmin;
}

export class FolderNode extends vscode.TreeItem implements IFolderNode {
  constructor(readonly pulsarAdmin: TPulsarAdmin, readonly label: string, readonly folderType: FolderTypes, readonly tenantName: string, readonly namespace: string) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.contextValue = CONTEXT_VALUES.folder;
  }
}
