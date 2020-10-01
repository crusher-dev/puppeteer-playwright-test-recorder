import EventRecording from "./ui/eventRecording";
import { ACTION_TYPES } from "../../constants/actionTypes";
import LocalFrameStorage from "../../utils/frameStorage";
import {
  IS_RECORDING_USING_INSPECTOR,
  IS_RECORDING_WITHOUT_INSPECTOR,
  NOT_RECORDING,
} from "../../constants";
import { ACTION_FORM_TYPE } from "../../ui/testRecorder/app";
import { ASSERT_TEXT } from "../../constants/domEventsToRecord";

if (top !== self) {
  fetch(chrome.runtime.getURL("iframe_inject.html") /* , options */)
    .then((response) => response.text())
    .then((html) => {
      try {
        const htmlWrapper = document.createElement("div");
        htmlWrapper.innerHTML = html;
        document.body.appendChild(htmlWrapper);
        const linkRel = document.createElement("link");
        linkRel.setAttribute("rel", "stylesheet");
        linkRel.setAttribute(
          "href",
          chrome.runtime.getURL("styles/overlay.css")
        );
        document.head.appendChild(linkRel);
      } catch (ex) {
        console.log("Exception");
        console.error("This is the exception", ex);
      }
    });

  const recordingOverlay = new EventRecording({});

  window.top.postMessage(
    {
      type: ACTION_TYPES.GET_RECORDING_STATUS,
      // @ts-ignore
      frameId: LocalFrameStorage.get(),
      value: true,
    },
    "*"
  );

  window.addEventListener(
    "message",
    (message) => {
      const { type, value, formType } = message.data;
      console.log(message.data);
      if (!!type === false) {
        return;
      }

      if (formType === ACTION_FORM_TYPE.PAGE_ACTIONS) {
        switch (type) {
          case ACTION_TYPES.INSPECT:
            if (value) recordingOverlay.showEventsFormWizard();
            else recordingOverlay.removeEventsFormWizard();
            break;
          case ACTION_TYPES.SCREENSHOT:
            recordingOverlay.takePageScreenShot();
            break;
          case ACTION_TYPES.CAPTURE_CONSOLE:
            recordingOverlay.saveConsoleLogsAtThisMoment();
            break;
        }
      } else if (formType === ACTION_FORM_TYPE.ELEMENT_ACTIONS) {
        recordingOverlay.hideEventsBoxIfShown();
        if (type === ASSERT_TEXT) {
        } else {
          recordingOverlay.handleSelectedActionFromEventsList({ action: type });
        }
      } else {
        switch (type) {
          case ACTION_TYPES.GO_BACK:
            window.history.back();
            break;
          case ACTION_TYPES.GO_FORWARD:
            window.history.forward();
            break;
          case ACTION_TYPES.REFRESH_PAGE:
            window.location.reload();
            break;
          case ACTION_TYPES.TOOGLE_INSPECTOR:
            break;
          case ACTION_TYPES.RECORDING_STATUS_RESPONSE:
            const { isFromParent } = message.data;
            if (!isFromParent) {
              break;
            }
            if (
              value === IS_RECORDING_WITHOUT_INSPECTOR ||
              value === NOT_RECORDING
            ) {
              recordingOverlay.boot(true);
            } else if (value === IS_RECORDING_USING_INSPECTOR) {
              recordingOverlay.boot();
              recordingOverlay.showEventsFormWizard();
            }
            break;
        }
      }
    },
    false
  );

  document.addEventListener(
    "keydown",
    (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (event.keyCode === 68 && event.shiftKey) {
        recordingOverlay.highlightInspectedElement();
      }
    },
    true
  );

  document.addEventListener(
    "keyup",
    () => {
      recordingOverlay.stopInspectorIfMoving();
    },
    true
  );
}
