"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicTree = exports.TopicNode = void 0;
const vscode = require("vscode");
const types_1 = require("./types");
const message_1 = require("./message");
const error_1 = require("./error");
const path = require("path");
class TopicNode {
    constructor(pulsarAdmin, label, topicData) {
        this.pulsarAdmin = pulsarAdmin;
        this.label = label;
        this.topicData = topicData;
    }
}
exports.TopicNode = TopicNode;
class TopicTree {
    constructor(pulsarAdmin) {
        this.pulsarAdmin = pulsarAdmin;
    }
    async getChildren(tenantName, namespaceName) {
        try {
            return this.pulsarAdmin.ListTopics(tenantName, namespaceName).then((topics) => {
                if (topics.length === 0) {
                    return [new message_1.MessageNode(types_1.MessageTypes.noTopics)];
                }
                return topics.map((topic) => {
                    return new TopicNode(this.pulsarAdmin, topic.Name, topic);
                });
            }).catch((error) => {
                return [new error_1.ErrorNode(error)];
            });
        }
        catch (err) {
            return [new error_1.ErrorNode(err)];
        }
    }
    static getTreeItem(topicNode) {
        const treeItem = new vscode.TreeItem(topicNode.topicData.Name, vscode.TreeItemCollapsibleState.None);
        treeItem.contextValue = types_1.CONTEXT_VALUES.topic;
        treeItem.description = topicNode.topicData.Type;
        treeItem.iconPath = {
            light: path.join(__dirname, '..', 'images', 'light', 'topic.svg'),
            dark: path.join(__dirname, '..', 'images', 'dark', 'topic.svg'),
        };
        return treeItem;
    }
}
exports.TopicTree = TopicTree;
//# sourceMappingURL=topic.js.map