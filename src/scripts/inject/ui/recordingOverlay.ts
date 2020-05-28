import {
    ASSERT_TEXT,
    CLICK, EXTRACT_INFO,
    HOVER, INPUT,
    NAVIGATE_URL,
    PAGE_SCREENSHOT,
    SCREENSHOT,
    SCROLL_TO_VIEW
} from "../../../constants/DOMEventsToRecord";
import {sendMessageToBackground} from "../../../utils/messageUtil";
import {DELETE_RECORDING_SESSION, EVENT_CAPTURED, START_RECORDING_SESSION, STOP_RECORDING} from "../../../constants";
import {hideAllChildNodes, removeAllTargetBlankFromLinks, setAttributeForAllChildNodes} from "../../../utils/dom";
import UIController from "../UIController";
import {createSnackBar} from "../toast";
import EventsController from "../EventsController";
import FormWizard from "./formWizard";
const {createPopper}  = require("@popperjs/core");

export default class RecordingOverlay{
    defaultState: any = {targetElement: null, sessionGoingOn: false, showingEventsBox: false, pinned: false};

    private state: any;
    private eventsController: EventsController;
    private formWizard: FormWizard;

    private controller: any;
    private _overlayAddEventsContainer: any;
    private _modalContentContainer: any;

    private _addActionElement: any;
    private _addAction: any;
    private _closeActionIcon: any;
    private _addActionIcon: any;
    private _overlayEventsGrid: any;
    private _pageActionsContainer: any;
    private _stopRecorderButton: any;
    private _addActionTether: any;
    private _eventsListTether: any;
    private _takeScreenShotButton: any;
    private _addActionModal: any;

    private _arrowOnAddIcon: any;
    private _modalHeading: any;

    constructor(controller: UIController, options = {} as any) {
        this.state ={
            ...this.defaultState
        };
        this.controller = controller;

        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleAddIconClick = this.handleAddIconClick.bind(this);
        this.handleEventsGridClick = this.handleEventsGridClick.bind(this);
        this.takePageScreenShot = this.takePageScreenShot.bind(this);
        this.handleStopRecordingButtonClick = this.handleStopRecordingButtonClick.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.eventsController = new EventsController(this);
        this.formWizard = new FormWizard(this, this.eventsController);
        this.toggleEventsBox = this.toggleEventsBox.bind(this);
    }

    getState(){
        return this.state;
    }

    toggleEventsBox(){
        if(this._overlayAddEventsContainer.style.display !== "block"){
            this._arrowOnAddIcon.setAttribute('data-hide', '');
            this.showEventsList()
        } else {
            this.hideEventsList();
        }
    }

    showAddIcon(target: any){
        this.destroyAddTether();

        this._addActionTether = createPopper(target, this._addActionElement, {
                placement: 'right-start',
                modifiers: [
                    {
                        name: 'flip',
                        enabled: true,
                    },
                    {
                        name: 'offset',
                        options: {
                            offset: [-1, 0]
                        }
                    },
                    {
                        name: 'arrow',
                        options: {
                            element: this._arrowOnAddIcon,
                        },
                    }
                ],
            });
        this._addActionElement.style.display = 'block';
    }

    showEventsList(){
        console.debug("Showing events list", this._overlayAddEventsContainer);
        this._overlayAddEventsContainer.style.display = 'block';
        this.state.pinned = true;

        // Increase the height of actions container to give more space for not falling out of selection.
        this._addActionElement.style.height = this._overlayAddEventsContainer.getBoundingClientRect().height + "px";

        this.destoryEventsListTether();
        this._eventsListTether =  createPopper(this._addActionModal, this._overlayAddEventsContainer, {
            placement: 'right-start',
            modifiers: [
                {
                    name: 'flip',
                    enabled: true,
                },
            ]});
    }

    hideEventsList(){
        this._arrowOnAddIcon.removeAttribute('data-hide');
        this._overlayAddEventsContainer.style.display = 'none';
        this._addActionElement.style.height = "auto";
        this.state.pinned = false;

        hideAllChildNodes(this._modalContentContainer);
        this._modalHeading.innerHTML = "Select action";
        this._overlayEventsGrid.removeAttribute("data-gone");
        this.destoryEventsListTether();
    }

    destroyAddTether(){
        if(this._addActionTether){
        this._addActionTether.destroy();
        this._addActionTether = null;
        }
    }

    destoryEventsListTether(){
        if(this._eventsListTether){
            this._eventsListTether.destroy();
            this._eventsListTether = null;
        }
    }

    initNodes(){
        this._modalHeading = document.querySelector(".overlay_heading_container .overlay_heading");
        this._addActionElement = document.querySelector('#overlay_add_action');
        this._addActionIcon = document.querySelector('#overlay_add');
        this._addActionModal = document.querySelector('#overlay_add_icon');
        this._closeActionIcon = document.querySelector('#overlay_add_events_container .overlay_close_icon');
        this._overlayAddEventsContainer = document.querySelector("#overlay_add_events_container");
        this._overlayEventsGrid = document.querySelector("#events_grid");
        this._pageActionsContainer = document.querySelector("#page_actions");
        this._stopRecorderButton = document.querySelector("#page_actions #stop_recorder_button");
        this._takeScreenShotButton = document.querySelector("#page_actions #screenshot_button");
        this._arrowOnAddIcon = document.querySelector('#popper_arrow');
        this._modalContentContainer = document.querySelector(".overlay_modal_content");
    }

