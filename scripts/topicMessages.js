const vscode = acquireVsCodeApi();
const bodyTheme = document.querySelector('body')?.getAttribute('data-vscode-theme-kind');
if (bodyTheme) {
  if(bodyTheme === 'vscode-light') {
    document.querySelector('html')?.setAttribute('data-bs-theme', 'light');
  }else{
    document.querySelector('html')?.setAttribute('data-bs-theme', 'dark');
  }
}

let messagesList;

window.addEventListener('message', event => {
  //console.log(event);

  const message = event.data; // The JSON data our extension sent

  if(!message.command){ //it's a topic message
    messagesList.add(message);
    return;
  }

  switch (message.command) {
    case 'error':
      messagesList.showError(message.text);
      break;
    case 'close':
      break;
    default: // info
      messagesList.showInfo(message.text);
      break;
  }
});

window.addEventListener('load', event => {
  messagesList = new MessageManager();
});