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
        this.initNodes();
        this.registerEvents();
            sendMessageToBackground({type: CHECK_SESSION_STATUS},  (res: any)=> {
                console.log( Chrome.runtime.lastError);
                const isSessionGoingOn = res && res.isSessionGoingOn;
                console.debug("CHECK_SESSION", res);
                if(isSessionGoingOn){
                    this.hideOnBoardingOverlay();
                    this.startRecording();
                } else {
                    this.showOnboardingOverlay();
                }
            });
            // Show onboarding overlay first
    }

    initNodes(){
        this._overlay = document.querySelector("#overlay");
        this._overlayStartButton = document.querySelector("#overlay-wizard-button");
    }

    registerEvents(){
        if(!this._overlayStartButtonClickListener) {
            this._overlayStartButtonClickListener = this._overlayStartButton.addEventListener("click", (event: MouseEvent)=> {
                console.debug("Let's start recording");
                this.hideOnBoardingOverlay();
                this.startRecording();
            });
        }
        Chrome.runtime.onMessage.addListener(this.handleIncomingMessages.bind(this));
    }

    showOnboardingOverlay(){
        console.debug("Showing Onboarding Overlay");
        const {showingOnboardingOverlay} = this.state;
        if(this.showingOnboardingOverlay){
            console.debug("Onboarding Overlay is already displayed");
            return;
        }
        this._overlay.style.display = "block";
        this.state = {
            ...this.state,
            showingOnboardingOverlay: true
        };
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

    hideOnBoardingOverlay(){
        console.debug("Hiding Onboarding Overlay");
        const {showingOnboardingOverlay} = this.state;

        this.state = {
            ...this.state,
            showingOnboardingOverlay: false
        }
        this._overlayStartButton.removeEventListener("click", this._overlayStartButtonClickListener);
        this._overlay.style.display = "none";
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
        this.hideOnBoardingOverlay();
        stopSession();
        this.recordingOverlay.shutDown();
        this._overlay.remove();
        document.querySelector("#overlay_css").remove();
    }
}
