import TelemetryReporter from '@vscode/extension-telemetry';
import {TELEM_KEY} from "../common/constants";

export default class Telemetry {
  private static reporter: TelemetryReporter;

  public static initialize() {
    const context = (global as any).extensionContext;

    // create telemetry reporter on extension activation
    this.reporter = new TelemetryReporter(TELEM_KEY);
    // ensure it gets properly disposed. Upon disposal the events will be flushed
    context.subscriptions.push(this.reporter);
  }

  public static sendEvent(eventName: string, properties?: { [key: string]: string }) {
    try {
      const context = (global as any).extensionContext;
      if (context.env.isTelemetryEnabled) {
        this.reporter.sendTelemetryEvent(eventName, properties);
      }
    } catch {
    }
  }

  public static sendError(error: Error) {
    try {
      const context = (global as any).extensionContext;
      if (context.env.isTelemetryEnabled) {
        this.reporter.sendTelemetryErrorEvent(error.name, { message: error.message, stack: (error.stack ? error.stack : '') });
      }
    } catch {
    }
  }
}

Telemetry.initialize();