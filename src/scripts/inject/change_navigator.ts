import {ACTION_TYPES} from "../../constants/ActionTypes";
import LocalFrameStorage from "../../utils/frameStorage";

var actualCode =  '(' + function(userAgent : string, appVersion: string, platformVersion: string) {
    'use strict';
    var navigator = window.navigator;
    var modifiedNavigator;
    if ('userAgent' in Navigator.prototype) {
        // Chrome 43+ moved all properties from navigator to the prototype,
        // so we have to modify the prototype instead of navigator.
        modifiedNavigator = Navigator.prototype;

    } else {
        // Chrome 42- defined the property on navigator.
        modifiedNavigator = Object.create(navigator);
        Object.defineProperty(window, 'navigator', {
            value: modifiedNavigator,
            configurable: false,
            enumerable: false,
            writable: false
        });
    }
    // Pretend to be Windows XP
    Object.defineProperties(modifiedNavigator, {
        userAgent: {
            value: userAgent,
            configurable: false,
            enumerable: true,
            writable: false
        },
        appVersion: {
            value: navigator.appVersion.replace(/\([^)]+\)/, appVersion),
            configurable: false,
            enumerable: true,
            writable: false
        },
        platform: {
            value: platformVersion,
            configurable: false,
            enumerable: true,
            writable: false
        },
    });
} + ')';

window.top.postMessage(
    {
        type: ACTION_TYPES.GET_USER_AGENT,
        //@ts-ignore
        frameId: LocalFrameStorage.get(),
        value: true
    },
    '*'
);

window.addEventListener('message', (message)=> {
    const {type, value: userAgent} = message.data;
    console.log("Adding this to user_agent", type,  userAgent);

    if (!!type === false) {
        return;
    }
    if(type===ACTION_TYPES.SET_USER_AGENT) {
        var s = document.createElement('script');
        s.textContent = actualCode + `('${userAgent.value}', '${userAgent.appVersion}', '${userAgent.platform}');`;
        document.documentElement.appendChild(s);
        s.remove();
    }
});
