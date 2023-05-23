const vscode = acquireVsCodeApi();

const bodyTheme = document.querySelector('body')?.getAttribute('data-vscode-theme-kind');
if (bodyTheme) {
  if(bodyTheme === 'vscode-light') {
    document.querySelector('html')?.setAttribute('data-bs-theme', 'light');
  }else{
    document.querySelector('html')?.setAttribute('data-bs-theme', 'dark');
  }
}

window.addEventListener('message', event => {
  console.log(event);
  const message = event.data; // The JSON data our extension sent
  document.getElementById('pageError').classList.add('d-none');
  document.getElementById('pageMessage').classList.add('d-none');

  if(message.isError && message.isError === true) {
    document.getElementById('pageError').classList.remove('d-none');
    document.getElementById('pageError').innerText = message.text;
    return;
  }
  document.getElementById('pageMessage').classList.remove('d-none');
  document.getElementById('pageMessage').innerText = message.text;
});

function sendMsg(command, text) {
  vscode.postMessage({ command: command, text: text });
}

window.addEventListener('load', event => {
  sendMsg('loaded', '');
});

function buildClusterTenants(){
  const data = [...document.querySelectorAll("input[type='checkbox']:checked")].map(e => e.value);
  return data;
}