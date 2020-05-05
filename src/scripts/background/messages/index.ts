import { Chrome } from '../../../utils/types';
import {
    CHECK_SESSION_STATUS,
    EVENT_CAPTURED,
    GET_EVENTS,
    SAVE_EVENT,
    START_RECORDING_SESSION,
    STOP_RECORDING,
    DELETE_RECORDING_SESSION
} from '../../../constants';
import { dispatch, getState } from '../store';
import {sendMessageToPage} from "../../../utils/messageUtil";
import {getActiveTabId, loadScript} from "../../../utils/helpers";

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
        }
    });

  Chrome.runtime.onMessage.addListener(
    (request: any, sender: any, sendResponse: any) => {
        const {type, payload} = request;
        switch(type){
            case START_RECORDING_SESSION:
                dispatch({type: START_RECORDING_SESSION, tabId: sender.tab.id});
                return sendResponse("Started new session");
                break;
            case DELETE_RECORDING_SESSION:
                // @ts-ignore
                const {tabId} = payload;
                dispatch({type: DELETE_RECORDING_SESSION, tabId: tabId});
                console.log(getState());
                return sendResponse("Stopped previous session");
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
                try{
                    const events = getState().events && getState().events[payload.tabId];
                    return sendResponse(events ? events : []);
                } catch(err){
                    return sendResponse(err.message);
                }

            default:
                break;
        }
    },
  );
};
