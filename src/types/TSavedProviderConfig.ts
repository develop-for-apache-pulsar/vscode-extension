import {TPulsarAdminProviderCluster} from "./TPulsarAdminProviderCluster";

export type TSavedProviderConfig = {
  providerId: string;
  name: string;
  clusters: TPulsarAdminProviderCluster[];
  providerTypeName: string
};

