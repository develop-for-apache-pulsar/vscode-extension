import {trace} from "../utils/traceDecorator";
import * as vscode from "vscode";
import {FunctionNode} from "../providers/pulsarClusterTreeDataProvider/nodes/function";
import {PulsarClusterTreeDataProvider} from "../providers/pulsarClusterTreeDataProvider/explorer";
import {TreeExplorerController} from "./treeExplorerController";
import {FunctionInstanceNode} from "../providers/pulsarClusterTreeDataProvider/nodes/functionInstance";
import DocumentHelper from "../utils/documentHelper";
import {TPulsarAdmin} from "../types/tPulsarAdmin";
import {TSavedProviderConfig} from "../types/tSavedProviderConfig";
import {TPulsarAdminProviderCluster} from "../types/tPulsarAdminProviderCluster";
import {TPulsarAdminProviderTenant} from "../types/tPulsarAdminProviderTenant";
import {FunctionConfig, FunctionConfigRuntimeEnum, FunctionStatus} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import * as fs from "fs";
import * as path from "path";
import {NamespaceNode} from "../providers/pulsarClusterTreeDataProvider/nodes/namespace";
import FunctionService from "../services/function/functionService";
import FunctionInstanceService from "../services/function/functionInstanceService";
import TopicMessageService from "../services/topicMessages/topicMessageService";
import {zipFolder} from "../utils/zip";
import WatchFunctionDeploymentTask from "../services/function/watchFunctionDeploymentTask";
import ProgressRunner from "../utils/progressRunner";
import WatchFunctionStoppingTask from "../services/function/watchFunctionStoppingTask";
import Logger from "../utils/logger";
import ZipFunctionPackageTask from "../services/function/zipFunctionPackageTask";
import WatchFunctionDeletingTask from "../services/function/watchFunctionDeletingTask";
import WatchFunctionRestartTask from "../services/function/watchFunctionRestartTask";

export default class FunctionController {
  public static chooseFunctionPackage(runtimeType: FunctionConfigRuntimeEnum, range: vscode.Range, fileFilters?: {[p: string]: string[]}): void {
    const opts: vscode.OpenDialogOptions = {
      canSelectFiles: (fileFilters !== undefined),
      canSelectFolders: (fileFilters === undefined),
      canSelectMany: false,
      openLabel: `Select ${(fileFilters !== undefined) ? 'file' : 'folder'}`,
      filters: fileFilters
    };

    vscode.window.showOpenDialog(opts).then((uris: vscode.Uri[] | undefined) => {
      if(uris === undefined) {
        return;
      }

      const uri = uris[0]; // Only one file can be selected

      // Find the range in the current document and replace with the path
      const editor = vscode.window.activeTextEditor;
      if(editor === undefined) {
        return;
      }

      const document = editor.document;
      const text = document.lineAt(range.start.line).text;
      if(text === undefined) {
        return;
      }

      const newText = text.replace(/(?<=:).*/i, ` ${uri.fsPath}`);

      editor.edit(editBuilder => {
        editBuilder.replace(document.lineAt(range.start.line).range, newText);
      });
    });

    // no op on error
  }

  public static async startFunction(functionNode: FunctionNode, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): Promise<void> {
    Logger.debug("Sending start command");
    const functionService = new FunctionService(functionNode.pulsarAdmin);
    const task = new WatchFunctionDeploymentTask(functionNode.tenantName, functionNode.namespaceName, functionNode.label, functionService, pulsarClusterTreeProvider);

    const startPromises = Promise.all([
      functionService.startFunction(functionNode.tenantName, functionNode.namespaceName, functionNode.label),
      new ProgressRunner<FunctionStatus>("Start function").run(task)
    ]);

    await startPromises.then(() => {
    }, (reason: any) => {
      Logger.error(reason);
      throw new Error(reason);
    }).finally(() => {
      TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
    });
  }

