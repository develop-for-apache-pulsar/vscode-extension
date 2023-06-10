

export type TTopicMessage = {
  readonly topicName?: string;
  readonly messageId: string;
  readonly publishTime?: string;
  readonly data?: string;
  readonly key?: string;
  readonly properties?: { [Key:string]: string };
  readonly redeliveryCount?: number;
};
