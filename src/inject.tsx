import { loadContentInBody } from './utils/dom';
import { getHTMLContentOfTemplate } from './utils/helpers';
import { Chrome } from './utils/types';
import { registerOverlayEvents } from './scripts/inject/overlayActions';
import {render} from 'preact/compat';
import App from "./App";

function initContentScript() {
  // @ts-ignore
  if (window.scriptLoaded) {
    console.log('Already loaded, returning early');
    return;
  }
  // @ts-ignore
  window.scriptLoaded = true;
  // @ts-ignore
  getHTMLContentOfTemplate('overlay', (res) => {
    loadContentInBody(`<div id="overlayRoot"></div>`);
    render(<App />, document.querySelector("#overlayRoot"));
  });
}

initContentScript();