  public static async stopFunction(functionNode: FunctionNode, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): Promise<void> {
    Logger.debug("Sending stop command");
    const functionService = new FunctionService(functionNode.pulsarAdmin);
    const task = new WatchFunctionStoppingTask(functionNode.tenantName, functionNode.namespaceName, functionNode.label, functionService, pulsarClusterTreeProvider);

    const stopPromises = Promise.all([
      functionService.stopFunction(functionNode.tenantName, functionNode.namespaceName, functionNode.label),
      new ProgressRunner<FunctionStatus>("Stop function").run(task)
    ]);

    await stopPromises.then(() => {
    }, (reason: any) => {
      Logger.error(reason);
      throw new Error(reason);
    }).finally(() => {
      TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
    });
  }

  public static async restartFunction(functionNode: FunctionNode,pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): Promise<void> {
    Logger.debug("Sending restart command");
    const functionService = new FunctionService(functionNode.pulsarAdmin);
    const task = new WatchFunctionRestartTask(functionNode.tenantName, functionNode.namespaceName, functionNode.label, functionService, pulsarClusterTreeProvider);

    const restartPromises = Promise.all([
      functionService.restartFunction(functionNode.tenantName, functionNode.namespaceName, functionNode.label),
      new ProgressRunner<FunctionStatus>("Restart function").run(task)
    ]);

    await restartPromises.then(() => {
    }, (reason: any) => {
      Logger.error(reason);
      throw new Error(reason);
    }).finally(() => {
      TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
    });
  }

  public static showFunctionStatistics(functionNode: FunctionNode): void {
    Logger.debug("Show stats");
    const functionService = new FunctionService(functionNode.pulsarAdmin);

    functionService.getStatistics(functionNode.tenantName, functionNode.namespaceName, functionNode.label)
      .then(functionStatus => {
        DocumentHelper.openDocument(functionStatus, 'yaml').then(
          doc => DocumentHelper.showDocument(doc, true),
          vscode.window.showErrorMessage
        );
      })
      .catch(err => vscode.window.showErrorMessage(err.message));
  }

  public static showFunctionStatus(functionNode: FunctionNode): void {
    Logger.debug("Show status");
    const functionService = new FunctionService(functionNode.pulsarAdmin);

    functionService.getStatus(functionNode.tenantName, functionNode.namespaceName, functionNode.label)
      .then(functionStatus => {
        DocumentHelper.openDocument(functionStatus, 'yaml').then(
          doc => DocumentHelper.showDocument(doc, true),
          vscode.window.showErrorMessage
        );
      })
      .catch(err => vscode.window.showErrorMessage(err.message));
  }

  public static showFunctionInfo(functionNode: FunctionNode): void {
    Logger.debug("Show info");
    const functionService = new FunctionService(functionNode.pulsarAdmin);

    functionService.getFunctionInfo(functionNode.tenantName, functionNode.namespaceName, functionNode.label)
      .then(functionInfo => {
        DocumentHelper.openDocument(functionInfo, 'yaml').then(
          doc => DocumentHelper.showDocument(doc, true),
          vscode.window.showErrorMessage
        );
      })
      .catch(err => vscode.window.showErrorMessage(err.message));
  }

  @trace('Watch function topics')
  public static async watchFunctionTopics(functionNode: FunctionNode): Promise<void> {
    if(functionNode.functionConfig === undefined || functionNode.functionConfig.inputSpecs === undefined) {
      return;
    }

    Logger.debug("Watch topics");
    const topicMessageService = new TopicMessageService(functionNode.pulsarAdmin);

    // Open the input topics first
    let watchDetails: any[] = [];

    for (const inputTopicKey of Object.keys(functionNode.functionConfig.inputSpecs)) {
      watchDetails.push({
        topicAddress: inputTopicKey,
        providerTypeName: functionNode.providerTypeName,
        clusterName: functionNode.clusterName
      });
    }

    await topicMessageService.watchTopics(watchDetails).catch(err => vscode.window.showErrorMessage(err.message));

    watchDetails = [];

    if((functionNode.functionConfig.output?.length ?? 0) > 0) {
      watchDetails.push({
        topicAddress: functionNode.functionConfig.output,
        providerTypeName: functionNode.providerTypeName,
        clusterName: functionNode.clusterName
      });
    }

    if((functionNode.functionConfig.logTopic?.length ?? 0) > 0) {
      watchDetails.push({
        topicAddress: functionNode.functionConfig.logTopic,
        providerTypeName: functionNode.providerTypeName,
        clusterName: functionNode.clusterName
      });
    }

    if((functionNode.functionConfig.deadLetterTopic?.length ?? 0) > 0) {
      watchDetails.push({
        topicAddress: functionNode.functionConfig.deadLetterTopic,
        providerTypeName: functionNode.providerTypeName,
        clusterName: functionNode.clusterName
      });
    }

    await topicMessageService.watchTopics(watchDetails).catch(err => vscode.window.showErrorMessage(err.message));
  }

