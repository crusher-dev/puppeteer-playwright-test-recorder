import {Chrome} from "./utils/types";
import {loadScript} from "./utils/helpers";
import * as Messages from "./scripts/background/messages/index";
import {EVENT_CAPTURED} from "./constants";

Chrome.browserAction.onClicked.addListener(function(tab:any) {
    console.log(`Running config on current tab ${tab.url}`);
    // @ts-ignore
    loadScript("inject", tab.id);
    Chrome.browserAction.setBadgeText({text: 'ON'});
    // // @ts-ignore
    Chrome.browserAction.setBadgeBackgroundColor({color: '#4688F1'});

    Messages.init();
});

