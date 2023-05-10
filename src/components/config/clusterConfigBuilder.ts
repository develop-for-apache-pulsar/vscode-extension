import {TSavedProviderConfig} from "../../types/TSavedProviderConfig";
import * as config from "./config";
import * as uuid from 'uuid';
import {TPulsarAdminProviderTenant} from "../../types/TPulsarAdminProviderTenant";
import {TPulsarAdminProviderCluster} from "../../types/TPulsarAdminProviderCluster";
import {TPulsarAdmin} from "../../types/TPulsarAdmin";

export class ClusterConfigBuilder {
  protected readonly providerConfig: TSavedProviderConfig;

  constructor(providerTypeName: string, displayName: string) {
    if (!providerTypeName) {
      throw new Error("Provider type is required to save cluster configuration");
    }

    this.providerConfig = new class implements TSavedProviderConfig {
      clusters: TPulsarAdminProviderCluster[] = [];
      name: string = displayName;
      providerId:string = uuid.v4();
      providerTypeName: string = providerTypeName;
    };
  }

  public set providerName(providerName: string) {
    if (!this.providerConfig) {
      throw new Error("Cluster configuration is not initialized");
    }

    if (!providerName) {
      throw new Error("Provider name is required to save cluster configuration");
    }

    this.providerConfig.name = providerName;
  }

  public async saveConfig(): Promise<void> {
    return config.addClusterConfig(this.providerConfig);
  }

  private validateWebServiceUrl(webServiceUrl: string): void {
    try {
      new URL(webServiceUrl);
      return;
    } catch {
    }

    throw new Error("Check the format of the URL, it could not be validated.");
  }

  public initCluster(clusterName: string, brokerServiceUrl: string, webServiceUrl: string, clusterVersion?: string): TPulsarAdminProviderCluster {
    return new class implements TPulsarAdminProviderCluster {
      name: string = clusterName;
      brokerServiceUrl?: string = brokerServiceUrl;
      pulsarVersion?: string = clusterVersion;
      tenants: TPulsarAdminProviderTenant[] = [];
      webServiceUrl: string = webServiceUrl;
      websocketUrl?: string;
    };
  }

  public addCluster(clusterConfig: TPulsarAdminProviderCluster): void {
    this.providerConfig.clusters.push(clusterConfig);
  }

  private findCluster(clusterName: string): TPulsarAdminProviderCluster | undefined {
    return this.providerConfig.clusters.find((cluster) => cluster.name === clusterName);
  }

  public addTenant(clusterName: string, tenantName: string, pulsarAdmin: TPulsarAdmin, pulsarToken?: string): void {
    const cluster = this.findCluster(clusterName);

    if(cluster === undefined){
      throw new Error(`An error occurred while looking up a cluster's details: "${clusterName}"`);
    }

    const tenant = new class implements TPulsarAdminProviderTenant {
      name: string = tenantName;
      pulsarToken?: string = pulsarToken;
      pulsarAdmin: TPulsarAdmin = pulsarAdmin;
    };

    cluster.tenants.push(tenant);
  }
}