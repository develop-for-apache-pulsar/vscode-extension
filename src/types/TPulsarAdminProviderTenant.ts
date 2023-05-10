import {TPulsarAdmin} from "./TPulsarAdmin";

export type TPulsarAdminProviderTenant = {
  pulsarToken?: string;
  name: string;

  pulsarAdmin: TPulsarAdmin;
}