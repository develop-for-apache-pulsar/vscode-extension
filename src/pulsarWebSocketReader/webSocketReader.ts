import {TTopicMessage} from "../types/tTopicMessage";
import {CloseEvent, ErrorEvent, Event, MessageEvent, WebSocket} from "isomorphic-ws";
import {Observable, Subscriber} from "rxjs";
import ReaderMessage from "./readerMessage";
import {AllMessageTypes} from "../types/allMessageTypes";
import TopicMessage from "./topicMessage";

export default class WebSocketReader {
  private readonly _webRequestArgs: {} = {};
  private _socket: WebSocket | null = null;
  private readonly _observable: Observable<AllMessageTypes>;

  constructor(private readonly webSocketAddress: URL, pulsarToken: string | undefined = undefined, topicSchema: string | undefined = undefined) {
    if(pulsarToken !== undefined){
      this._webRequestArgs = {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Bearer ${pulsarToken}`
        }
      };
    }

    this._observable = this.createObservable(topicSchema);
  }

  public pause(): void {
    console.debug("Pausing websocket");
    this._socket?.pause();
  }

  public resume(): void {
    console.debug("Resuming websocket");
    this._socket?.resume();
  }

  public close(): void {
    console.debug("Closing websocket");
    this._socket?.close();
  }

  public open(): Observable<AllMessageTypes> {
    console.debug("Opening websocket");
    return this._observable;
  }

  private createObservable(topicSchema: string | undefined): Observable<AllMessageTypes> {
    return new Observable<AllMessageTypes>((subscriber: Subscriber<AllMessageTypes>) => {
      let socket: WebSocket | null = null;

      try {
        socket = new WebSocket(this.webSocketAddress, undefined, this._webRequestArgs);
        this._socket = socket;
      } catch (e: any) {
        subscriber.error(ReaderMessage.fromError(e));
        return;
      }

      socket.onopen = (e: Event) => {
        subscriber.next(ReaderMessage.fromWsMessage(e));
      };

      socket.onerror = (e: ErrorEvent) => {
        subscriber.error(ReaderMessage.fromWsMessage(e));
      };

      socket.onclose = (e: CloseEvent) => {
        if (!e.wasClean) {
          subscriber.error(ReaderMessage.fromError(new Error("WebSocket connection closed unexpectedly")));
        }

        // on a close, remove the subscriber
        subscriber.complete();
      };

      socket.onmessage = (e: MessageEvent) => {
        try {
          const readerMessage: TTopicMessage = TopicMessage.fromWsMessage(e, topicSchema);
          subscriber.next(readerMessage);

          setTimeout(function timeout() {
            const ackMsg = {"messageId" : readerMessage.messageId};
            socket?.send(JSON.stringify(ackMsg));
          }, 500);
        } catch (err) {
          subscriber.error(err);
        }
      };
    });
  }
}