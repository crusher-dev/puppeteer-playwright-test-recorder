import { Chrome } from '../../../utils/types';
import {
    CHECK_SESSION_STATUS,
    EVENT_CAPTURED,
    GET_EVENTS,
    SAVE_EVENT,
    START_RECORDING_SESSION,
    DELETE_RECORDING_SESSION
} from '../../../constants';
import { dispatch, getState } from '../store';
import {changeExtensionIcon, getActiveTabId, loadAssetScript, loadScript} from "../../../utils/helpers";

function handleNewEvent(payload: any, tabId: any){
    const {event_type, selector, value}  = payload;
    return dispatch({type: SAVE_EVENT, event_type, selector, value, tabId});
}

export function init() {
    Chrome.tabs.onUpdated.addListener(function(tabId: any, changeInfo: any, tab: any) {
        if(!!getState().sessions[tabId]){
            Chrome.tabs.query({ active: true, currentWindow: true }, async (tabs: any) => {
                // @ts-ignore
                await loadScript('inject', tabs[0].id);
            });
        } else {
        }
    });

    Chrome.tabs.onActivated.addListener(function(activeInfo: any) {
        const {tabId} = activeInfo;
        if(!!getState().sessions[tabId]) {
            changeExtensionIcon("icons/ongoing_recording.png");
        } else {
            changeExtensionIcon("icons/extension_icon.png");

        }
    });

  Chrome.runtime.onMessage.addListener(
    (request: any, sender: any, sendResponse: any) => {
        const {type, payload} = request;
        switch(type){
            case START_RECORDING_SESSION:
                dispatch({type: START_RECORDING_SESSION, tabId: sender.tab.id});
                changeExtensionIcon("icons/ongoing_recording.png");
                return sendResponse("Started new session");
                break;
            case DELETE_RECORDING_SESSION:
                // @ts-ignore
                getActiveTabId().then(tabId => {
                    dispatch({type: DELETE_RECORDING_SESSION, tabId: tabId});
                    changeExtensionIcon("icons/extension_icon.png");
                    console.log(getState());
                    sendResponse("Stopped previous session");
                });
                return true;
                break;
            case EVENT_CAPTURED:
                return sendResponse(handleNewEvent(payload, sender.tab.id));
                break;
            case CHECK_SESSION_STATUS:
                getActiveTabId().then(tabId => {

                    // @ts-ignore
                    sendResponse({isSessionGoingOn: !!getState().sessions[tabId]});
                });

                return true;

                break;
            case GET_EVENTS:
                getActiveTabId().then(tabId => {
                    const events = getState().events && getState().events[payload.tabId ? payload.tabId : tabId];
                    return sendResponse(events ? events : []);
                });
                return true;

            default:
                break;
        }
    },
  );
};
