import {TTopicMessage} from "../../types/tTopicMessage";
import {TTopicMessageDocumentContent} from "../../types/tTopicMessageDocumentContent";
import ConfigurationProvider from "../configurationProvider/configuration";
import * as path from "path";

export default class TopicMessageDocumentContent implements TTopicMessageDocumentContent{
  private readonly _webSocketUrl: URL;
  private readonly _pulsarToken: string | undefined;
  private _schema: string | undefined;
  constructor(public readonly providerTypeName: string,
              public readonly clusterName: string,
              public readonly tenantName: string,
              public readonly namespaceName: string,
              public readonly topicName: string,
              public readonly topicType: string,
              public lastMessageId: string,
              public readonly messages: TTopicMessage[]) {
    const savedProviderConfigs = ConfigurationProvider.getClusterConfigs();

    const savedProviderConfig = savedProviderConfigs.find((providerConfig) => { return providerConfig.providerTypeName === providerTypeName; });
    if(!savedProviderConfig) {
      throw new Error(`Could not find provider config for providerTypeName: ${providerTypeName}`);
    }

    console.debug("Using provider config: %o", savedProviderConfig);

    const savedCluster = savedProviderConfig.clusters.find((cluster) => { return cluster.name === clusterName; });
    if(savedCluster === undefined){
      throw new Error(`Could not find cluster for name: ${clusterName}`);
    }

    console.debug("Using cluster: %o", savedCluster);

    if(savedCluster.websocketUrl === undefined) {
      throw new Error("To watch topic messages the cluster must have websocket services running. Please ensure that the service is running and add the cluster again.");
    }

    const savedTenant = savedCluster.tenants.find((tenant) => { return tenant.name === tenantName; });
    if(savedTenant === undefined){
      throw new Error(`Could not find tenant for name: ${tenantName}`);
    }

    console.debug("Using tenant: %o", savedTenant);

    this._webSocketUrl = new URL(savedCluster.websocketUrl);

    if(!savedCluster.websocketUrl.endsWith("/")){
      this._webSocketUrl.pathname += "/";
    }

    this._webSocketUrl.pathname += path.join("reader", topicType, savedTenant.name, namespaceName, topicName);
    this._webSocketUrl.searchParams.set("readerName", "vscode-reader");
    this._webSocketUrl.searchParams.set("receiverQueueSize", "500");
    this._webSocketUrl.searchParams.set("messageId", lastMessageId);

    if(savedTenant.pulsarToken !== undefined){
      this._pulsarToken = savedTenant.pulsarToken;
    }

    // Todo: Look for a schema saved to topic, the below code was just a test
    // savedTenant.pulsarAdmin.GetTopicSchema(tenantName, namespaceName, topicName).then((schema) => {
    //   this._schema = schema;
    // });
  }

  public get topicSchema(): string | undefined {
    return this._schema;
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

      if(!parsed.topicType || parsed.topicType.length < 1){
        throw new Error("topicType is not set");
      }

      const topicMessage = new TopicMessageDocumentContent(parsed.providerTypeName,
        parsed.clusterName,
        parsed.tenantName,
        parsed.namespaceName,
        parsed.topicName,
        parsed.topicType,
        parsed.lastMessageId,
        parsed.messages
      );

      return topicMessage;
    }catch (e: any) {
      throw new Error(`The pulsar file is not formatted correctly - ${e.message}`);
    }
  }

  public toJson(): string {
    const obj = {
      providerTypeName: this.providerTypeName,
      clusterName: this.clusterName,
      tenantName: this.tenantName,
      namespaceName: this.namespaceName,
      topicName: this.topicName,
      topicType: this.topicType,
      lastMessageId: this.lastMessageId,
      messages: this.messages
    };

    return JSON.stringify(obj, undefined, 2);
  }

  public get webSocketUrl(): URL{
    return this._webSocketUrl;
  }

  public get pulsarToken(): string | undefined {
    return this._pulsarToken;
  }

  public addMessage(message: TTopicMessage): void{
    this.messages.push(message);
  }

}