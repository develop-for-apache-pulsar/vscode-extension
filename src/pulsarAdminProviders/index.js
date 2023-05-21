"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PulsarAdminProviders = void 0;
const settings_1 = require("./standalone/settings");
const settings_2 = require("./private-service/settings");
const settings_3 = require("./datastax-astra-streaming/settings");
class PulsarAdminProviders {
    constructor() {
        this.providerRegistry = [];
        const sa = new settings_1.Settings();
        const pv = new settings_2.Settings();
        const ds = new settings_3.Settings();
        this.addProvider(sa.typeName, sa);
        this.addProvider(pv.typeName, pv);
        this.addProvider(ds.typeName, ds);
    }
    getProvider(providerTypeName) {
        const provider = this.providerRegistry.find((p) => p[0] === providerTypeName);
        if (provider === undefined) {
            throw new Error(`Provider ${providerTypeName} not found`);
        }
        return provider[1];
    }
    get allProviderInfo() {
        return this.providerRegistry.map((p) => {
            return {
                typeName: p[0],
                displayName: p[1].displayName,
                description: p[1].description
            };
        });
    }
    addProvider(providerTypeName, provider) {
        this.providerRegistry.push([providerTypeName, provider]);
    }
}
exports.PulsarAdminProviders = PulsarAdminProviders;
