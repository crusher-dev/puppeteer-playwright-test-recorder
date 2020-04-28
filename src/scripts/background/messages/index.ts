import {Chrome} from "../../../utils/types";
import {EVENT_CAPTURED, SAVE_EVENT} from "../../../constants";
import {dispatch, getState} from "../store";

export function init() {
    Chrome.runtime.onMessage.addListener(
        function (request: any, sender: any, sendResponse: any) {
            console.log(request);
            const {type, data} = request;
            switch (type) {
                case EVENT_CAPTURED:
                    const {action_type, target} = request;
                    dispatch({type: SAVE_EVENT, event: {action_type, target}});
                    return sendResponse(getState());
                default:
                    break;
            }
        });
}
