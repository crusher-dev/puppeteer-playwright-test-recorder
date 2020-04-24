import {Chrome} from "../other/types";

export function registerButtonClick(){
    Chrome.browserAction.onClicked.addListener(function(tab:any) {
        console.log(`Running config on current tab ${tab.url}`);
        // @ts-ignore
        chrome.tabs.executeScript({
            file: 'content-script.js'
        });
        Chrome.browserAction.setBadgeText({text: 'ON'});
        // // @ts-ignore
        Chrome.browserAction.setBadgeBackgroundColor({color: '#4688F1'});
    });
}
