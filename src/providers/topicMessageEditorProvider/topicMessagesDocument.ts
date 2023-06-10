import * as vscode from "vscode";
import * as fs from "fs";
import ErrnoException = NodeJS.ErrnoException;
import TopicMessageDocumentContent from "./topicMessageDocumentContent";

export default class TopicMessagesDocument implements vscode.CustomDocument {
  public static async create(uri: vscode.Uri, backupId: string | undefined): Promise<TopicMessagesDocument> {
    // If we have a backup, read that.
    console.debug(typeof backupId === 'string' ? `Creating document from backup` : `Creating new document`);
    const dataFile = typeof backupId === 'string' ? vscode.Uri.parse(backupId) : uri;

    return TopicMessagesDocument.readFile(dataFile);
  }

  private static async readFile(uri: vscode.Uri): Promise<TopicMessagesDocument> {

    // Opening a new document. Parse the info from the uri and build a new document.
    if (uri.scheme === 'untitled') {
      console.debug("Using untitled scheme");
      const uriParts = uri.path.split('\\');

      console.debug("uriParts: %o", uriParts);
      const providerTypeName = uriParts[0];
      const clusterName = uriParts[1];
      const tenantName = uriParts[2];
      const namespaceName = uriParts[3];
      const topicType = uriParts[4];
      const topicName = uriParts[5]?.replace('.pulsar', '');

      const newTopicContent =  new TopicMessageDocumentContent(providerTypeName, clusterName, tenantName, namespaceName, topicName, topicType, "earliest", []);

      console.debug("New topic content: %o", newTopicContent);
      return new TopicMessagesDocument(uri, newTopicContent);
    }

    // Otherwise parse the existing file's contents.
    console.debug("Using existing file");
    let fileContents: TopicMessageDocumentContent | undefined = undefined;
    try {
      fs.readFile(uri.fsPath, "utf8", (err: ErrnoException | null, data: string) => {
        if (err){
          throw new Error(`An error occurred trying to read the pulsar file - ${err?.message}`);
        }

        console.debug("File contents: %o", data);

        try{
          fileContents = TopicMessageDocumentContent.fromJson(data);
        }catch (e: any){
          throw new Error('Could not build document from file contents - ' + e?.message);
        }
      });
    } catch(e) {
      console.error(e);
      throw e;
    }

    if (!fileContents) {
      throw new Error('File contents were not built correctly. Try opening the file again.');
    }

    return new TopicMessagesDocument(uri, fileContents);
  }

  constructor(
    public readonly uri: vscode.Uri,
    public readonly content: TopicMessageDocumentContent
  ) {
  }

  public dispose(): void {
    console.debug("Disposing document");
  }

  /**
   * Called by VS Code when the user saves the document.
   */
  public async save(cancellation: vscode.CancellationToken): Promise<void> {
    console.debug("Saving document");
    await this.saveAs(this.uri, cancellation);
  }

  /**
   * Called by VS Code when the user saves the document to a new location.
   */
  public async saveAs(targetResource: vscode.Uri, cancellation: vscode.CancellationToken): Promise<void> {
    console.debug("Saving file contents as: %o", targetResource);
    console.debug("File contents: %o", this.content.toJson());

    fs.writeFile(targetResource.fsPath, this.content.toJson(), (err: ErrnoException | null) => {
      if (err) {
        console.error(err);
        throw new Error(`An error occurred trying to save the pulsar file - ${err.message}`); //let vscode handle the error
      }
    });
  }

  /**
   * Called by VS Code to back up the edited document.
   *
   * These backups are used to implement hot exit.
   */
  public async backup(destination: vscode.Uri, cancellation: vscode.CancellationToken): Promise<vscode.CustomDocumentBackup> {
    console.debug("Backing up document");
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