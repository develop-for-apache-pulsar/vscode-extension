"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trace = void 0;
const telemetry_1 = require("./telemetry");
function trace(eventName) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            telemetry_1.default.sendEvent(eventName);
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
exports.trace = trace;
