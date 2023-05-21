"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageNode = void 0;
const vscode = require("vscode");
const constants_1 = require("../../../common/constants");
class MessageNode extends vscode.TreeItem {
    constructor(messageType, messageText = '', command = undefined) {
        super("", vscode.TreeItemCollapsibleState.None);
        this.messageType = messageType;
        this.messageText = messageText;
        this.command = command;
        this.contextValue = constants_1.CONTEXT_VALUES.message;
        this.command = command;
        switch (messageType) {
            case constants_1.ExplorerMessageTypes.noClusters:
                this.label = "(no clusters)";
                break;
            case constants_1.ExplorerMessageTypes.noTenants:
                this.label = "(no tenants)";
                break;
            case constants_1.ExplorerMessageTypes.noNamespaces:
                this.label = "(no namespaces)";
                break;
            case constants_1.ExplorerMessageTypes.noTopics:
                this.label = "(no topics)";
                break;
            case constants_1.ExplorerMessageTypes.noConnectorSinks:
                this.label = "(no sinks)";
                break;
            case constants_1.ExplorerMessageTypes.noConnectorSources:
                this.label = "(no sources)";
                break;
            case constants_1.ExplorerMessageTypes.noFunctions:
                this.label = "(no functions)";
                break;
            case constants_1.ExplorerMessageTypes.customMessage:
                this.label = messageText || "";
                break;
            default:
                this.label = "Unknown";
        }
    }
}
exports.MessageNode = MessageNode;
