const EventEmitter = require("events");
const {createPopper}  = require("@popperjs/core");

export default class RecordingOverlay extends EventEmitter{
    defaultState: any = {targetElement: null, sessionGoingOn: false, showingEventsBox: false};

    constructor(options = {} as any) {
        super();
        this.state ={
            ...this.defaultState
        };
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
                ],
            });
            this._addActionElement.style.display = 'block';
    }

    showEventsList(){
        this._overlayAddEventsContainer.style.display = 'block';
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

    registerNodeListeners(){
        this._mouseMoveListener = document.body.addEventListener("mousemove", (event: MouseEvent)=>{
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
        }, true);

        this._addIconListener = this._addActionIcon.addEventListener("click", ()=>{
            this.toggleEventsBox();
        });
    }

    boot(){
        this.initNodes();
        this.registerNodeListeners();
        console.info("Info Overlay booted up");
    }

    shutDown(){
        this._mouseMoveListener.remove();
        this.state = {
            ...this.state,
            sessionGoingOn: false
        };
    }
}
