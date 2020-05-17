import {sendMessageToBackground} from "../../utils/messageUtil";
import {EVENT_CAPTURED} from "../../constants";
import {CLICK} from "../../constants/DOMEventsToRecord";
import {createSnackBar} from "./toast";
import {getSentenceCaseString} from "../../utils/helpers";
import RecordingOverlay from "./ui/recordingOverlay";

const unique: any = require('unique-selector').default;

export default class EventsController {
    recordingOverlay: RecordingOverlay;

    constructor(recordingOverlay: RecordingOverlay) {
        this.recordingOverlay = recordingOverlay;
    }

    simulateClickOnElement(element: any){
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

    simulateHoverOnElement(el: any){
        try{
            const event = new Event('MS');
            event.initEvent("mouseover",true,true);
            el.dispatchEvent(event);
        } catch(err){
            console.error(el, err);
            return;
        }
    }

    saveCapturedEventInBackground(event_type: string, capturedTarget: any, value: any = "", callback?: any){
        sendMessageToBackground({type: EVENT_CAPTURED, payload: {event_type: event_type, selector: unique(capturedTarget), value: value ? value : null}},  (res: any) => {
            createSnackBar(`${getSentenceCaseString(event_type)} action has been recorded`, "Dismiss");
            if(callback){
                callback();
            }
        });
    }
}
