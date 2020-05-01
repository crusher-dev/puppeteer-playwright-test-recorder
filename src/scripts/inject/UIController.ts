import RecordingOverlay from "./ui/recordingOverlay";

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

        // Show onboarding overlay first
        this.showOnboardingOverlay();
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

    hideOnBoardingOverlay(){
        console.debug("Hiding Onboarding Overlay");
        const {showingOnboardingOverlay} = this.state;

        if(!showingOnboardingOverlay){
            console.warn("There's no onboarding overlay to hide");
            return;
        }

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

        if(sessionGoingOn){
            console.warn("Can't start new recording session until current session has finished");
            return;
        }

        this.recordingOverlay.boot();
    }

    stopRecording(){
        console.debug("Stopping recording actions");
        this.recordingOverlay.shutDown();
    }
}
