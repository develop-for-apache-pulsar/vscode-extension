import {TTopicMessage} from "../../types/tTopicMessage";
import * as PulsarClient from "pulsar-client";

export default class TopicMessage implements TTopicMessage{
  private readonly _decodePartitionKey: string | undefined;
  private readonly _decodedData: string | undefined;

  constructor(public readonly topicName: string,
              public readonly messageId: PulsarClient.MessageId,
              public readonly publishTimestamp: number,
              public readonly eventTimestamp: number,
              public readonly data: Buffer,
              public readonly partitionKey: string,
              public readonly properties: { [Key:string]: string },
              public readonly redeliveryCount: number) {
    let buff = new Buffer(partitionKey,'base64');
    this._decodePartitionKey = buff.toString('ascii');
    this._decodedData = data.toString('utf8');
  }

  get decodedPartitionKey(): string | undefined{
    return this._decodePartitionKey;
  }

  get decodedData(): string | undefined{
    return this._decodedData;
  }

  public static fromPulsarMessage(message: PulsarClient.Message): TopicMessage{
    return new TopicMessage(message.getTopicName(),
                            message.getMessageId(),
                            message.getPublishTimestamp(),
                            message.getEventTimestamp(),
                            message.getData(),
                            message.getPartitionKey(),
                            message.getProperties(),
                            message.getRedeliveryCount());
  }
}