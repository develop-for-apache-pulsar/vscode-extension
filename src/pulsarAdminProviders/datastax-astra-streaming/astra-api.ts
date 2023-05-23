/* eslint-disable */

import axios from "axios";
import {trace} from "../../utils/traceDecorator";

export class AstraApi{
  private baseUrl = "https://api.astra.datastax.com";
  constructor(private readonly astraToken: string) {
  }

  @trace('Astra: Get Streaming Tenants')
  async getStreamingTenants(): Promise<TStreamingTenantDetails[]> {
    const apiUrl = `${this.baseUrl}/v2/streaming/tenants`;
    try {
      const headers = { Authorization: `Bearer ${this.astraToken}` };
      const response = await axios.get(apiUrl, { headers });
      return response.data as TStreamingTenantDetails[];
    } catch (error) {
      throw error;
    }
  }

  @trace('Astra: Get Streaming Clusters')
  async getStreamingClusters(): Promise<TStreamingClusterDetails[]> {
    const apiUrl = `${this.baseUrl}/v2/streaming/clusters`;
    try {
      const headers = { Authorization: `Bearer ${this.astraToken}` };
      const response = await axios.get(apiUrl, { headers });
      return response.data as TStreamingClusterDetails[];
    } catch (error) {
      throw error;
    }
  }
}

export type TStreamingClusterDetails = {
  clusterName: string;
  cloudProvider: string;
  cloudRegion: string;
  clusterType: string;
  webServiceUrl: string;
  brokerServiceUrl: string;
  websocketUrl: string;
  pulsarInstance: string;
  regionZone: string;
};

export type TStreamingTenantDetails = {
  id: string;
  tenantName: string;
  clusterName: string;
  webServiceUrl: string;
  brokerServiceUrl: string;
  websocketUrl: string;
  websocketQueryParamUrl: string;
  pulsarToken: string;
  plan: string;
  planCode: string;
  astraOrgGUID: string;
  cloudProvider: string;
  cloudProviderCode: string;
  cloudRegion: string;
  status: string;
  jvmVersion: string;
  pulsarVersion: string;
  regionZone: string;
  email: string;
  userMetricsUrl: string;
  pulsarInstance: string;
};