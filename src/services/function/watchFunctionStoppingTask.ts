import {FunctionInstanceStatus, FunctionStatus} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import {TObservableTask, ProgressReport} from "../../types/tObservableTask";
import Logger from "../../utils/logger";
import FunctionService from "./functionService";
import {window} from "vscode";

export default class WatchFunctionStoppingTask implements TObservableTask<FunctionStatus> {
  constructor(private readonly tenantName: string,
              private readonly namespaceName: string,
              private readonly functionName: string,
              private readonly functionService: FunctionService,
              private readonly pulsarClusterTreeProvider: any) {
  }

  action = () => {
    return this.functionService.getStatus(this.tenantName, this.namespaceName, this.functionName);
  };
  errorThreshold = 3;
  messages = {
    startingTask: "Stopping function",
    timeoutWaiting: `Timeout waiting for status of function ${this.tenantName}/${this.namespaceName}/${this.functionName}`,
    doAction: "",
    errorThresholdExceeded: `Too many errors found for function ${this.tenantName}/${this.namespaceName}/${this.functionName}`,
    taskSuccess: `Function ${this.tenantName}/${this.namespaceName}/${this.functionName} is stopped`,
    taskCancelled: `Task cancelled for function ${this.tenantName}/${this.namespaceName}/${this.functionName}`,
  };
  pollingInterval = 1500;
  timeout = 120000;
  complete = (hasErrors: boolean, functionStatus?: FunctionStatus) => {
    if(functionStatus === undefined) {
      return false;
    }

    if(functionStatus.numInstances === 0) {
      return false;
    }

    const errorInstances = functionStatus.instances?.filter((instance: FunctionInstanceStatus) => { return ((instance.status?.error?.length ?? 0) > 1); });
    return (functionStatus.numRunning === 0) || (((errorInstances?.length ?? 0) === functionStatus.numInstances));
  };
  onProgress = (functionStatus?: FunctionStatus) => {
    console.log(functionStatus);
    const increment = (100/(this.timeout/this.pollingInterval));

    return new class implements ProgressReport {
      message = "Function instances stopping";
      increment = increment;
    };
  };

  onFinish = (waitExpired:boolean, wasCancelled: boolean, hasErrors: boolean): void => {
    this.pulsarClusterTreeProvider.refresh();

    if(waitExpired){
      window.showInformationMessage(`Timeout waiting for status of function ${this.tenantName}/${this.namespaceName}/${this.functionName}`);
      return;
    }

    if(hasErrors){
      window.showErrorMessage(`Too many errors found for function ${this.tenantName}/${this.namespaceName}/${this.functionName}. Check status for more details`);
      return;
    }

    window.showInformationMessage(`Function ${this.tenantName}/${this.namespaceName}/${this.functionName} stopped`);
  };
  hasErrors = (functionStatus?: FunctionStatus) => {
    if(functionStatus === undefined) {
      return false;
    }

    const errorInstances = functionStatus.instances?.filter((instance: FunctionInstanceStatus) => { return ((instance.status?.error?.length ?? 0) > 1); });

    return (errorInstances?.length ?? 0) > 0;
  };
};