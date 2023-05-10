import {TPulsarAdminProviderTenant} from "./TPulsarAdminProviderTenant";

export type TPulsarAdminProviderCluster = {
  name: string;
  webServiceUrl: string;
  brokerServiceUrl?: string;
  websocketUrl?: string;
  pulsarVersion?: string;
  tenants: TPulsarAdminProviderTenant[];
}