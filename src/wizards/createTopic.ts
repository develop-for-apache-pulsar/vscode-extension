import * as vscode from "vscode";
import {Wizard} from "../utils/wizard";
import {TPulsarAdmin} from "../types/tPulsarAdmin";
import {trace} from "../utils/traceDecorator";
import {TWebviewMessage} from "../types/tWebviewMessage";

enum MessageCommand {
  loaded = 'loaded',
  setTopicType = 'setTopicType',
  setNumPartitions = 'setNumPartitions',
  setTopicName = 'setTopicName',
  createTopic = 'createTopic',
  cancel = 'cancel',
}

enum MessageError {
  couldNotCreate = 'Could not create topic',
}

export class CreateTopicWizard extends Wizard {
  private tempTopicDesign: { topicType: string, numPartitions: number, topicName: string };

  constructor(context: vscode.ExtensionContext,
              private readonly providerTypeName: string,
              private readonly clusterName: string,
              private readonly tenantName: string,
              private readonly namespaceName: string,
              private readonly pulsarAdmin: TPulsarAdmin,
              private readonly successCallback?: (topicType: string, numPartitions: number, topicName: string, topicProperties: {}) => void) {
    super(context, "createTopic", "Create New Topic");
    this.receivedMessageCallback = this.receivedMessage;
    this.tempTopicDesign = {topicType: "", numPartitions: 0, topicName: ""};
  }

  @trace("Start create topic wizard")
  public static startWizard(context: vscode.ExtensionContext,
                            providerTypeName: string,
                            clusterName: string,
                            tenantName: string,
                            namespaceName: string,
                            pulsarAdmin: TPulsarAdmin,
                            successCallback?: (topicType: string, numPartitions: number, topicName: string, topicProperties: {}) => void): void {
    const wizard = new CreateTopicWizard(context, providerTypeName, clusterName, tenantName, namespaceName, pulsarAdmin, successCallback);
    wizard.showWizardStartPage();
  }

  private showWizardStartPage() {
    this.showPage(this.chooseTopicTypePage);
  }

  private async receivedMessage(message: TWebviewMessage): Promise<void> {
    switch (message.command) {
      case MessageCommand.loaded:
        // no op
        break;
      case MessageCommand.setTopicType:
        const topicType = message.text as string;
        this.tempTopicDesign.topicType = topicType;

        this.showPage(this.topicNamePage);
        break;
      case MessageCommand.setTopicName:
        const topicName = message.text as string;
        this.tempTopicDesign.topicName = topicName;

        this.showPage(this.numPartitionsPage);
        break;
      case MessageCommand.setNumPartitions:
        const numPartitions = parseInt(message.text as string);
        this.tempTopicDesign.numPartitions = numPartitions;

        this.showPage(this.propertiesPage);
        break;
      case MessageCommand.createTopic:
        const topicProperties = message.text as {};
        await this.createTopic(this.tenantName,
          this.namespaceName,
          this.tempTopicDesign.topicType,
          this.tempTopicDesign.numPartitions,
          this.tempTopicDesign.topicName,
          topicProperties);
        break;
      case MessageCommand.cancel:
        this.dispose();
        break;
    }
  }

  private get chooseTopicTypePage(): string {
    return `
      <div class="row h-75">
        <div class="col-12 align-self-center text-center"><h4>Choose a topic type.</h4></div>
        <div class="col-12 text-center">
            <div class="row h-75">
               <div class="col-12"><div class="row"><div class="offset-3 col-2">
                  <button style="width: 100%;" class="btn btn-lg btn-primary pt-2 pb-2" onclick='sendMsg("${MessageCommand.setTopicType}","persistent")'>Persistent</button>
              </div>
              <div class="col-5 text-muted">A persistent topic in Apache Pulsar is a topic where all messages are durably persisted on disk. This means that even if a broker or 
              subscriber fails, the messages will still be available. This is especially useful when you watch topic messages because it can retrieve a history of messages. Note 
              that Persistent topics require more storage space than non-persistent topics, so depending on where your cluster is hosted, there could be additional charges.</div></div></div>
            <div class="col-12"><div class="row"><div class="offset-3 col-2">
                  <button style="width: 100%;" class="btn btn-lg btn-primary pt-2 pb-2" onclick='sendMsg("${MessageCommand.setTopicType}","non-persistent")'>Non Persistent</button>
              </div>
              <div class="col-5 text-muted">A non-persistent topic in Apache Pulsar is a topic where non-acknowledged messages are stored in memory only. This means that if a broker
               or subscriber fails, the messages will be lost. Non-persistent topics are a good choice for applications that do not require high durability, scalability, or 
               availability. While developing, this is a convenient option to always be seeing only the latest messages.</div></div></div>
            </div>
        </div>
      </div>`;
  }

