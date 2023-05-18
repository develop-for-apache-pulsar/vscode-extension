import {WebView} from "../../utils/webView";
import * as vscode from "vscode";
import {TTopic} from "../../types/TTopic";
import {TPulsarAdmin} from "../../types/TPulsarAdmin";
import {TWizardMessage} from "../../types/TWizardMessage";
import * as PulsarClient from "pulsar-client";

enum WebViewCommand {
  receivedMessage = "receivedMessage",
  watchingEnded = "watchingEnded",
  watchStarting = "watchStarting",
  noNewMessages = "noNewMessages",
  keepAlive = "keepAlive",
  lostConnection = "lostConnection", //This is a case where the connection is expected to be lost
}

enum ReaderCommand{
  setKepAlive = "setKepAlive",
  setSeekPosition = "setSeekPosition",
  setMemorySize = "setMemorySize",
  setReadMessageTimeout = "setReadMessageTimeout",
}

enum WebViewError {
  lostConnection = "lostConnection", //This is a case where a lost connection is unexpected
  readerNotInitialized = "readerNotInitialized",
  couldNotRestart = "couldNotRestart",
}

enum SeekPositionMilliseconds {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "15s" = (15*1000),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "1m" = (60*1000),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "5m" = (5*60*1000),
}

export class WatchConfig{
  constructor(public keepAlive: number = 0,
              public readonly queue: {
                seekPosition: SeekPositionMilliseconds
                memorySize: number, // in mb
                readMessageTimeout: number,
              } = {
                seekPosition: SeekPositionMilliseconds["15s"],
                memorySize: 50,//mb
                readMessageTimeout: 1000,
              }) {
  }
}

export class WatchTopic extends WebView{
  private pulsarReader: PulsarClient.Reader | undefined;
  private pulsarClient: PulsarClient.Client;
  private lastReadTimestamp: number = 0;

  constructor(context: vscode.ExtensionContext,
              private readonly topicData: TTopic,
              private readonly pulsarAdmin: TPulsarAdmin,
              private readonly watchConfig: WatchConfig = new WatchConfig()) {
    super(context, "watchTopic", "Watch Topic");
    this.receivedMessageCallback = this.receivedMessage;
    this.stateChangeCallback = this.viewStateChanged;
    this.didDisposeCallback = this.disposeView;

    this.pulsarClient = new PulsarClient.Client({
      serviceUrl: serviceUrl,
      authentication: (pulsarToken !== undefined ? new PulsarClient.AuthenticationToken({token: pulsarToken}) : undefined),
      log: this.receiveReaderLog
    });
  }

  private async viewStateChanged(e: vscode.WebviewPanelOnDidChangeViewStateEvent): Promise<void> {
    const panel = e.webviewPanel;

    // The view has gone out of focus
    if(!panel.active){
      await this.stopReader();
    }

    // The view has come into focus
    if(panel.active){
      this.startReader(this.lastReadTimestamp, this.watchConfig.keepAlive, this.watchConfig.queue.readMessageTimeout);
    }
  }

  public override async showPage(): Promise<void> {
    this.lastReadTimestamp = (Date.now() - this.watchConfig.queue.seekPosition);

    // Wait for the reader to create
    this.pulsarReader = await this.createReader("vscode_reader", this.topicData.address);

    // Let the page get initialized
    super.showPage(this.watchMessagesPage());

    // Start the reader and return
    this.startReader(this.lastReadTimestamp);
  }

