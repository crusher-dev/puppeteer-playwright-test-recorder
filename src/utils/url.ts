import parse from 'url-parse';
const clean = (url: string) => String(url).replace(/^\/|\/$/g, '')

export const isLocal = (url: string) =>
    String(url).startsWith('chrome://') ||
    String(url).startsWith('chrome-extension://')

export const isExtension = (url: string) =>
    Boolean(url) && clean(url).startsWith(clean(chrome.runtime.getURL('/')))

export const origins = (url: string) => {
    const hostname = parse(url).hostname
    return [`https://${hostname}`, `http://${hostname}`]
}

export const addHttpToURLIfNotThere = (uri: string) => {
    const httpRgx = new RegExp(/^https?\:\/\/[\w\._-]+?\.[\w_-]+/i);
    if(!uri.match(httpRgx)){
        return `http://${uri}`;
    } else {
        return uri;
    }
}