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

function buildProperties(rowsParent){
  let data = {};
  rowsParent.childNodes.forEach(row => {
    const label = row.querySelector("input[name^='label']").value;
    const value = row.querySelector("input[name^='value']").value;
    if(label && value){
      data[label] = value;
    }
  });
  return data;
}

function appendLabelValueRow(rowsParent){
  const rowCount = rowsParent.childElementCount++;

  const newRowNode = document.createElement('tr');
  newRowNode.id = `labelValue${rowCount}`;
  newRowNode.innerHTML = `<td><input type="text" class="form-control" placeholder="label" aria-label="label" name="label${rowCount}"></td>
<td><input type="text" class="form-control" placeholder="value" aria-label="value" name="value${rowCount}"></td>
<td><button type="button" class="btn btn-danger btn-lg" title="Remove" onclick="document.getElementById('labelValue${rowCount}').remove()">-</button></td>`;

  rowsParent.appendChild(newRowNode);
}