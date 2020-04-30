import { createPopper } from '@popperjs/core';
import { sendMessageToBackground } from '../../utils/messageUtil';
import { EVENT_CAPTURED } from '../../constants';

const actions: Array<any> = [];
const events = ['click', 'mousemove'];

const event_handler: any = { mousemove: handleMouseMove };
let lastHoverElement : any = null;
let addActionElement: any = null;
let addActionIcon: any = null;
let closeActionIcon: any = null;
let actionEventsContainer: any = null;
let addActionTether: any = null;
let addActionsEventTether: any = null;

function toggleEventsBox() {
  const eventBox : any = actionEventsContainer;
eventBox.style.display = eventBox.style.display !== 'block' ? 'block' : 'none';
if(addActionsEventTether){
  addActionsEventTether.destroy();
}
}

function initNodes() {
  if (!addActionElement || !actionEventsContainer) {
    addActionElement = document.querySelector('#overlay_add_action');
    actionEventsContainer = document.querySelector("#overlay_add_events_container");
  }
  if (!addActionIcon) {
    addActionIcon = document.querySelector('#overlay_add_icon');
    addActionIcon.addEventListener('click', () => {
      toggleEventsBox();
    });
  }
  if (!closeActionIcon) {
    closeActionIcon = document.querySelector('#overlay_add_events_container .overlay_close_icon');
    closeActionIcon.addEventListener('click', () => {
      toggleEventsBox();
    });
  }
}

function handleMouseMove(e: Event) {
  if (e.target === lastHoverElement || addActionElement && addActionElement.contains(e.target)) {
    return e.preventDefault();
  }

  if (lastHoverElement) {
    lastHoverElement.style.outlineStyle = 'none';
    lastHoverElement.style.outlineColor = 'none';
  }
  const target :any = e.target;
  target.style.outlineStyle = 'dotted';
  target.style.outlineColor = '#ff577c';
  target.style.outlineWidth = '2px';

  initNodes();

  if (e.target !== lastHoverElement && lastHoverElement) {
    if (addActionTether){
      addActionTether.destroy();
    }
    if(addActionsEventTether){
      addActionsEventTether.destroy();
      actionEventsContainer.style.display = "none";
    }
    addActionTether = createPopper(target, addActionElement, {
      placement: 'right-start',
      modifiers: [
        {
          name: 'flip',
          enabled: false,
        },
        {
          name: 'offset',
          options: {
            offset: [-15, -15],
          },
        },
      ],
    });
    console.log(addActionElement, actionEventsContainer);
      addActionsEventTether = createPopper(addActionElement, actionEventsContainer, {
        placement: "right-start",
        modifiers: [
          {
            name: 'flip',
            enabled: false,
          }
        ]
      });
  }

  addActionElement.style.display = 'block';

  lastHoverElement = target;
}

function addToList(event: any, event_type: string) {
  const action = { action_type: event_type, target: event.target };
  actions.push(action);
  sendMessageToBackground({ type: EVENT_CAPTURED, ...action }, (res: any) => {
    console.log('Message sent and res: ', res);
  });
  console.log(actions);
}

export function registerEvents() {
  events.forEach((event_type) => {
    window.addEventListener(event_type, (event) => {
      if (event_handler[event_type]) {
        event_handler[event_type](event);
      } else {
        addToList(event, event_type);
      }
    }, true);
  });
}
