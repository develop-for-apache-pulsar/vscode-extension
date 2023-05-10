"use strict";
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstraApi = void 0;
const axios_1 = require("axios");
class AstraApi {
    constructor(astraToken) {
        this.astraToken = astraToken;
        this.baseUrl = "https://api.astra.datastax.com";
    }
    async getStreamingTenants() {
        const apiUrl = `${this.baseUrl}/v2/streaming/tenants`;
        try {
            const headers = { Authorization: `Bearer ${this.astraToken}` };
            const response = await axios_1.default.get(apiUrl, { headers });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
    async getStreamingClusters() {
        const apiUrl = `${this.baseUrl}/v2/streaming/clusters`;
        try {
            const headers = { Authorization: `Bearer ${this.astraToken}` };
            const response = await axios_1.default.get(apiUrl, { headers });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.AstraApi = AstraApi;
//# sourceMappingURL=astra-api.js.map