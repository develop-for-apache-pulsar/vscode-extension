import {TPulsarAdmin} from "./tPulsarAdmin";

export type TPulsarAdminProviderTenant = {
  pulsarToken?: string;
  name: string;

  pulsarAdmin: TPulsarAdmin;
};