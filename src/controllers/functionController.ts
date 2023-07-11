import {trace} from "../utils/traceDecorator";
import * as vscode from "vscode";
import {FunctionNode} from "../providers/pulsarClusterTreeDataProvider/nodes/function";
import {PulsarClusterTreeDataProvider} from "../providers/pulsarClusterTreeDataProvider/explorer";
import {TreeExplorerController} from "./treeExplorerController";
import {FunctionInstanceNode} from "../providers/pulsarClusterTreeDataProvider/nodes/functionInstance";
import * as YAML from "yaml";
import TextDocumentHelper from "../utils/textDocumentHelper";
import {ITopicNode, TopicNode} from "../providers/pulsarClusterTreeDataProvider/nodes/topic";
import TopicMessageController from "./topicMessageController";
import TopicController from "./topicController";
import {TPulsarAdmin} from "../types/tPulsarAdmin";
import {TSavedProviderConfig} from "../types/tSavedProviderConfig";
import {TPulsarAdminProviderCluster} from "../types/tPulsarAdminProviderCluster";
import {TPulsarAdminProviderTenant} from "../types/tPulsarAdminProviderTenant";
import {FunctionConfig, FunctionConfigRuntimeEnum, FunctionStatus} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import * as fs from "fs";
import * as fflate from "fflate";
import ErrnoException = NodeJS.ErrnoException;
import * as path from "path";
import {NamespaceNode} from "../providers/pulsarClusterTreeDataProvider/nodes/namespace";
import * as assert from "assert";
import {set} from "yaml/dist/schema/yaml-1.1/set";

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

  @trace('Start Function')
  public static startFunction(functionNode: FunctionNode, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): void {
    functionNode.pulsarAdmin.StartFunction(functionNode.tenantName, functionNode.namespaceName, functionNode.label).then(() => {
      vscode.window.showInformationMessage(`Starting function '${functionNode.label}', polling for status...`);
      functionNode.description = 'Starting';
      functionNode.collapsibleState = vscode.TreeItemCollapsibleState.None;
      pulsarClusterTreeProvider.refresh(functionNode);

      let interval:any = null;

      // Stop polling after 120 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
        vscode.window.showErrorMessage(`Timed out waiting for function '${functionNode.label}' to start`);
        TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
      }, (120 * 1000));

      let i = 0;

      // Poll the function status until it is running
      interval = setInterval(async () => {
        i++;
        functionNode.description = `Starting ${ '.'.repeat(i % 5) }`;
        pulsarClusterTreeProvider.refresh(functionNode);

        try{
          const status:any = await functionNode.pulsarAdmin.FunctionStatus(functionNode.tenantName, functionNode.namespaceName, functionNode.label);

          if (status !== undefined && status.numRunning !== undefined && status.numRunning > 0) {
            clearTimeout(timeout);
            clearInterval(interval);
            vscode.window.showInformationMessage(`Function '${functionNode.label}' started in ${i} seconds with ${status.numRunning} instances`);
            TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
          }
        }catch (e) {
          console.log(e);
          vscode.window.showErrorMessage(`Could not poll function '${functionNode.label}': ${e}`);
          clearInterval(interval);
          clearTimeout(timeout);
          TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
        }
      }, 1000);

    }).catch((e) => {
      vscode.window.showErrorMessage(`Error trying to start function '${functionNode.label}': ${e}`);
      console.log(e);
    });
  }

  @trace('Stop Function')
  public static stopFunction(functionNode: FunctionNode, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): void {
    functionNode.pulsarAdmin.StopFunction(functionNode.tenantName, functionNode.namespaceName, functionNode.label).then(() => {
      vscode.window.showInformationMessage(`Stopping function '${functionNode.label}', polling for status...`);
      functionNode.description = 'Stopping';
      functionNode.collapsibleState = vscode.TreeItemCollapsibleState.None;
      pulsarClusterTreeProvider.refresh(functionNode);

      let interval:any = null;

      // Stop polling after N seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
        vscode.window.showErrorMessage(`Timed out waiting for function '${functionNode.label}' to stop`);
        TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
      }, (30 * 1000));

      let i = 0;

      // Poll the function status until it is stopped
      interval = setInterval(async () => {
        i++;
        functionNode.description = `Stopping ${ '.'.repeat(i % 5) }`;
        pulsarClusterTreeProvider.refresh(functionNode);

        try{
          const status:any = await functionNode.pulsarAdmin.FunctionStatus(functionNode.tenantName, functionNode.namespaceName, functionNode.label);

          if (status !== undefined && status.numRunning !== undefined && status.numRunning < 1) {
            clearTimeout(timeout);
            clearInterval(interval);
            vscode.window.showInformationMessage(`Function '${functionNode.label}' stopped in ${i} second${i>1?'s':''}`);
            TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
          }
        }catch (e) {
          console.log(e);
          vscode.window.showErrorMessage(`Could not poll function '${functionNode.label}': ${e}`);
          clearInterval(interval);
          clearTimeout(timeout);
          TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
        }
      }, 1000);
    }).catch((e) => {
      vscode.window.showErrorMessage(`Error stopping function '${functionNode.label}': ${e}`);
      console.log(e);
    });
  }

  @trace('Restart Function')
  public static restartFunction(functionNode: FunctionNode,pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): void {
    functionNode.pulsarAdmin.RestartFunction(functionNode.tenantName, functionNode.namespaceName, functionNode.label).then(() => {
      vscode.window.showInformationMessage(`Restarting function '${functionNode.label}', polling for status...`);
      functionNode.description = 'Starting';
      functionNode.collapsibleState = vscode.TreeItemCollapsibleState.None;
      pulsarClusterTreeProvider.refresh(functionNode);

      let interval:any = null;

      // Stop polling after 120 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
        vscode.window.showErrorMessage(`Timed out waiting for function '${functionNode.label}' to restart`);
        TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
      }, (120 * 1000));

      let i = 0;

      // Poll the function status until it is running
      interval = setInterval(async () => {
        i++;
        functionNode.description = `Restarting ${ '.'.repeat(i % 5) }`;
        pulsarClusterTreeProvider.refresh(functionNode);

        try{
          const status:any = await functionNode.pulsarAdmin.FunctionStatus(functionNode.tenantName, functionNode.namespaceName, functionNode.label);

          if (status !== undefined && status.numRunning !== undefined && status.numRunning > 0) {
            clearTimeout(timeout);
            clearInterval(interval);
            vscode.window.showInformationMessage(`Function '${functionNode.label}' restarted in ${i} seconds with ${status.numRunning} instances`);
            TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
          }
        }catch (e) {
          console.log(e);
          vscode.window.showErrorMessage(`Could not poll function '${functionNode.label}': ${e}`);
          clearInterval(interval);
          clearTimeout(timeout);
          TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
        }
      }, 1000);
    }).catch((e) => {
      vscode.window.showErrorMessage(`Error trying to restart function '${functionNode.label}': ${e}`);
      console.log(e);
    });
  }

  @trace('Function statistics')
  public static showFunctionStatistics(functionNode: FunctionNode): void {
    functionNode.pulsarAdmin.FunctionStats(functionNode.tenantName, functionNode.namespaceName, functionNode.label).then(async (stats) => {
      if (stats === undefined) {
        vscode.window.showErrorMessage(`Error occurred getting function statistics`);
        return;
      }

      const documentContent = YAML.stringify(stats, null, 2);
      await TextDocumentHelper.openDocument(documentContent, 'yaml');
    }).catch((e) => {
      vscode.window.showErrorMessage(`Error occurred getting function statistics: ${e}`);
      console.log(e);
    });
  }

  @trace('Function status')
  public static showFunctionStatus(functionNode: FunctionNode): void {
    functionNode.pulsarAdmin.FunctionStatus(functionNode.tenantName, functionNode.namespaceName, functionNode.label).then(async (status) => {
      if (status === undefined) {
        vscode.window.showErrorMessage(`Error occurred getting function status`);
        return;
      }

      const documentContent = YAML.stringify(status, null, 2);
      await TextDocumentHelper.openDocument(documentContent, 'yaml');
    }).catch((e) => {
      vscode.window.showErrorMessage(`Error occurred getting function status: ${e}`);
      console.log(e);
    });
  }

  @trace('Function info')
  public static async showFunctionInfo(functionNode: FunctionNode): Promise<void> {
    const documentContent = YAML.stringify(functionNode.functionConfig, null, 2);
    await TextDocumentHelper.openDocument(documentContent, 'yaml');
  }

  @trace('Show function topics')
  public static async watchFunctionTopics(functionNode: FunctionNode): Promise<void> {
    if(functionNode.functionConfig === undefined || functionNode.functionConfig.inputSpecs === undefined) {
      return;
    }

    let watchPromises: Promise<void>[] = [];

    // Open the input topics first

    for (const inputTopicKey of Object.keys(functionNode.functionConfig.inputSpecs)) {
      try{
        const inputTopicNode: ITopicNode = await this.buildTopicNode(functionNode.pulsarAdmin, inputTopicKey, functionNode.providerTypeName, functionNode.clusterName);
        watchPromises.push(TopicMessageController.watchTopicMessages(inputTopicNode));
      } catch(e) {
        console.log(e);
      }
    }

    Promise.all<void>(watchPromises).then(() => {
      // no op
    }).catch((e) => {
      vscode.window.showErrorMessage(`Error occurred watching input topic: ${e}`);
      console.log(e);
    });

    watchPromises = [];

    // Then open everything else
    try{
      if(functionNode.functionConfig.output !== undefined && functionNode.functionConfig.output !== null && functionNode.functionConfig.output.length > 0) {
        const outputTopicNode: ITopicNode = await this.buildTopicNode(functionNode.pulsarAdmin, functionNode.functionConfig.output, functionNode.providerTypeName, functionNode.clusterName);
        watchPromises.push(TopicMessageController.watchTopicMessages(outputTopicNode));
      }
    } catch(e) {
      vscode.window.showErrorMessage(`Error occurred watching output topic: ${e}`);
      console.log(e);
    }

    try{
      if(functionNode.functionConfig.logTopic !== undefined && functionNode.functionConfig.logTopic !== null && functionNode.functionConfig.logTopic.length > 0) {
        const logTopicNode: ITopicNode = await this.buildTopicNode(functionNode.pulsarAdmin, functionNode.functionConfig.logTopic, functionNode.providerTypeName, functionNode.clusterName);
        watchPromises.push(TopicMessageController.watchTopicMessages(logTopicNode));
      }
    }catch (e) {
      vscode.window.showErrorMessage(`Error occurred watching log topic: ${e}`);
      console.log(e);
    }

    try{
      if(functionNode.functionConfig.deadLetterTopic !== undefined && functionNode.functionConfig.deadLetterTopic !== null && functionNode.functionConfig.deadLetterTopic.length > 0) {
        const deadLetterTopicNode: ITopicNode = await this.buildTopicNode(functionNode.pulsarAdmin, functionNode.functionConfig.deadLetterTopic, functionNode.providerTypeName, functionNode.clusterName);
        watchPromises.push(TopicMessageController.watchTopicMessages(deadLetterTopicNode));
      }
    }catch(e) {
      vscode.window.showErrorMessage(`Error occurred watching dead letter topic: ${e}`);
      console.log(e);
    }

    Promise.all<void>(watchPromises).then(() => {
      //no op
    }).catch((e) => {
      vscode.window.showErrorMessage(`Error occurred watching topic: ${e}`);
      console.log(e);
    });
  }

  @trace('Delete function')
  public static async deleteFunction(functionNode: FunctionNode, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): Promise<void> {
    functionNode.pulsarAdmin.DeleteFunction(functionNode.tenantName, functionNode.namespaceName, functionNode.label).then(() => {
      vscode.window.showInformationMessage(`Function '${functionNode.label}' deleted`);
      TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
    }).catch((e) => {
      vscode.window.showErrorMessage(`Error deleting function: ${e}`);
      console.log(e);
    });
  }

  @trace('Start function instance')
  public static startFunctionInstance(functionInstanceNode: FunctionInstanceNode, context: vscode.ExtensionContext, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): void {
    const instanceId = this.parseInstanceId(functionInstanceNode.label);

    if(instanceId === undefined) {
      return;
    }

    functionInstanceNode.pulsarAdmin.StartFunction(functionInstanceNode.tenantName, functionInstanceNode.namespaceName, functionInstanceNode.functionName, instanceId).then(() => {
      vscode.window.showInformationMessage(`Function instance '${functionInstanceNode.label}' started`);
      TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
    }).catch((e) => {
      vscode.window.showErrorMessage(`Error starting function instance: ${e}`);
      console.log(e);
    });
  }

  @trace('Stop function instance')
  public static stopFunctionInstance(functionInstanceNode: FunctionInstanceNode, context: vscode.ExtensionContext, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): void {
    const instanceId = this.parseInstanceId(functionInstanceNode.label);

    if(instanceId === undefined) {
      return;
    }

    functionInstanceNode.pulsarAdmin.StopFunction(functionInstanceNode.tenantName, functionInstanceNode.namespaceName, functionInstanceNode.functionName, instanceId).then(() => {
      vscode.window.showInformationMessage(`Function instance '${functionInstanceNode.label}' stopped`);
      TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
    }).catch((e) => {
      vscode.window.showErrorMessage(`Error stopping function instance: ${e}`);
      console.log(e);
    });
  }

  @trace('Restart function instance')
  public static restartFunctionInstance(functionInstanceNode: FunctionInstanceNode, context: vscode.ExtensionContext, pulsarClusterTreeProvider: PulsarClusterTreeDataProvider): void {
    const instanceId = this.parseInstanceId(functionInstanceNode.label);

    if(instanceId === undefined) {
      return;
    }

    functionInstanceNode.pulsarAdmin.RestartFunction(functionInstanceNode.tenantName, functionInstanceNode.namespaceName, functionInstanceNode.functionName, instanceId).then(() => {
      vscode.window.showInformationMessage(`Function instance '${functionInstanceNode.label}' restarted`);
      TreeExplorerController.refreshTreeProvider(pulsarClusterTreeProvider);
    }).catch((e) => {
      vscode.window.showErrorMessage(`Error restarting function instance: ${e}`);
      console.log(e);
    });
  }

  @trace('Show new function template')
  public static async showNewFunctionTemplate(explorerNode: NamespaceNode) {
    const newFunctionTemplate: any = {
      tenant: explorerNode.tenantName,
      namespace: explorerNode.label,
      name: '',
      className: '',
      inputs: [],
      parallelism: 1,
      output: null,
      logTopic: null,
      deadLetterTopic: null,
      autoAck: true,
      py: null,
      go: null,
      jar: null
    };

    const documentContent = YAML.stringify(newFunctionTemplate, null, 2);
    await TextDocumentHelper.openDocument(documentContent, 'yaml');
  }

  private static parseInstanceId(instanceId: string): number | undefined {
    try{
      return parseInt(instanceId);
    }catch (e) {
      vscode.window.showErrorMessage(`Error parsing instanceId as number: ${e}`);
      console.log(e);
    }

    return undefined;
  }

  private static async buildTopicNode(pulsarAdmin: TPulsarAdmin, topicAddress: string, providerTypeName: string, clusterName: string): Promise<ITopicNode> {
    let parsedTopicAddress: URL;

    if(!topicAddress.startsWith('persistent') && !topicAddress.startsWith('non-persistent')) {
      // The topic address is not a full URL, so we need to attempt to fix
      const tenantName = topicAddress.split('/')[0];
      const namespaceName = topicAddress.split('/')[1];
      const topicName = topicAddress.split('/')[2];
      console.log(topicAddress);
      console.log(tenantName);
      console.log(namespaceName);
      console.log(topicName);

      let exists = await pulsarAdmin.TopicExists('persistent', tenantName, namespaceName, topicName);
      if(exists === true){
        topicAddress = `persistent://${tenantName}/${namespaceName}/${topicName}`;
      }else{
        exists = await pulsarAdmin.TopicExists('non-persistent', tenantName, namespaceName, topicName);
        if(exists === true){
          topicAddress = `non-persistent://${tenantName}/${namespaceName}/${topicName}`;
        }
      }

      if(exists === false) {
        throw new Error(`Could not find topic at address: ${topicAddress}`);
      }
    }

    try{
      parsedTopicAddress = TopicController.parseTopicAddress(topicAddress);
    } catch(e) {
      throw new Error(`Error parsing invalid topic address: ${topicAddress}`);
    }

    const topicName = TopicController.parseTopicName(parsedTopicAddress);

    if(topicName === undefined) {
      throw new Error(`Error parsing topic name: ${topicAddress}`);
    }

    const topicType = TopicController.parseTopicType(parsedTopicAddress);

    if(topicType === undefined) {
      throw new Error(`Error parsing topic type: ${topicAddress}`);
    }

    const topicTenant = TopicController.parseTopicTenant(parsedTopicAddress);

    if(topicTenant === undefined) {
      throw new Error(`Error parsing topic tenant: ${topicAddress}`);
    }

    const topicNamespace = TopicController.parseTopicNamespace(parsedTopicAddress);

    if(topicNamespace === undefined) {
      throw new Error(`Error parsing topic namespace: ${topicAddress}`);
    }

    return new TopicNode(pulsarAdmin,
      topicName,
      topicType,
      providerTypeName,
      clusterName,
      topicTenant,
      topicNamespace,
      undefined);
  }

  public static async deployFunction(context:vscode.ExtensionContext, functionConfig: FunctionConfig,
                                     providerConfig: TSavedProviderConfig,
                                     providerCluster: TPulsarAdminProviderCluster,
                                     providerTenant: TPulsarAdminProviderTenant,
                                     pulsarAdmin: TPulsarAdmin): Promise<void>;
  public static async deployFunction(context:vscode.ExtensionContext, functionConfig: FunctionConfig, clusterConfigs: TSavedProviderConfig[]): Promise<void>;
  public static async deployFunction(context:vscode.ExtensionContext, functionConfig: FunctionConfig,
                                     providerConfigOrArray: TSavedProviderConfig | TSavedProviderConfig[],
                                     providerCluster?: TPulsarAdminProviderCluster,
                                     providerTenant?: TPulsarAdminProviderTenant,
                                     pulsarAdmin?: TPulsarAdmin ): Promise<void> {
    let providerConfig: TSavedProviderConfig;

    if(!Array.isArray(providerConfigOrArray)) {
      if(providerCluster === undefined) {
        vscode.window.showErrorMessage("Cluster information is required if a provider config is provided");
        return;
      }

      if(providerTenant === undefined) {
        vscode.window.showErrorMessage("Tenant information is required if a provider config is provided");
        return;
      }

      if(pulsarAdmin === undefined) {
        vscode.window.showErrorMessage("Pulsar admin information is required if a provider config is provided");
        return;
      }

      providerConfig = providerConfigOrArray as TSavedProviderConfig;
    }

    //functionConfig = this.matchInputs(functionConfig);

    // Validate function config
    try{
      this.validateFunctionConfig(functionConfig);
    }catch(e: any){
      vscode.window.showErrorMessage(e.message);
      return;
    }

    // Find file
    let functionFile = this.findFunctionFilePath(functionConfig);
    if(functionFile === undefined) {
      vscode.window.showErrorMessage("Provide a valid file path for either 'py', 'jar', or 'go'.");
      return;
    }

    // Zip if it's a directory
    if(fs.lstatSync(functionFile).isDirectory()) {
      const zipFile = await this.zipFolder(functionFile);

      if(!fs.existsSync(context.globalStorageUri.fsPath)) {
        fs.mkdirSync(context.globalStorageUri.fsPath);
      }

      const functionZipUri = vscode.Uri.file(path.join(context.globalStorageUri.fsPath, `${functionConfig.name}.zip`));

      // // Save the zip file as a stream
      await fs.writeFile(functionZipUri.fsPath, zipFile, (err: ErrnoException | null) => {
        if (err) {
          console.log(err);
          vscode.window.showErrorMessage(`An error occurred while zipping the folder - ${err.message}`);
        }
      });

      //vscode.workspace.fs.writeFile(fileUri, zipFile);
      functionFile = functionZipUri.fsPath;
    }

    // Validate the file
    if(!fs.existsSync(functionFile)) {
      vscode.window.showErrorMessage(`File ${functionFile} does not exist`);
    }

    if(Array.isArray(providerConfigOrArray)) {
      const clusterNames = [""];

      providerConfigOrArray.forEach(clusterConfig => {
        clusterConfig.clusters.forEach(cluster => {
          clusterNames.push(`${clusterConfig.name}/${cluster.name}`);
        });
      });

      // Prompt to choose cluster
      const selectedProviderCluster = await vscode.window.showQuickPick(clusterNames, { title:"Choose the provider/cluster", canPickMany: false });
      if (selectedProviderCluster === undefined) {
        return;
      }

      const [selectedClusterConfig, selectedClusterName] = selectedProviderCluster.split("/");

      providerConfig = <TSavedProviderConfig>providerConfigOrArray.find(clusterConfig => {return (clusterConfig.name === selectedClusterConfig);}); //Yes it's forceful
      providerCluster = providerConfig!.clusters.find(cluster => {return (cluster.name === selectedClusterName);});
      providerTenant = providerCluster!.tenants.find(tenant => {return (tenant.name === functionConfig.tenant); });

      const providerClass = require(`../pulsarAdminProviders/${providerConfig!.providerTypeName}/provider`);
      pulsarAdmin = new providerClass.Provider(providerCluster!.webServiceUrl, providerTenant!.pulsarToken);
    }

    // Attempt to delete the function if it already exists
    try{
      await pulsarAdmin!.DeleteFunction(<string>functionConfig.tenant, <string>functionConfig.namespace, <string>functionConfig.name);
    }catch (e:any) {
      // no op
    }

    // Register function and wait
    pulsarAdmin!.CreateFunction(functionConfig, functionFile).then(() => {
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Deploying function",
        cancellable: true
      }, (progress, token) => {
        token.onCancellationRequested(() => {
          console.log("User canceled the long running operation");
        });

        progress.report({ increment: 0, message: "Instances: 0 Running: 0"}); //Bump progress to show things are happening

        return new Promise<void>((resolve, reject) => {
          let interval:any = null;

          const timeout = setTimeout(() => {
            clearInterval(interval);
            reject("Function deployment timed out");
          }, (100 * 1000)); //timeout after 100 seconds - it's 100 because we're polling every second and reporting progress

          try{
            // Poll status every second
            interval = setInterval(async () => {
              const status:any = await pulsarAdmin!.FunctionStatus(<string>functionConfig.tenant, <string>functionConfig.namespace, <string>functionConfig.name);
              if(status === undefined) {
                return;
              }

              const funcStatus = status as FunctionStatus;
              progress.report({ increment: 1, message: "Instances: " + funcStatus.numInstances + " Running: " + funcStatus.numRunning });

              if(<number>funcStatus.numInstances === 0) {
                return;
              }

              // Pop the progress to show the function is starting
              progress.report({ increment: (80/<number>funcStatus.numInstances), message: "Instances: " + funcStatus.numInstances + " Running: " + funcStatus.numRunning });

              if (funcStatus.numRunning === funcStatus.numInstances) {
                clearTimeout(timeout);
                clearInterval(interval);
                resolve();
              }
            }, 1000);
          }catch (e) {
            // Function Status pooling error
            reject(e);
          }
        });
      }).then();
    }).catch(async (e: any) => {
      // CreateFunction Error
      console.log(e);

      try {
        const reason = (e.data ? e.data.reason : e.response!.data.reason);
        vscode.window.showErrorMessage(`An error occurred trying to deploy the function, '${reason.toLowerCase()}'`);
      } catch (e2: any) {
        vscode.window.showErrorMessage(`An error occurred trying to register the function, '${e?.message.toLowerCase()}'`);
        return;
      }
    });
  }

  private static findFunctionFilePath(functionConfig: FunctionConfig): string | undefined {
    if(functionConfig.jar !== undefined && functionConfig.jar !== null && functionConfig.jar !== "null" && functionConfig.jar.length > 0) {
      return functionConfig.jar;
    }

    if(functionConfig.py !== undefined && functionConfig.py !== null && functionConfig.py !== "null" && functionConfig.py.length > 0) {
      return functionConfig.py;
    }

    if(functionConfig.go !== undefined && functionConfig.go !== null && functionConfig.go !== "null" && functionConfig.go.length > 0) {
      return functionConfig.go;
    }

    return undefined;
  }

  private static async zipFolder(pathLike: fs.PathLike): Promise<Uint8Array> {
    const a: any = this.defFolder(pathLike);
    return fflate.zipSync(a);
  }

  private static defFolder(pathLike: fs.PathLike): {} {
    const a: any = {};
    fs.readdirSync(pathLike, { withFileTypes: true }).forEach((value: fs.Dirent) => {
      if(value.isFile()) {
        a[value.name] = fs.readFileSync(`${pathLike}/${value.name}`);
      }
      if(value.isDirectory()) {
        a[value.name] = this.defFolder(`${pathLike}/${value.name}`);
      }
    });
    return a;
  };

  public static validateFunctionConfig(functionConfig: FunctionConfig): void {
    assert(functionConfig !== undefined, "functionConfig is required");

    functionConfig.tenant = functionConfig.tenant?.trim()
                              .replace(/'null'/g, "") //do this before the rest in case the name has "null" in it
                              .replace(/"null"/g, "")
                              .replace(/^\bnull\b$/i, "")
                              .replace(/"/g, "")
                              .replace(/'/g, "")
                              .replace(/`/g, "");

    assert(functionConfig.tenant !== undefined && functionConfig.tenant !== null && functionConfig.tenant.length > 1, "'tenant' is required");

    assert(functionConfig.namespace !== undefined && functionConfig.namespace !== null && functionConfig.namespace !== "\"\"" && functionConfig.namespace !== "null", "'namespace' is required");

    assert(functionConfig.name !== undefined && functionConfig.name !== null && functionConfig.name !== "\"\"" && functionConfig.name !== "null", "'name' is required");

    assert(functionConfig.parallelism !== undefined && functionConfig.parallelism !== null, "'parallelism' is required");
    assert(functionConfig.parallelism > 0, "'parallelism' should be greater than zero");

    assert((functionConfig.py !== undefined && functionConfig.py !== null && functionConfig.py !== "null" && functionConfig.py !== "\"null\"" && functionConfig.py !== "\"\"" && functionConfig.py.length > 0)
            || (functionConfig.go !== undefined && functionConfig.go !== null && functionConfig.go !== "null" && functionConfig.go !== "\"null\"" && functionConfig.go !== "\"\"" && functionConfig.go.length > 0)
            || (functionConfig.jar !== undefined && functionConfig.jar !== null && functionConfig.jar !== "null" && functionConfig.jar !== "\"null\"" && functionConfig.jar !== "\"\"" && functionConfig.jar.length > 0), "provide either 'py', 'jar'" +
      " or 'go'");

    if((functionConfig.py !== undefined && functionConfig.py !== null && functionConfig.py !== "null")
        || (functionConfig.jar !== undefined && functionConfig.jar !== null && functionConfig.jar !== "null") ) {
      assert(functionConfig.className !== undefined && functionConfig.className !== null && functionConfig.className !== "\"\"" && functionConfig.className !== "null", "'className' is required");
    }

    assert(functionConfig.inputs !== undefined && functionConfig.inputs !== null, "the 'inputs' collection is required");
    assert(functionConfig.inputs.length > 0, "'inputs' needs at least 1 topic");
    assert(!functionConfig.inputs.includes("null") && !functionConfig.inputs.includes(""), "'inputs' has an invalid topic name");
  }

  public static matchInputs(functionConfig: FunctionConfig): FunctionConfig {
    if(functionConfig.inputs === undefined || functionConfig.inputs === null){
      functionConfig.inputs = [];
    }

    if(functionConfig.inputSpecs === undefined){
      return functionConfig;
    }

    const inputSpecKeys = Object.keys(functionConfig.inputSpecs);

    if(inputSpecKeys.length < 1){
      return functionConfig;
    }

    for (const inputSpecKey of inputSpecKeys) {
      if(functionConfig.inputs?.find((inputTopic) => { return (inputTopic.toLowerCase() === inputSpecKey.toLowerCase()); }) === undefined){
        functionConfig.inputs.push(inputSpecKey);
      }
    }

    return functionConfig;
  }
}