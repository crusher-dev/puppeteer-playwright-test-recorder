import {CLICK, HOVER, NAVIGATE_URL, SCREENSHOT, SCROLL_TO_VIEW} from "../../../constants/DOMEventsToRecord";
import {sendMessageToBackground} from "../../../utils/messageUtil";
import {EVENT_CAPTURED, START_RECORDING_SESSION, STOP_RECORDING} from "../../../constants";
import {Chrome} from "../../../utils/types";
import {removeAllBlankLinks} from "../../../utils/dom";
import {getTabId} from "../../../utils/helpers";
const EventEmitter = require("events");
const {createPopper}  = require("@popperjs/core");
const unique: any = require('unique-selector').default;

export default class RecordingOverlay extends EventEmitter{
    defaultState: any = {targetElement: null, sessionGoingOn: false, showingEventsBox: false};

    constructor(options = {} as any) {
        super();
        this.state ={
            ...this.defaultState
        };
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleAddIconClick = this.handleAddIconClick.bind(this);
        this.handleEventsGridClick = this.handleEventsGridClick.bind(this);
    }

    toggleEventsBox(){
        if(this._overlayAddEventsContainer.style.display !== "block"){
            this.showEventsList()
        } else {
            this.hideEventsList()
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
                            offset: [-14, -12]
                        }
                    }
                ],
            });
        this._addActionElement.style.display = 'block';
    }

    hideAddActionElement(){
        if(this._addActionElement) {
            this._addActionElement.style.display = 'none';
        }
    }

    showEventsList(){
        console.debug("Showing events list", this._overlayAddEventsContainer);
        this._overlayAddEventsContainer.style.display = 'block';

        // Increase the height of actions container to give more space for not falling out of selection.
        this._addActionElement.style.height = this._overlayAddEventsContainer.getBoundingClientRect().height + "px";

        this.destoryEventsListTether();
        this._eventsListTether =  createPopper(this._addActionIcon, this._overlayAddEventsContainer, {
            placement: 'right-start',
            modifiers: [
                {
                    name: 'flip',
                    enabled: true,
                },
            ]});
    }

    hideEventsList(){
        this._overlayAddEventsContainer.style.display = 'none';
        this._addActionElement.style.height = "auto";

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
        if (!this._addActionElement) {
            this._addActionElement = document.querySelector('#overlay_add_action');
        }
        if (!this._addActionIcon) {
            this._addActionIcon = document.querySelector('#overlay_add_icon');
        }
        if (!this._closeActionIcon) {
            this._closeActionIcon = document.querySelector('#overlay_add_events_container .overlay_close_icon');
        }
        if(!this._overlayAddEventsContainer){
            this._overlayAddEventsContainer = document.querySelector("#overlay_add_events_container");
        }
        if(!this._overlayEventsGrid){
            this._overlayEventsGrid = document.querySelector(".overlay_grid");
        }
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
        target.style.outlineStyle = 'dotted';
        target.style.outlineColor = '#ff577c';
        target.style.outlineWidth = '2px';
    }

    removeHighLightFromNode(target: HTMLElement){
        // @FIXME: What if the target had set outlineColor and outlineStyleBefore.
        if(target) {
            target.style.outlineStyle = 'none';
            target.style.outlineColor = 'none';
            target.style.outlineWidth = '0px';
        }
    }

    clickOnElement(element: any){
        try{
            if(element.tagName === "A"){
                return element.click();
            }
            const event = new Event('click');
            event.initEvent("click",true,true);
            element.dispatchEvent(event);
        } catch(err){
            console.error(element, err);
            return;
        }
    }

    hoverOnElement(element: any){
        try{
            const el = document.querySelector(unique(element));
            const event = new Event('MS');
            event.initEvent("mouseover",true,true);
            el.dispatchEvent(event);
        } catch(err){
            console.error(element, err);
            return;
        }
    }

    handleSelectedActionFromEventsList(event: any){
       const action = event.target.getAttribute("data-action");
       switch(action){
           case CLICK:
               removeAllBlankLinks();
                this.clickOnElement(this.state.targetElement);
                sendMessageToBackground({type: EVENT_CAPTURED, payload: {event_type: CLICK, selector: unique(this.state.targetElement)}}, function (res: any) {
                    console.log(res);
                });
                break;
           case HOVER:
               this.hoverOnElement(this.state.targetElement);
               sendMessageToBackground({type: EVENT_CAPTURED, payload: {event_type: HOVER, selector: unique(this.state.targetElement)}}, function (res: any) {
                   console.log(res);
               });
               break;
           case SCREENSHOT:
               sendMessageToBackground({type: EVENT_CAPTURED, payload: {event_type: SCREENSHOT, selector: unique(this.state.targetElement)}}, function (res: any) {
                   console.log(res);
               });
               break;
           case SCROLL_TO_VIEW:
               sendMessageToBackground({type: EVENT_CAPTURED, payload: {event_type: SCROLL_TO_VIEW, selector: unique(this.state.targetElement)}}, function (res: any) {
                   console.log(res);
               });
               break;
       }
    }

    handleMouseOver(event: MouseEvent){
    if(this._addActionElement.contains(event.target)) {
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
    this.toggleEventsBox();
}

    registerNodeListeners(){
        document.body.addEventListener("mousemove", this.handleMouseOver, true);

        this._addActionIcon.addEventListener("click", this.handleAddIconClick);

         this._overlayEventsGrid.addEventListener("click", this.handleEventsGridClick, true);

    }

    removeNodeListeners(){
        document.body.removeEventListener("mousemove", this.handleMouseOver, true);
        this._addActionIcon.removeEventListener("click", this.handleAddIconClick);
        this._overlayEventsGrid.removeEventListener("click", this.handleEventsGridClick, true);
    }

    boot(){
        this.initNodes();
        this.registerNodeListeners();
        sendMessageToBackground({
            type: START_RECORDING_SESSION,
        }, function (res: any) {
            console.log(res);
        });
            sendMessageToBackground({
                type: EVENT_CAPTURED,
                payload: {event_type: NAVIGATE_URL, selector: unique(document), value: window.location.href}
            }, function (res: any) {
                console.log(res);
            });
        console.info("Info Overlay booted up");
    }

    shutDown(){
        const {targetElement} = this.state;

        console.debug("Shutting down Recording Overlay");
        this.removeNodeListeners();
        if(targetElement) {
            this.removeHighLightFromNode(targetElement);
        }
        this.hideAddActionElement();
        this.state = {
            ...this.state,
            sessionGoingOn: false
        };
    }
}
