const vscode = acquireVsCodeApi();
const bodyTheme = document.querySelector('body')?.getAttribute('data-vscode-theme-kind');
if (bodyTheme) {
  if(bodyTheme === 'vscode-light') {
    document.querySelector('html')?.setAttribute('data-bs-theme', 'light');
  }else{
    document.querySelector('html')?.setAttribute('data-bs-theme', 'dark');
  }
}

let messageManager;

function sendMsg(command, text) {
  vscode.postMessage({ command: command, text: text });
}

window.addEventListener('message', event => {
  console.log("message");
  console.log(event);

  const messageData = event.data; // The JSON data our extension sent

  if(!messageData.command && messageData.publishTime && messageData.messageId){ //it's a topic message
    messageManager.add(messageData);
    return;
  }

  if(!messageData.text){
    return;
  }

  switch (messageData.command) {
    case 'error':
      messageManager.showError(messageData.text);
      break;
    case 'connection':
      document.getElementById('websocketStatus').innerText = messageData.text;
      break;
    default: // info
      messageManager.showInfo(messageData.text);
      break;
  }
});

window.addEventListener('load', event => {
  console.log("Load");
  console.log(event);

  messageManager = new MessageManager();

  sendMsg("ready");
});