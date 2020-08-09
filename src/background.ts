import * as Messages from './scripts/background/messages/index';

let lastOpenedUrl = null;

chrome.browserAction.onClicked.addListener(tab => {

});

Messages.init();