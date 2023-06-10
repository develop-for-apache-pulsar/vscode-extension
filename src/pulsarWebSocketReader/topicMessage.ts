import {TTopicMessage} from "../types/tTopicMessage";
import {MessageEvent} from "isomorphic-ws";
import {TextEncoder} from "util";

enum MessageType {
  json = "JSON",
  avro = "AVRO",
  binary = "BINARY",
  string = "STRING",
}

export default class TopicMessage implements TTopicMessage{
  public readonly decodedPayload: any;
  public readonly messageType: MessageType;

  constructor(public readonly messageId: string,
              public readonly publishTime: string,
              public readonly payload: string,
              public readonly key: string,
              public readonly properties: { [Key:string]: string },
              public readonly redeliveryCount: number,
              public readonly messageSizeBytes: number = -1,
              public readonly topicSchema: string | undefined = undefined) {
    this.messageType = this.getMessageType(payload, topicSchema);

    const b64Decode = atob(payload);

    switch(this.messageType){
      case MessageType.json:
        this.decodedPayload = JSON.parse(b64Decode);
        break;
      case MessageType.avro:
        if(!this.topicSchema){
          throw new Error("Topic schema was not set");
        }

        const avro = require('avro-js');
        const topicSchema = JSON.parse(this.topicSchema);
        // const keySchema = topicSchema.data.key;
        // const ns = keySchema.namespace.replace(/\d.*_/,'');
        // keySchema.namespace=ns;
        // const keyAvroSchema = avro.parse(keySchema);

        const valSchema = topicSchema.data.value;
        const valns = valSchema.namespace.replace(/\d.*_/,'');
        valSchema.namespace=valns;
        const valAvroSchema = avro.parse(valSchema);

        this.decodedPayload = valAvroSchema.fromBuffer(b64Decode);
        break;
      case MessageType.binary:
      case MessageType.string:
      default:
        this.decodedPayload = b64Decode;
        break;
    }
  }

  public static fromWsMessage(message: MessageEvent, topicSchema: string | undefined): TopicMessage{
    if(!message.data){
      throw new Error("Message data is empty");
    }

    // capture the bytes before any decoding is done
    const messageSizeBytes = (new TextEncoder().encode(message.data.toString())).length;
    const messageJson = JSON.parse(message.data.toString());

    return new TopicMessage(messageJson.messageId,
                            messageJson.publishTime,
                            messageJson.payload,
                            messageJson.key,
                            messageJson.properties,
                            messageJson.redeliveryCount,
                            messageSizeBytes,
                            topicSchema);
  }

  private getMessageType(data: string, topicSchema: string | undefined): MessageType{

    if(topicSchema){
      return MessageType.avro;
    }

    if(this.isJSON(data)){
      return MessageType.json;
    }

    if(this.isBinary(data)){
      return MessageType.binary;
    }

    return MessageType.string;
  }

  private isJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  private isBinary(str: string): boolean {
    // Check if the string contains non-printable ASCII characters
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      if (charCode < 32 || charCode > 126) {
        return true;
      }
    }
    return false;
  }
}