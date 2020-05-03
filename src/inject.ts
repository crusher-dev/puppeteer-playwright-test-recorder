import {isSessionGoingOn, loadContentInBody, loadCSSIfNotAlreadyLoadedForSomeReason, startSession} from './utils/dom';
import { getHTMLContentOfTemplate } from './utils/helpers';
import { Chrome } from './utils/types';
import UIController from './scripts/inject/UIController';

function initContentScript() {
  // @ts-ignore
  if (isSessionGoingOn()) {
    console.log('Already loaded, returning early');
    return;
  }
  startSession();
  // @ts-ignore
  getHTMLContentOfTemplate('overlay', (res) => {
      loadContentInBody(`${res}`);
      loadCSSIfNotAlreadyLoadedForSomeReason(Chrome.runtime.getURL('styles/overlay.css'));
      (new UIController()).boot();
  });
}

initContentScript();