  private receivedMessage(message: TWizardMessage): void {
    console.debug("Received message from webview");
    console.debug(message);

    let restartReader = false;

    switch (message.command) {
      case ReaderCommand.setKepAlive:
        if(message.text === undefined || !Number.isInteger(message.text)) {
          break;
        }

        this.watchConfig.keepAlive = Number.parseInt(message.text as string);
        restartReader = true;
        break;
      case ReaderCommand.setSeekPosition:
        if(message.text === undefined || !Number.isInteger(message.text)) {
          break;
        }

        this.watchConfig.queue.seekPosition = Number.parseInt(message.text as string);
        restartReader = true;
        break;
      case ReaderCommand.setMemorySize:
        if(message.text === undefined || !Number.isInteger(message.text)) {
          break;
        }

        this.watchConfig.queue.memorySize = Number.parseInt(message.text as string);
        restartReader = true;
        break;
      case ReaderCommand.setReadMessageTimeout:
        if(message.text === undefined || !Number.isInteger(message.text)) {
          break;
        }

        this.watchConfig.queue.readMessageTimeout = Number.parseInt(message.text as string);
        restartReader = true;
        break;
    }

    if(restartReader){
      console.debug("Restarting reader");
      this.stopReader().then(() => {
        this.startReader(this.lastReadTimestamp, this.watchConfig.keepAlive, this.watchConfig.queue.readMessageTimeout);
      })
      .catch((e: any) => {
        console.debug("Error stopping reader");
        console.error(e);

        this.postError(WebViewError.couldNotRestart, new Error("An error occurred while trying to restart with the new settings, close the tab and try again"));
      });
    }
  }

  private watchMessagesPage(): string{
    return "";
  }

  private async disposeView(): Promise<void>{
    console.debug("Disposing view");

    this.stopReader()
    .catch((e: any) => {
      console.debug("Error stopping reader");
      console.error(e);
    })
    .finally(async () => {
      console.debug("Closing pulsar client");
      await this.pulsarClient.close();
    });
  }

  private async createReader(readerName: string, topicAddress: string): Promise<PulsarClient.Reader>{
    return await this.pulsarClient.createReader({
      topic: topicAddress,
      startMessageId: PulsarClient.MessageId.latest(),
      readerName: readerName,
    });
  }

  private async stopReader(): Promise<void>{
    console.debug("Stopping reader");
    await this.pulsarReader?.close();
  }

  private startReader(startTimestamp: number | undefined = undefined, keepAlive: number = 0, readMessageTimeout: number = 1000): void {
    console.debug("Beginning startReader with timestamp " + startTimestamp + " and keepAlive " + keepAlive + " and readMessageTimeout " + readMessageTimeout);

    if(!this.pulsarReader){
      this.postError(WebViewError.readerNotInitialized, new Error("The reader was not initialized. Close the tab and try connecting again"));
      return;
    }

    (async () => {
      if(startTimestamp !== undefined){
        console.debug("Set seek timestamp to " + startTimestamp);
        await this.pulsarReader!.seekTimestamp(startTimestamp);
      }

      // Start a loop to read messages and let keepAlive control it
      while(true){
        // Notify the webview that the watching is starting
        this.postMessage(WebViewCommand.watchStarting);

        // Continue reading messages until there are no more or the connection is lost
        while (this.pulsarReader!.isConnected() && this.pulsarReader!.hasNext()) {
          try{
            const message: PulsarClient.Message | undefined = await this.pulsarReader!.readNext(readMessageTimeout);

            console.debug("Received message");
            console.debug(message);

            if(message === undefined){
              continue;
            }

            this.lastReadTimestamp = Date.now();
            this.postMessage(WebViewCommand.receivedMessage, JSON.stringify(message));
          }catch (e: any){
            console.debug("Error reading message");
            console.error(e);
          }
        }

        // If the connection was lost, break out of the loop
        if(!this.pulsarReader!.isConnected()){
          this.postMessage(WebViewCommand.lostConnection);
         break;
        }

        // Notify the webview that the end of new messages has been reached
        this.postMessage(WebViewCommand.noNewMessages);

        // If keepAlive is not set, break out of the loop
        if(keepAlive < 1) {
          console.debug("Keep alive is less than 1, breaking out of loop");
          break;
        }

        // Notify the webview that the reader is being kept open
        this.postMessage(WebViewCommand.keepAlive, keepAlive.toString());

        // Wait to retry for new messages
        await new Promise(resolve => setTimeout(resolve, keepAlive));
      }
    })();

    // Notify the webview that the watching has ended
    this.postMessage(WebViewCommand.watchingEnded);

    console.debug("Exiting startReader");
  }

  private receiveReaderLog(level: PulsarClient.LogLevel, file: string, line: number, message: string){
    console.log('READER LOG [%s][%s:%d] %s', level, file, line, message);
  }
}