import * as vscode from "vscode";
import { TPulsarAdmin } from "../../../types/tPulsarAdmin";
import {CONTEXT_VALUES, ExplorerFolderTypes} from "../../../common/constants";

export interface IFolderNode extends vscode.TreeItem {
  readonly folderType: ExplorerFolderTypes;
  readonly namespace: string;
  readonly tenantName: string;
  readonly pulsarAdmin: TPulsarAdmin;
}

export class FolderNode extends vscode.TreeItem implements IFolderNode {
  constructor(readonly pulsarAdmin: TPulsarAdmin, readonly label: string, readonly folderType: ExplorerFolderTypes, readonly tenantName: string, readonly namespace: string) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.contextValue = CONTEXT_VALUES.folder;
  }
}
