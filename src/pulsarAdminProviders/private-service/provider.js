"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
const provider_1 = require("../base-provider/provider");
class Provider extends provider_1.BaseProvider {
    constructor(webServiceUrl, pulsarToken) {
        if (webServiceUrl === null || webServiceUrl === undefined) {
            throw new Error("Web service url is required");
        }
        super(webServiceUrl, pulsarToken);
    }
}
exports.Provider = Provider;
