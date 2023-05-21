import {IPulsarAdminProviderNode} from "../providers/pulsarClusterTreeDataProvider/nodes/pulsarAdminProvider";
import {IClusterNode} from "../providers/pulsarClusterTreeDataProvider/nodes/cluster";
import {IMessageNode} from "../providers/pulsarClusterTreeDataProvider/nodes/message";
import {IErrorNode} from "../providers/pulsarClusterTreeDataProvider/nodes/error";
import {ITenantNode} from "../providers/pulsarClusterTreeDataProvider/nodes/tenant";
import {INamespaceNode} from "../providers/pulsarClusterTreeDataProvider/nodes/namespace";
import {IFolderNode} from "../providers/pulsarClusterTreeDataProvider/nodes/folder";
import {ITopicNode} from "../providers/pulsarClusterTreeDataProvider/nodes/topic";
import {IConnectorSourceNode} from "../providers/pulsarClusterTreeDataProvider/nodes/connectorSource";
import {IConnectorSinkNode} from "../providers/pulsarClusterTreeDataProvider/nodes/connectorSink";
import {IFunctionNode} from "../providers/pulsarClusterTreeDataProvider/nodes/function";

export type TAllPulsarAdminExplorerNodeTypes =
  | IPulsarAdminProviderNode
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