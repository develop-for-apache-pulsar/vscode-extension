import {TTopicMessage} from "../../types/tTopicMessage";
import {TTopicMessageDocumentContent} from "../../types/tTopicMessageDocumentContent";

export default class TopicMessageDocumentContent implements TTopicMessageDocumentContent{
  constructor(public readonly providerTypeName: string,
              public readonly clusterName: string,
              public readonly tenantName: string,
              public readonly namespaceName: string,
              public readonly topicName: string,
              public readonly topicAddress: string,
              public readonly messages: TTopicMessage[] = []) {
  }

  public static fromJson(json: string): TopicMessageDocumentContent{
    try{
      const parsed = JSON.parse(json);

      if(!parsed.providerTypeName || parsed.providerTypeName.length < 1){
        throw new Error("providerTypeName is not set");
      }

      if(!parsed.clusterName || parsed.clusterName.length < 1){
        throw new Error("clusterName is not set");
      }

      if(!parsed.tenantName || parsed.tenantName.length < 1){
        throw new Error("tenantName is not set");
      }

      if(!parsed.namespaceName || parsed.namespaceName.length < 1){
        throw new Error("namespaceName is not set");
      }

      if(!parsed.topicName || parsed.topicName.length < 1){
        throw new Error("topicName is not set");
      }

      if(!parsed.topicAddress || parsed.topicAddress.length < 1){
        throw new Error("topicAddress is not set");
      }

      if(!parsed.messages){
        throw new Error("messages is not set");
      }

      return new TopicMessageDocumentContent(parsed.providerTypeName,
        parsed.clusterName,
        parsed.tenantName,
        parsed.namespaceName,
        parsed.topicName,
        parsed.topicAddress,
        parsed.messages);
    }catch (e: any) {
      throw new Error(`The pulsar file is not formatted correctly - ${e.message}`);
    }
  }

  public toJson(): string {
    return JSON.stringify(this, undefined, 2);
  }

  public addMessage(message: TTopicMessage): void{
    this.messages.push(message);
  }
}