// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {PulsarClusterTreeDataProvider} from "./providers/pulsarClusterTreeDataProvider/explorer";
import {TreeExplorerController} from "./controllers/treeExplorerController";
import {ConfigController} from "./controllers/configController";
import {PulsarAdminProviders} from "./pulsarAdminProviders";
import * as Constants from "./common/constants";
import Telemetry from "./utils/telemetry";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext): Promise<void> {
	console.info('Welcome to the Apache Pulsar admin extension. There are many wonderful things to see and click.');

	console.debug('Building provider registry');
	const providerRegistry = new PulsarAdminProviders();

	console.debug('Building tree provider');
	const pulsarClusterTreeProvider = new PulsarClusterTreeDataProvider(providerRegistry, context);

	console.debug('Building subscriptions');
	const subscriptions = [
		vscode.window.registerTreeDataProvider(Constants.PROVIDER_CLUSTER_TREE, pulsarClusterTreeProvider),

		registerCommand(Constants.COMMAND_REMOVE_CLUSTER_CONFIG, ConfigController.removeSavedConfig),
		registerCommand(Constants.COMMAND_REFRESH_EXPLORER, () => TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider)),
		registerCommand(Constants.COMMAND_ADD_CLUSTER_CONFIG, () => ConfigController.showAddClusterConfigWizard(providerRegistry, context)),
		Telemetry.initialize(),
	];

	console.debug('Registering commands');
	subscriptions.forEach((element) => {
		context.subscriptions.push(element);
		console.log('Registered command');
	});
}

// This method is called when your extension is deactivated
export function deactivate(): void  {}


function registerCommand(command: string, callback: (...args: any[]) => any): vscode.Disposable {
	return vscode.commands.registerCommand(command, (...args: any[]) => { try{ callback(...args); }catch(e: any){ Telemetry.sendError(e); throw e; } });
}