    updateEventTarget(target: HTMLElement){
        this.state = {
            ...this.state,
            targetElement: target
        };
        this.highlightNode(target);
        this.showAddIcon(target);
    }

    highlightNode(target: HTMLElement){
        target.style.outlineStyle = 'solid';
        target.style.outlineColor = '#EC2E6A';
        target.style.outlineWidth = '1px';
    }

    removeHighLightFromNode(target: HTMLElement){
        // @FIXME: What if the target had set outlineColor and outlineStyleBefore.
        if(target) {
            target.style.outlineStyle = 'none';
            target.style.outlineColor = 'none';
            target.style.outlineWidth = '0px';
        }
    }

    handleSelectedActionFromEventsList(event: any){
       const action = event.target.getAttribute("data-action");
        switch(action){
           case CLICK:
                removeAllTargetBlankFromLinks();
                this.eventsController.saveCapturedEventInBackground(CLICK, this.state.targetElement);
                this.eventsController.simulateClickOnElement(this.state.targetElement);
               break;
           case HOVER:
               this.eventsController.simulateHoverOnElement(this.state.targetElement);
               this.eventsController.saveCapturedEventInBackground(HOVER, this.state.targetElement);
               break;
           case SCREENSHOT:
               this.eventsController.saveCapturedEventInBackground(SCREENSHOT, this.state.targetElement);
               break;
           case SCROLL_TO_VIEW:
                this.eventsController.saveCapturedEventInBackground(SCROLL_TO_VIEW, this.state.targetElement);
               break;
            case EXTRACT_INFO:
                return this.formWizard.boot(action);
            case ASSERT_TEXT:
                return this.formWizard.boot(action);
            default:
                break;
       }
       this.toggleEventsBox();
    }

    handleMouseOver(event: MouseEvent){
        // @ts-ignore
        if(this._addActionElement.contains(event.target) || event.target.hasAttribute("data-recorder") || this.state.pinned) {
            return event.preventDefault();
        }
        const {targetElement} = this.state;

        if(targetElement !== event.target){
            // Remove Highlight from last element hovered
            this.removeHighLightFromNode(targetElement);
            this.hideEventsList();
            this.updateEventTarget(event.target as HTMLElement);
        }
    }

    handleAddIconClick(){
        this.toggleEventsBox();
    }

    handleEventsGridClick(event: Event){
        this.handleSelectedActionFromEventsList(event);
    }

    handleStopRecordingButtonClick(event: any){
        this.controller.getCodeForEvents();
        sendMessageToBackground({type: DELETE_RECORDING_SESSION});
        this.controller.stopRecording();
    }

    handleDocumentClick(event: any){
        const isRecorder = event.target.getAttribute('data-recorder');
        if(!isRecorder){
            this.state.pinned = false;
            const {target} = event;
            if(!event.simulatedEvent){
                this.eventsController.saveCapturedEventInBackground(CLICK, event.target);
            }
        }
    }

    handleInputBlur(event: any){
        const isRecorder = event.target.getAttribute('data-recorder');
        if(!isRecorder){
            const targetElement = event.target;
            if((targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") && targetElement.value){
                this.eventsController.saveCapturedEventInBackground(INPUT, event.target, targetElement.value);
            }
        }
    }

    registerNodeListeners(){
        document.body.addEventListener("mousemove", this.handleMouseOver, true);
        document.body.addEventListener("blur", this.handleInputBlur, true);

        document.addEventListener( "click", this.handleDocumentClick, true);

        this._addActionIcon.addEventListener("click", this.handleAddIconClick);

         this._overlayEventsGrid.addEventListener("click", this.handleEventsGridClick, true);
         this._closeActionIcon.addEventListener("click", this.toggleEventsBox, true);
         this._takeScreenShotButton.addEventListener("click", this.takePageScreenShot);
         this._stopRecorderButton.addEventListener("click", this.handleStopRecordingButtonClick);
    }

    takePageScreenShot(){
        sendMessageToBackground({type: EVENT_CAPTURED, payload: {event_type: PAGE_SCREENSHOT, selector: window.location.href, value: document.title}}, function (res: any) {
            console.log(res);
        });
    }

    removeNodeListeners(){
        document.body.removeEventListener("mousemove", this.handleMouseOver, true);
        this._addActionIcon.removeEventListener("click", this.handleAddIconClick);
        this._overlayEventsGrid.removeEventListener("click", this.handleEventsGridClick, true);
        this._takeScreenShotButton.removeEventListener("click", this.takePageScreenShot);
        this._stopRecorderButton.removeEventListener("click", this.handleStopRecordingButtonClick);
    }

    boot(){
        this.initNodes();
        this.registerNodeListeners();
        sendMessageToBackground({
            type: START_RECORDING_SESSION,
        }, function (res: any) {
            console.log(res);
        });

        this.eventsController.saveCapturedEventInBackground(NAVIGATE_URL, document.body, window.location.href);

        console.info("Info Overlay booted up");
    }

    removeNodes(){
        if(this._addActionElement){
            this._addActionElement.remove();
        }
        if(this._pageActionsContainer){
            this._pageActionsContainer.remove();
        }
    }

    shutDown(){
        const {targetElement} = this.state;

        console.debug("Shutting down Recording Overlay");
        this.removeNodeListeners();
        if(targetElement) {
            this.removeHighLightFromNode(targetElement);
        }
        this.removeNodes();

        this.state = {
            ...this.state,
            sessionGoingOn: false
        };
    }
}
