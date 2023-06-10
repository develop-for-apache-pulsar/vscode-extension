import {TTopicMessage} from "./tTopicMessage";

export type TTopicMessageDocumentContent = {
  get providerTypeName(): string,
  get clusterName(): string,
  get tenantName(): string,
  get topicType(): string,
  get namespaceName(): string,
  get topicName(): string,
  get messages(): TTopicMessage[],
  get lastMessageId(): string,
  set lastMessageId(value: string),
  addMessage(message: TTopicMessage): void;
};