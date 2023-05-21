import {TPulsarAdminProviderCluster} from "./tPulsarAdminProviderCluster";

export type TSavedProviderConfig = {
  providerId: string;
  name: string;
  clusters: TPulsarAdminProviderCluster[];
  providerTypeName: string
};