  public static async deleteFunction(functionNode: FunctionNode, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): Promise<void> {

    const functionService = new FunctionService(functionNode.pulsarAdmin);

    const confirmDelete = await vscode.window.showWarningMessage(`Are you sure you want to delete function '${functionNode.label}'?`, { modal: true }, 'Yes', 'No');
    if (confirmDelete !== 'Yes') {
      return;
    }

    const task = new WatchFunctionDeletingTask(functionNode.tenantName, functionNode.namespaceName, functionNode.label, functionService, pulsarClusterTreeProvider);

    Logger.debug("Sending delete command");
    const deletePromises = Promise.all([
      functionService.deleteFunction(functionNode.tenantName, functionNode.namespaceName, functionNode.label),
      new ProgressRunner<FunctionStatus>("Delete function").run(task)
    ]);

    await deletePromises.then(() => {
    }, (reason: any) => {
      Logger.error(reason);
      throw new Error(reason);
    }).finally(() => {
      TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
    });
  }

  public static startFunctionInstance(functionInstanceNode: FunctionInstanceNode, context: vscode.ExtensionContext, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): void {
    let instanceId: number;

    try{
      instanceId = parseInt(functionInstanceNode.label);
    }catch (e) {
      vscode.window.showErrorMessage(`Error parsing instanceId as number: ${e}`);
      return;
    }

    Logger.debug("Sending start instance command");
    const functionInstanceService = new FunctionInstanceService(functionInstanceNode.pulsarAdmin);

    functionInstanceService.startFunctionInstance(functionInstanceNode.tenantName, functionInstanceNode.namespaceName, functionInstanceNode.functionName, instanceId).then(() => {
      vscode.window.showInformationMessage(`Function instance '${functionInstanceNode.label}' started`);
      TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
    }).catch(err => vscode.window.showErrorMessage(err.message));
  }

  public static stopFunctionInstance(functionInstanceNode: FunctionInstanceNode, context: vscode.ExtensionContext, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): void {
    let instanceId: number;

    try{
      instanceId = parseInt(functionInstanceNode.label);
    }catch (e) {
      vscode.window.showErrorMessage(`Error parsing instanceId as number: ${e}`);
      return;
    }

    Logger.debug("Sending stop instance command");
    const functionInstanceService = new FunctionInstanceService(functionInstanceNode.pulsarAdmin);

    functionInstanceService.stopFunctionInstance(functionInstanceNode.tenantName, functionInstanceNode.namespaceName, functionInstanceNode.functionName, instanceId).then(() => {
      vscode.window.showInformationMessage(`Function instance '${functionInstanceNode.label}' stopped`);
      TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
    }).catch(err => vscode.window.showErrorMessage(err.message));
  }

  public static restartFunctionInstance(functionInstanceNode: FunctionInstanceNode, context: vscode.ExtensionContext, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): void {
    let instanceId: number;

    try{
      instanceId = parseInt(functionInstanceNode.label);
    }catch (e) {
      vscode.window.showErrorMessage(`Error parsing instanceId as number: ${e}`);
      return;
    }

    Logger.debug("Sending restart instance command");
    const functionInstanceService = new FunctionInstanceService(functionInstanceNode.pulsarAdmin);

    functionInstanceService.restartFunctionInstance(functionInstanceNode.tenantName, functionInstanceNode.namespaceName, functionInstanceNode.functionName, instanceId).then(() => {
      vscode.window.showInformationMessage(`Function instance '${functionInstanceNode.label}' restarted`);
      pulsarClusterTreeProvider.refresh();
    }).catch(err => vscode.window.showErrorMessage(err.message));
  }

