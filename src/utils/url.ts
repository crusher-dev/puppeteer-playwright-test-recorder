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
