export interface ReplicationData
{
  connected?: boolean;
  inboundConnectedSince?: string;
  inboundConnection?: string;
  msgRateExpired?: number;
  msgRateIn?: number;
  msgRateOut?: number;
  msgThroughputIn?: number;
  msgThroughputOut?: number;
  outboundConnectedSince?: string;
  outboundConnection?: string;
  replicationBacklog?: number;
  replicationDelayInSeconds?: number;
}

export interface SubscriptionData {
  activeConsumerName?: string;
  allowOutOfOrderDelivery?: boolean;
  backlogSize?: number;
  blockedSubscriptionOnUnackedMsgs?: boolean;
  bytesOutCounter?: number;
  chunkedMessageRate?: number;
  consumers?: {
    address?: string;
    availablePermits?: number;
    avgMessagesPerEntry?: number;
    blockedConsumerOnUnackedMsgs?: boolean;
    bytesOutCounter?: number;
    chunkedMessageRate?: number;
    clientVersion?: string;
    connectedSince?: string;
    consumerName?: string;
    keyHashRanges?: string[];
    lastAckedTimestamp?: number;
    lastConsumedFlowTimestamp?: number;
    lastConsumedTimestamp?: number;
    messageAckRate?: number;
    metadata?: { [key: string]: string; };
    msgOutCounter?: number;
    msgRateOut?: number;
    msgRateRedeliver?: number;
    msgThroughputOut?: number;
    readPositionWhenJoining?: string;
    unackedMessages?: number;
  }[];
  consumersAfterMarkDeletePosition?: { [key: string]: string; };
  delayedMessageIndexSizeInBytes?: number;
  durable?: boolean;
  earliestMsgPublishTimeInBacklog?: number;
  filterAcceptedMsgCount?: number;
  filterProcessedMsgCount?: number;
  filterRejectedMsgCount?: number;
  filterRescheduledMsgCount?: number;
  keySharedMode?: string;
  lastAckedTimestamp?: number;
  lastConsumedFlowTimestamp?: number;
  lastConsumedTimestamp?: number;
  lastExpireTimestamp?: number;
  lastMarkDeleteAdvancedTimestamp?: number;
  messageAckRate?: number;
  msgBacklog?: number;
  msgBacklogNoDelayed?: number;
  msgDelayed?: number;
  msgOutCounter?: number;
  msgRateExpired?: number;
  msgRateOut?: number;
  msgRateRedeliver?: number;
  msgThroughputOut?: number;
  nonContiguousDeletedMessagesRanges?: number;
  nonContiguousDeletedMessagesRangesSerializedSize?: number;
  replicated?: boolean;
  subscriptionProperties?: { [key: string]: string; };
  totalMsgExpired?: number;
  type?: string;
  unackedMessages?: number;
}

export interface  TopicStats {
  averageMsgSize?: number;
  backlogSize?: number;
  bytesInCounter?: number;
  bytesOutCounter?: number;
  compaction?: {
    lastCompactionDurationTimeInMills?: number;
    lastCompactionFailedTimestamp?: number;
    lastCompactionRemovedEventCount?: number;
    lastCompactionSucceedTimestamp?: number;
  };
  deduplicationStatus?: string;
  delayedMessageIndexSizeInBytes?: number;
  earliestMsgPublishTimeInBacklogs?: number;
  msgChunkPublished?: boolean;
  msgInCounter?: number;
  msgOutCounter?: number;
  msgRateIn?: number;
  msgRateOut?: number;
  msgThroughputIn?: number;
  msgThroughputOut?: number;
  nonContiguousDeletedMessagesRanges?: number;
  nonContiguousDeletedMessagesRangesSerializedSize?: number;
  offloadedStorageSize?: number;
  ownerBroker?: string;
  publishers?: {
    accessMode?: string;
    address?: string;
    averageMsgSize?: number;
    chunkedMessageRate?: number;
    clientVersion?: string;
    connectedSince?: string;
    metadata?: { [key: string]: string; };
    msgRateIn?: number;
    msgThroughputIn?: number;
    producerId?: number;
    producerName?: string;
    supportsPartialProducer?: boolean;
  }[];
  replication?: { [key: string]: ReplicationData; };
  storageSize?: number;
  subscriptions?: { [key: string]: SubscriptionData; };
  topicEpoch?: number;
  waitingPublishers?: number;
}