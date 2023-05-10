import { IPulsarAdminProviderNode } from "./pulsarAdminProvider";
import { IFolderNode } from "./folder";
import { ITenantNode } from "./tenant";
import { INamespaceNode } from "./namespace";
import { IConnectorSourceNode } from "./connectorSource";
import { ITopicNode } from "./topic";
import { IConnectorSinkNode } from "./connectorSink";
import { IFunctionNode } from "./function";
import { IMessageNode } from "./message";
import {IErrorNode} from "./error";
import {TPulsarAdmin} from "../../../types/TPulsarAdmin";
import {IClusterNode} from "./cluster";

export enum MessageTypes {
  noTenants,
  noClusters,
  noNamespaces,
  noTopics,
  noConnectorSinks,
  noConnectorSources,
  noFunctions,
  customMessage,
}

export enum FolderTypes {
  topicFolder,
  connectorFolder,
  sourceFolder,
  sinkFolder,
  functionFolder,
}

export type TBaseNode = {
  readonly label: string;
};

export type TBaseNodeWithPulsarAdmin = {
  readonly label: string;
  readonly pulsarAdmin: TPulsarAdmin;
};

export type AllPulsarAdminExplorerNodeTypes =
  IPulsarAdminProviderNode
  | IClusterNode
  | IMessageNode
  | IErrorNode
  | ITenantNode
  | INamespaceNode
  | IFolderNode
  | ITopicNode
  | IConnectorSourceNode
  | IConnectorSinkNode
  | IFunctionNode;

export const CONTEXT_VALUES = {
  error: 'vsPulsarAdmin.error',
  message: 'vsPulsarAdmin.message',
  provider: 'vsPulsarAdmin.provider',
  cluster: 'vsPulsarAdmin.cluster',
  tenant: 'vsPulsarAdmin.tenant',
  namespace: 'vsPulsarAdmin.namespace',
  topicFolder: 'vsPulsarAdmin.topicFolder',
  topic: 'vsPulsarAdmin.topic',
  connectorFolder: 'vsPulsarAdmin.connectorFolder',
  sourceFolder: 'vsPulsarAdmin.sourceFolder',
  sinkFolder: 'vsPulsarAdmin.sinkFolder',
  functionFolder: 'vsPulsarAdmin.functionFolder',
  schemaFolder: 'vsPulsarAdmin.schemaFolder',
  source: 'vsPulsarAdmin.source',
  sink: 'vsPulsarAdmin.sink',
  function: 'vsPulsarAdmin.function',
};
