// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {PulsarClusterTreeDataProvider} from "./providers/pulsarClusterTreeDataProvider/explorer";
import {TreeExplorerController} from "./controllers/treeExplorerController";
import {ConfigController} from "./controllers/configController";
import {PulsarAdminProviders} from "./pulsarAdminProviders";
import * as Constants from "./common/constants";
//import Telemetry from "./utils/telemetry";
import TopicMessageController from "./controllers/topicMessageController";
import {TopicNode} from "./providers/pulsarClusterTreeDataProvider/nodes/topic";
import {PulsarAdminProviderNode} from "./providers/pulsarClusterTreeDataProvider/nodes/pulsarAdminProvider";
import {NamespaceNode} from "./providers/pulsarClusterTreeDataProvider/nodes/namespace";
import TopicController from "./controllers/topicController";
import {FunctionNode} from "./providers/pulsarClusterTreeDataProvider/nodes/function";
import FunctionController from "./controllers/functionController";
import {FunctionInstanceNode} from "./providers/pulsarClusterTreeDataProvider/nodes/functionInstance";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext): Promise<void> {
	console.log('Welcome to the Apache Pulsar admin extension. There are many wonderful things to see and click.');

	console.log('Building provider registry');
	const providerRegistry = new PulsarAdminProviders();

	console.log('Building tree provider');
	const pulsarClusterTreeProvider = new PulsarClusterTreeDataProvider(providerRegistry, context);

	console.log('Building subscriptions');
	const subscriptions = [
		vscode.window.registerTreeDataProvider(Constants.PROVIDER_CLUSTER_TREE, pulsarClusterTreeProvider),

		registerCommand(Constants.COMMAND_REMOVE_CLUSTER_CONFIG, (explorerName: PulsarAdminProviderNode) => ConfigController.removeSavedConfig(explorerName, pulsarClusterTreeProvider)),
		registerCommand(Constants.COMMAND_REFRESH_EXPLORER, () => TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider)),
		registerCommand(Constants.COMMAND_ADD_CLUSTER_CONFIG, () => ConfigController.showAddClusterConfigWizard(providerRegistry, context, pulsarClusterTreeProvider)),
		registerReadonlyEditorProvider(Constants.TOPIC_MESSAGE_CUSTOM_EDITOR_VIEW_TYPE, TopicMessageController.createTopicMessageEditorProvider(context)),
		registerCommand(Constants.COMMAND_WATCH_TOPIC_MESSAGES, (explorerNode: TopicNode) => TopicMessageController.watchTopicMessages(explorerNode)),
		registerCommand(Constants.COMMAND_CREATE_TOPIC, (explorerNode: NamespaceNode) => TopicController.showNewTopicWizard(explorerNode, context, pulsarClusterTreeProvider)),
		registerCommand(Constants.COMMAND_SHOW_TOPIC_SCHEMA, (explorerNode: TopicNode) => TopicController.showTopicSchemaDetails(explorerNode)),
		registerCommand(Constants.COMMAND_TOPIC_STATISTICS, (explorerNode: TopicNode) => TopicController.showTopicStatistics(explorerNode)),
		registerCommand(Constants.COMMAND_TOPIC_PROPERTIES, (explorerNode: TopicNode) => TopicController.showTopicProperties(explorerNode)),
		registerCommand(Constants.COMMAND_DELETE_TOPIC, (explorerNode: TopicNode) => TopicController.deleteTopic(explorerNode, pulsarClusterTreeProvider)),
		registerCommand(Constants.COMMAND_START_FUNCTION, (explorerNode: FunctionNode) => FunctionController.startFunction(explorerNode, pulsarClusterTreeProvider)),
		registerCommand(Constants.COMMAND_STOP_FUNCTION, (explorerNode: FunctionNode) => FunctionController.stopFunction(explorerNode, pulsarClusterTreeProvider)),
		registerCommand(Constants.COMMAND_RESTART_FUNCTION, (explorerNode: FunctionNode) => FunctionController.restartFunction(explorerNode, pulsarClusterTreeProvider)),
		registerCommand(Constants.COMMAND_FUNCTION_STATISTICS, (explorerNode: FunctionNode) => FunctionController.showFunctionStatistics(explorerNode)),
		registerCommand(Constants.COMMAND_FUNCTION_STATUS, (explorerNode: FunctionNode) => FunctionController.showFunctionStatus(explorerNode)),
		registerCommand(Constants.COMMAND_FUNCTION_INFO, (explorerNode: FunctionNode) => FunctionController.showFunctionInfo(explorerNode)),
		registerCommand(Constants.COMMAND_FUNCTION_DELETE, (explorerNode: FunctionNode) => FunctionController.deleteFunction(explorerNode, pulsarClusterTreeProvider)),
		registerCommand(Constants.COMMAND_FUNCTION_WATCH_TOPICS, (explorerNode: FunctionNode) => FunctionController.watchFunctionTopics(explorerNode)),
		registerCommand(Constants.COMMAND_START_FUNCTION_INSTANCE, (explorerNode: FunctionInstanceNode) => FunctionController.startFunctionInstance(explorerNode, context, pulsarClusterTreeProvider)),
		registerCommand(Constants.COMMAND_STOP_FUNCTION_INSTANCE, (explorerNode: FunctionInstanceNode) => FunctionController.stopFunctionInstance(explorerNode, context, pulsarClusterTreeProvider)),
		registerCommand(Constants.COMMAND_RESTART_FUNCTION_INSTANCE, (explorerNode: FunctionInstanceNode) => FunctionController.restartFunctionInstance(explorerNode, context, pulsarClusterTreeProvider)),

		//Telemetry.initialize(),
	];

	console.log('Registering commands');
	subscriptions.forEach((element) => {
		context.subscriptions.push(element);
		console.log('Registered command');
	});
}

// This method is called when your extension is deactivated
export function deactivate(): void  {}

function registerCommand(command: string, callback: (...args: any[]) => any): vscode.Disposable {
	return vscode.commands.registerCommand(command, (...args: any[]) => { callback(...args); });
}

function registerReadonlyEditorProvider(viewType: string, provider: vscode.CustomReadonlyEditorProvider): vscode.Disposable {
	return vscode.window.registerCustomEditorProvider(viewType, provider);
}