import * as vscode from "vscode";
import {FunctionConfigRuntimeEnum} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import {COMMAND_FUNCTION_PACKAGE_CHOOSER} from "../common/constants";

export default class FunctionPackageChooserCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
  private readonly runtimeRegexes: [FunctionConfigRuntimeEnum, RegExp][];

  constructor() {
    this.runtimeRegexes = [
      [FunctionConfigRuntimeEnum.Python, new RegExp(/^.*?(\bpy\b:).*?$/im)],
      [FunctionConfigRuntimeEnum.Go, new RegExp(/^.*?(\bgo\b:).*?$/im)],
      [FunctionConfigRuntimeEnum.Java, new RegExp(/^.*?(\bjar\b:).*?$/im)],
    ];

    vscode.workspace.onDidChangeConfiguration((_) => {
      this._onDidChangeCodeLenses.fire();
    });
  }

  provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
    const documentText = document.getText();
    const codeLenses: vscode.CodeLens[] = [];

    if(token.isCancellationRequested) {
      return [];
    }

    // Test the document for each regex
    for (const runtimeRegex of this.runtimeRegexes) {
      const matches = runtimeRegex[1].exec(documentText);
      if(matches === null) {
        continue;
      }

      if(token.isCancellationRequested) {
        return [];
      }

      const line = document.lineAt(document.positionAt(matches.index).line);

      switch(runtimeRegex[0]) {
        case FunctionConfigRuntimeEnum.Python:
          // A range for choosing a single file
          codeLenses.push(new vscode.CodeLens(new vscode.Range(line.lineNumber, 0, line.lineNumber, runtimeRegex[0].length)));
          // A range for choosing a folder
          codeLenses.push(new vscode.CodeLens(new vscode.Range(line.lineNumber, 1, line.lineNumber, runtimeRegex[0].length)));
          break;
        case FunctionConfigRuntimeEnum.Go:
          // A range for choosing a single file
          codeLenses.push(new vscode.CodeLens(new vscode.Range(line.lineNumber, 0, line.lineNumber, runtimeRegex[0].length)));
          break;
        case FunctionConfigRuntimeEnum.Java:
          // A range for choosing a single file
          codeLenses.push(new vscode.CodeLens(new vscode.Range(line.lineNumber, 0, line.lineNumber, runtimeRegex[0].length)));
          break;
      }

    }

    return codeLenses;
  }

  resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
    if(token.isCancellationRequested) {
      return codeLens;
    }

    switch(codeLens.range.end.character) {
      case FunctionConfigRuntimeEnum.Python.length:
        if(codeLens.range.start.character === 0) {
          codeLens.command = {
            title: "Choose py or whl file",
            command: COMMAND_FUNCTION_PACKAGE_CHOOSER,
            arguments: [FunctionConfigRuntimeEnum.Python, codeLens.range, {'python': ['py', 'whl']}]
          };
        }

        if(codeLens.range.start.character === 1) {
          codeLens.command = {
            title: "Choose Python project folder",
            command: COMMAND_FUNCTION_PACKAGE_CHOOSER,
            arguments: [FunctionConfigRuntimeEnum.Python, codeLens.range]
          };
        }

        break;

      case FunctionConfigRuntimeEnum.Go.length:
        if(codeLens.range.start.character === 0) {
          codeLens.command = {
            title: "Choose Go executable",
            command: COMMAND_FUNCTION_PACKAGE_CHOOSER,
            arguments: [FunctionConfigRuntimeEnum.Go, codeLens.range, {'go': ['*']}]
          };
        }

        break;

      case FunctionConfigRuntimeEnum.Java.length:
        if(codeLens.range.start.character === 0) {
          codeLens.command = {
            title: "Choose jar or nar file",
            command: COMMAND_FUNCTION_PACKAGE_CHOOSER,
            arguments: [FunctionConfigRuntimeEnum.Java, codeLens.range, {'java': ['jar', 'nar']}]
          };
        }

        break;
    }

    return codeLens;
  }

}