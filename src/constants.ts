export const EVENT_CAPTURED = 'EVENT_CAPTURED';


// Actions
export const START_RECORDING_SESSION = "START_RECORDING_SESSION";
export const DELETE_RECORDING_SESSION = "STOP_RECORDING_SESSION";
export const SAVE_EVENT = 'SAVE_EVENT';
export const GET_EVENTS = "GET_EVENTS";
export const CHECK_SESSION_STATUS = "CHECK_SESSION_STATUS";
export const STOP_RECORDING = "STOP_RECORDING";
export const GET_CODE = "GET_CODE";

// Scripts
export const DEFAULT_VALIDATION_SCRIPT = `function(html, text, element) {
    return text.toLowerCase();
}`
