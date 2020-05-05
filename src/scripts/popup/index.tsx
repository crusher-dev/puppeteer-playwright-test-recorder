import { h, render } from 'preact';
import App from './App';
import React from "preact/compat";
import {getSessionStatus} from "../../utils/messageUtil";
import {getActiveTabId} from "../../utils/helpers";
getActiveTabId()
    .then(tabId => getSessionStatus(tabId).then(isSessionGoingOn => ({tabId, isSessionGoingOn})))
    .then(({tabId, isSessionGoingOn}) => render(<App tabId={tabId} isSessionGoingOn={isSessionGoingOn}/>, document.body))
