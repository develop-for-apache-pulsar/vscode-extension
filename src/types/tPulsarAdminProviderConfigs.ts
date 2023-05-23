import {TProviderSettings} from "./tProviderSettings";
import {TSavedProviderConfig} from "./tSavedProviderConfig";
import {TPulsarAdminProviderCluster} from "./tPulsarAdminProviderCluster";

export type TPulsarAdminProviderConfigs = {
  settings: TProviderSettings;
  config: TSavedProviderConfig;
  pulsarAdminClusters: TPulsarAdminProviderCluster[];
};