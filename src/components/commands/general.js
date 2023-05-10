"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PulsarAdminCommandUtils = void 0;
const vscode = require("vscode");
const sleep_1 = require("../../utils/sleep");
class PulsarAdminCommandUtils {
    static async showInfoMessage(message) {
        await vscode.window.showInformationMessage(message);
    }
    static async debounceActivation(needsActivationDebouncing) {
        if (needsActivationDebouncing) {
            await (0, sleep_1.sleep)(50);
            await vscode.commands.executeCommand('extension.vsPulsarAdminDebounceActivation');
        }
        return false;
    }
}
exports.PulsarAdminCommandUtils = PulsarAdminCommandUtils;
//# sourceMappingURL=general.js.map