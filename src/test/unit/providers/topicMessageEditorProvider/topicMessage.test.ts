import {assert, expect} from "chai";
import TopicMessage from "../../../../providers/topicMessageEditorProvider/topicMessage";
import * as PulsarClient from "pulsar-client";

describe("Topic message tests", () => {
  it("should construct new topic message", () => {
    const dataBuffer = Buffer.from("data");
    const message = new TopicMessage("topicName", new PulsarClient.MessageId(), 0, 0, dataBuffer, "partitionKey", {}, 0);

    assert.equal(message.publishTimestamp, 0);
    assert.equal(message.topicName, "topicName");
    assert.equal(message.decodedData, "data");
    assert.equal(message.decodedPartitionKey, "partitionKey");
  });

});