"use strict";
/* eslint-disable */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstraApi = void 0;
const axios_1 = require("axios");
const traceDecorator_1 = require("../../utils/traceDecorator");
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
__decorate([
    (0, traceDecorator_1.trace)('Astra: Get Streaming Tenants'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AstraApi.prototype, "getStreamingTenants", null);
__decorate([
    (0, traceDecorator_1.trace)('Astra: Get Streaming Clusters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AstraApi.prototype, "getStreamingClusters", null);
exports.AstraApi = AstraApi;
