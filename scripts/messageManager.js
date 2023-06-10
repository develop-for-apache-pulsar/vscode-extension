/*
{
    "messageId": "COjdIxAQIAAwAQ==",
    "publishTime": "2023-03-30T18:42:23.527Z",
    "payload": "eyJfa2V5IjoiNmQxMGI1NTUtNTI1YS00NjYxLThjNDQtOWY1YzZkYTg0NmYzIiwiX3RpbWUiOiIxOTcwLTAxLTAxVDAwOjI4OjAwLjIwMTczNyIsImNsaWNrX3RpbWVzdGFtcCI6MTY4MDIwMTczNzcyMSwibWFpbl9jYXRlZ29yeSI6IlNwb3J0cyIsInN1Yl9jYXRlZ29yeSI6IlRlbm5pcyBSYWNrZXRzIiwidmlzaXRvcl9pZCI6IjZkMTBiNTU1LTUyNWEtNDY2MS04YzQ0LTlmNWM2ZGE4NDZmMyJ9",
    "properties": {},
    "redeliveryCount": 0,
    "_decodedPayload": "{\"_key\":\"6d10b555-525a-4661-8c44-9f5c6da846f3\",\"_time\":\"1970-01-01T00:28:00.201737\",\"click_timestamp\":1680201737721,\"main_category\":\"Sports\",\"sub_category\":\"Tennis Rackets\",\"visitor_id\":\"6d10b555-525a-4661-8c44-9f5c6da846f3\"}"
}
 */
class MessageManager {
  _messagesList = [];
  _avgMessageSizeBytes = 0;
  _messagesCount = 0;

  constructor() {
    const listOptions = {
      valueNames: [ 'messageId', 'publishTime', 'decodedPayload', 'messageSizeBytes' ],
      item: this.formatListItem,
      listClass: 'list',
      searchClass: 'search',
      searchColumns: ['messageId', 'publishTime', 'decodedPayload', 'messageSizeBytes'],
      searchDelay: 400
    };

    this._messagesList = new List('messages-list', listOptions);
    this.filter();
  }

  formatListItem(values){
    values.publishTime = new Date(values.publishTime);
    return `<li class="list-group-item mb-3">
<div class="row">
    <div class="col-2 text-muted fs-6" title="${values.messageId}">Id: <span class="messageId">${values.messageId}</span></div>
    <div class="col-3 text-muted fs-6" title="${values.publishTime.toUTCString()}">Published: <span class="publishTime">${values.formattedPublishTime}</span></div>
    <div class="col-2 text-muted fs-6">Size: <span class="messageSizeBytes">${values.messageSizeBytes}</span></div>
</div>
<div class="row">
    <div class="col-12"><span class="decodedPayload">${values.decodedPayload}</span></div>
</div>
</li>`;
  }

  add(message) {
    this._messagesCount++;
    this._avgMessageSizeBytes = (((message.messageSizeBytes - this._avgMessageSizeBytes) / this._messagesCount) + this._avgMessageSizeBytes);

    message.formattedPublishTime = new Date(message.publishTime);
    message.formattedPublishTime = message.formattedPublishTime.toISOString().replace('T', ' ').replace('Z', '');

    if(message.messageSizeBytes > 1024){
      message.messageSizeBytes = (message.messageSizeBytes / 1024).toFixed(2) + ' KB';
    }else if(message.messageSizeBytes > 1024 * 1024){
      message.messageSizeBytes = (message.messageSizeBytes / 1024 / 1024).toFixed(2) + ' MB';
    }else if(message.messageSizeBytes > 1024 * 1024 * 1024){
      message.messageSizeBytes = (message.messageSizeBytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    }else{
      message.messageSizeBytes = message.messageSizeBytes + ' Bytes';
    }

    this._messagesList.add(message);
    this.filter();
    document.getElementById('messagesCount').innerText = this._messagesCount.toString();
    document.getElementById('avgMessageSize').innerText = this._avgMessageSizeBytes.toFixed(2) + ' Bytes';
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
    setTimeout(() => {
      this._messagesList.search(document.getElementById('search-message-payload').value, ['decodedPayload']);
    },400);
  }

  filter(){
    let publishTimeFilter = new Date();
    const redeliveredOnly = document.getElementById('redeliveredOnly').checked;

    document.getElementsByName('publishDate').forEach((item) => {
      if(!item.checked) {
        return;
      }

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

    this._messagesList.filter((item) => {
      const publishTime = new Date(item.values().publishTime);
      return (!publishTimeFilter || publishTime > publishTimeFilter) && (!redeliveredOnly || item.values().redeliveryCount > 0);
    });
  }
}