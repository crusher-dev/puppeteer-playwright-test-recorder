import {loadContentInBody} from "./utils/dom";
import {Chrome} from "./utils/types";

function init(){
    loadContentInBody(`<link rel='stylesheet' href='${Chrome.runtime.getURL('styles/popup.css')}'/>`);
}

init();
