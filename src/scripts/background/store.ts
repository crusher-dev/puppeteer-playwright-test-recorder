import {SAVE_EVENT, START_RECORDING_SESSION, DELETE_RECORDING_SESSION} from '../../constants';

let state: any = {
  events: {},
  sessions: {}
};

export function dispatch(action: any) {
  const { type } = action;

  switch (type) {
    case START_RECORDING_SESSION:
      // @ts-ignore
      const {tabId} = action;
      return state = {
        ...state,
        sessions: {...state.sessions, [tabId]: true}
      }
    case DELETE_RECORDING_SESSION:
      // @ts-ignore
      const {tabId} = action;
      return state = {
        ...state,
        events: {...state.events, [tabId]: []},
        sessions: {...state.sessions, [tabId]: false}
      }
    case SAVE_EVENT:
      // @ts-ignore
      const {event_type, selector, value, tabId} = action;
      return state = {
        ...state,
        events: {
          ...state.events,
          [tabId]: [
            ...(state.events[tabId] ? state.events[tabId] : []),
            {event_type, selector, value}
          ]
        }
      };
  }
}

// @ts-ignore
export function getState() {
  return state;
}
