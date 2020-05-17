import { Chrome } from './types';

export function loadScript(name: string, tabId: any, cb: any) {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'production') {
      Chrome.tabs.executeScript(tabId, { file: `/js/${name}.js`, runAt: 'document_end' }, function () {
        resolve(true);
        if(cb) {
          cb();
        }
      });
    } else {
      // dev: async fetch bundle
      fetch(`http://localhost:3000/js/${name}.js`)
          .then((res) => res.text())
          .then((fetchRes) => {
            Chrome.tabs.executeScript(tabId, { code: fetchRes, runAt: 'document_end' }, function(){
              resolve(true);
              if(cb) {
                cb();
              }
            });
          });
    }
  });
}

export function getHTMLContentOfTemplate(template: string, cb:any) {
  fetch(Chrome.runtime.getURL(`${template}.html`))
    .then((res) => res.text())
    .then((res) => { if(cb) { cb(res);} });
}

export function getActiveTabId() {
  return new Promise((resolve, reject) => {
    Chrome.tabs.query({active: true, currentWindow: true}, (tabs: any) => {
      resolve(tabs[0].id);
    });
  });
}

export function sendPostDataWithForm(url: string, options: any = {}){
  const form = document.createElement('form');
  form.method = "post";
  form.action = url;
  form.target = "_blank";
  const optionKeys = Object.keys(options);
  for(let optionKey of optionKeys){
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = optionKey;
    hiddenField.value = options[optionKey];

    form.appendChild(hiddenField);
  }

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

export function changeExtensionIcon(icon: string){
    Chrome.browserAction.setIcon({path:icon});
}

export function getSentenceCaseString(str: string){
  return str[0].toUpperCase()+str.slice(1).toLowerCase();
}
