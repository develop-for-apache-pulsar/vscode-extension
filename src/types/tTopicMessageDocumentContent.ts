import {TTopicMessage} from "./tTopicMessage";

export type TTopicMessageDocumentContent = {
  get providerTypeName(): string,
  get clusterName(): string,
  get tenantName(): string,
  get namespaceName(): string,
  get topicName(): string,
  get topicAddress(): string,
  get messages(): TTopicMessage[],
  addMessage(message: TTopicMessage): void;
};