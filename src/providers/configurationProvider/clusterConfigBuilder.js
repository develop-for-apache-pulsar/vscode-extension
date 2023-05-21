"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterConfigBuilder = void 0;
const uuid = require("uuid");
const configuration_1 = require("./configuration");
class ClusterConfigBuilder {
    constructor(providerTypeName, displayName) {
        if (!providerTypeName) {
            throw new Error("Provider type is required to save cluster configuration");
        }
        this.providerConfig = new class {
            constructor() {
                this.clusters = [];
                this.name = displayName;
                this.providerId = uuid.v4();
                this.providerTypeName = providerTypeName;
            }
        };
    }
    set providerName(providerName) {
        if (!this.providerConfig) {
            throw new Error("Cluster configuration is not initialized");
        }
        if (!providerName) {
            throw new Error("Provider name is required to save cluster configuration");
        }
        this.providerConfig.name = providerName;
    }
    async saveConfig() {
        return configuration_1.default.addClusterConfig(this.providerConfig);
    }
    validateWebServiceUrl(webServiceUrl) {
        try {
            new URL(webServiceUrl);
            return;
        }
        catch {
        }
        throw new Error("Check the format of the URL, it could not be validated.");
    }
    initCluster(clusterName, brokerServiceUrl, webServiceUrl, clusterVersion) {
        return new class {
            constructor() {
                this.name = clusterName;
                this.brokerServiceUrl = brokerServiceUrl;
                this.pulsarVersion = clusterVersion;
                this.tenants = [];
                this.webServiceUrl = webServiceUrl;
            }
        };
    }
    addCluster(clusterConfig) {
        this.providerConfig.clusters.push(clusterConfig);
    }
    findCluster(clusterName) {
        return this.providerConfig.clusters.find((cluster) => cluster.name === clusterName);
    }
    addTenant(clusterName, tenantName, pulsarAdmin, pulsarToken) {
        const cluster = this.findCluster(clusterName);
        if (cluster === undefined) {
            throw new Error(`An error occurred while looking up a cluster's details: "${clusterName}"`);
        }
        const tenant = new class {
            constructor() {
                this.name = tenantName;
                this.pulsarToken = pulsarToken;
                this.pulsarAdmin = pulsarAdmin;
            }
        };
        cluster.tenants.push(tenant);
    }
}
exports.ClusterConfigBuilder = ClusterConfigBuilder;
