import { isExtension } from '../../utils/url'

export default {
    tabs: {},

    set(tabId: string, details: any) {
        this.tabs[tabId] = details
    },

    all() {
        return this.tabs
    },

    get(tabId: string) {
        return this.tabs[tabId]
    },

    has(tabId: string) {
        return this.tabs.hasOwnProperty(tabId) && this.tabs[tabId] !== null
    },

    isExtension(tabId: string) {
        const tab = this.get(tabId)
        if (!tab) {
            return false
        }
        return isExtension(this.get(tabId).url)
    },

    remove(tabId: string) {
        this.tabs[tabId] = null
    },
}
