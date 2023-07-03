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

export default class FunctionController {
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
}