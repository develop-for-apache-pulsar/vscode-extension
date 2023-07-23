import {TPulsarAdmin} from "../../types/tPulsarAdmin";
import {FunctionStatus, FunctionStatsImpl, FunctionConfig} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import Logger from "../../utils/logger";
import {trace} from "../../utils/traceDecorator";
import * as yaml from 'yaml';
import * as assert from "assert";
import {PathLike} from "fs";

export default class FunctionService {
  constructor(private readonly pulsarAdmin: TPulsarAdmin) {}

  @trace('Function status')
  public async getStatus(tenantName: string, namespaceName: string, functionName: string): Promise<FunctionStatus | undefined>{
    return new Promise<FunctionStatus | undefined>((resolve, reject) => {
      this.pulsarAdmin.FunctionStatus(tenantName, namespaceName, functionName).then((status) => {
        resolve(status as FunctionStatus | undefined);
      }).catch((e: any) => {
        Logger.error(`Get function status`, e);
        reject(new Error('Error occurred getting function status'));
      });
    });
  }

  @trace('Function statistics')
  public getStatistics(tenantName: string, namespaceName: string, functionName: string): Promise<FunctionStatsImpl | undefined> {
    return new Promise<FunctionStatsImpl | undefined>((resolve, reject) => {
      this.pulsarAdmin.FunctionStats(tenantName, namespaceName, functionName).then((status) => {
        resolve(status as FunctionStatsImpl | undefined);
      }).catch((e: any) => {
        Logger.error(`Get function stats`, e);
        reject(new Error('Error occurred getting function stats'));
      });
    });
  }

