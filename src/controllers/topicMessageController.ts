import {TopicMessageEditorProvider} from "../providers/topicMessageEditorProvider";
import * as vscode from "vscode";

export default class TopicMessageController {
  public static createTopicMessageEditorProvider(context: vscode.ExtensionContext): TopicMessageEditorProvider {
    return new TopicMessageEditorProvider(context);
  }
}