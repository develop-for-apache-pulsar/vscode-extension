import {TReaderMessage} from "../../types/tReaderMessage";

export default class ReaderMessage implements TReaderMessage {
  constructor(readonly command: string,
              readonly message: string | undefined = undefined) {
  }

  public static fromError(error: any, command: string = "error"): ReaderMessage {
    return new ReaderMessage(command , error);
  }
}