/* eslint-disable @typescript-eslint/naming-convention */

import { TPulsarAdmin } from "../../types/tPulsarAdmin";
import PulsarAdmin from "@apache-pulsar/pulsar-admin";
import {ClusterData} from "@apache-pulsar/pulsar-admin/dist/gen/models/cluster-data";
import {trace} from "../../utils/traceDecorator";
import {
  FunctionConfig,
  FunctionInstanceStatsDataImpl,
  FunctionInstanceStatusData,
  FunctionStatsImpl,
  FunctionStatus,
  GetSchemaResponse,
  PartitionedTopicMetadata
} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import axios, {Axios, AxiosRequestConfig, AxiosResponse} from "axios";

export class BaseProvider implements TPulsarAdmin {
  protected readonly client: PulsarAdmin;

  constructor(public readonly providerTypeName: string, private readonly webServiceUrl: string, private readonly pulsarToken: string | undefined) {
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
  public async GetBrokerVersion(): Promise<string> {
    return this.QueryPulsarAdminClient<string>(this.client.brokers().version(), "");
  }

  @trace('Base: List cluster names')
  public async ListClusterNames(): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.clusters().get(), []);
  }

  @trace('Base: Get cluster details')
  public async GetClusterDetails(clusterName: string): Promise<ClusterData | undefined> {
    return this.QueryPulsarAdminClient<ClusterData | undefined>(this.client.clusters().get_1(clusterName), undefined);
  }

  @trace('Base: List tenant names')
  public async ListTenantNames(): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.tenants().get(), []);
  }

  @trace('Base: List namespace names')
  public async ListNamespaceNames(tenantName: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.QueryPulsarAdminClient<string[]>(this.client.namespaces().getTenant(tenantName), []).then((namespaces: string[]) => {
        resolve(namespaces.map((namespace: string) => { return namespace.split('/').pop()!; }));
      }).catch((err: any) => {
        reject(err);
      });
    });
  }

  @trace('Base: List topics')
  public async ListTopicNames(tenantName: string, namespaceName: string): Promise<{type:string, name:string}[]> {
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
  public async ListConnectorSinkNames(tenantName: string, namespaceName: string): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.sinks().list(tenantName, namespaceName), []);
  }

  @trace('Base: List connector source names')
  public async ListConnectorSourceNames(tenantName: string, namespaceName: string): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.sources().list(tenantName, namespaceName), []);
  }

  @trace('Base: List function names')
  public async ListFunctionNames(tenantName: string, namespaceName: string): Promise<string[]> {
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
  public async CreatePersistentTopic(tenantName: string, namespaceName: string, topicName: string, numPartitions: number = 0, metadata: {[p: string]: string} | undefined = undefined): Promise<undefined> {
    if(numPartitions < 1) {
      return this.QueryPulsarAdminClient<undefined>(this.client.persistentTopic().createNonPartitionedTopic(tenantName, namespaceName, topicName, undefined, metadata), undefined);
    }

    return this.QueryPulsarAdminClient<undefined>(this.client.persistentTopic().createPartitionedTopic(tenantName, namespaceName, topicName, numPartitions), undefined);
  }

  @trace('Base: Create non-persistent topic')
  public async CreateNonPersistentTopic(tenantName: string, namespaceName: string, topicName: string, numPartitions: number = 0, metadata: {[p: string]: string} | undefined = undefined): Promise<undefined> {
    if(numPartitions < 1) {
      return this.QueryPulsarAdminClient<undefined>(this.client.nonPersistentTopic().createNonPartitionedTopic(tenantName, namespaceName, topicName, undefined, metadata), undefined);
    }

    const partitionedTopicMetadata = new class implements PartitionedTopicMetadata {
      partitions: number = numPartitions;
      properties: {[p: string]: string} = metadata || {};
    };

    return this.QueryPulsarAdminClient<undefined>(this.client.nonPersistentTopic().createPartitionedTopic(tenantName, namespaceName, topicName, partitionedTopicMetadata), undefined);
  }

  @trace('Base: Start function')
  public async StartFunction(tenantName: string, namespaceName: string, functionName: string, instanceId?: number | undefined): Promise<void | undefined> {
    const options: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      baseURL: this.webServiceUrl
    };

    if(this.pulsarToken) {
      options.headers!.Authorization = 'Bearer ' + this.pulsarToken;
    }

    if(instanceId) {
      return this.QueryPulsarAdminClient<void | undefined>(this.client.functions().start_2(tenantName, namespaceName, functionName, instanceId.toString(), options), undefined);
    }

    return this.QueryPulsarAdminClient<void | undefined>(this.client.functions().start(tenantName, namespaceName, functionName, options), undefined);
  }

  @trace('Base: Stop function')
  public async StopFunction(tenantName: string, namespaceName: string, functionName: string, instanceId?: number | undefined): Promise<void | undefined> {
    const options: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      baseURL: this.webServiceUrl
    };

    if(this.pulsarToken) {
      options.headers!.Authorization = 'Bearer ' + this.pulsarToken;
    }

    if(instanceId) {
      return this.QueryPulsarAdminClient<void | undefined>(this.client.functions().stop_3(tenantName, namespaceName, functionName, instanceId.toString(), options), undefined);
    }

    return this.QueryPulsarAdminClient<void | undefined>(this.client.functions().stop(tenantName, namespaceName, functionName, options), undefined);
  }

  @trace('Base: Restart function')
  public async RestartFunction(tenantName: string, namespaceName: string, functionName: string, instanceId?: number | undefined): Promise<void | undefined> {
    const options: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      baseURL: this.webServiceUrl
    };

    if(this.pulsarToken) {
      options.headers!.Authorization = 'Bearer ' + this.pulsarToken;
    }

    if(instanceId) {
      return this.QueryPulsarAdminClient<void | undefined>(this.client.functions().restart_1(tenantName, namespaceName, functionName, instanceId.toString(), options), undefined);
    }

    return this.QueryPulsarAdminClient<void | undefined>(this.client.functions().restart(tenantName, namespaceName, functionName, options), undefined);
  }

  @trace('Base: Function stats')
  public async FunctionStats(tenantName: string, namespaceName: string, functionName: string, instanceId?: number | undefined): Promise<FunctionStatsImpl | FunctionInstanceStatsDataImpl | undefined> {
    if(instanceId) {
      return this.QueryPulsarAdminClient<FunctionInstanceStatsDataImpl | undefined>(this.client.functions().getInstanceStats(tenantName, namespaceName, functionName, instanceId.toString()), undefined);
    }

    return this.QueryPulsarAdminClient<FunctionStatsImpl | undefined>(this.client.functions().getStats(tenantName, namespaceName, functionName), undefined);
  }

  @trace('Base: Function status')
  public async FunctionStatus(tenantName: string, namespaceName: string, functionName: string, instanceId?: number | undefined): Promise<FunctionStatus | FunctionInstanceStatusData | undefined> {
    if(instanceId) {
      return this.QueryPulsarAdminClient<FunctionInstanceStatusData | undefined>(this.client.functions().getInstanceStatus(tenantName, namespaceName, functionName, instanceId.toString()), undefined);
    }

    return this.QueryPulsarAdminClient<FunctionStatus | undefined>(this.client.functions().getStatus(tenantName, namespaceName, functionName), undefined);
  }

  @trace('Base: Function info')
  public async GetFunctionInfo(tenantName: string, namespaceName: string, functionName: string): Promise<FunctionConfig | undefined> {
    return this.QueryPulsarAdminClient<FunctionConfig | undefined>(this.client.functions().getInfo(tenantName, namespaceName, functionName), undefined);
  }

  @trace('Base: Delete function')
  public async DeleteFunction(tenantName: string, namespaceName: string, functionName: string): Promise<void | undefined> {
    return this.QueryPulsarAdminClient<void | undefined>(this.client.functions().deregister(tenantName, namespaceName, functionName), undefined);
  }

  @trace('Base: Topic exists')
  public async TopicExists(topicType: string, tenantName: string, namespaceName: string, topicName: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      const options: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json'
        },
        baseURL: this.webServiceUrl
      };

      if(this.pulsarToken) {
        options.headers!.Authorization = 'Bearer ' + this.pulsarToken;
      }

      const resp: AxiosResponse = await new Axios(options).put(this.webServiceUrl + '/admin/v2/' + topicType + '/' + tenantName + '/' + namespaceName + '/' + topicName);
      resolve((resp.status === 409)); // This topic already exists
    });
  }
}

