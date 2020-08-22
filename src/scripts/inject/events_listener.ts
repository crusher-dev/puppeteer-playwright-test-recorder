import RecordingOverlay from "./ui/recordingOverlay";
import {ACTION_TYPES} from "../../constants/ActionTypes";
import LocalFrameStorage from "../../utils/localFrameStorage";
import {IS_RECORDING_USING_INSPECTOR, IS_RECORDING_WITHOUT_INSPECTOR, NOT_RECORDING} from "../../constants";

setInterval(function (){
    console.log("My next data: ");
    console.log(document.getElementById("__NEXT_DATA__"));
},100)

if (top !== self) {
    fetch(chrome.runtime.getURL("inject.html") /*, options */)
        .then((response) => response.text())
        .then(html=> {
            try {
                document.body.innerHTML += html;
                const linkRel = document.createElement("link");
                linkRel.setAttribute("rel", "stylesheet");
                linkRel.setAttribute("href", chrome.runtime.getURL("styles/overlay.css"));
                document.body.appendChild(linkRel);
            } catch(ex){}
        });

    const recordingOverlay = new RecordingOverlay({});

    window.top.postMessage(
        {
            type: ACTION_TYPES.CHECK_RECORDING_STATUS,
            //@ts-ignore
            frameId: LocalFrameStorage.get(),
            value: true
        },
        '*'
    );

    window.addEventListener('message', (message)=>{
        const {type, value} = message.data;
        console.log(message.data);
        if(!!type === false){
            return;
        }

        switch(type){
            case ACTION_TYPES.INSPECT:
                if(value)
                    recordingOverlay.showEventsFormWizard();
                else
                    recordingOverlay.removeEventsFormWizard();
                break;
            case ACTION_TYPES.SCREENSHOT:
                recordingOverlay.takePageScreenShot();
                break;
            case ACTION_TYPES.CAPTURE_CONSOLE:
                recordingOverlay.saveConsoleLogsAtThisMoment();
                break;
            case ACTION_TYPES.GO_BACK:
                window.history.back();
                break;
            case ACTION_TYPES.GO_FORWARD:
                window.history.forward();
                break;
            case ACTION_TYPES.REFRESH_PAGE:
                window.location.reload();
                break;
            case ACTION_TYPES.TOOGLE_INSPECTOR:

                break;
            case ACTION_TYPES.CHECK_RECORDING_STATUS:
                if(value === IS_RECORDING_WITHOUT_INSPECTOR || value === NOT_RECORDING){
                    recordingOverlay.startEventRecording(true);
                } else if(value === IS_RECORDING_USING_INSPECTOR){
                    recordingOverlay.startEventRecording();
                    recordingOverlay.showEventsFormWizard();
                }
                break;
        }
    }, false);

    document.addEventListener("keydown", function(event: KeyboardEvent){
        if(event.keyCode === 68 && event.shiftKey){
            recordingOverlay.toggleEventsBox();
        }
    }, true);
}