class MessageManager {
  _listJs = undefined;
  _avgMessageSizeBytes = undefined;

  constructor() {
    console.log("MessageManager constructor");
    const listOptions = {
      valueNames: [ 'messageId', 'publishTime', 'decodedPayload', 'messageSizeBytes' ],
      item: this.formatListItem,
      listClass: 'list',
      searchClass: 'search',
      searchColumns: ['messageId', 'publishTime', 'decodedPayload', 'messageSizeBytes'],
      searchDelay: 400
    };

    this._listJs = new List('messages-list', listOptions);
    this._avgMessageSizeBytes = 0;

    this.filter();
  }

  formatListItem(topicMessage){ //type: TopicMessage
    /*
    "messageId": "COjdIxAQIAAwAQ==",
    "publishTime": "2023-03-30T18:42:23.527Z",
    "payload": "eyJfa2V5IjoiNmQxMGI1NTUtNTI1YS00NjYxLThjNDQtOWY1YzZkYTg0NmYzIiwiX3RpbWUiOiIxOTcwLTAxLTAxVDAwOjI4OjAwLjIwMTczNyIsImNsaWNrX3RpbWVzdGFtcCI6MTY4MDIwMTczNzcyMSwibWFpbl9jYXRlZ29yeSI6IlNwb3J0cyIsInN1Yl9jYXRlZ29yeSI6IlRlbm5pcyBSYWNrZXRzIiwidmlzaXRvcl9pZCI6IjZkMTBiNTU1LTUyNWEtNDY2MS04YzQ0LTlmNWM2ZGE4NDZmMyJ9",
    "properties": {},
    "redeliveryCount": 0,
    "messageSizeBytes": "422 Bytes",
    "messageType": "STRING",
    "decodedPayload": {
        "_key": "6d10b555-525a-4661-8c44-9f5c6da846f3",
        "_time": "1970-01-01T00:28:00.201737",
        "click_timestamp": 1680201737721,
        "main_category": "Sports",
        "sub_category": "Tennis Rackets",
        "visitor_id": "6d10b555-525a-4661-8c44-9f5c6da846f3"
    },
    "formattedPublishTime": "2023-03-30 18:42:23.527"
    */

    let str=topicMessage.decodedPayload;

    if (typeof topicMessage.decodedPayload === 'object') {
      str=JSON.stringify(topicMessage.decodedPayload, null, 2);
    }

    const strEllipse = str.length > 200 ? str.substring(0, 200) + '...' : str;

    let props = '';
    for (const [key, value] of Object.entries(topicMessage.properties)) {
      props += `<li><span class="fw-bold">${key}</span>: ${value}</li>`;
    }

    return `<li class="list-group-item mt-3 mb-3 border-top border-1 border-light-subtle">
<div class="row">
    <div class="col-lg-2 text-muted fs-6 d-none d-md-flex" title="${topicMessage.messageId}">Id:&nbsp;<span>${topicMessage.messageId}</span></div>
    <div class="col-lg-3 text-muted fs-6" title="${topicMessage.publishTime}">Published:&nbsp;<span>${topicMessage.formattedPublishTime}</span></div>
    <div class="col-lg-2 text-muted fs-6 d-none d-md-flex" title="${topicMessage.messageSizeBytes}">Size:&nbsp;<span>${topicMessage.formatedMessageSizeBytes}</span></div>
    <div class="col-lg-2 text-muted fs-6">Schema:&nbsp;<span>${topicMessage.messageType}</span></div>
    <div class="col-lg-2 text-muted fs-6 d-none d-lg-flex">Redelivery:&nbsp;<span>${topicMessage.redeliveryCount}</span></div>
    <div class="col-lg-1 text-muted fs-6 d-none d-lg-flex">
      <div class="dropdown">
        <a class="text-muted text-decoration-none dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          Properties
        </a>
        <ul class="dropdown-menu">${props}</ul>
      </div>
    </div>
</div>
</div>
<div class="row">
  <div class="col-12" title="${topicMessage.decodedPayload}">
    <a class="text-decoration-none" href="#collapseExample" data-bs-toggle="collapse" data-bs-target="#coll${topicMessage.messageId}" aria-expanded="false" aria-controls="coll${topicMessage.messageId}">
      ${strEllipse}
    </a>
    <div class="collapse" id="coll${topicMessage.messageId}">
        <div class="card card-body"><pre><code>${str}</code></pre></div>
    </div>
</div>
</div>
</li>`;
  }

