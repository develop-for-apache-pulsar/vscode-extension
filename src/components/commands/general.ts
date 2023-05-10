import * as vscode from "vscode";
import { sleep } from "../../utils/sleep";

export class PulsarAdminCommandUtils{
  public static async showInfoMessage(message: string) {
    await vscode.window.showInformationMessage(message);
  }

  public static async debounceActivation(needsActivationDebouncing: boolean): Promise<boolean> {
    if (needsActivationDebouncing) {
      await sleep(50);
      await vscode.commands.executeCommand('extension.vsPulsarAdminDebounceActivation');
    }

    return false;
  }
}