  @trace('Restart Function')
  public restartFunction(tenantName: string, namespaceName: string, functionName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pulsarAdmin.RestartFunction(tenantName, namespaceName, functionName).then(() => {
        resolve();
      }).catch((e: any) => {
        Logger.error(`Restart function`, e);
        reject(new Error('Error occurred restarting function'));
      });
    });
  }

  @trace('Function info')
  public getFunctionInfo(tenantName: string, namespaceName: string, functionName: string): Promise<FunctionConfig | undefined> {
    return new Promise<FunctionConfig | undefined>((resolve, reject) => {
      this.pulsarAdmin.GetFunctionInfo(tenantName, namespaceName, functionName).then((info) => {
        resolve(info);
      }).catch((e: any) => {
        Logger.error(`Get function info`, e);
        reject(new Error('Error occurred getting function info'));
      });
    });
  }

  @trace('Delete function')
  public deleteFunction(tenantName: string, namespaceName: string, functionName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pulsarAdmin.DeleteFunction(tenantName, namespaceName, functionName).then(() => {
        resolve();
      }).catch((e: any) => {
        Logger.error(`Delete function`, e);
        reject(new Error('Error occurred deleting function'));
      });
    });
  }

  @trace('Function template')
  public getFunctionTemplate(templateType: "yaml" | "json", providerTypeName: string, clusterName: string, tenantName: string, namespaceName: string): yaml.Document | {} {
    const obj = {
      tenant: tenantName,
      namespace: namespaceName,
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
      jar: null,
      userConfig: null
    };

    switch (templateType) {
      case 'yaml':
        const doc = new yaml.Document(obj);
        doc.commentBefore = `Function for provider ${providerTypeName} in ${clusterName}/${namespaceName}/${tenantName}`;
        doc.comment = '---';
        return doc;
      case 'json':
        return obj;
    }
  }

  @trace('Create function')
  public createFunction(functionConfig: FunctionConfig, functionFilePath: PathLike) {
    return new Promise<void>((resolve, reject) => {
      this.pulsarAdmin.CreateFunction(functionConfig, functionFilePath).then(() => {
        resolve();
      }).catch((e: any) => {
        Logger.error(`Create function`, e);
        reject(new Error('Error occurred creating function'));
      });
    });
  }

  @trace('Start Function')
  public startFunction(tenantName: string, namespaceName: string, functionName: string) {
    return new Promise<void>((resolve, reject) => {
      this.pulsarAdmin.StartFunction(tenantName, namespaceName, functionName).then(() => {
        resolve();
      }).catch((e: any) => {
        Logger.error(`Start function`, e);
        reject(new Error('Error occurred starting function'));
      });
    });
  }

  @trace('Stop Function')
  public stopFunction(tenantName: string, namespaceName: string, functionName: string) {
    return new Promise<void>((resolve, reject) => {
      this.pulsarAdmin.StopFunction(tenantName, namespaceName, functionName).then(() => {
        resolve();
      }).catch((e: any) => {
        Logger.error(`Stop function`, e);
        reject(new Error('Error occurred stopping function'));
      });
    });
  }

  public static findFunctionRuntimeFilePath(functionConfig: FunctionConfig): string | undefined {
    if((functionConfig.jar?.length ?? 0) > 0) {
      return functionConfig.jar;
    }

    if((functionConfig.py?.length ?? 0) > 0) {
      return functionConfig.py;
    }

    if((functionConfig.go?.length ?? 0) > 0) {
      return functionConfig.go;
    }

    return undefined;
  }

  public static normalizeFunctionConfigValues(functionConfig: any): FunctionConfig {
    const normalizedConfig:any = {};

    Object.keys(functionConfig).forEach((key) => {
      const value = functionConfig[key];

      if(typeof value === 'string') {
        normalizedConfig[key] = value.trim()
          .replace(/'null'/g, "") //do this before the rest in case the name has "null" in it
          .replace(/"null"/g, "")
          .replace(/^\bnull\b$/i, "")
          .replace(/"/g, "")
          .replace(/'/g, "")
          .replace(/`/g, "");

        return;
      }

      if(Array.isArray(value)) {
        normalizedConfig[key] = value?.filter(i => {
          const ret = i.trim()
            .replace(/'null'/g, "")
            .replace(/"null"/g, "")
            .replace(/^\bnull\b$/i, "")
            .replace(/"/g, "")
            .replace(/'/g, "")
            .replace(/`/g, "");

          return (ret.length === 0) ? undefined: ret;
        });

        return;
      }

      normalizedConfig[key] = value;
    });

    try{
      // Try to cast as FunctionConfig to validate
      return <FunctionConfig>normalizedConfig;
    } catch(e:any) {
      throw new Error(`Unable to normalize function config: ${e.message}`);
    }
  }

  public static validateFunctionConfig(functionConfig: FunctionConfig): void {
    assert(functionConfig !== undefined, "functionConfig is required");

    assert(functionConfig.tenant !== undefined && functionConfig.tenant.length > 1, "'tenant' is required");
    assert(functionConfig.namespace !== undefined && functionConfig.namespace.length > 1, "'namespace' is required");
    assert(functionConfig.name !== undefined && functionConfig.name.length > 1, "'name' is required");

    assert((functionConfig.parallelism ?? 0) > 0, "'parallelism' is required and should be greater than zero");

    assert((functionConfig.py?.length ?? 0) > 0 || (functionConfig.go?.length ?? 0) > 0 || (functionConfig.jar?.length ?? 0) > 0, "provide either 'py', 'jar', or 'go'");

    if((functionConfig.py?.length ?? 0) > 0 || (functionConfig.jar?.length ?? 0) > 0 ) {
      assert((functionConfig.className?.length ?? 0) > 1, "'className' is required");
    }

    assert((functionConfig.inputs?.length ?? 0) > 0, "'inputs' needs at least 1 topic");
    assert(!functionConfig.inputs?.includes("null")
      && !functionConfig.inputs?.includes("\"\"")
      && !functionConfig.inputs?.includes("\"null\""), "'inputs' has an invalid topic name");
  }

  // public static matchInputs(functionConfig: FunctionConfig): FunctionConfig {
  //   if(functionConfig.inputs === undefined || functionConfig.inputs === null){
  //     functionConfig.inputs = [];
  //   }
  //
  //   if(functionConfig.inputSpecs === undefined){
  //     return functionConfig;
  //   }
  //
  //   const inputSpecKeys = Object.keys(functionConfig.inputSpecs);
  //
  //   if(inputSpecKeys.length < 1){
  //     return functionConfig;
  //   }
  //
  //   for (const inputSpecKey of inputSpecKeys) {
  //     if(functionConfig.inputs?.find((inputTopic) => { return (inputTopic.toLowerCase() === inputSpecKey.toLowerCase()); }) === undefined){
  //       functionConfig.inputs.push(inputSpecKey);
  //     }
  //   }
  //
  //   return functionConfig;
  // }
}