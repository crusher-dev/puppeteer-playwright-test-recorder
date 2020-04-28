import {sendMessageToBackground} from "../../utils/messageUtil";
import {EVENT_CAPTURED} from "../../constants";

let actions: Array<any> = [];
let events = ["click", "mousemove"];
let event_handler: any = {"mousemove": handleMouseMove};
let lastHoverElement : any = null;
let add_action_element: any = null;

function handleMouseMove(e: Event){
        if(e.target === lastHoverElement || e.target === add_action_element){
            return e.preventDefault();
        }

        if(lastHoverElement){
            lastHoverElement.style.outlineStyle  = "none";
            lastHoverElement.style.outlineColor  = "none";
        }
        const target : any = e.target;
        target.style.outlineStyle = 'dotted';
        target.style.outlineColor = '#ff577c';
        target.style.outlineWidth = '2px';
        lastHoverElement = target;

    const rightPos = lastHoverElement.getBoundingClientRect().x + lastHoverElement.getBoundingClientRect().width;
    const topPos = lastHoverElement.getBoundingClientRect().y;

    if(!add_action_element){
        add_action_element =  document.createElement("div");
        add_action_element.innerHTML = "+";
        add_action_element.id = "add_actions_overlay";
        document.body.appendChild(add_action_element);
    }

    const add : any = document.querySelector("#add_actions_overlay");
    add.style.top = topPos + "px";
    add.style.left = rightPos + "px";
}

function addToList(event: any, event_type: string){
    const action = {action_type: event_type, target: event.target};
    actions.push(action);
    sendMessageToBackground({type: EVENT_CAPTURED, ...action}, (res: any)=>{
       console.log("Message sent and res: ", res);
    });
    console.log(actions);
}

export function registerEvents(){
    events.forEach((event_type)=>{
        window.addEventListener(event_type, function(event){
            if(event_handler[event_type]){
                event_handler[event_type](event);
            } else {
                addToList(event, event_type);
            }
        }, true);
    });
}

var currentElement;
document.body.addEventListener('mousemove',function(e){

}, true)
