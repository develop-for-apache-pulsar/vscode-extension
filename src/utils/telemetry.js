"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_telemetry_1 = require("@vscode/extension-telemetry");
const constants_1 = require("../common/constants");
class Telemetry {
    static initialize() {
        const context = global.extensionContext;
        // create telemetry reporter on extension activation
        this.reporter = new extension_telemetry_1.default(constants_1.TELEM_KEY);
        // ensure it gets properly disposed. Upon disposal the events will be flushed
        context.subscriptions.push(this.reporter);
    }
    static sendEvent(eventName, properties) {
        try {
            const context = global.extensionContext;
            if (context.env.isTelemetryEnabled) {
                this.reporter.sendTelemetryEvent(eventName, properties);
            }
        }
        catch {
        }
    }
    static sendError(error) {
        try {
            const context = global.extensionContext;
            if (context.env.isTelemetryEnabled) {
                this.reporter.sendTelemetryErrorEvent(error.name, { message: error.message, stack: (error.stack ? error.stack : '') });
            }
        }
        catch {
        }
    }
}
exports.default = Telemetry;
Telemetry.initialize();
