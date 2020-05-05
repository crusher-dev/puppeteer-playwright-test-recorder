export function loadContentInBody(content: string) {
  // @ts-ignore
  document.body.insertAdjacentHTML( 'beforeend', content );
};

export function removeAllBlankLinks(){
  let links = document.links, i, length;

  for (i = 0, length = links.length; i < length; i++) {
    links[i].target == '_blank' && links[i].removeAttribute('target');
  }
}

export function startSession(){
  // @ts-ignore
  window.sessionStarted = true;
}

export function stopSession(){
  // @ts-ignore
  window.sessionStarted = false;
}

export function isSessionGoingOn(){
  // @ts-ignore
  return !!window.sessionStarted;
}

export function loadCSSIfNotAlreadyLoadedForSomeReason (href: any) {
  let ss = document.styleSheets;
  for (let i = 0, max = ss.length; i < max; i++) {
    if (ss[i].href == "/path/to.css")
      return;
  }
  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.id="overlay_css";

  document.getElementsByTagName("head")[0].appendChild(link);
}
