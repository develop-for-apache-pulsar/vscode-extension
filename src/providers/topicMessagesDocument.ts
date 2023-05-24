import * as vscode from "vscode";

export default class TopicMessagesDocument implements vscode.CustomDocument {
  constructor(
    public readonly uri: vscode.Uri,
  ) {
    console.log(uri);
  }

  dispose(): void {

  }
}