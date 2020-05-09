import {Window} from "./types";

export function loadContentInBody(content: string) {
  document.body.insertAdjacentHTML( 'beforeend', content );
}

export function removeAllBlankLinks(){
  const links = document.links;
  let i, length;

  for (i = 0, length = links.length; i < length; i++) {
    links[i].target == '_blank' && links[i].removeAttribute('target');
  }
}

export function startSession(){
  Window.sessionStarted = true;
}

export function stopSession(){
  Window.sessionStarted = false;
}

export function isSessionGoingOn(){
  return !!Window.sessionStarted;
}

export function loadCSSIfNotAlreadyLoadedForSomeReason (href: any) {
  const ss = document.styleSheets;
  for (let i = 0, max = ss.length; i < max; i++) {
    if (ss[i].href == "/path/to.css")
      return;
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.id="overlay_css";

  document.getElementsByTagName("head")[0].appendChild(link);
}
