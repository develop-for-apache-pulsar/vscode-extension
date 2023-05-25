import * as vscode from "vscode";
import * as PulsarClient from "pulsar-client";
import {Observable} from 'rxjs';
import {WatchConfig} from "./watchConfig";
import TopicMessage from "./topicMessage";
import {TTopicMessage} from "../../types/tTopicMessage";
import {TReaderMessage} from "../../types/tReaderMessage";
import ReaderMessage from "./readerMessage";

export default class TopicMessageReader{
  private pulsarReader: PulsarClient.Reader | undefined;
  private pulsarClient: PulsarClient.Client;
  private lastReadTimestamp: number = 0;

  constructor(context: vscode.ExtensionContext,
              private readonly brokerServiceUrl: string,
              private readonly pulsarToken: string | undefined,
              private readonly watchConfig: WatchConfig = new WatchConfig()) {
    this.pulsarClient = new PulsarClient.Client({
      serviceUrl: brokerServiceUrl,
      authentication: (pulsarToken !== undefined ? new PulsarClient.AuthenticationToken({token: pulsarToken}) : undefined),
      log: this.receiveReaderLog
    });
  }

  public restartReader(): void {
    console.debug("Restarting reader");

    this.stopReader().then(() => {
      this.startReader(this.lastReadTimestamp, this.watchConfig.keepAlive, this.watchConfig.queue.readMessageTimeout);
    })
    .catch((e: any) => {
      console.debug("Error stopping reader");
      console.error(e);

      throw e;
    });
  }

  public async createReader(readerName: string, topicAddress: string): Promise<void>{
    console.debug("Creating reader");

    this.pulsarReader = await this.pulsarClient.createReader({
      topic: topicAddress,
      startMessageId: PulsarClient.MessageId.latest(),
      readerName: readerName,
    });
  }

  public async stopReader(): Promise<void>{
    console.debug("Stopping reader");
    await this.pulsarReader?.close();
  }

  public startReader(startTimestamp: number | undefined = undefined,
                     keepAlive: number = 0,
                     readMessageTimeout: number = 1000,
                     cancelToken: vscode.CancellationToken | undefined = undefined): Observable<TTopicMessage | TReaderMessage> | undefined {
    console.debug("Beginning startReader with timestamp " + startTimestamp + " and keepAlive " + keepAlive + " and readMessageTimeout " + readMessageTimeout);

    if(!this.pulsarReader){
      throw new Error("Could not read messages because the reader has not been initialized");
    }

    if(cancelToken?.isCancellationRequested){
      return undefined;
    }

    return new Observable((subscriber) => {
      (async () => {
        if(startTimestamp !== undefined){
          console.debug("Set seek timestamp to " + startTimestamp);
          await this.pulsarReader!.seekTimestamp(startTimestamp);
        }

        // Start a loop to read messages and let keepAlive control it
        while(!cancelToken?.isCancellationRequested && this.pulsarReader!.isConnected()){
          // Continue reading messages until there are no more or the connection is lost
          while (this.pulsarReader!.hasNext()) {
            try{
              const message: PulsarClient.Message | undefined = await this.pulsarReader!.readNext(readMessageTimeout);

              console.debug("Received message");
              console.debug(message);

              if(message === undefined){
                continue;
              }

              this.lastReadTimestamp = Date.now();
              subscriber.next(TopicMessage.fromPulsarMessage(message));
            }catch (e: any){
              console.debug("Error reading message");
              console.error(e);
              subscriber.error(ReaderMessage.fromError(e));
            }
          }

          // Notify the webview that the end of new messages has been reached
          subscriber.next(new ReaderMessage("EndOfMessages"));

          // If keepAlive is not set, break out of the loop
          if(keepAlive < 1) {
            console.debug("Keep alive is less than 1, breaking out of loop");
            break;
          }

          // Notify the webview that the reader is being kept open
          subscriber.next(new ReaderMessage("KeepAlive", keepAlive.toString()));

          // Wait to retry for new messages
          await new Promise(resolve => setTimeout(resolve, keepAlive));
        }

        // If the connection was lost, break out of the loop
        if(!this.pulsarReader!.isConnected()){
          subscriber.error(ReaderMessage.fromError(new Error("Connection to broker was lost")));
        }

        if(cancelToken?.isCancellationRequested){
          console.debug("Cancellation requested, breaking out of loop");
        }

        await this.stopReader();
      })();

      // Notify the webview that the watching has ended
      subscriber.complete();
    });
  }

  private receiveReaderLog(level: PulsarClient.LogLevel, file: string, line: number, message: string){
    console.log('READER LOG [%s][%s:%d] %s', level, file, line, message);
  }
}