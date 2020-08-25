import {EVENT_CAPTURED, EVENTS} from "../../constants";
import {CLICK} from "../../constants/DOMEventsToRecord";
import {createSnackBar} from "./toast";
import {getSentenceCaseString} from "../../utils/helpers";
import EventRecording from "./ui/eventRecording";
import {finder} from '@medv/finder'
import FormWizard from "./ui/formWizard";
import getDomFromPath from "../../utils/domPath";
import FrameStorage from "../../utils/frameStorage";

export default class EventsController {
    recordingOverlay: EventRecording;

    constructor(recordingOverlay: EventRecording) {
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
        const optimizedMinLength = (capturedTarget.id) ? 2 : 10 // if the target has an id, use that instead of multiple frames selectors
        // @ts-ignore
        const selector = capturedTarget ? finder(capturedTarget, {seedMinLength: 5, optimizedMinLength: optimizedMinLength}) : null;
        window.top.postMessage(
            {
                eventType: event_type,
                //@ts-ignore
                frameId: FrameStorage.get(),
                value: value,
                path: selector,
            },
            '*'
        );
    }
}
