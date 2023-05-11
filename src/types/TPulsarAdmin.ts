import {TTopic} from "./TTopic";
import {ClusterData} from "@apache-pulsar/pulsar-admin/dist/gen/models/cluster-data";

export type TPulsarAdmin = {
  /**
   * Get a collection of cluster names that make up the Pulsar instance. Optionally include a toke in the request
   * @param webServiceUrl the service url
   * @param pulsarToken optional token for authentication
   * @constructor
   */

  ListClusterNames: () => Promise<string[]>;

  GetBrokerVersion: () => Promise<string>;

  /**
   * Get a collection of tenant names in the given cluster
   * @constructor
   */
  ListTenantNames: (clusterName: string) => Promise<string[]>;

  /**
   * Get a collection of namespace names for the given tenant
   * @param tenantName the tenant name
   * @constructor
   */
  ListNamespaceNames: (tenantName: string) => Promise<string[]>;

  /**
   * Get a collection of topic names for the given tenant/namespace
   * @param tenantName the tenant name
   * @param namespaceName the namespace name
   * @constructor
   */
  ListTopics: (tenantName: string, namespaceName: string) => Promise<TTopic[]>;

  ListConnectorSinkNames: (tenantName: string, namespaceName: string) => Promise<string[]>;

  ListConnectorSourceNames: (tenantName: string, namespaceName: string) => Promise<string[]>;

  ListFunctionNames: (tenantName: string, namespaceName: string) => Promise<string[]>;

  GetClusterDetails(clusterName: string): Promise<ClusterData | undefined>
};


