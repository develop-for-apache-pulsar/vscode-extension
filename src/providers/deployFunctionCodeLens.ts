import * as vscode from 'vscode';
import ConfigurationProvider from "./configurationProvider/configuration";
import {TPulsarAdmin} from "../types/tPulsarAdmin";
import {FunctionConfig, FunctionStatus} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import {TPulsarAdminProviderCluster} from "../types/tPulsarAdminProviderCluster";
import * as Constants from "../common/constants";
import {TPulsarAdminProviderTenant} from "../types/tPulsarAdminProviderTenant";
import {TSavedProviderConfig} from "../types/tSavedProviderConfig";
import * as YAML from "yaml";
import FunctionService from "../services/function/functionService";
import Logger from "../utils/logger";

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
      new RegExp(/^.*?(\binputs\b:).*?$/im),
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

    const tenantNames = new RegExp(/^.*?(\btenant\b:).*?$/im).exec(documentText);
    if (tenantNames === null || tenantNames.length !== 1) {
      vscode.window.showErrorMessage("Could not find tenant name either it's misspelled or appears more than once in the document");
    }
    const tenantName = tenantNames![0].replace("tenant:", "").trim()
      .replace(/'null'/g, "")
      .replace(/"null"/g, "")
      .replace(/^\bnull\b$/i, "")
      .replace(/"/g, "")
      .replace(/'/g, "")
      .replace(/`/g, "");

    const namespaceNames = new RegExp(/^.*?(\bnamespace\b:).*?$/im).exec(documentText);
    if (namespaceNames === null || namespaceNames.length !== 1) {
      vscode.window.showErrorMessage("Could not find namespace either it's misspelled or appears more than once in the document");
    }
    const namespaceName = namespaceNames![0].replace("namespace:", "").trim()
      .replace(/'null'/g, "")
      .replace(/"null"/g, "")
      .replace(/^\bnull\b$/i, "")
      .replace(/"/g, "")
      .replace(/'/g, "")
      .replace(/`/g, "");

    const functionNames = new RegExp(/^.*?(\bname\b:).*?$/im).exec(documentText);
    if (functionNames === null || functionNames.length !== 1) {
      vscode.window.showErrorMessage("Could not find name either it's misspelled or appears more than once");
    }
    const functionName = functionNames![0].replace("name:", "").trim()
      .replace(/'null'/g, "")
      .replace(/"null"/g, "")
      .replace(/^\bnull\b$/i, "")
      .replace(/"/g, "")
      .replace(/'/g, "")
      .replace(/`/g, "");

    // Get the configured clusters and try to find the function
    const clusterConfigs = ConfigurationProvider.getClusterConfigs();

    let selectedClusterConfig: TSavedProviderConfig | undefined = undefined;
    let selectedCluster: TPulsarAdminProviderCluster | undefined = undefined;
    let selectedTenant: TPulsarAdminProviderTenant | undefined = undefined;
    let pulsarAdmin: TPulsarAdmin | undefined = undefined;
    let functionStatus: FunctionStatus | undefined = undefined;
    let selectedNamespace: string | undefined = undefined;

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

        selectedTenant = tenant;
        selectedClusterConfig = clusterConfig;
        selectedCluster = cluster;

        const providerClass = require(`../pulsarAdminProviders/${clusterConfig.providerTypeName}/provider`);
        pulsarAdmin = new providerClass.Provider(cluster.webServiceUrl, tenant.pulsarToken);
        const functionService = new FunctionService(pulsarAdmin!);

        const namespaceNames = await pulsarAdmin?.ListNamespaceNames(tenantName);
        if (namespaceNames === undefined) { // move on there's no matching namespace
          continue;
        }

        for (const namespaceNm of namespaceNames) {
          if (namespaceNm.toLowerCase() !== namespaceName.toLowerCase()) {
            continue;
          }

          selectedNamespace = namespaceNm;

          try{
            functionStatus = <FunctionStatus | undefined>await functionService.getStatus(tenantName, namespaceName, functionName);
          }catch (e) {
            Logger.error(e);
            // no op
          }
        }
      }
    }

    const functionConfig: FunctionConfig = <FunctionConfig>YAML.parse(documentText);
    const normalizedFunctionConfig = FunctionService.normalizeFunctionConfigValues(functionConfig);

    switch (codeLens.range.end.character) {
      case 0:
        codeLens.command = this.buildFunctionDeployCommand((functionStatus !== undefined),
          selectedClusterConfig,
          selectedCluster,
          selectedTenant,
          selectedNamespace,
          pulsarAdmin,
          normalizedFunctionConfig);
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
    let status: string;

    if(functionStatus === undefined){
      status = "NEW";
    }else{
      status = ((functionStatus.numRunning ?? 0) > 0 ? "RUNNING" : "STOPPED");
    }

    return new class implements vscode.Command {
      command = "";
      title = `status: ${status}`;
      tooltip = "";
    };
  }

  private buildFunctionDeployCommand(functionExists: boolean,
                                     selectedClusterConfig: TSavedProviderConfig | undefined,
                                      selectedCluster: TPulsarAdminProviderCluster | undefined,
                                      selectedTenant: TPulsarAdminProviderTenant | undefined,
                                      selectedNamespaceName: string | undefined,
                                      pulsarAdmin: TPulsarAdmin | undefined,
                                      functionConfig: FunctionConfig): vscode.Command  {
    let validateError: string | undefined = undefined;

    if(selectedTenant === undefined){
      validateError = `Could not find the tenant in your saved clusters`;
    }else if(selectedNamespaceName === undefined){
      validateError = "Could not find the namespace in your saved clusters";
    }else if(selectedClusterConfig === undefined){
      validateError = "No matching cluster config found in your saved clusters";
    }else if(selectedCluster === undefined) {
      validateError = "No matching cluster found in your saved clusters";
    }else {
      try{
        FunctionService.validateFunctionConfig(functionConfig);
      }catch (e:any) {
        validateError = e.message;
      }
    }

    let tooltip = `Deploy the function in cluster '${selectedClusterConfig?.name}'.`;
    let title = "Deploy function";

    if(functionExists){
      tooltip = `The existing function in cluster '${selectedClusterConfig?.name}' will be removed and new instances will be started`;
      title = "Replace function";
    }

    if(validateError !== undefined){
      tooltip = "";
      title = validateError;
    }

    return {
      tooltip: tooltip,
      command: (validateError !== undefined ? "" : Constants.COMMAND_DEPLOY_FUNCTION),
      title: title,
      arguments: [selectedClusterConfig, selectedCluster, selectedTenant, functionConfig, pulsarAdmin]
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