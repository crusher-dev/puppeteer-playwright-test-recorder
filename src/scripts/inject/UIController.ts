import RecordingOverlay from "./ui/recordingOverlay";
import {
    START_RECORDING_SESSION,
    STOP_RECORDING,
    GET_CODE
} from "../../constants";
import {Chrome} from "../../utils/types";
import {getEventsList, sendMessageToBackground, sendMessageToPage} from "../../utils/messageUtil";
import {stopSession} from "../../utils/dom";
import {sendPostDataWithForm} from "../../utils/helpers";
import CodeGenerator from "../code-generator";

export default class UIControllerExtends{
    state: any;
    defaultState: any = {showingOnboardingOverlay: false, sessionGoingOn: false};
    recordingOverlay: RecordingOverlay;

    constructor(options = {} as any) {
        const {showingOnboardingOverlay, sessionGoingOn} = options;
        this.state = {
            ...this.defaultState,
            showingOnboardingOverlay,
            sessionGoingOn
        };

        this.recordingOverlay = new RecordingOverlay(this, {});
    }

    boot(){
        this.registerEvents();
        this.startRecording();
    }

    registerEvents(){
        Chrome.runtime.onMessage.addListener(this.handleIncomingMessages.bind(this));
    }


    handleIncomingMessages(request: any, sender: any, sendResponse: any){
        const {type} = request;
        switch(type){
            case STOP_RECORDING:
                this.stopRecording();
                break;
            case GET_CODE:
                const {events} = request;
                sendPostDataWithForm("http://localhost:7000/app/editor", {actions: JSON.stringify(events)})
                break;
            default:
                break;
        }
        sendResponse(true);
    }

    startRecording(){
        console.debug("Starting recording actions");
        const {sessionGoingOn} = this.state;
        sendMessageToBackground({type: START_RECORDING_SESSION}, function (res:any) {
            console.log("Sent" + res)
        });
        if(sessionGoingOn){
            console.warn("Can't start new recording session until current session has finished");
            return;
        }

        this.recordingOverlay.boot();
    }

    getCodeForEvents(){
        getEventsList().then((events)=>{
            const _generator = new CodeGenerator({});
            sendPostDataWithForm("http://localhost:7000/app/editor", {actions: JSON.stringify(events)})
            window.close();
        });
    }

    stopRecording(){
        console.debug("Stopping recording actions");
        stopSession();
        this.recordingOverlay.shutDown();

        const _overlayCss = document.querySelector("#overlay_css");
        if(_overlayCss){_overlayCss.remove();}
        window.location.reload();
    }
}
