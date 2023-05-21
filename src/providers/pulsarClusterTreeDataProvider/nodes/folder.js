"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderNode = void 0;
const vscode = require("vscode");
const constants_1 = require("../../../common/constants");
class FolderNode extends vscode.TreeItem {
    constructor(pulsarAdmin, label, folderType, tenantName, namespace) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.pulsarAdmin = pulsarAdmin;
        this.label = label;
        this.folderType = folderType;
        this.tenantName = tenantName;
        this.namespace = namespace;
        this.contextValue = constants_1.CONTEXT_VALUES.folder;
    }
}
exports.FolderNode = FolderNode;
