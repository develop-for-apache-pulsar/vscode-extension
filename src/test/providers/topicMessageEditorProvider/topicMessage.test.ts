import {expect} from "chai";
import TopicMessage from "../../../providers/topicMessageEditorProvider/topicMessage";
import {GetSchemaResponse, GetSchemaResponseTypeEnum} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import {MessageEvent, WebSocket, Server} from "ws";

describe("Topic message document tests", () => {
  const serverAddress: string = "ws://localhost:8082";
  let server: Server;

  before(() => {
    // Start a web socket server
    server = new Server({
      port: 8082
    });
  });

  after(() => {
    // Stop the web socket server
    server.close();
  });

  it("should be a string with no schema", async () => {
    const messageEvent = new class implements MessageEvent {
      target = new WebSocket(serverAddress);
      data = JSON.stringify({
        "messageId": "COjdIxAQIAAwAQ==",
        "publishTime": "publishTime",
        "payload": btoa("hi there"),
        "key": "key",
        "properties": {},
        "redeliveryCount": 0,
        "size": 0
      });
      type: string = "message";
    };

    const topicMessage: TopicMessage = TopicMessage.fromWsMessage(messageEvent, undefined);
    expect(topicMessage.messageType).to.equal("STRING");
    expect(topicMessage.decodedPayload).to.equal("hi there");
    expect(topicMessage.messageId).to.equal(atob("COjdIxAQIAAwAQ=="));
  });

  it("should be a json with no schema", async () => {
    const messageEvent = new class implements MessageEvent {
      target = new WebSocket(serverAddress);
      data = JSON.stringify({
        "messageId": "COjdIxAQIAAwAQ==",
        "publishTime": "publishTime",
        "payload": btoa("{\"a\":\"b\"}"),
        "key": "key",
        "properties": {},
        "redeliveryCount": 0,
        "size": 0
      });
      type: string = "message";
    };

    const topicMessage: TopicMessage = TopicMessage.fromWsMessage(messageEvent, undefined);
    expect(topicMessage.messageType).to.equal("JSON");
  });

  it("should be an avro schema", async () => {
    const avro = require('avro-js');

    const avroSchema = {
      type: 'record',
      name: 'Pet',
      fields: [
        {
          name: 'kind',
          type: {type: 'enum', name: 'PetKind', symbols: ['CAT', 'DOG']}
        },
        {name: 'name', type: 'string'}
      ]
    };

    const schema = avro.parse(avroSchema);

    const avroMessageData = {kind: 'CAT', name: 'Albert'};

    const buf = schema.toBuffer(avroMessageData);

    const topicSchema = new class implements GetSchemaResponse {
      data: string = JSON.stringify(avroSchema);
      properties: { [Key: string]: string } = {};
      type: GetSchemaResponseTypeEnum = GetSchemaResponseTypeEnum.Avro;
    };

    const messageEvent = new class implements MessageEvent {
      target = new WebSocket(serverAddress);
      data = JSON.stringify({
        "messageId": "messageId",
        "publishTime": "publishTime",
        "payload": btoa(buf.toString()),
        "key": "key",
        "properties": {},
        "redeliveryCount": 0,
        "size": 0
      });
      type: string = "message";
    };

    const topicMessage: TopicMessage = TopicMessage.fromWsMessage(messageEvent, topicSchema);
    expect(topicMessage.messageType).to.equal("AVRO");
  });

  it("should be an json schema", async () => {
    const jsonSchema = {
      type: "object",
      properties: {
        foo: {type: "integer"},
        bar: {type: "string"},
      },
      required: ["foo"],
      additionalProperties: false,
    };

    const jsonMessageData = { foo: 1, bar: "abc" };

    const topicSchema = new class implements GetSchemaResponse {
      data: string = JSON.stringify(jsonSchema);
      properties: { [Key: string]: string } = {};
      type: GetSchemaResponseTypeEnum = GetSchemaResponseTypeEnum.Json;
    };

    const messageEvent = new class implements MessageEvent {
      target = new WebSocket(serverAddress);
      data = JSON.stringify({
        "messageId": "messageId",
        "publishTime": "publishTime",
        "payload": btoa(JSON.stringify(jsonMessageData)),
        "key": "key",
        "properties": {},
        "redeliveryCount": 0,
        "size": 0
      });
      type: string = "message";
    };

    const topicMessage: TopicMessage = TopicMessage.fromWsMessage(messageEvent, topicSchema);
    expect(topicMessage.messageType).to.equal("JSON");
  });
});