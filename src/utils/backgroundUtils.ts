import {Chrome} from "./types";

enum BADGETEXT {
    ON = 'ON',
    NULL = '',
}

/**
 * Check if extension is active for current tab
 * @return boolean
 */
export function isExtensionActive(): boolean{
    return Chrome.browserAction.getBadgeText() === 'ON';
}

/**
 * Set badge text
 * @param text
 * @return void
 */
export function setExtensionText(text: BADGETEXT): void{
    return Chrome.browserAction.setBadgeText(text);
}
