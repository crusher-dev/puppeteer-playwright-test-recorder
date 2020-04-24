import {overlay} from "./components/overlay";
import {loadContentInBody} from "./utils/domUtils";

function loadContentScript() {
    // @ts-ignore
    if(window.scriptLoaded) {
        console.log("Already loaded, returning early")
        return
    }
    // @ts-ignore
    window.scriptLoaded = true;
    // @ts-ignore

     console.log(overlay)
    loadContentInBody(overlay)

}

loadContentScript()
