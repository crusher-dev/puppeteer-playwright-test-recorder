import { SAVE_EVENT } from '../../constants';

let state: any = {
  events: {},
};

export function dispatch(action: any) {
  const { type } = action;
  switch (type) {
    case SAVE_EVENT:
      state = {
        ...state,
        events: {
          ...state.events,
          [action.tabId]: [
              ...(state.events[action.tabId] ? state.events[action.tabId] : []),
              action.event
          ]
        }
      };
      break;
    default:
      break;
  }
}

export function getState() {
  return state;
}
