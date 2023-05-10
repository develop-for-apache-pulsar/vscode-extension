import * as vscode from "vscode";
import { TPulsarAdmin } from "../../../types/TPulsarAdmin";
import {FolderTypes, TBaseNodeWithPulsarAdmin} from "./types";

export interface IFolderNode extends TBaseNodeWithPulsarAdmin {
  readonly folderType: FolderTypes;
  readonly namespace: string;
  readonly tenantName: string;
}

export class FolderNode implements IFolderNode, vscode.TreeItem {
  constructor(readonly pulsarAdmin: TPulsarAdmin, readonly label: string, readonly folderType: FolderTypes, readonly tenantName: string, readonly namespace: string) {}
}
