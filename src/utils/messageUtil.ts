import { Chrome } from './types';
import {CHECK_SESSION_STATUS, GET_EVENTS} from "../constants";

export function sendMessageToBackground(payload: any, callback: any = null) {
  Chrome.runtime.sendMessage(payload, (response: any) => {
    if (callback) {
      callback(response);
    }
  });
}

export function sendMessageToPage(payload: any, callback: any = null) {
  Chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
    Chrome.tabs.sendMessage(tabs[0].id, payload, (response: any) => {
      if (callback) {
        callback(response);
      }
    });
  });
}

export function getEventsList(tabId: any){
  return new Promise((resolve, reject) => {
    sendMessageToBackground({type: GET_EVENTS, payload: {tabId: tabId}}, (events: any)=>{
      if(!events){
        reject("Something went wrong!! Failed to get events from background script.");
      }
      resolve(events);
    });
  });
}

export function getSessionStatus(tabId: any){
  return new Promise((resolve, reject) => {
    sendMessageToBackground({type: CHECK_SESSION_STATUS, payload: {tabId: tabId}}, (res: any)=> {
      resolve(res && res.isSessionGoingOn);
    });
  });
}
