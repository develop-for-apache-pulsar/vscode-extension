import {FunctionInstanceStatus, FunctionStatus} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import {TObservableTask, ProgressReport} from "../../types/tObservableTask";
import FunctionService from "./functionService";
import {window} from "vscode";

export default class WatchFunctionDeploymentTask implements TObservableTask<FunctionStatus> {
  private errorCount = 0;
  private currentNumRunning = 0;

  constructor(private readonly tenantName: string,
              private readonly namespaceName: string,
              private readonly functionName: string,
              private readonly functionService: FunctionService,
              private readonly pulsarClusterTreeProvider: any) {
  }

  action = () => {
    return this.functionService.getStatus(this.tenantName, this.namespaceName, this.functionName);
  };
  errorThreshold = 5;
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

    // Check if all the instances are running
    // Then check if the number of errors is equal to the number of instances and the error threshold has been reached
    return (functionStatus.numRunning === functionStatus.numInstances) || (((errorInstances?.length ?? 0) === functionStatus.numInstances && hasErrors));
  };
  onProgress = (functionStatus?: FunctionStatus) => {
    const increment = (100/(this.timeout/this.pollingInterval)); // :( this isn't accurate

    console.log(functionStatus);
    if(functionStatus === undefined) {
      return new class implements ProgressReport {
        message = "Uploading function package and waiting for start";
        increment = increment;
      };
    }

    const numInstances = functionStatus.numInstances ?? 0;
    const numRunning = functionStatus.numRunning ?? 0;

    if(numInstances === 0) {
      return new class implements ProgressReport {
        message = `Function instances starting`;
        increment = increment;
      };
    }

    return new class implements ProgressReport {
      increment = increment;
      message = `Function instances starting (${numRunning} of ${numInstances})`;
    };
  };
  onFinish = (waitExpired:boolean, wasCancelled: boolean, hasErrors: boolean): void => {
    this.pulsarClusterTreeProvider.refresh();

    if(hasErrors && wasCancelled){
      try{
        // Fire and forget
        this.functionService.deleteFunction(this.tenantName, this.namespaceName, this.functionName).then();
      }catch (e) {
        // no op
      }
    }

    if(waitExpired){
      window.showInformationMessage(`Timeout waiting for status of function ${this.tenantName}/${this.namespaceName}/${this.functionName}`);
      return;
    }

    if(wasCancelled){
      window.showInformationMessage(`Task cancelled for function ${this.tenantName}/${this.namespaceName}/${this.functionName}`);
      return;
    }

    if(hasErrors){
      window.showWarningMessage(`Errors were reported while starting function ${this.tenantName}/${this.namespaceName}/${this.functionName}. Check status to confirm.`);
      return;
    }

    window.showInformationMessage(`Function ${this.tenantName}/${this.namespaceName}/${this.functionName} is ready`);
  };
  hasErrors = (functionStatus?: FunctionStatus) => {
    if(functionStatus === undefined) {
      return false;
    }

    const errorInstances = functionStatus.instances?.filter((instance: FunctionInstanceStatus) => { return ((instance.status?.error?.length ?? 0) > 1); });

    // We have to count the errors because a function instance could report a false positive IO error
    // in that case the instance could be just starting up, and we don't want to count that as an error
    if((errorInstances?.length ?? 0) > 0){
      this.errorCount++;
    }

    return this.errorCount > this.errorThreshold;
  };
};