  private get topicNamePage(): string {
    return `
      <div class="row h-75">
        <div class="col-12 align-self-center text-center"><h4>Name your topic.</h4></div>
        <div class="offset-2 col-8 text-center">
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1">&nbsp;</span>
              </div>
              <input type="text" id="topicName" class="form-control" value="" placeholder="my-topic" aria-label="topicName" aria-describedby="basic-addon1">
            </div>
        </div>
        <div class="col-2 text-center">&nbsp;</div>
      </div>
      <div class="row h-25 align-items-center">
        <div class="offset-4 col-2">
            <button class="btn btn-primary btn-lg" onclick='sendMsg("${MessageCommand.setTopicName}",document.getElementById("topicName").value)'>Next >></button>
          </div>
        <div class="col-2">
            <button class="btn btn-secondary btn-lg" onclick='sendMsg("${MessageCommand.cancel}","")'>Cancel</button>
        </div>
        <div class="col-4">&nbsp;</div>
      </div>`;
  }

  private get numPartitionsPage(): string {
    let numPartitionsInput = `<input type="radio" class="btn-check" name="numPartitions" id="numPartitionsNone" autocomplete="off" value="0" 
      onchange='sendMsg("${MessageCommand.setNumPartitions}","0")'><label class="btn btn-outline-primary" for="numPartitionsNone">None</label>`;

    for(let i = 2; i <= 10; i++) {
      numPartitionsInput += `
        <input type="radio" class="btn-check" name="numPartitions" id="numPartitions${i}" autocomplete="off" value="${i}" onchange='sendMsg("${MessageCommand.setNumPartitions}","${i}")'>
        <label class="btn btn-outline-primary" for="numPartitions${i}">${i}</label>`;
    }

    return `
      <div class="row h-75">
        <div class="col-12 align-self-center text-center"><h4>Optionally, choose a partition size.</h4></div>
        <div class="col-12 text-center">
          <div class="btn-group" role="group" aria-label="Number of partitions">
            ${numPartitionsInput}
          </div>
          <p class="offset-3 col-6 mt-5">
            A topic partition in Apache Pulsar is the number of brokers to distribute messages across. Partitions are useful when you have a high number of messages being 
            injested and want to process them asynchronously. Messages are hashed to determine which partition it is stored in. Unless you are running load tests, while developing, 
            choose a value of 'None'.
          </p>
        </div>
      </div>`;
  }

  private get propertiesPage(): string {
    return `
      <div class="row h-75 mt-3">
        <div class="col-12 align-self-center text-center border-0"><h4>Optionally, add metadata about the topic.</h4>
            <div class="">
            <button type="button" class="btn btn-success btn-lg" title="Add another" onclick='appendLabelValueRow(document.getElementById("labelValueRows"))'>New label/value</button>
            </div>
        </div>
        <div class="offset-2 col-8 text-center">
            <table class="table table-bordered table-hover">
              <tbody id="labelValueRows"></tbody>
            </table>
        </div>
        <div class="col-2 text-center">&nbsp;</div>
      </div>
      <div class="row h-25 align-items-center">
        <div class="offset-3 col-3">
            <button class="btn btn-primary btn-lg" onclick='sendMsg("${MessageCommand.createTopic}",buildProperties(document.getElementById("labelValueRows")))'>Create topic</button>
          </div>
        <div class="col-2">
            <button class="btn btn-secondary btn-lg" onclick='sendMsg("${MessageCommand.cancel}","")'>Cancel</button>
        </div>
        <div class="col-4">&nbsp;</div>
      </div>`;
  }

  @trace('Create topic')
  private async createTopic(tenantName:string, namespaceName: string, topicType: string, numPartitions: number, topicName: string, topicProperties: {}): Promise<void> {
    try {
      if(topicType === 'persistent') {
        await this.pulsarAdmin.CreatePersistentTopic(tenantName, namespaceName, topicName, numPartitions, topicProperties);
      }else{
        await this.pulsarAdmin.CreateNonPersistentTopic(tenantName, namespaceName, topicName, numPartitions, topicProperties);
      }

      if(this.successCallback !== undefined) {
        this.successCallback(topicType, numPartitions, topicName, topicProperties);
      }
    } catch (err: any) {
      console.log(err);
      this.postError(MessageError.couldNotCreate, err);
      return;
    }

    this.dispose();
  }
}