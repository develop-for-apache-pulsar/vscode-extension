import {TTopicMessage} from "../../types/tTopicMessage";

export default class TopicMessage implements TTopicMessage{
  private readonly _decodedPayload: string | undefined;

  constructor(public readonly messageId: string,
              public readonly publishTime: string,
              public readonly payload: string,
              public readonly key: string,
              public readonly properties: { [Key:string]: string },
              public readonly redeliveryCount: number) {
    let buff = new Buffer(payload,'base64');
    this._decodedPayload = buff.toString();
  }

  get decodedPayload(): string | undefined{
    return this._decodedPayload;
  }

  public static fromWsMessage(message: any): TopicMessage{
    return new TopicMessage(message.messageId,
                            message.publishTime,
                            message.payload,
                            message.key,
                            message.properties,
                            message.redeliveryCount);
  }
}