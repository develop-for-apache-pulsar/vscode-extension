import {Settings as Standalone} from './standalone/settings';
import {TProviderSettings} from "../../types/TProviderSettings";
import {Settings as PrivateService} from './private-service/settings';
import {Settings as DataStaxAstra} from './datastax-astra-streaming/settings';

export class PulsarAdminProviders{
  private providerRegistry: [string, TProviderSettings][] = [];
  constructor() {
    const sa: TProviderSettings = new Standalone();
    const pv: TProviderSettings = new PrivateService();
    const ds: TProviderSettings = new DataStaxAstra();

    this.addProvider(sa.typeName, sa);
    this.addProvider(pv.typeName, pv);
    this.addProvider(ds.typeName, ds);
  }

  public getProvider(providerTypeName: string): TProviderSettings {
    const provider = this.providerRegistry.find((p) => p[0] === providerTypeName);
    if (provider === undefined) {
      throw new Error(`Provider ${providerTypeName} not found`);
    }

    return provider[1];
  }

  get allProviderInfo(): TProviderInfo[] {
    return this.providerRegistry.map((p) => {
      return {
        typeName: p[0],
        displayName: p[1].displayName,
        description: p[1].description
      };
    });
  }

  private addProvider(providerTypeName: string, provider: TProviderSettings): void {
    this.providerRegistry.push([providerTypeName, provider]);
  }
}

export type TProviderInfo = {
  typeName: string;
  displayName: string;
  description: string;
}