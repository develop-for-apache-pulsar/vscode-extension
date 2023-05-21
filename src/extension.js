"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const explorer_1 = require("./providers/pulsarClusterTreeDataProvider/explorer");
const treeExplorerController_1 = require("./controllers/treeExplorerController");
const configController_1 = require("./controllers/configController");
const pulsarAdminProviders_1 = require("./pulsarAdminProviders");
const constants_1 = require("./common/constants");
const telemetry_1 = require("./utils/telemetry");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
async function activate(context) {
    console.info('Welcome to the Apache Pulsar admin extension. There are many wonderful things to see and click.');
    global.extensionContext = context;
    console.debug('Building provider registry');
    const providerRegistry = new pulsarAdminProviders_1.PulsarAdminProviders();
    console.debug('Building tree provider');
    const pulsarClusterTreeProvider = new explorer_1.PulsarClusterTreeDataProvider(providerRegistry, context);
    console.debug('Building subscriptions');
    const subscriptions = [
        vscode.window.registerTreeDataProvider(constants_1.PROVIDER_CLUSTER_TREE, pulsarClusterTreeProvider),
        registerCommand(constants_1.COMMAND_REMOVE_CLUSTER_CONFIG, configController_1.ConfigController.removeSavedConfig),
        registerCommand(constants_1.COMMAND_REFRESH_EXPLORER, () => treeExplorerController_1.TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider)),
        registerCommand(constants_1.COMMAND_ADD_CLUSTER_CONFIG, () => configController_1.ConfigController.showAddClusterConfigWizard(providerRegistry)),
    ];
    console.debug('Registering commands');
    subscriptions.forEach((element) => {
        context.subscriptions.push(element);
        console.log('Registered command');
    });
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
function registerCommand(command, callback) {
    return vscode.commands.registerCommand(command, (...args) => { try {
        callback(...args);
    }
    catch (e) {
        telemetry_1.default.sendError(e);
        throw e;
    } });
}
