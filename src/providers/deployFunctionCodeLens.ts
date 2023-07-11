import * as vscode from 'vscode';
import ConfigurationProvider from "./configurationProvider/configuration";
import {TPulsarAdmin} from "../types/tPulsarAdmin";
import {FunctionConfig, FunctionInstanceStatusData, FunctionStatus} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import {TPulsarAdminProviderCluster} from "../types/tPulsarAdminProviderCluster";
import * as Constants from "../common/constants";
import {TPulsarAdminProviderTenant} from "../types/tPulsarAdminProviderTenant";
import {TSavedProviderConfig} from "../types/tSavedProviderConfig";
import FunctionController from "../controllers/functionController";

export default class DeployFunctionCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
  private readonly regexes: RegExp[];

  constructor() {
    this.regexes = [
      new RegExp(/^.*?(\btenant\b:).*?$/im),
      new RegExp(/^.*?(\bnamespace\b:).*?$/im),
      new RegExp(/^.*?(\bname\b:).*?$/im),
      new RegExp(/^.*?(\bparallelism\b:).*?$/im),
      new RegExp(/^.*?(\binputs\b|\binputSpecs\b:).*?$/im),
    ];

    vscode.workspace.onDidChangeConfiguration((_) => {
      this._onDidChangeCodeLenses.fire();
    });
  }

  public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
    const documentText = document.getText();
    let regexScore = 0;
    if(token.isCancellationRequested) {
      return [];
    }

    // Test the document for each regex
    for (const regex of this.regexes) {
      if(!regex.test(documentText)) {
        continue;
      }
      if(token.isCancellationRequested) {
        return [];
      }

      regexScore++;
    }

    if (regexScore !== this.regexes.length) {
      return [];
    }

    return [ // These are placeholders for resolving different information about the function
      new vscode.CodeLens(new vscode.Range(0, 0, 0, 0)),
      new vscode.CodeLens(new vscode.Range(0, 1, 0, 0)),
      new vscode.CodeLens(new vscode.Range(0, 2, 0, 0))
    ];
  }

  public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
    return this.resolve(codeLens).then(() => {
      return codeLens;
    });
  }

  private async resolve(codeLens: vscode.CodeLens): Promise<void>{
    const editor = vscode.window.activeTextEditor;
    const document = editor?.document;
    if (!editor || !document) {
      return;
    }

    const documentText = document.getText();

    const tenantNames = new RegExp(/(tenant:).*/i).exec(documentText);
    if (tenantNames === null || tenantNames.length !== 1) {
      vscode.window.showErrorMessage("Could not find tenant name either it's misspelled or appears more than once");
    }
    const tenantName = tenantNames![0].replace("tenant:", "").trim();

    const namespaceNames = new RegExp(/(namespace:).*/i).exec(documentText);
    if (namespaceNames === null || namespaceNames.length !== 1) {
      vscode.window.showErrorMessage("Could not find namespace either it's misspelled or appears more than once");
    }
    const namespaceName = namespaceNames![0].replace("namespace:", "").trim();

    const functionNames = new RegExp(/(name:).*/i).exec(documentText);
    if (functionNames === null || functionNames.length !== 1) {
      vscode.window.showErrorMessage("Could not find namespace either it's misspelled or appears more than once");
    }
    const functionName = functionNames![0].replace("name:", "").trim();

    // Get the configured clusters and try to find the function
    const clusterConfigs = ConfigurationProvider.getClusterConfigs();

    let selectedConfig: TSavedProviderConfig | undefined = undefined;
    let selectedCluster: TPulsarAdminProviderCluster | undefined = undefined;
    let selectedTenant: TPulsarAdminProviderTenant | undefined = undefined;
    let pulsarAdmin: TPulsarAdmin | undefined = undefined;
    let functionStatus: FunctionStatus | undefined = undefined;

    for (const clusterConfig of clusterConfigs) {
      if (functionStatus !== undefined) { // already discovered function
        continue;
      }

      for (const cluster of clusterConfig.clusters) {
        if (functionStatus !== undefined) { // already discovered function
          continue;
        }

        const tenant = cluster.tenants.find((tenant) => { return tenant.name.toLowerCase() === tenantName.toLowerCase(); });
        if (tenant === undefined) { // move on there's no matching tenant
          continue;
        }

        const providerClass = require(`../pulsarAdminProviders/${clusterConfig.providerTypeName}/provider`);
        pulsarAdmin = new providerClass.Provider(cluster.webServiceUrl, tenant.pulsarToken);

        const namespaceNames = await pulsarAdmin?.ListNamespaceNames(tenantName);
        if (namespaceNames === undefined) { // move on there's no matching namespace
          continue;
        }

        for (const namespaceNm of namespaceNames) {
          if (namespaceNm.toLowerCase() !== namespaceName.toLowerCase()) {
            continue;
          }

          try{
            functionStatus = <FunctionStatus | undefined>await pulsarAdmin!.FunctionStatus(tenantName, namespaceName, functionName);
            if (functionStatus === undefined) { // move on there's no matching function
              continue;
            }

            selectedCluster = cluster;
            selectedTenant = tenant;
            selectedConfig = clusterConfig;
          }catch (e) {
            // no op
          }
        }
      }
    }

    const functionConfig: FunctionConfig = {};

    documentText.split("\n").forEach((line) => {
      if (line.startsWith("tenant:")) {
        functionConfig.tenant = line.replace("tenant:", "").trim();
      }

      if (line.startsWith("namespace:")) {
        functionConfig.namespace = line.replace("namespace:", "").trim();
      }

      if (line.startsWith("name:")) {
        functionConfig.name = line.replace("name:", "").trim();
      }

      if (line.startsWith("parallelism:")) {
        functionConfig.parallelism = parseInt(line.replace("parallelism:", "").trim());
      }

      if (line.startsWith("inputs:")) {
        functionConfig.inputs = [];
        functionConfig.inputs.push(line.replace("inputs:", "").trim());
      }

      if (line.startsWith("className:")) {
        functionConfig.className = line.replace("className:", "").trim();
      }

      if (line.startsWith("py:")) {
        functionConfig.py = line.replace("py:", "").trim();
      }
    });

    switch (codeLens.range.end.character) {
      case 0:
        codeLens.command = this.buildFunctionDeployCommand(selectedConfig, selectedCluster, selectedTenant, pulsarAdmin, functionConfig);
        break;
      case 1:
        codeLens.command = this.buildFunctionStatusCommand(functionStatus);
        break;
      case 2:
        codeLens.command = this.buildFunctionInstanceCountCommand(functionStatus);
        break;
    }
  }

  private buildFunctionStatusCommand(functionStatus: FunctionStatus | undefined): vscode.Command {
    let status = "";
    let tooltip = "";

    if(functionStatus === undefined){
      status = "NEW";
    }else{
      status = (functionStatus.numRunning !== undefined && functionStatus.numRunning > 0 ? "RUNNING" : "STOPPED");
    }

    return new class implements vscode.Command {
      command: string = "";
      title: string = `status: ${status}`;
      tooltip: string = tooltip;
    };
  }

  private buildFunctionDeployCommand(selectedConfig: TSavedProviderConfig | undefined,
                                    selectedCluster: TPulsarAdminProviderCluster | undefined,
                                    selectedTenant: TPulsarAdminProviderTenant | undefined,
                                    pulsarAdmin: TPulsarAdmin | undefined,
                                    functionConfig: FunctionConfig): vscode.Command  {
    let validateError: string | undefined = undefined;

    try{
      FunctionController.validateFunctionConfig(functionConfig);
    }catch (e:any) {
      validateError = e.message;
    }

    if(selectedCluster === undefined){
      // The function location is unknown, therefore it's considered new
      return {
        tooltip: "Click to see a choice of clusters and start the new function",
        command: (validateError !== undefined ? "" : Constants.COMMAND_DEPLOY_FUNCTION),
        title: (validateError !== undefined ? validateError : "Deploy function"),
        arguments: [functionConfig, ConfigurationProvider.getClusterConfigs()]
      };
    }

    return {
      tooltip: `The existing function in cluster '${selectedCluster.name}' will be removed and new instances will be started`,
      command: (validateError !== undefined ? "" : Constants.COMMAND_UPDATE_FUNCTION),
      title: (validateError !== undefined ? validateError : "Replace function"),
      arguments: [selectedConfig, selectedCluster, selectedTenant, functionConfig, pulsarAdmin]
    };
  }

  private buildFunctionInstanceCountCommand(functionStatus: FunctionStatus | undefined): vscode.Command  {
    // Assume the function is unknown
    let command = "";
    let title = "no instances";

    if(functionStatus !== undefined){
      title = `count: ${functionStatus.numInstances} running: ${functionStatus.numRunning}`;
    }

    return {
      command: command,
      title: title,
    };
  }
}