import * as Messages from './scripts/background/messages/index';
import {Chrome} from "./utils/types";

Chrome.webRequest.onHeadersReceived.addListener(
    function(details: any) {
        const headers = details.responseHeaders
        const responseHeaders = headers.filter((header: any) => {
            const name = header.name.toLowerCase()
            return (
                ['x-frame-options', 'content-security-policy', 'frame-options'].indexOf(
                    name
                ) === -1
            )
        })

        const redirectUrl = headers.find((header: any) => {
            return header.name.toLowerCase() === 'location'
        })

        if (redirectUrl) {
            Chrome.browsingData.remove(
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

Messages.init();
