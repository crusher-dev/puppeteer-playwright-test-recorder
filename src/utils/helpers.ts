import { Chrome } from './types';

export function loadScript(name: string, tabId: any, cb: any) {
  if (process.env.NODE_ENV === 'production') {
    Chrome.tabs.executeScript(tabId, { file: `/${name}.js`, runAt: 'document_end' }, cb);
  } else {
    // dev: async fetch bundle
    fetch(`http://localhost:3000/js/${name}.js`)
      .then((res) => res.text())
      .then((fetchRes) => {
        Chrome.tabs.executeScript(tabId, { code: fetchRes, runAt: 'document_end' }, cb);
      });
  }
}

export function getHTMLContentOfTemplate(template: string, cb:any) {
  fetch(Chrome.runtime.getURL(`${template}.html`))
    .then((res) => res.text())
    .then((res) => { cb(res); });
}
