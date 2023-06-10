import {TReaderMessage} from "../types/tReaderMessage";
import {CloseEvent, ErrorEvent, Event, MessageEvent} from "isomorphic-ws";

export enum ReaderMessageCommand {
  error = "error",
  info = "info",
  close = "close"
}

export default class ReaderMessage implements TReaderMessage {
  constructor(readonly command: string,
              readonly text: string | undefined = undefined) {
  }

  /*
  interface Event {
        type: string;
        target: WebSocket;
    }

  interface ErrorEvent {
      error: any;
      message: string;
      type: string;
      target: WebSocket;
  }

  interface CloseEvent {
      wasClean: boolean;
      code: number;
      reason: string;
      type: string;
      target: WebSocket;
  }

  interface MessageEvent {
      data: Data;
      type: string;
      target: WebSocket;
  }
   */

  public static fromError(error: Error): ReaderMessage {
    return new ReaderMessage(ReaderMessageCommand.error , error.message);
  }

  public static fromWsMessage(message: CloseEvent): ReaderMessage;
  public static fromWsMessage(message: ErrorEvent): ReaderMessage;
  public static fromWsMessage(message: Event): ReaderMessage;
  public static fromWsMessage(message: any): ReaderMessage{
    switch(message.type){
      case "close":
        const close = message as CloseEvent;
        return new ReaderMessage(ReaderMessageCommand.close, `${close.reason}(${close.code})`);
      case "error":
        const error = message as ErrorEvent;
        return new ReaderMessage(ReaderMessageCommand.error, error.message);
      default:
        return new ReaderMessage(ReaderMessageCommand.info);
    }
  }
}