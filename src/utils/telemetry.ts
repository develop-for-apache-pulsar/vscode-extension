import TelemetryReporter from '@vscode/extension-telemetry';
import {TELEM_KEY} from "../common/constants";
import * as vscode from "vscode";

export default class Telemetry {
  private static reporter: TelemetryReporter;

  public static initialize() : TelemetryReporter {
    // create telemetry reporter on extension activation
    this.reporter = new TelemetryReporter(TELEM_KEY);
    return this.reporter;
  }

  public static sendEvent(eventName: string, properties?: { [key: string]: string }) {
    //try {
      if (vscode.env.isTelemetryEnabled) {
        this.reporter.sendTelemetryEvent(eventName, properties);
      }
   // } catch {
    //}
  }

  public static sendError(error: Error) {
    try {
      if (vscode.env.isTelemetryEnabled) {
        this.reporter.sendTelemetryErrorEvent(error.name, { message: error.message, stack: (error.stack ? error.stack : '') });
      }
    } catch {
    }
  }
}