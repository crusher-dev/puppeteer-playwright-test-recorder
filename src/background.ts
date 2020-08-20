import * as Messages from './scripts/background/messages/index';
import {isExtension} from './utils/url';
import backgroundTabStorage from './scripts/services/backgroundTabStorage';
import backgroundFrameStorage from "./scripts/services/backgroundFrameStorage";
import * as queryString from "querystring";

let lastOpenedUrl = null;

chrome.browserAction.onClicked.addListener(tab => {
    lastOpenedUrl = tab.url;

});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (isExtension(tab.url)) {
        backgroundTabStorage.set(tabId, tab)
    } else {
        backgroundTabStorage.remove(tabId)
    }
})

chrome.tabs.onRemoved.addListener(tabId => {
    if (!backgroundTabStorage.has(tabId)) {
        return
    }
    backgroundTabStorage.remove(tabId)
})

chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        if (details.parentFrameId !== 0) {
            return {
                cancel: false,
            }
        }
        return {
            cancel: false,
        }
    },
    {urls: ['<all_urls>']},
    ['blocking']
)

chrome.webRequest.onHeadersReceived.addListener(
    function (details) {
        const headers = details.responseHeaders;

        if (details.parentFrameId !== 0) {
            return {responseHeaders: headers}
        }

        const responseHeaders = headers.filter(header => {
            const name = header.name.toLowerCase();
            console.log(name);
            return (
                ['x-frame-options', 'content-security-policy', 'frame-options'].indexOf(
                    name
                ) === -1
            )
        })

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
            responseHeaders,
        }
    },
    {
        urls: ['<all_urls>'],
        types: ['sub_frame', 'main_frame'],
    },
    ['blocking', 'responseHeaders']
)


chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {

        if (details.parentFrameId !== 0) {
            return null;
        }

        const frame = backgroundFrameStorage.get(details.tabId, details.frameId)

        if (!frame) {
            return {
                requestHeaders: details.requestHeaders,
            }
        }

        return {requestHeaders: details.requestHeaders}
    },
    {urls: ['<all_urls>'], types: ['sub_frame']},
    ['blocking', 'requestHeaders']
)

chrome.webNavigation.onBeforeNavigate.addListener(function (details) {

    if (details.frameId === 0) {
        return
    }

    if (details.parentFrameId === 0) {
        const parsed = queryString.parse(details.url)


        backgroundFrameStorage.set({
            ...details
        })

    }
})


Messages.init();