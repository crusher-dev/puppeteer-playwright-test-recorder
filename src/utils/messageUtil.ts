import { Chrome } from './types';

export function sendMessageToBackground(payload: any, callback: any = null) {
  Chrome.runtime.sendMessage(payload, (response: any) => {
    if (callback) {
      callback(response);
    }
  });
}

export function sendMessageToPage(payload: any, callback: any = null) {
  Chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
    Chrome.tabs.sendMessage(tabs[0].id, { greeting: 'hello' }, (response: any) => {
      if (callback) {
        callback(response);
      }
    });
  });
}
