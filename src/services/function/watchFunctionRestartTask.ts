import {FunctionInstanceStatus, FunctionStatus} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import {TObservableTask, ProgressReport} from "../../types/tObservableTask";
import FunctionService from "./functionService";
import {window} from "vscode";

export default class WatchFunctionRestartTask implements TObservableTask<FunctionStatus> {
  private errorCount = 0;
  private initialCheck = false;

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
  pollingInterval = 1500;
  timeout = 120000;
  complete = (hasErrors: boolean, functionStatus?: FunctionStatus) => {
    if(functionStatus === undefined) {
      return false;
    }

    if(functionStatus.numInstances === 0 || !this.initialCheck){
      return false;
    }

    const errorInstances = functionStatus.instances?.filter((instance: FunctionInstanceStatus) => { return ((instance.status?.error?.length ?? 0) > 1); });

    // Check if all the instances are running
    // Then check if the number of errors is equal to the number of instances and the error threshold has been reached
    return (functionStatus.numRunning === functionStatus.numInstances) || (((errorInstances?.length ?? 0) === functionStatus.numInstances && hasErrors));
  };
  onProgress = (functionStatus?: FunctionStatus) => {
    if(!this.initialCheck){
      // Wait a second before checking the status. This is to avoid the case where the function is starting and the status is immediately checked.
      setTimeout(() => {
        this.initialCheck = true;
        console.log("Initial check complete");
      }, 1000);
    }

    const increment = (100/(this.timeout/this.pollingInterval)); // :( this isn't accurate

    console.log(functionStatus);
    if(functionStatus === undefined || !this.initialCheck) {
      return new class implements ProgressReport {
        message = "Function starting";
        increment = increment;
      };
    }

    const numInstances = functionStatus.numInstances ?? 0;
    const numRunning = functionStatus.numRunning ?? 0;

    return new class implements ProgressReport {
      increment = increment;
      message = `Function instances starting (${numRunning} of ${numInstances})`;
    };
  };
  onFinish = (waitExpired:boolean, wasCancelled: boolean, hasErrors: boolean): void => {
    this.pulsarClusterTreeProvider.refresh();

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
      return true;
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