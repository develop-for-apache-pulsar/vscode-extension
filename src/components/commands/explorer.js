"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PulsarAdminTreeCommands = void 0;
const topic_1 = require("../pulsarClusterExplorer/nodes/topic");
class PulsarAdminTreeCommands {
    static refreshTreeProvider(treeProvider, context) {
        treeProvider.refresh();
    }
    static initializeTreeProvider(treeProvider, context) {
        treeProvider.initialize();
    }
    static viewTopicDetails(explorerNode, context) {
        // This should be a topic node
        if (typeof explorerNode !== typeof topic_1.TopicNode) {
            return;
        }
    }
}
exports.PulsarAdminTreeCommands = PulsarAdminTreeCommands;
//# sourceMappingURL=explorer.js.map