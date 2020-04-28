import {registerEvents} from "./captureActions";
export function registerOverlayEvents(){
    let overlay : HTMLElement = document.querySelector("#overlay");
    let startButton : HTMLElement = document.querySelector("#overlay-wizard-button");
    startButton.onclick = function(){
            overlay.remove();
            overlay = null;
            registerEvents();
    }
}
