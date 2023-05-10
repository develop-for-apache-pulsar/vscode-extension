"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const host_1 = require("./utils/host");
const explorer_1 = require("./components/pulsarClusterExplorer/explorer");
const explorer_2 = require("./components/commands/explorer");
const config_1 = require("./components/commands/config");
const general_1 = require("./components/commands/general");
const pulsarAdminProvider_1 = require("./components/pulsarAdminProvider");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
async function activate(context) {
    console.info('Welcome to the Apache Pulsar admin extension. There are many wonderful things to see and click.');
    console.debug('Building provider registry');
    const providerRegistry = new pulsarAdminProvider_1.PulsarAdminProviders();
    console.debug('Building tree provider');
    const pulsarClusterTreeProvider = new explorer_1.PulsarAdminExplorerTree(host_1.host, providerRegistry);
    console.debug('Building subscriptions');
    const subscriptions = [
        vscode.window.registerTreeDataProvider('extension.vsPulsarClusterExplorer', pulsarClusterTreeProvider),
        registerCommand('extension.vsPulsarAdminDebounceActivation', () => { }),
        registerCommand('extension.showInfoMessage', (message) => general_1.PulsarAdminCommandUtils.showInfoMessage(message)),
        registerCommand('extension.vsPulsarAdminRemoveClusterConfig', (explorerNode) => config_1.PulsarAdminConfigCommands.removeSavedConfig(host_1.host, explorerNode, context)),
        registerCommand('extension.vsPulsarAdminRefreshExplorer', () => explorer_2.PulsarAdminTreeCommands.refreshTreeProvider(pulsarClusterTreeProvider, context)),
        registerCommand('extension.vsPulsarAdminAddClusterConfig', () => config_1.PulsarAdminConfigCommands.showAddClusterConfigWizard(needsActivationDebouncing, context, providerRegistry)),
        registerCommand('extension.vsPulsarAdminViewTopicDetails', (explorerNode) => explorer_2.PulsarAdminTreeCommands.viewTopicDetails(explorerNode, context)),
    ];
    console.debug('Registering commands');
    subscriptions.forEach((element) => {
        context.subscriptions.push(element);
        console.log('Registered command');
    });
    //console.debug('Initializing tree provider');
    //PulsarAdminTreeCommands.initializeTreeProvider(pulsarClusterTreeProvider, context);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
const needsActivationDebouncing = true;
function registerCommand(command, callback) {
    return vscode.commands.registerCommand(command, callback);
}
//# sourceMappingURL=extension.js.map