import {TTopicMessage} from "../../types/tTopicMessage";
import {MessageEvent} from "ws";
import {TextEncoder} from "util";
import {GetSchemaResponse, GetSchemaResponseTypeEnum} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import * as avro from 'avsc';

const defaultSchema = new class implements GetSchemaResponse {
  data: string = "";
  type: GetSchemaResponseTypeEnum = GetSchemaResponseTypeEnum.None;
};

export default class TopicMessage implements TTopicMessage{
  public readonly decodedPayload: any;
  public readonly messageType: GetSchemaResponseTypeEnum;

  constructor(public readonly messageId: string,
              public readonly publishTime: string,
              public readonly payload: string,
              public readonly key: string,
              public readonly properties: { [Key:string]: string },
              public readonly redeliveryCount: number,
              public readonly messageSizeBytes: number = -1,
              private readonly topicSchema: GetSchemaResponse = defaultSchema) {
    const b64Decode = atob(payload);
    this.messageType = topicSchema?.type || GetSchemaResponseTypeEnum.None;
    const schemaData = topicSchema?.data || "";
    this.decodedPayload = this.decodePayload(b64Decode, this.messageType, schemaData);
  }

  public static fromWsMessage(message: MessageEvent, topicSchema: GetSchemaResponse | undefined): TopicMessage{
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

  private decodePayload(payload: string, messageType: GetSchemaResponseTypeEnum, schemaData: string): any{
    switch(messageType){
      case GetSchemaResponseTypeEnum.Json:
        return this.decodeJsonSchemaPayload(payload, schemaData);
      case GetSchemaResponseTypeEnum.Avro:
        return this.decodeAvroSchemaPayload(payload, schemaData);
      case GetSchemaResponseTypeEnum.Bytes:
        return payload;
      case GetSchemaResponseTypeEnum.Protobuf:
        return this.decodeProtobufSchemaPayload(payload, schemaData);
      // case GetSchemaResponseTypeEnum.KeyValue:
      //   return this.decodeKeyValueSchemaPayload(payload, schemaData);
      default:
        try{
          return JSON.parse(payload);
        }catch{
          return payload;
        }
    }
  }

  private decodeJsonSchemaPayload(payload: string, schemaData: string): any{
    if(schemaData === ""){
      throw new Error("JSON schema data is empty");
    }

    try{
      const avroSchema = avro.Type.forSchema(JSON.parse(schemaData));
      const jsonPayload = JSON.parse(payload);
      const buf = avroSchema.toBuffer(jsonPayload);
      return avroSchema.fromBuffer(buf);
    }catch (e){
      console.log(e);
    }

    throw new Error("JSON schema validation failed");
  }

  private decodeAvroSchemaPayload(payload: string, schemaData: string): any{
    if(schemaData === ""){
      throw new Error("AVRO schema data is empty");
    }

    try{
      const avroSchema = avro.Type.forSchema(JSON.parse(schemaData));
      const buf = Buffer.from(payload, 'binary');
      return avroSchema.fromBuffer(buf);
    }catch(e){
      console.log(e);
    }

    throw new Error("AVRO schema validation failed");
  }

  private decodeProtobufSchemaPayload(payload: string, schemaData: string): any{
    if(schemaData === ""){
      throw new Error("PROTOBUF schema data is empty");
    }

    try{
      const avroSchema = avro.Type.forSchema(JSON.parse(schemaData));
      const jsonPayload = JSON.parse(payload);
      const buf = avroSchema.toBuffer(jsonPayload);
      return avroSchema.fromBuffer(buf);
    }catch (e){
      console.log(e);
    }
  }

  // private decodeKeyValueSchemaPayload(payload: string, schemaData: string) {
  //   if(schemaData === ""){
  //     throw new Error("KEYVALUE schema data is empty");
  //   }
  //
  //   // let formattedSchemaData = schemaData.replace(/\\/g,'');
  //   // formattedSchemaData = formattedSchemaData.replace(/"{/g,'{');
  //   // formattedSchemaData = formattedSchemaData.replace(/}"/g,'}');
  //   //
  //   // const topicSchema = JSON.parse(formattedSchemaData);
  //   //
  //   // var keySchema = topicSchema.data.key;
  //   // var ns = keySchema.namespace.replace(/\d.*_/,'');
  //   // keySchema.namespace=ns;
  //   //
  //   // var valSchema = topicSchema.data.value;
  //   // var valns = valSchema.namespace.replace(/\d.*_/,'');
  //   // valSchema.namespace=valns;
  //
  //   const key = message.getKey();
  //   const value = JSON.parse(message.getData().toString());
  //
  //   console.log(`Key: ${key}, Value: ${JSON.stringify(value)}`);
  // }
}