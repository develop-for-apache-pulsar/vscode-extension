import { TPulsarAdmin } from "../../../types/TPulsarAdmin";
import {TTopic, TopicType} from "../../../types/TTopic";

import PulsarAdmin from "../../../../../typescript/dist/src/index";
import {ClusterData} from "../../../../../typescript/dist/gen/models/cluster-data";

export class BaseProvider implements TPulsarAdmin {
  protected readonly client: PulsarAdmin;

  constructor(webServiceUrl: string, pulsarToken: string | undefined) {
    if (webServiceUrl === null || webServiceUrl === undefined) {
      throw new Error("Web service url is required");
    }

    if (pulsarToken === undefined) {
      this.client = PulsarAdmin.builder()
        .serviceHttpUrl(webServiceUrl)
        .build();
    } else {
      this.client = PulsarAdmin.builder()
        .serviceHttpUrl(webServiceUrl)
        .tokenAuthentication(pulsarToken)
        .build();
    }
  }

  protected async QueryPulsarAdminClient<T>(fn: Promise<any>, def: T): Promise<T> {
    return new Promise((resolve, reject) => {
      fn.then((response: any) => {
        if (response.status === 200) {
          resolve(response.data);
          return;
        }

        reject(response);
      }).catch((err: any) => {
        if(this.shouldRejectError(err)) {
          console.debug("Request rejected");
          console.error(err);

          reject(err);
          return;
        }

        console.debug("Request not rejected, returning default value");
        resolve(def);
      });
    });
  }

  private shouldRejectError(err: any): boolean {
    return !(err.code === 'ERR_BAD_RESPONSE'
        && err.response.status === 500
        && err.response.data.message === 'Request failed.'
        && (err.response.data.servlet.indexOf('org.glassfish.jersey.servlet.ServletContainer') > -1)
        && err.response.data.status === '500');
  }

  async GetBrokerVersion(): Promise<string> {
    return this.QueryPulsarAdminClient<string>(this.client.brokers().version(), "");
  }

  async ListClusterNames(): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.clusters().get(), []);
  }

  async GetClusterDetails(clusterName: string): Promise<ClusterData | undefined> {
    return this.QueryPulsarAdminClient<ClusterData | undefined>(this.client.clusters().get_1(clusterName), undefined);
  }

  async ListTenantNames(): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.tenants().get(), []);
  }

  async ListNamespaceNames(tenantName: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.QueryPulsarAdminClient<string[]>(this.client.namespaces().getTenant(tenantName), []).then((namespaces: string[]) => {
        resolve(namespaces.map((namespace: string) => { return namespace.split('/').pop()!; }));
      }).catch((err: any) => {
        reject(err);
      });
    });
  }

  async ListTopics(tenantName: string, namespaceName: string): Promise<TTopic[]> {
    return new Promise<TTopic[]>((resolve, reject) => {
      this.QueryPulsarAdminClient<string[]>(this.client.namespaces().getTopics(tenantName, namespaceName), []).then((topics: string[]) => {
        const topicData = topics.map((topic: string) => {
          return new class implements TTopic {
            Name = topic.split('//')[1].split('/').pop()!;
            Type = TopicType.Persistent;
          };
        });

        resolve(topicData);
      }).catch((err: any) => {
        reject(err);
      });
    });
  }

  async ListConnectorSinkNames(tenantName: string, namespaceName: string): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.sinks().list(tenantName, namespaceName), []);
  }

  async ListConnectorSourceNames(tenantName: string, namespaceName: string): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.sources().list(tenantName, namespaceName), []);
  }

  async ListFunctionNames(tenantName: string, namespaceName: string): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.functions().list(tenantName, namespaceName), []);
  }
}

