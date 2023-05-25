import * as vscode from "vscode";
import * as fs from "fs";
import ErrnoException = NodeJS.ErrnoException;
import TopicMessageDocumentContent from "./topicMessageDocumentContent";
import ConfigurationProvider from "../configurationProvider/configuration";
import {TPulsarAdminProviderCluster} from "../../types/tPulsarAdminProviderCluster";
import {TSavedProviderConfig} from "../../types/tSavedProviderConfig";
import {TPulsarAdminProviderTenant} from "../../types/tPulsarAdminProviderTenant";
import {TTopicMessage} from "../../types/tTopicMessage";

export default class TopicMessagesDocument implements vscode.CustomDocument {
  private readonly _savedProviderConfig: TSavedProviderConfig | undefined;
  private readonly _savedCluster: TPulsarAdminProviderCluster | undefined;
  private readonly _savedTenant: TPulsarAdminProviderTenant | undefined;

  public static async create(uri: vscode.Uri, backupId: string | undefined): Promise<TopicMessagesDocument> {
    // If we have a backup, read that.
    const dataFile = typeof backupId === 'string' ? vscode.Uri.parse(backupId) : uri;

    return TopicMessagesDocument.readFile(dataFile);
  }

  private static async readFile(uri: vscode.Uri): Promise<TopicMessagesDocument> {

    // Opening a new document. Parse the info from the uri and build a new document.
    if (uri.scheme === 'untitled') {
      console.log(uri.path);
      const uriParts = uri.path.split('/');
      const providerTypeName = uriParts[0];
      const clusterName = uriParts[1];
      const tenantName = uriParts[2];
      const namespaceName = uriParts[3];
      const topicType = uriParts[4];
      const topicName = uriParts[5]?.replace('.pulsar', '');

      const fileContents =  new TopicMessageDocumentContent(providerTypeName, clusterName, tenantName, namespaceName, topicName, topicType);

      return new TopicMessagesDocument(uri, fileContents);
    }

    // Otherwise parse the existing file's contents.
    let fileContents: TopicMessageDocumentContent | undefined = undefined;
    try {

      fs.readFile(uri.fsPath, "utf8", (err: ErrnoException | null, data: string) => {
        if (err){
          throw new Error(`An error occurred trying to read the pulsar file - ${err.message}`);
        }

        fileContents = TopicMessageDocumentContent.fromJson(data);
      });
    } catch {
      throw new Error('Could not build document from file contents. Content is either not valid json or not formatted correctly');
    }

    if (!fileContents) {
      throw new Error('File contents were not built correctly. Try opening the file again.');
    }

    return new TopicMessagesDocument(uri, fileContents);
  }

  constructor(
    public readonly uri: vscode.Uri,
    private readonly fileContents: TopicMessageDocumentContent
  ) {
    const savedProviderConfigs = ConfigurationProvider.getClusterConfigs();

    this._savedProviderConfig = savedProviderConfigs.find((providerConfig) => { return providerConfig.providerTypeName === fileContents.providerTypeName; });
    if(!this._savedProviderConfig){
      throw new Error(`Could not find provider config for providerTypeName: ${fileContents.providerTypeName}`);
    }

    this._savedCluster = this._savedProviderConfig.clusters.find((cluster) => { return cluster.name === fileContents.clusterName; });
    if(!this._savedCluster){
      throw new Error(`Could not find cluster for name: ${fileContents.clusterName}`);
    }

    this._savedTenant = this._savedCluster.tenants.find((tenant) => { return tenant.name === fileContents.tenantName; });
    if(!this._savedTenant){
      throw new Error(`Could not find tenant for name: ${fileContents.tenantName}`);
    }
  }

  get providerConfig(): TSavedProviderConfig {
    return this._savedProviderConfig!;
  }

  get clusterInfo(): TPulsarAdminProviderCluster {
    return this._savedCluster!;
  }

  get tenantInfo(): TPulsarAdminProviderTenant {
    return this._savedTenant!;
  }

  get topicType(): string {
    return this.fileContents.topicType;
  }

  get messages(): TTopicMessage[] {
    return this.fileContents.messages;
  }

  get topicName() : string{
    return this.fileContents.topicName;
  }

  get namespaceName() : string {
    return this.fileContents.namespaceName;
  }

  public addMessage(message: TTopicMessage){
    this.fileContents.addMessage(message);
  }

  public dispose(): void {

  }

  /**
   * Called by VS Code when the user saves the document.
   */
  public async save(cancellation: vscode.CancellationToken): Promise<void> {
    await this.saveAs(this.uri, cancellation);
  }

  /**
   * Called by VS Code when the user saves the document to a new location.
   */
  public async saveAs(targetResource: vscode.Uri, cancellation: vscode.CancellationToken): Promise<void> {
    fs.writeFile(targetResource.fsPath, this.fileContents.toJson(), (err: ErrnoException | null) => {
      if (err) {
        vscode.window.showErrorMessage(`An error occurred trying to save the pulsar file - ${err.message}`);
        console.error(err);
      }
    });
  }

  /**
   * Called by VS Code to backup the edited document.
   *
   * These backups are used to implement hot exit.
   */
  public async backup(destination: vscode.Uri, cancellation: vscode.CancellationToken): Promise<vscode.CustomDocumentBackup> {
    await this.saveAs(destination, cancellation);

    return {
      id: destination.toString(),
      delete: async () => {
        try {
          await vscode.workspace.fs.delete(destination);
        } catch {
          // noop
        }
      }
    };
  }
}