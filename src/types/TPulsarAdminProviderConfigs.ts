import {TProviderSettings} from "./TProviderSettings";
import {TSavedProviderConfig} from "./TSavedProviderConfig";
import {TPulsarAdminProviderCluster} from "./TPulsarAdminProviderCluster";

export type TPulsarAdminProviderConfigs = {
  settings: TProviderSettings;
  config: TSavedProviderConfig;
  pulsarAdminClusters: TPulsarAdminProviderCluster[];
}