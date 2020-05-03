import { h, render } from 'preact';
import App from './App';
import React from "preact/compat";
import {Chrome} from "../../utils/types";
import {sendMessageToBackground} from "../../utils/messageUtil";
import {CHECK_SESSION_STATUS, GET_EVENTS} from "../../constants";
Chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
    sendMessageToBackground({type: CHECK_SESSION_STATUS, payload: {tabId: tabs[0].id}}, async (res: any)=> {
        console.log(res);
        render(<App tabId={tabs[0].id} isSessionGoingOn={res && res.isSessionGoingOn}/>, document.body);
    });
});