  add(topicMessage, formatMessage=true) { //type: TopicMessage
    if(formatMessage) {
      topicMessage.formatedMessageSizeBytes = this.formatMessageSize(topicMessage.messageSizeBytes);
      topicMessage.formattedPublishTime = this.formatPublishTime(topicMessage.publishTime);
    }

    this._listJs.add(topicMessage);

    this._avgMessageSizeBytes = (((topicMessage.messageSizeBytes - this._avgMessageSizeBytes) / this._listJs.items.length) + this._avgMessageSizeBytes);
    this.refreshInfo();
    this.filter();
  }

  refreshInfo(){
    document.getElementById('messagesCount').innerText = this._listJs.items.length.toString();
    document.getElementById('avgMessageSize').innerText = this.formatMessageSize(this._avgMessageSizeBytes);
  }

  formatMessageSize(messageSizeBytes){
    if(!messageSizeBytes){
      return '0';
    }

    if(messageSizeBytes > 1024){
      return (messageSizeBytes / 1024).toFixed(2) + ' KB';
    }else if(messageSizeBytes > 1024 * 1024){
      return (messageSizeBytes / 1024 / 1024).toFixed(2) + ' MB';
    }else if(messageSizeBytes > 1024 * 1024 * 1024){
      return (messageSizeBytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    }

    return messageSizeBytes.toFixed(2)  + ' Bytes';
  }

  formatPublishTime(messagePublishTime){
    const pubTime = new Date(messagePublishTime);
    return pubTime.toISOString()
                  .replace('T', ' ')
                  .replace('Z', '');
  }

  showError(text) {
    document.getElementById('pageError').classList.remove('d-none');
    document.getElementById('pageError').innerText = text;
  }

  showInfo(text) {
    document.getElementById('pageMessage').classList.remove('d-none');
    document.getElementById('pageMessage').innerText = text;
  }

  search(){
    console.log("MessageManager search");
    setTimeout(() => {
      this._listJs.search(document.getElementById('search-message-payload').value, ['decodedPayload']);
    },400);
  }

  filter(){
    console.log("MessageManager filter");
    let publishTimeFilter = new Date();
    const redeliveredOnly = document.getElementById('redeliveredOnly').checked;

    document.getElementsByName('publishDate').forEach((item) => {
      if(!item.checked) {
        return;
      }

      console.log(item.value);
      switch(item.value){
        case '1h':
          publishTimeFilter.setHours(publishTimeFilter.getHours() - 1);
          break;
        case '3h':
          publishTimeFilter.setHours(publishTimeFilter.getHours() - 3);
          break;
        case '12h':
          publishTimeFilter.setHours(publishTimeFilter.getHours() - 12);
          break;
        case '1d':
          publishTimeFilter.setHours(publishTimeFilter.getHours() - 24);
          break;
        case '1w':
          publishTimeFilter.setHours(publishTimeFilter.getHours() - 24 * 7);
          break;
        default:
          publishTimeFilter = undefined;
      }
    });

    this._listJs.filter((item) => {
      const publishTime = new Date(item.values().publishTime);
      return (!publishTimeFilter || publishTime > publishTimeFilter) && (!redeliveredOnly || item.values().redeliveryCount > 0);
    });
  }

  get messages(){
    return this._listJs.items;
  }
}