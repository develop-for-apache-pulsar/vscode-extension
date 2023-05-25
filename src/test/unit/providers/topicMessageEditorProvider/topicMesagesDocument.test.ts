import {assert, expect} from "chai";
import TopicMessageDocumentContent from "../../../../providers/topicMessageEditorProvider/topicMessageDocumentContent";

describe("Topic message document content tests", () => {
  it("should construct new document content", () => {
    const content = new TopicMessageDocumentContent("providerTypeName",
      "clusterName",
      "tenantName",
      "namespaceName",
      "topicName",
      "topicType");

    assert.equal(content.providerTypeName, "providerTypeName");
    assert.equal(content.clusterName, "clusterName");
    assert.equal(content.tenantName, "tenantName");
    assert.equal(content.namespaceName, "namespaceName");
    assert.equal(content.topicName, "topicName");
    assert.equal(content.topicType, "topicType");
    assert.equal(content.messages.length, 0);
  });

  it("should construct new document content from json", () => {
    const obj = {
      providerTypeName: "providerTypeName",
      clusterName: "clusterName",
      tenantName: "tenantName",
      namespaceName: "namespaceName",
      topicName: "topicName",
      topicType: "topicType",
      messages: []
    };

    const content = TopicMessageDocumentContent.fromJson(JSON.stringify(obj));
    assert.equal(content.providerTypeName, "providerTypeName");
    assert.equal(content.clusterName, "clusterName");
    assert.equal(content.tenantName, "tenantName");
    assert.equal(content.namespaceName, "namespaceName");
    assert.equal(content.topicName, "topicName");
    assert.equal(content.topicType, "topicType");
    assert.equal(content.messages.length, 0);
  });

  it("should throw error when json is not formatted correctly", () => {
    const obj = {
      asd: "asd"
    };

    assert.throws(() => TopicMessageDocumentContent.fromJson(JSON.stringify(obj)));
  });

  it("should throw error when providerTypeName is not set", () => {
    const obj = {
      clusterName: "clusterName",
      tenantName: "tenantName",
      namespaceName: "namespaceName",
      topicName: "topicName",
      topicType: "topicType",
      messages: []
    };

    assert.throws(() => TopicMessageDocumentContent.fromJson(JSON.stringify(obj)));
  });

  it("should add a message", () => {
    const content = new TopicMessageDocumentContent("providerTypeName",
      "clusterName",
      "tenantName",
      "namespaceName",
      "topicName",
      "topicType");
    content.addMessage({
      publishTime: "asdf",
      topicName: "topicName",
    });

    assert.equal(content.messages.length, 1);
  });
});
