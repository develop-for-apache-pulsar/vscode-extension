"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildPulsarAdminProviderConfigs = void 0;
const configuration_1 = require("../providers/configurationProvider/configuration");
async function BuildPulsarAdminProviderConfigs(providerRegistry) {
    const configs = configuration_1.default.getClusterConfigs();
    const providerConfigsPromises = [];
    configs.map((savedConfig) => {
        const providerConfigsPromise = new Promise((resolve, reject) => {
            try {
                const providerSettings = providerRegistry.getProvider(savedConfig.providerTypeName);
                const clusterPromises = [];
                savedConfig.clusters.map((savedConfigCluster) => {
                    const pulsarAdminClusterPromise = new Promise((resolve, reject) => {
                        try {
                            const providerClass = require(`./${savedConfig.providerTypeName}/provider`);
                            const tenants = [];
                            savedConfigCluster.tenants.forEach((tenant) => {
                                tenants.push(new class {
                                    constructor() {
                                        this.pulsarAdmin = new providerClass.Provider(savedConfigCluster.webServiceUrl, tenant.pulsarToken);
                                        this.name = tenant.name;
                                        this.pulsarToken = tenant.pulsarToken;
                                    }
                                });
                            });
                            const pulsarAdminProviderCluster = new class {
                                constructor() {
                                    this.brokerServiceUrl = savedConfigCluster.brokerServiceUrl;
                                    this.name = savedConfigCluster.name;
                                    this.pulsarVersion = savedConfigCluster.pulsarVersion;
                                    this.tenants = tenants;
                                    this.webServiceUrl = savedConfigCluster.webServiceUrl;
                                    this.websocketUrl = savedConfigCluster.websocketUrl;
                                }
                            };
                            resolve(pulsarAdminProviderCluster);
                        }
                        catch (e) {
                            //@ts-ignore
                            reject(new Error(`Error building provider for cluster ${savedConfigCluster.name} in provider type ${savedConfig.providerTypeName}`, { cause: err }));
                        }
                    });
                    clusterPromises.push(pulsarAdminClusterPromise);
                });
                Promise.all(clusterPromises).then((pulsarAdminClusters) => {
                    resolve({
                        settings: providerSettings,
                        config: savedConfig,
                        pulsarAdminClusters: pulsarAdminClusters
                    });
                });
            }
            catch (err) {
                //@ts-ignore
                reject(new Error(`Error loading saved config ${savedConfig.name} for provider type ${savedConfig.providerTypeName}`, { cause: err }));
            }
        });
        providerConfigsPromises.push(providerConfigsPromise);
    });
    return Promise.all(providerConfigsPromises);
}
exports.BuildPulsarAdminProviderConfigs = BuildPulsarAdminProviderConfigs;
