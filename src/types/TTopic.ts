export type TTopic = {
  name: string;
  type: TopicType;
  tenantName: string;
  namespaceName: string;
};

export enum TopicType {
  persistent = 'Persistent',
  nonPersistent = 'NonPersistent',
}