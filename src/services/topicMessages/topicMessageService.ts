import {TPulsarAdmin} from "../../types/tPulsarAdmin";
import {ITopicNode, TopicNode} from "../../providers/pulsarClusterTreeDataProvider/nodes/topic";
import TopicMessageController from "../../controllers/topicMessageController";
import Logger from "../../utils/logger";

export default class TopicMessageService {
  constructor(private readonly pulsarAdmin: TPulsarAdmin) {}

  public async watchTopics(watchDetails: {topicAddress: string, providerTypeName: string, clusterName: string}[]): Promise<void[]> {
    let watchPromises: Promise<void>[] = [];

    watchDetails.forEach((watchDetail) => {
      TopicNode.fromTopicAddress(this.pulsarAdmin, watchDetail.topicAddress, watchDetail.providerTypeName, watchDetail.clusterName).then((topicNode: ITopicNode) => {
        watchPromises.push(TopicMessageController.watchTopicMessages(topicNode));
      }).catch((e: any) => {
        Logger.error(`Watch topic messages`, e);
      });
    });

    return Promise.all<void>(watchPromises);
  }
}