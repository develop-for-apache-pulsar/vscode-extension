export type TTopic = {
  name: string;
  type: TopicType;
  providerTypeName: string;
  clusterName: string;
  tenantName: string;
  namespaceName: string;
};

export enum TopicType {
  persistent = 'Persistent',
  nonPersistent = 'NonPersistent',
}