import RecordingOverlay from "./ui/recordingOverlay";
import {START_RECORDING_SESSION, STOP_RECORDING, DELETE_RECORDING_SESSION, CHECK_SESSION_STATUS} from "../../constants";
import {Chrome} from "../../utils/types";
import {sendMessageToBackground} from "../../utils/messageUtil";
import {stopSession} from "../../utils/dom";

const EventEmitter = require("events");

export default class UIControllerExtends extends EventEmitter{
    state: any;
    defaultState: any = {showingOnboardingOverlay: false, sessionGoingOn: false};
    recordingOverlay: RecordingOverlay;

    constructor(options = {} as any) {
        super();

        const {showingOnboardingOverlay, sessionGoingOn} = options;
        this.state = {
            ...this.defaultState,
            showingOnboardingOverlay,
            sessionGoingOn
        };

        this.recordingOverlay = new RecordingOverlay();
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
            default:
                break;
        }
        sendResponse(true);
    }

    startRecording(){
        console.debug("Staring recording actions");
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

    stopRecording(){
        console.debug("Stopping recording actions");
        stopSession();
        this.recordingOverlay.shutDown();
        document.querySelector("#overlay_css").remove();
    }
}
