import { TPulsarAdmin } from "../../types/tPulsarAdmin";
import PulsarAdmin from "@apache-pulsar/pulsar-admin";
import {ClusterData} from "@apache-pulsar/pulsar-admin/dist/gen/models/cluster-data";
import {trace} from "../../utils/traceDecorator";
import {GetSchemaResponse, PartitionedTopicMetadata} from "@apache-pulsar/pulsar-admin/dist/gen/models";

export class BaseProvider implements TPulsarAdmin {
  protected readonly client: PulsarAdmin;

  constructor(public readonly providerTypeName: string, webServiceUrl: string, pulsarToken: string | undefined) {
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
        if (response.status > 199 && response.status < 300) {
          resolve(response.data);
          return;
        }

        reject(response);
      }).catch((err: any) => {
        if(this.shouldRejectError(err)) {
          console.log("Request rejected");
          reject(err);
          return;
        }

        console.log("Request not rejected, returning default value");
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
  async ListTopicNames(tenantName: string, namespaceName: string): Promise<{type:string, name:string}[]> {
    const persistentTopics: string[] = await this.QueryPulsarAdminClient<string[]>(this.client.persistentTopic().getList(tenantName, namespaceName), []);
    const nonPersistentTopics: string[] = await this.QueryPulsarAdminClient<string[]>(this.client.nonPersistentTopic().getList(tenantName, namespaceName), []);

    const ret: {type: string, name: string}[] = [];

    persistentTopics.forEach((topic: string) => {
      ret.push({type: 'persistent', name: this.cleanTopicName(topic)});
    });

    nonPersistentTopics.forEach((topic: string) => {
      ret.push({type: 'non-persistent', name: this.cleanTopicName(topic)});
    });

    return ret;
  }

  private cleanTopicName(topicAddress: string): string{
    return new URL(topicAddress).pathname.split("/")[2];
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

  @trace('Base: Get topic schema')
  async GetTopicSchema(tenantName: string, namespaceName: string, topicName: string): Promise<GetSchemaResponse | undefined> {
    return new Promise<GetSchemaResponse | undefined>((resolve, reject) => {
      this.QueryPulsarAdminClient<GetSchemaResponse | undefined>(this.client.schemas().get(tenantName, namespaceName, topicName), undefined)
        .then((schema: GetSchemaResponse | undefined) => {
          resolve(schema);
        })
        .catch((err: any) => {
          if(err.response.status === 404 && err.response.data.message === 'Schema not found'){
            resolve(undefined);
            return;
          }

          reject(err);
        });
    });
  }

  @trace('Base: Create persistent topic')
  async CreatePersistentTopic(tenantName: string, namespaceName: string, topicName: string, numPartitions: number = 0, metadata: {[p: string]: string} | undefined = undefined): Promise<undefined> {
    if(numPartitions < 1) {
      return this.QueryPulsarAdminClient<undefined>(this.client.persistentTopic().createNonPartitionedTopic(tenantName, namespaceName, topicName, undefined, metadata), undefined);
    }

    return this.QueryPulsarAdminClient<undefined>(this.client.persistentTopic().createPartitionedTopic(tenantName, namespaceName, topicName, numPartitions), undefined);
  }

  @trace('Base: Create non-persistent topic')
  async CreateNonPersistentTopic(tenantName: string, namespaceName: string, topicName: string, numPartitions: number = 0, metadata: {[p: string]: string} | undefined = undefined): Promise<undefined> {
    if(numPartitions < 1) {
      return this.QueryPulsarAdminClient<undefined>(this.client.nonPersistentTopic().createNonPartitionedTopic(tenantName, namespaceName, topicName, undefined, metadata), undefined);
    }

    const partitionedTopicMetadata = new class implements PartitionedTopicMetadata {
      partitions: number = numPartitions;
      properties: {[p: string]: string} = metadata || {};
    };

    return this.QueryPulsarAdminClient<undefined>(this.client.nonPersistentTopic().createPartitionedTopic(tenantName, namespaceName, topicName, partitionedTopicMetadata), undefined);
  }
}

