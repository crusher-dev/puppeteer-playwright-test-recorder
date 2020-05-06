import { h, render } from 'preact';
import App from './App';
import React from "preact/compat";
import {getSessionStatus} from "../../utils/messageUtil";
import {getActiveTabId} from "../../utils/helpers";

// Get Active Tab id (i.e, tabId) and check if the recorder is one or not (i.e, isSessionGoingOn).
// Pass both of them to our component App
getActiveTabId()
    .then(tabId => getSessionStatus(tabId).then(isSessionGoingOn => ({tabId, isSessionGoingOn})))
    .then(({tabId, isSessionGoingOn}) => render(<App tabId={tabId} isSessionGoingOn={isSessionGoingOn}/>, document.body))
