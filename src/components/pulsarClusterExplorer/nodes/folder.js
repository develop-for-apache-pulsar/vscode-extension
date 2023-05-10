"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderNode = void 0;
class FolderNode {
    constructor(pulsarAdmin, label, folderType, tenantName, namespace) {
        this.pulsarAdmin = pulsarAdmin;
        this.label = label;
        this.folderType = folderType;
        this.tenantName = tenantName;
        this.namespace = namespace;
    }
}
exports.FolderNode = FolderNode;
//# sourceMappingURL=folder.js.map