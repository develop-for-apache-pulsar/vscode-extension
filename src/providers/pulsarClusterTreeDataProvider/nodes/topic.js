"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicTree = exports.TopicNode = void 0;
const vscode = require("vscode");
const message_1 = require("./message");
const error_1 = require("./error");
const path = require("path");
const constants_1 = require("../../../common/constants");
class TopicNode extends vscode.TreeItem {
    constructor(pulsarAdmin, label, topicData) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.pulsarAdmin = pulsarAdmin;
        this.label = label;
        this.topicData = topicData;
        this.contextValue = constants_1.CONTEXT_VALUES.topic;
        this.description = topicData.Type;
        this.iconPath = {
            light: path.join(__dirname, '..', 'images', 'light', 'topic.svg'),
            dark: path.join(__dirname, '..', 'images', 'dark', 'topic.svg'),
        };
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
                    return [new message_1.MessageNode(constants_1.ExplorerMessageTypes.noTopics)];
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
}
exports.TopicTree = TopicTree;
