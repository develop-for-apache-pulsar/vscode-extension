// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {host} from "./utils/host";
import {PulsarAdminExplorerTree} from "./components/pulsarClusterExplorer/explorer";
import {PulsarAdminTreeCommands} from "./components/commands/explorer";
import {PulsarAdminConfigCommands} from "./components/commands/config";
import {PulsarAdminCommandUtils} from "./components/commands/general";
import {PulsarAdminProviderNode} from "./components/pulsarClusterExplorer/nodes/pulsarAdminProvider";
import {PulsarAdminProviders} from "./components/pulsarAdminProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext): Promise<void> {
	console.info('Welcome to the Apache Pulsar admin extension. There are many wonderful things to see and click.');

	console.debug('Building provider registry');
	const providerRegistry = new PulsarAdminProviders();

	console.debug('Building tree provider');
	const pulsarClusterTreeProvider = new PulsarAdminExplorerTree(host, providerRegistry);

	console.debug('Building subscriptions');
	const subscriptions = [
		vscode.window.registerTreeDataProvider('extension.vsPulsarClusterExplorer', pulsarClusterTreeProvider),

		registerCommand('extension.vsPulsarAdminDebounceActivation', () => {}),
		registerCommand('extension.showInfoMessage', (message: string) => PulsarAdminCommandUtils.showInfoMessage(message)),
		registerCommand('extension.vsPulsarAdminRemoveClusterConfig', (explorerNode: PulsarAdminProviderNode) => PulsarAdminConfigCommands.removeSavedConfig(host, explorerNode, context)),
		registerCommand('extension.vsPulsarAdminRefreshExplorer', () => PulsarAdminTreeCommands.refreshTreeProvider(pulsarClusterTreeProvider, context)),
		registerCommand('extension.vsPulsarAdminAddClusterConfig', () => PulsarAdminConfigCommands.showAddClusterConfigWizard(needsActivationDebouncing, context, providerRegistry)),
		registerCommand('extension.vsPulsarAdminViewTopicDetails', (explorerNode) => PulsarAdminTreeCommands.viewTopicDetails(explorerNode, context)),
	];

	console.debug('Registering commands');
	subscriptions.forEach((element) => {
		context.subscriptions.push(element);
		console.log('Registered command');
	});

	//console.debug('Initializing tree provider');
	//PulsarAdminTreeCommands.initializeTreeProvider(pulsarClusterTreeProvider, context);
}

// This method is called when your extension is deactivated
export function deactivate(): void  {}

const needsActivationDebouncing = true;

function registerCommand(command: string, callback: (...args: any[]) => any): vscode.Disposable {
	return vscode.commands.registerCommand(command, callback);
}
