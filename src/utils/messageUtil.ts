import {Chrome} from "./types";

export function sendMessageToBackground(payload: any, callback: any = null){
    Chrome.runtime.sendMessage(payload, function(response: any) {
        if(callback){
            callback(response);
        }
    });
}

export function sendMessageToPage(payload: any, callback: any = null){
    Chrome.tabs.query({active: true, currentWindow: true}, function(tabs: any) {
        Chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response: any) {
            if(callback){
                callback(response);
            }
        });
    });
}
