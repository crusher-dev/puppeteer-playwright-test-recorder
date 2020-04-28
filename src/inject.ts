import {loadContentInBody} from "./utils/dom";
import {getHTMLContentOfTemplate} from "./utils/helpers";
import {Chrome} from "./utils/types";
import {registerOverlayEvents} from "./scripts/inject/overlayActions";

function initContentScript() {
    // @ts-ignore
    if(window.scriptLoaded) {
        console.log("Already loaded, returning early")
        return
    }
    // @ts-ignore
    window.scriptLoaded = true;
    // @ts-ignore
    getHTMLContentOfTemplate("overlay", (res)=>{
        loadContentInBody(res +
            `<link rel='stylesheet' href='${Chrome.runtime.getURL('styles/overlay.css')}'/>`
        );
        registerOverlayEvents();
    });
}

initContentScript()
