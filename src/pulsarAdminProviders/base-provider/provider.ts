/* eslint-disable @typescript-eslint/naming-convention */

import { TPulsarAdmin } from "../../types/tPulsarAdmin";
import PulsarAdmin from "@apache-pulsar/pulsar-admin";
import {ClusterData} from "@apache-pulsar/pulsar-admin/dist/gen/models/cluster-data";
import {
  FunctionConfig,
  FunctionInstanceStatsDataImpl,
  FunctionInstanceStatusData,
  FunctionStatsImpl,
  FunctionStatus,
  GetSchemaResponse,
  PartitionedTopicMetadata
} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import axios, {Axios, AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import {TopicStats} from "./topicStats";
import * as path from "path";
import * as fs from "fs";

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

  protected async QueryPulsarAdminClient<T>(fn: Promise<any>, def: T, errorOnNotFound: boolean = true): Promise<T> {
    return new Promise((resolve, reject) => {
      fn.then((response: any) => {
        if (response.status > 199 && response.status < 300) {
          resolve(response.data);
          return;
        }

        reject(response);
      }).catch((err: any) => {
        if(true === this.shouldRejectError(err, errorOnNotFound)) {
          reject(err);
          return;
        }

        resolve(def);
      });
    });
  }

  private shouldRejectError(err: any, errorOnNotFound: boolean): boolean {
    if (false === err instanceof AxiosError) {
      return true;
    }

    const isGlassfishError = (err.code === 'ERR_BAD_RESPONSE'
                                && err.response.status === 500
                                && err.response.data.message === 'Request failed.'
                                && (err.response.data.servlet.indexOf('org.glassfish.jersey.servlet.ServletContainer') > -1)
                                && err.response.data.status === '500');

    const isNotFoundError = (err.code === 'ERR_BAD_REQUEST'
                              && err.response?.status === 404
                              && err.response?.statusText?.toLowerCase().indexOf('not found') > -1);

    if(isGlassfishError) {
      return false;
    }

    return isNotFoundError && errorOnNotFound;
  }

  public async GetBrokerVersion(): Promise<string> {
    return this.QueryPulsarAdminClient<string>(this.client.brokers().version(), "");
  }

  public async ListClusterNames(): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.clusters().get(), []);
  }

  public async GetClusterDetails(clusterName: string): Promise<ClusterData | undefined> {
    return this.QueryPulsarAdminClient<ClusterData | undefined>(this.client.clusters().get_1(clusterName), undefined);
  }

  public async ListTenantNames(): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.tenants().get(), []);
  }

  public async ListNamespaceNames(tenantName: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.QueryPulsarAdminClient<string[]>(this.client.namespaces().getTenant(tenantName), []).then((namespaces: string[]) => {
        resolve(namespaces.map((namespace: string) => { return namespace.split('/').pop()!; }));
      }).catch((err: any) => {
        reject(err);
      });
    });
  }

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

  public async ListConnectorSinkNames(tenantName: string, namespaceName: string): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.sinks().list(tenantName, namespaceName), []);
  }

  public async ListConnectorSourceNames(tenantName: string, namespaceName: string): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.sources().list(tenantName, namespaceName), []);
  }

  public async ListFunctionNames(tenantName: string, namespaceName: string): Promise<string[]> {
    return this.QueryPulsarAdminClient<string[]>(this.client.functions().list(tenantName, namespaceName), []);
  }

  async GetTopicSchema(tenantName: string, namespaceName: string, topicName: string): Promise<GetSchemaResponse | undefined> {
    return new Promise<GetSchemaResponse | undefined>((resolve, reject) => {
      this.QueryPulsarAdminClient<GetSchemaResponse | undefined>(this.client.schemas().get(tenantName, namespaceName, topicName), undefined, false)
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

  public async CreatePersistentTopic(tenantName: string, namespaceName: string, topicName: string, numPartitions: number = 0, metadata: {[p: string]: string} | undefined = undefined): Promise<undefined> {
    if(numPartitions < 1) {
      return this.QueryPulsarAdminClient<undefined>(this.client.persistentTopic().createNonPartitionedTopic(tenantName, namespaceName, topicName, undefined, metadata), undefined);
    }

    return this.QueryPulsarAdminClient<undefined>(this.client.persistentTopic().createPartitionedTopic(tenantName, namespaceName, topicName, numPartitions), undefined);
  }

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

  public async FunctionStats(tenantName: string, namespaceName: string, functionName: string, instanceId?: number | undefined): Promise<FunctionStatsImpl | FunctionInstanceStatsDataImpl | undefined> {
    if(instanceId) {
      return this.QueryPulsarAdminClient<FunctionInstanceStatsDataImpl | undefined>(this.client.functions().getInstanceStats(tenantName, namespaceName, functionName, instanceId.toString()), undefined);
    }

    return this.QueryPulsarAdminClient<FunctionStatsImpl | undefined>(this.client.functions().getStats(tenantName, namespaceName, functionName), undefined);
  }

  public async FunctionStatus(tenantName: string, namespaceName: string, functionName: string, instanceId?: number | undefined): Promise<FunctionStatus | FunctionInstanceStatusData | undefined> {
    if(instanceId) {
      return this.QueryPulsarAdminClient<FunctionInstanceStatusData | undefined>(this.client.functions().getInstanceStatus(tenantName, namespaceName, functionName, instanceId.toString()), undefined);
    }

    return this.QueryPulsarAdminClient<FunctionStatus | undefined>(this.client.functions().getStatus(tenantName, namespaceName, functionName), undefined, false);
  }

  public async GetFunctionInfo(tenantName: string, namespaceName: string, functionName: string): Promise<FunctionConfig | undefined> {
    return this.QueryPulsarAdminClient<FunctionConfig | undefined>(this.client.functions().getInfo(tenantName, namespaceName, functionName), undefined);
  }

  public async DeleteFunction(tenantName: string, namespaceName: string, functionName: string): Promise<void | undefined> {
    return this.QueryPulsarAdminClient<void | undefined>(this.client.functions().deregister(tenantName, namespaceName, functionName), undefined, false);
  }

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

      const url = new URL(this.webServiceUrl);
      url.pathname = path.join("admin", "v2", topicType, tenantName, namespaceName, topicName);

      const resp: AxiosResponse = await new Axios(options).put(url.toString());

      if(resp.status > 199 && resp.status < 300) {
        await new Axios(options).delete(url.toString());
      }

      resolve((resp.status === 409)); // This topic already exists
    });
  }

  public async TopicStats(topicType:string, tenantName: string, namespaceName: string, topicName: string): Promise<TopicStats | undefined> {
    if(topicType === 'persistent') {
      return this.QueryPulsarAdminClient<TopicStats | undefined>(this.client.persistentTopic().getStats(tenantName, namespaceName, topicName), undefined);
    }

    return this.QueryPulsarAdminClient<TopicStats | undefined>(this.client.nonPersistentTopic().getStats(tenantName, namespaceName, topicName), undefined);
  }

  public async TopicProperties(topicType:string, tenantName: string, namespaceName: string, topicName: string): Promise<[{ [key: string]: string; }] | undefined> {
    if(topicType === 'persistent') {
      return this.QueryPulsarAdminClient<[{ [key: string]: string; }]| undefined>(this.client.persistentTopic().getProperties(tenantName, namespaceName, topicName), undefined);
    }

    return this.QueryPulsarAdminClient<[{ [key: string]: string; }] | undefined>(this.client.nonPersistentTopic().getProperties(tenantName, namespaceName, topicName), undefined);
  }

  public async DeleteTopic(topicType:string, tenantName: string, namespaceName: string, topicName: string): Promise<void> {
    if(topicType === 'persistent') {
      return this.QueryPulsarAdminClient<void>(this.client.persistentTopic().deleteTopic(tenantName, namespaceName, topicName), undefined);
    }

    return this.QueryPulsarAdminClient<void>(this.client.nonPersistentTopic().deleteTopic(tenantName, namespaceName, topicName), undefined);
  }

  public async CreateFunction(functionConfig: FunctionConfig, filePath: fs.PathLike): Promise<void> {
    const options: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      baseURL: this.webServiceUrl,
      transformRequest: axios.defaults.transformRequest,
      transformResponse: axios.defaults.transformResponse,
    };

    if(this.pulsarToken) {
      options.headers!.Authorization = 'Bearer ' + this.pulsarToken;
    }

    const url = new URL(this.webServiceUrl);
    url.pathname = path.join("admin", "v3", "functions", <string>functionConfig.tenant, <string>functionConfig.namespace, <string>functionConfig.name);

    return this.QueryPulsarAdminClient<void>(
      new Axios(options).post(url.href, {functionConfig: JSON.stringify(functionConfig), data: fs.createReadStream(filePath)}),
      undefined);
  }
}

