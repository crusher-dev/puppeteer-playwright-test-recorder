import * as url from "./utils/url";
import TabChangeInfo = chrome.tabs.TabChangeInfo;
import Tab = chrome.tabs.Tab;
import tabStorage from "./utils/tabStorage";
import WebRequestDetails = chrome.webRequest.WebRequestDetails;
import WebRequestFullDetails = chrome.webRequest.WebRequestFullDetails;
import WebResponseHeadersDetails = chrome.webRequest.WebResponseHeadersDetails;
import FrameStorage from "./utils/frameStorage";
import {getQueryStringParams} from "./utils/url";
import userAgents from "./constants/userAgents";

class ChromeEventsListener{
    state: any;

    constructor() {
        this.onTabUpdated = this.onTabUpdated.bind(this);
        this.onTabRemoved = this.onTabRemoved.bind(this);
        this.onBeforeRequest = this.onBeforeRequest.bind(this);
        this.onHeadersReceived = this.onHeadersReceived.bind(this);
        this.onBeforeSendHeaders = this.onBeforeSendHeaders.bind(this);
        this.onRuntimeMessage = this.onRuntimeMessage.bind(this);
        this.onNavigationCompleted = this.onNavigationCompleted.bind(this);
        this.onBeforeNavigation = this.onBeforeNavigation.bind(this);
    }

    isAllowedToPerformAction(tab: Tab){
        if(!tab){
            return false;
        }

        return tabStorage.isExtension(tab.id);
    }

    onTabUpdated(tabId: number, changeInfo: TabChangeInfo, tab: Tab){
        if(url.isOfCrusherExtension(tab.url)){
            const iframeURL = getQueryStringParams("url", tab.url);
            const crusherAgent = getQueryStringParams("__crusherAgent__", iframeURL);
            const userAgent = userAgents.find((agent => {
              return agent.name === (crusherAgent ? crusherAgent : userAgents[6].value)
            }));

            console.log("Setting user agent for tab ", tab.id, tab.url, userAgent.value);
            tabStorage.set(tabId, tab, userAgent.value);
        } else {
            tabStorage.remove(tabId)
        }
    }

    onTabRemoved(tabId: number){
        if(!tabStorage.has(tabId)){
            return
        }
    }

    onBeforeRequest(details: WebRequestDetails){
        const areActionsAllowed = this.isAllowedToPerformAction(tabStorage.get(details.tabId));

        if(!areActionsAllowed || details.parentFrameId !== 0){
            return { cancel: false }
        }

        chrome.browsingData.remove(
            {},
            {
                serviceWorkers: true,
            }
        );

        return { cancel: false };
    }

    onHeadersReceived(details: WebResponseHeadersDetails){
        const areActionsAllowed = this.isAllowedToPerformAction(tabStorage.get(details.tabId));
        const headers = details.responseHeaders;

        if (!areActionsAllowed || details.parentFrameId !== 0) {
            return { responseHeaders: headers }
        }

        const responseHeaders = headers.filter(header => {
            const name = header.name.toLowerCase()
            return (
                ['x-frame-options', 'content-security-policy', 'frame-options'].indexOf(
                    name
                ) === -1
            )
        });

        const redirectUrl = headers.find(header => {
            return header.name.toLowerCase() === 'location'
        })

        if (redirectUrl) {
            chrome.browsingData.remove(
                {},
                {
                    serviceWorkers: true,
                }
            )
        }

        return {
            responseHeaders
        }
    }

    onBeforeSendHeaders(details: WebRequestFullDetails){
        const areActionsAllowed = this.isAllowedToPerformAction(tabStorage.get(details.tabId));
        const headers = details.requestHeaders;

        if (!areActionsAllowed || details.parentFrameId !== 0) {
            return { requestHeaders: headers }
        }

        const frame = FrameStorage.get(details.tabId, details.frameId);

        console.log("Can't find frame", frame, details.url, details.frameId, details.tabId);
        if (!frame) {
            return {
                requestHeaders: details.requestHeaders,
            }
        }

        let userAgent = tabStorage.get(details.tabId).crusherAgent;

        console.log("Changing user agent to", userAgent);

        details.requestHeaders.push({
            name: 'User-Agent',
            value: userAgent,
        })

        return { requestHeaders: details.requestHeaders }
    }

    onRuntimeMessage(){

    }

    onNavigationCompleted(details: any){
        const isAllowed = this.isAllowedToPerformAction(tabStorage.get(details.tabId))

        if (!isAllowed || details.frameId === 0) {
            return
        }
    }

    onBeforeNavigation(details: any){
        const isAllowed = this.isAllowedToPerformAction(tabStorage.get(details.tabId))

        if (!isAllowed || details.frameId === 0) {
            return
        }

        if (details.parentFrameId === 0) {
            const userAgentId = getQueryStringParams("__crusherAgent__", details.url);
            const userAgentFromUrl = userAgents.find((agent)=>{
                return agent.name === userAgentId
            });
            const userAgent = userAgentFromUrl ? userAgentFromUrl.value : tabStorage.get(details.tabId).crusherAgent;

            if (userAgent) {
                FrameStorage.set({
                    ...details,
                    userAgent: userAgent
                });
            }
        }
    }

    registerEventListeners(){
        chrome.tabs.onUpdated.addListener(this.onTabUpdated);
        chrome.tabs.onRemoved.addListener(this.onTabRemoved);
        chrome.webRequest.onBeforeRequest.addListener(this.onBeforeRequest, { urls: ['<all_urls>'] }, ['blocking']);
        chrome.webRequest.onHeadersReceived.addListener(this.onHeadersReceived, { urls: ['<all_urls>'], types: ['sub_frame', 'main_frame'] }, ['blocking', 'responseHeaders']);
        chrome.webRequest.onBeforeSendHeaders.addListener(this.onBeforeSendHeaders, { urls: ['<all_urls>'], types: ['sub_frame'] }, ['blocking', 'requestHeaders']);
        chrome.runtime.onMessage.addListener(this.onRuntimeMessage);
        chrome.webNavigation.onCompleted.addListener(this.onNavigationCompleted);
        chrome.webNavigation.onBeforeNavigate.addListener(this.onBeforeNavigation);
    }

    boot(){
        this.registerEventListeners();
    }

    shutdown(){

    }
}

const chromeEventsManager = new ChromeEventsListener();
chromeEventsManager.boot();