import {sendMessageToBackground} from "../../utils/messageUtil";
import {EVENT_CAPTURED} from "../../constants";
import {CLICK} from "../../constants/DOMEventsToRecord";
import {createSnackBar} from "./toast";
import {getSentenceCaseString} from "../../utils/helpers";
import RecordingOverlay from "./ui/recordingOverlay";
import finder from '@medv/finder'
import FormWizard from "./ui/formWizard";

export default class EventsController {
    recordingOverlay: RecordingOverlay;

    constructor(recordingOverlay: RecordingOverlay) {
        this.recordingOverlay = recordingOverlay;
    }

    simulateClickOnElement(element: any){
        try{
            const event = new MouseEvent("click", {
                "view": window,
                "bubbles": true,
                "cancelable": false
            });

            // Add this property so that global click listener
            // recognizes this is ans simulated event.
            (event as any).simulatedEvent = true;
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
        const optimizedMinLength = (capturedTarget.id) ? 2 : 10 // if the target has an id, use that instead of multiple other selectors
        console.debug(capturedTarget, "Hello");
        const selector = capturedTarget ? finder(capturedTarget, {seedMinLength: 5, optimizedMinLength: optimizedMinLength}) : null;

        sendMessageToBackground({type: EVENT_CAPTURED, payload: {event_type: event_type, selector, value: value ? value : null}},  (res: any) => {
            createSnackBar(`${getSentenceCaseString(event_type)} action has been recorded`, "Dismiss");
            if(callback){
                callback();
            }
        });
    }
}
