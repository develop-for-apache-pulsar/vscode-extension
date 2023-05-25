import * as PulsarClient from "pulsar-client";

export type TTopicMessage = {
  readonly topicName?: string;
  readonly messageId?: PulsarClient.MessageId;
  readonly publishTimestamp?: number;
  readonly eventTimestamp?: number;
  readonly data?: Buffer;
  readonly partitionKey?: string;
  readonly properties?: { [Key:string]: string };
  readonly redeliveryCount?: number;
};