  public static async showNewFunctionTemplate(namespaceNode: NamespaceNode) {
    Logger.debug("Showing new function template");
    const functionService = new FunctionService(namespaceNode.pulsarAdmin);
    const newFunctionTemplate = functionService.getFunctionTemplate('yaml', namespaceNode.providerTypeName, namespaceNode.clusterName, namespaceNode.tenantName, namespaceNode.label);

    DocumentHelper.openDocument(newFunctionTemplate, 'yaml').then(
      doc => DocumentHelper.showDocument(doc, false),
      vscode.window.showErrorMessage
    );
  }

  public static async deployFunction(pulsarClusterTreeProvider: PulsarClusterTreeDataProvider,
                                     context:vscode.ExtensionContext,
                                     functionConfig: FunctionConfig,
                                     providerConfig: TSavedProviderConfig,
                                     providerCluster: TPulsarAdminProviderCluster,
                                     providerTenant: TPulsarAdminProviderTenant,
                                     pulsarAdmin: TPulsarAdmin): Promise<void> {
    Logger.debug("Deploying function");

    // Find runtime package
    let functionRuntimeFile = FunctionService.findFunctionRuntimeFilePath(functionConfig);
    if(functionRuntimeFile === undefined) {
      vscode.window.showErrorMessage("Provide a valid file path for either 'py', 'jar', or 'go'.");
      return;
    }

    const functionPackageIsDir = fs.lstatSync(functionRuntimeFile).isDirectory();

    // Zip the package if it's a directory
    if(functionPackageIsDir) {
      Logger.debug("Zipping function package (this could take a bit of time)...");
      const functionRuntimeFolder = functionRuntimeFile; // It's actually the path to a folder

      const zipFileUri = vscode.Uri.file(path.join(context.globalStorageUri.fsPath, `${functionConfig.name}.zip`)); // Use vscode global storage path

      if(!fs.existsSync(context.globalStorageUri.fsPath)) {
        fs.mkdirSync(context.globalStorageUri.fsPath);
      }

      const task = new ZipFunctionPackageTask(functionRuntimeFolder, zipFileUri.fsPath);

      const zipPromises = Promise.all<[Promise<void>, Promise<void>]>([
        zipFolder(functionRuntimeFolder, zipFileUri.fsPath),
        new ProgressRunner<Uint8Array>("Creating function package").run(task)
      ]);

      await zipPromises.then(() => {
        functionRuntimeFile = zipFileUri.fsPath; //Reset the var to the zip file
      }, (reason: any) => {
        Logger.error(reason);
        try{ fs.rmSync(zipFileUri.fsPath, { force: true, maxRetries: 5, recursive: true, retryDelay: 250 }); }catch{} //Clean up
        throw new Error(reason);
      });
    }

    // Validate the function package exists
    if(!fs.existsSync(functionRuntimeFile)) {
      throw new Error(`File ${functionRuntimeFile} does not exist`);
    }

    pulsarAdmin = pulsarAdmin!;
    const functionService = new FunctionService(pulsarAdmin);

    // Attempt to delete the function if it already exists
    try{
      Logger.debug("Attempting to remove existing function");
      await functionService.deleteFunction(<string>functionConfig.tenant, <string>functionConfig.namespace, <string>functionConfig.name);
    }catch (e) {
      // no op
    }

    const task = new WatchFunctionDeploymentTask(<string>functionConfig.tenant, <string>functionConfig.namespace, <string>functionConfig.name, functionService, pulsarClusterTreeProvider);

    Logger.debug("Registering function");
    const deployPromises = Promise.all([
      functionService.createFunction(functionConfig, functionRuntimeFile),
      new ProgressRunner<FunctionStatus>("Deploy function").run(task)
    ]);

    await deployPromises.then(() => {
    }, (reason: any) => {
      Logger.error(reason);
      throw new Error(reason);
    }).finally(() => {
      if(functionPackageIsDir) {
        try{ fs.rmSync(functionRuntimeFile!, { force: true, maxRetries: 5, recursive: true, retryDelay: 250 }); }catch{} //Clean up
      }
    });
  }
}