export type TTopic = {
  Name: string;
  Type: TopicType;
};

export enum TopicType {
  Persistent = 'Persistent',
  NonPersistent = 'NonPersistent',
}