import { TPulsarAdmin } from "../../types/tPulsarAdmin";
import {TTopic, TopicType} from "../../types/TTopic";

import PulsarAdmin from "@apache-pulsar/pulsar-admin";
import {ClusterData} from "@apache-pulsar/pulsar-admin/dist/gen/models/cluster-data";
import {trace} from "../../utils/traceDecorator";

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

  @trace('Base: Get broker version')
  async GetBrokerVersion(): Promise<string> {
    return this.QueryPulsarAdminClient<string>(this.client.brokers().version(), "");
  }

  @trace('Base: List cluster names')
  async ListClusterNames(): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.clusters().get(), []);
  }

  @trace('Base: Get cluster details')
  async GetClusterDetails(clusterName: string): Promise<ClusterData | undefined> {
    return this.QueryPulsarAdminClient<ClusterData | undefined>(this.client.clusters().get_1(clusterName), undefined);
  }

  @trace('Base: List tenant names')
  async ListTenantNames(): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.tenants().get(), []);
  }

  @trace('Base: List namespace names')
  async ListNamespaceNames(tenantName: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.QueryPulsarAdminClient<string[]>(this.client.namespaces().getTenant(tenantName), []).then((namespaces: string[]) => {
        resolve(namespaces.map((namespace: string) => { return namespace.split('/').pop()!; }));
      }).catch((err: any) => {
        reject(err);
      });
    });
  }

  @trace('Base: List topics')
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

  @trace('Base: List connector sink names')
  async ListConnectorSinkNames(tenantName: string, namespaceName: string): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.sinks().list(tenantName, namespaceName), []);
  }

  @trace('Base: List connector source names')
  async ListConnectorSourceNames(tenantName: string, namespaceName: string): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.sources().list(tenantName, namespaceName), []);
  }

  @trace('Base: List function names')
  async ListFunctionNames(tenantName: string, namespaceName: string): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.functions().list(tenantName, namespaceName), []);
  }
}

