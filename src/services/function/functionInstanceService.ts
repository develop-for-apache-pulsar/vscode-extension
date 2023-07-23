import {TPulsarAdmin} from "../../types/tPulsarAdmin";
import Logger from "../../utils/logger";
import {trace} from "../../utils/traceDecorator";

export default class FunctionInstanceService {
  constructor(private readonly pulsarAdmin: TPulsarAdmin) {}

  @trace('Start function instance')
  public startFunctionInstance(tenantName: string, namespaceName: string, functionName: string, instanceId: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pulsarAdmin.StartFunction(tenantName, namespaceName, functionName, instanceId).then(() => {
        resolve();
      }).catch((e: any) => {
        Logger.error(`Start function instance`, e);
        reject(new Error('Error occurred starting function instance'));
      });
    });
  }

  @trace('Stop function instance')
  public stopFunctionInstance(tenantName: string, namespaceName: string, functionName: string, instanceId: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pulsarAdmin.StopFunction(tenantName, namespaceName, functionName, instanceId).then(() => {
        resolve();
      }).catch((e: any) => {
        Logger.error(`Stop function instance`, e);
        reject(new Error('Error occurred stopping function instance'));
      });
    });
  }

  @trace('Restart function instance')
  public restartFunctionInstance(tenantName: string, namespaceName: string, functionName: string, instanceId: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pulsarAdmin.RestartFunction(tenantName, namespaceName, functionName, instanceId).then(() => {
        resolve();
      }).catch((e: any) => {
        Logger.error(`Restart function instance`, e);
        reject(new Error('Error occurred restarting function instance'));
      });
    });
  }
}