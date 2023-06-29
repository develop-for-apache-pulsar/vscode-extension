import {ClusterData} from "@apache-pulsar/pulsar-admin/dist/gen/models/cluster-data";
import {GetSchemaResponse} from "@apache-pulsar/pulsar-admin/dist/gen/models";

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
};


