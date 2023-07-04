/* eslint-disable @typescript-eslint/naming-convention */

import {ClusterData} from "@apache-pulsar/pulsar-admin/dist/gen/models/cluster-data";
import {
  FunctionInstanceStatsDataImpl,
  FunctionInstanceStatusData,
  FunctionStatsImpl,
  GetSchemaResponse,
  FunctionStatus, FunctionConfig
} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import {TopicStats} from '../pulsarAdminProviders/base-provider/topicStats';

export type TPulsarAdmin = {
  providerTypeName: string;
   ListClusterNames: () => Promise<string[]>;

  GetBrokerVersion: () => Promise<string>;

  ListTenantNames: (clusterName: string) => Promise<string[]>;

  ListNamespaceNames: (tenantName: string) => Promise<string[]>;

  ListTopicNames: (tenantName: string, namespaceName: string) => Promise<{type:string, name:string}[]>;

  ListConnectorSinkNames: (tenantName: string, namespaceName: string) => Promise<string[]>;

  ListConnectorSourceNames: (tenantName: string, namespaceName: string) => Promise<string[]>;

  ListFunctionNames: (tenantName: string, namespaceName: string) => Promise<string[]>;

  GetClusterDetails(clusterName: string): Promise<ClusterData | undefined>;

  GetTopicSchema(tenantName: string, namespaceName: string, topicName: string): Promise<GetSchemaResponse | undefined>;

  CreatePersistentTopic(tenantName: string, namespaceName: string, topicName: string, numPartitions: number, metadata: {[p: string]: string} | undefined): Promise<undefined>;

  CreateNonPersistentTopic(tenantName: string, namespaceName: string, topicName: string, numPartitions: number, metadata: {[p: string]: string} | undefined): Promise<undefined>;

  StartFunction(tenantName: string, namespaceName: string, functionName: string, instanceId?: number | undefined): Promise<void | undefined>;

  StopFunction(tenantName: string, namespaceName: string, functionName: string, instanceId?: number | undefined): Promise<void | undefined>;

  RestartFunction(tenantName: string, namespaceName: string, functionName: string, instanceId?: number | undefined): Promise<void | undefined>;

  FunctionStats(tenantName: string, namespaceName: string, functionName: string, instanceId?: number | undefined): Promise<FunctionStatsImpl | FunctionInstanceStatsDataImpl | undefined>;

  FunctionStatus(tenantName: string, namespaceName: string, functionName: string, instanceId?: number | undefined): Promise<FunctionStatus | FunctionInstanceStatusData | undefined>;

  GetFunctionInfo(tenantName: string, namespaceName: string, functionName: string): Promise<FunctionConfig | undefined>;

  DeleteFunction(tenantName: string, namespaceName: string, functionName: string): Promise<void | undefined>;

  TopicExists(topicType: string, tenantName: string, namespaceName: string, topicName: string): Promise<boolean>;
  TopicStats(topicType:string, tenantName: string, namespaceName: string, topicName: string): Promise<TopicStats | undefined>;
  TopicProperties(topicType:string, tenantName: string, namespaceName: string, topicName: string): Promise<[{ [key: string]: string; }] | undefined>;
  DeleteTopic(topicType:string, tenantName: string, namespaceName: string, topicName: string): Promise<void>;
};


