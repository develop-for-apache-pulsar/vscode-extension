import ConfigurationProvider from "../providers/configurationProvider/configuration";
import {TPulsarAdminProviderConfigs} from "../types/tPulsarAdminProviderConfigs";
import {TPulsarAdminProviderCluster} from "../types/tPulsarAdminProviderCluster";
import {PulsarAdminProviders} from "./index";
import {TPulsarAdminProviderTenant} from "../types/tPulsarAdminProviderTenant";

export async function BuildPulsarAdminProviderConfigs(providerRegistry: PulsarAdminProviders): Promise<TPulsarAdminProviderConfigs[]> {
  const configs = ConfigurationProvider.getClusterConfigs();
  const providerConfigsPromises: Promise<TPulsarAdminProviderConfigs>[] = [];

  configs.map((savedConfig) => {
    const providerConfigsPromise = new Promise<TPulsarAdminProviderConfigs>((resolve, reject) => {
      try{
        const providerSettings = providerRegistry.getProvider(savedConfig.providerTypeName);

        const clusterPromises: Promise<TPulsarAdminProviderCluster>[] = [];

        savedConfig.clusters.map((savedConfigCluster) => {
          const pulsarAdminClusterPromise = new Promise<TPulsarAdminProviderCluster>((resolve, reject) => {
            try{
              const providerClass = require(`./${savedConfig.providerTypeName}/provider`);
              const tenants: TPulsarAdminProviderTenant[] = [];

              savedConfigCluster.tenants.forEach((tenant) => {
                tenants.push(new class implements TPulsarAdminProviderTenant {
                  pulsarAdmin = new providerClass.Provider(savedConfigCluster.webServiceUrl, tenant.pulsarToken);
                  name = tenant.name;
                  pulsarToken = tenant.pulsarToken;
                });
              });

              const pulsarAdminProviderCluster: TPulsarAdminProviderCluster = new class implements TPulsarAdminProviderCluster {
                brokerServiceUrl =  savedConfigCluster.brokerServiceUrl;
                name =  savedConfigCluster.name;
                pulsarVersion =  savedConfigCluster.pulsarVersion;
                tenants = tenants;
                webServiceUrl = savedConfigCluster.webServiceUrl;
                websocketUrl =  savedConfigCluster.websocketUrl;
              };

              resolve(pulsarAdminProviderCluster);
            }catch (e) {
              //@ts-ignore
              reject(new Error(`Error building provider for cluster ${savedConfigCluster.name} in provider type ${savedConfig.providerTypeName}`, { cause: err }));
            }
          });

          clusterPromises.push(pulsarAdminClusterPromise);
        });

        Promise.all<TPulsarAdminProviderCluster>(clusterPromises).then((pulsarAdminClusters) => {
          resolve({
            settings: providerSettings,
            config: savedConfig,
            pulsarAdminClusters: pulsarAdminClusters
          });
        });

      }catch (err) {
        //@ts-ignore
        reject(new Error(`Error loading saved config ${savedConfig.name} for provider type ${savedConfig.providerTypeName}`, { cause: err }));
      }
    });

    providerConfigsPromises.push(providerConfigsPromise);
  });

  return Promise.all<TPulsarAdminProviderConfigs>(providerConfigsPromises);
}

