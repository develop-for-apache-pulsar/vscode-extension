import {ProgressLocation, Progress, CancellationToken, window} from "vscode";
import Logger from "./logger";
import {TObservableTask, ProgressReport} from "../types/tObservableTask";
import {sleep} from "./sleep";

export default class ProgressRunner<T> {
  constructor(private readonly title: string) {}

  public async run(observableTask: TObservableTask<T>): Promise<void> {
    window.withProgress({ location: ProgressLocation.Notification, title: this.title, cancellable: true },
      async (progress: Progress<ProgressReport>, token: CancellationToken) => {
      return this.startRunner(progress, token, observableTask);
    });
  }

  private async startRunner(progress: Progress<ProgressReport>, token: CancellationToken, observableTask: TObservableTask<T>): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      let expired = false;
      let errorCnt = 0;
      let hasErrors = false;

      const timeout = setTimeout(() => {
        Logger.debug('Timeout callback');
        expired = true;
      }, observableTask.timeout);

      progress.report(observableTask.onProgress());

      while(!expired && !token.isCancellationRequested){
        let actionResult: T | undefined;

        try{
          actionResult = await observableTask.action();
        }catch (e:any) {
          errorCnt++;
          console.log('Error in action', e);

          if (errorCnt > observableTask.errorThreshold) {
            Logger.error('Error threshold exceeded', e);
            clearTimeout(timeout);
            break;
          }
        }

        progress.report(observableTask.onProgress(actionResult));

        hasErrors = observableTask.hasErrors(actionResult);

        if (observableTask.complete(hasErrors, actionResult)) {
          clearTimeout(timeout);
          break;
        }

        await sleep(observableTask.pollingInterval);
      }

      try{
        observableTask.onFinish(expired, token.isCancellationRequested, (errorCnt > 0 || hasErrors));
      }catch (e) {
        console.log('Error in onFinish', e);
        reject(e);
      }

      if(!expired) {
        clearTimeout(timeout);
      }

      resolve();
    });
  }
}