import React from "preact/compat";
import { useRef, useState } from "preact/hooks";
import { addHttpToURLIfNotThere, getQueryStringParams } from "../../utils/url";
import { sendPostDataWithForm } from "../../utils/helpers";
import { ACTION_TYPES, STATE } from "../../constants/actionTypes";
import {
  IS_RECORDING_USING_INSPECTOR,
  IS_RECORDING_WITHOUT_INSPECTOR,
  NOT_RECORDING,
} from "../../constants";
import devices from "../../constants/devices";
import userAgents from "../../constants/userAgents";
import {
  BLACKOUT,
  CLICK,
  HOVER,
  INPUT,
  NAVIGATE_URL,
  SCREENSHOT,
  SET_DEVICE,
} from "../../constants/domEventsToRecord";
import { SERVER_ENDPOINT } from "../../constants/endpoints";
import { Modal } from "./components/modal";
import {PreactElement} from "preact/src/internal";

export const ACTION_FORM_TYPE = {
  PAGE_ACTIONS: "PAGE_ACTIONS",
  ELEMENT_ACTIONS: "ELEMENT_ACTIONS",
};

function RecordingIcon(props: any) {
  return (
    <svg height="512pt" viewBox="0 0 512 512" width="512pt" {...props}>
      <path
        d="M512 256c0 141.387-114.613 256-256 256S0 397.387 0 256 114.613 0 256 0s256 114.613 256 256zm0 0"
        fill="#e76e54"
      />
      <path
        d="M384 256c0 70.691-57.309 128-128 128s-128-57.309-128-128 57.309-128 128-128 128 57.309 128 128zm0 0"
        fill="#dd523c"
      />
    </svg>
  );
}

function Step(props: any) {
  const { type, path, value } = props;
  return (
    <li style={styles.step}>
      <div style={styles.stepImage}>
        <img src={chrome.runtime.getURL("icons/mouse.svg")} />
      </div>
      <div style={{ ...styles.stepTextContainer }}>
        <div style={styles.stepAction}>{type}</div>
        <div style={{ width: "70%", overflow: "hidden" }}>
          <div style={styles.stepSelector}>{value || path}</div>
        </div>
      </div>
      <div style={styles.centerItemsVerticalFlex}>
        <img
          style={styles.stepGoImage}
          src={chrome.runtime.getURL("icons/arrow.svg")}
        />
      </div>
    </li>
  );
}

function Steps(props: any) {
  const { steps } = props;

  const stepList = steps.map((step: any) => {
    const { event_type, selectors, value } = step;
    return (
      <Step
        type={event_type}
        path={selectors && selectors[0].value}
        value={value}
      />
    );
  });

  return (
    <div
      style={{
        height: 300,
        minHeight: "50%",
        overflowY: "auto",
        marginBottom: "2rem",
      }}
    >
      <ul style={styles.stepsContainer} className="margin-list-item">
        {stepList}
      </ul>
    </div>
  );
}

function Actions(props: any) {
  const { iframeRef, type, isShowingElementFormCallback, updateState } = props;
  const pageActions = [
    {
      id: ACTION_TYPES.INSPECT,
      value: "Inspect",
      icon: chrome.runtime.getURL("icons/action.svg"),
    },
    {
      id: ACTION_TYPES.SCREENSHOT,
      value: "Screenshot",
      icon: chrome.runtime.getURL("icons/action.svg"),
    },
    {
      id: ACTION_TYPES.SEO,
      value: "SEO",
      icon: chrome.runtime.getURL("icons/action.svg"),
    },
    // {
    //     id: ACTION_TYPES.CAPTURE_CONSOLE,
    //     value: "Console",
    //     icon: chrome.runtime.getURL("icons/action.svg")
    // }
    // ,
    // {
    //     id: ACTION_TYPES.NETWORK,
    //     value: "Network",
    //     icon: chrome.runtime.getURL("icons/action.svg")
    // }
  ];

  const elementActions = [
    {
      id: CLICK,
      value: "Click",
      icon: chrome.runtime.getURL("icons/action.svg"),
    },
    {
      id: HOVER,
      value: "Hover",
      icon: chrome.runtime.getURL("icons/action.svg"),
    },
    {
      id: SCREENSHOT,
      value: "Screenshot",
      icon: chrome.runtime.getURL("icons/action.svg"),
    },
    {
      id: BLACKOUT,
      value: "Blackout",
      icon: chrome.runtime.getURL("icons/action.svg"),
    },
  ];

  function handleElementActionClick(actionType: string, updateState: Function) {
    const cn = iframeRef.current.contentWindow;

    switch (actionType) {
      case ACTION_TYPES.INSPECT:
        cn.postMessage(
          {
            type: ACTION_TYPES.INSPECT,
            formType: ACTION_FORM_TYPE.PAGE_ACTIONS,
            value: true,
          },
          "*"
        );
        break;
      case ACTION_TYPES.SCREENSHOT:
        cn.postMessage(
          {
            type: ACTION_TYPES.SCREENSHOT,
            formType: ACTION_FORM_TYPE.PAGE_ACTIONS,
            value: true,
          },
          "*"
        );
        break;
      case ACTION_TYPES.SEO:
        console.log();
        updateState(STATE.SEO);
        break;
      case ACTION_TYPES.CAPTURE_CONSOLE:
        cn.postMessage(
          {
            type: ACTION_TYPES.CAPTURE_CONSOLE,
            formType: ACTION_FORM_TYPE.PAGE_ACTIONS,
            value: true,
          },
          "*"
        );
        break;
      case CLICK:
        isShowingElementFormCallback(false);
        cn.postMessage(
          {
            type: CLICK,
            formType: ACTION_FORM_TYPE.ELEMENT_ACTIONS,
            value: true,
          },
          "*"
        );
        break;
      case HOVER:
        isShowingElementFormCallback(false);
        cn.postMessage(
          {
            type: HOVER,
            formType: ACTION_FORM_TYPE.ELEMENT_ACTIONS,
            value: true,
          },
          "*"
        );
        break;
      case SCREENSHOT:
        isShowingElementFormCallback(false);
        cn.postMessage(
          {
            type: SCREENSHOT,
            formType: ACTION_FORM_TYPE.ELEMENT_ACTIONS,
            value: true,
          },
          "*"
        );
        break;
      case BLACKOUT:
        isShowingElementFormCallback(false);
        cn.postMessage(
          {
            type: BLACKOUT,
            formType: ACTION_FORM_TYPE.ELEMENT_ACTIONS,
            value: true,
          },
          "*"
        );
        break;
    }
  }

  const out = [];
  const actions =
    type === ACTION_FORM_TYPE.ELEMENT_ACTIONS ? elementActions : pageActions;

  for (let i = 0; i < actions.length; i+=2) {
    const shouldAddMarginRight = i % 2 && i !== actions.length - 1;
    out.push(
      <div style={styles.actionRow}>
        <div
          style={
            shouldAddMarginRight
              ? { ...styles.actionItem, ...styles.oddItem }
              : { ...styles.actionItem}
          }
          id={actions[i].id}
          onClick={() => {
            handleElementActionClick(actions[i].id, updateState);
          }}
        >
          <img style={styles.actionImage} src={actions[i].icon} />
          <span style={styles.actionText}>{actions[i].value}</span>
        </div>
          {i + 1 < actions.length && (
              <div
                  style={
                      shouldAddMarginRight
                          ? { ...styles.actionItem, ...styles.oddItem }
                          : { ...styles.actionItem }
                  }
                  id={actions[i+1].id}
                  onClick={() => {
                      handleElementActionClick(actions[i].id, updateState);
                  }}
              >
                  <img style={styles.actionImage} src={actions[i+1].icon} />
                  <span style={styles.actionText}>{actions[i+1].value}</span>
              </div>
          )}
      </div>
    );
  }

  return (
    <div style={{ ...styles.actionListContainer, marginTop: "2rem" }}>
      {out}
    </div>
  );
}

function DesktopBrowser(props: any) {
  const selectedDeviceId = getQueryStringParams("device", window.location.href);
  const urlParams = getQueryStringParams("url", window.location.href);
  const urlEncoded = new URL(urlParams);
  const url = urlEncoded
    ? decodeURI(urlEncoded.toString().replace(/^["']/, "").replace(/["']$/, ""))
    : "https://google.com";
  const { forwardRef } = props;
  const addressInput = useRef(null);
  const [addressValue, setAddressValue] = useState(url);

  const deviceInfoIndex = devices.findIndex(
    (device) => device.id === selectedDeviceId
  );

  const selectedDevice = deviceInfoIndex
    ? devices[deviceInfoIndex]
    : devices[8];

  const isMobile = ["Pixel 3, 3 XL", "iPhone 8 Plus, 7 Plus, 6S Plus"].includes(
    selectedDevice.name
  );

  function handleKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      setAddressValue(
        addHttpToURLIfNotThere(addressInput.current.innerText.trim())
      );
    }
  }

  function goBack() {
    const cn = forwardRef.current.contentWindow;
    cn.postMessage({ type: ACTION_TYPES.GO_BACK, value: true }, "*");
  }

  function goForward() {
    const cn = forwardRef.current.contentWindow;
    cn.postMessage({ type: ACTION_TYPES.GO_FORWARD, value: true }, "*");
  }

  function refreshPage() {
    const cn = forwardRef.current.contentWindow;
    cn.postMessage({ type: ACTION_TYPES.REFRESH_PAGE, value: true }, "*");
  }

  function Addressbar() {
    const urlEncoded = new URL(addressValue);
    urlEncoded.searchParams.delete("__crusherAgent__");
    return (
      <div style={styles.addressBar}>
        <div
          style={{
            width: "1.75rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            style={{ width: "0.8rem" }}
            src={chrome.runtime.getURL("/icons/ssl.svg")}
          />
        </div>
        <div
          ref={addressInput}
          style={styles.addressBarInput}
          onKeyDown={handleKeyDown}
          contentEditable={true}
        >
          {urlEncoded.toString().substr(0, 50)}
        </div>
        <div style={styles.recordingStatus}>
          <RecordingIcon
            height={12}
            width={12}
            style={{ marginRight: ".5rem" }}
          />
          Recording Test
        </div>
      </div>
    );
  }

  function Toolbar() {
    return (
      <div style={styles.browserToolbar}>
        <div style={styles.browserSmallShadow} />
        <div style={styles.browserMainToolbar}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={chrome.runtime.getURL("/icons/navigation-back.svg")}
              onClick={goBack}
            />
          </div>
          <div
            style={{
              marginLeft: "0.7rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={chrome.runtime.getURL("/icons/navigation-forward.svg")}
              onClick={goForward}
            />
          </div>
          <div
            style={{
              marginLeft: "0.9rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              style={{ width: "1.1rem" }}
              src={chrome.runtime.getURL("/icons/navigation-refresh.svg")}
              onClick={refreshPage}
            />
          </div>
          <Addressbar />
        </div>
      </div>
    );
  }

  const IframeSection = ()=> {
    return (
      <div style={styles.previewBrowser}>
        {isMobile && (
          <div
            className="smartphone"
            style={{
              width: selectedDevice.width,
              height: selectedDevice.height,
            }}
          >
            <div className="content" style={{ width: "100%", height: "100%" }}>
              <iframe
                ref={forwardRef}
                style={{
                  ...styles.browserFrame,
                  width: "100%",
                  height: "100%",
                }}
                scrolling="auto"
                sandbox="allow-scripts allow-forms allow-same-origin"
                id="screen-iframe-5984a019-7f2b-4f58-ad11-e58cc3cfa634"
                title={selectedDevice.name}
                src={addressValue}
              />
            </div>
          </div>
        )}
        {!isMobile && (
          <iframe
            ref={forwardRef}
            style={{
              ...styles.browserFrame,
              width: selectedDevice.width,
              height: selectedDevice.height,
            }}
            scrolling="auto"
            id="screen-iframe-5984a019-7f2b-4f58-ad11-e58cc3cfa634"
            sandbox="allow-scripts allow-forms allow-same-origin"
            title={selectedDevice.name}
            src={addressValue}
          />
        )}
      </div>
    );
  }

  return (
    <div style={styles.mainContainer}>
      <div style={styles.browser}>
        <Toolbar />
        {IframeSection()}
      </div>
    </div>
  );
}

let messageListenerCallback: any = null;

window.addEventListener("message", (event) => {
  if (messageListenerCallback) {
    messageListenerCallback(event);
  }
});

function App() {
  const selectedDeviceId = getQueryStringParams("device", window.location.href);

  const [steps, setSteps] = useState([
    {
      event_type: SET_DEVICE,
      selectors: [{ value: "body", uniquenessScore: 1, type: "body" }],
      value: selectedDeviceId,
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isShowingElementForm, setIsShowingElementForm] = useState(false);
  const [isUsingElementInspector, setIsUsingElementInspector] = useState(false);

  const iframeRef = useRef(null);
  function getSteps() {
    return steps;
  }

  messageListenerCallback = function (event: any) {
    const { type, eventType, value, selectors } = event.data;
    const steps = getSteps();
    if (eventType) {
      const lastStep = steps[steps.length - 1];
      if (!lastStep) {
        setSteps([...getSteps(), { event_type: eventType, value, selectors }]);
      } else {
        const navigateEventExist = steps.find(
          (step) => step.event_type === NAVIGATE_URL
        );

        if (navigateEventExist && eventType === NAVIGATE_URL) {
        } else {
          if (
            lastStep.event_type === INPUT &&
            eventType === INPUT &&
            lastStep.selectors[0].value === selectors[0].value
          ) {
            steps[steps.length - 1].value = value;
            setSteps(steps);
          } else {
            setSteps([
              ...getSteps(),
              { event_type: eventType, value, selectors },
            ]);
          }
        }
      }
    } else if (type) {
      const cn = iframeRef.current.contentWindow;

      switch (type) {
        case ACTION_TYPES.SHOW_ELEMENT_FORM:
          setIsShowingElementForm(true);
          break;
        case ACTION_TYPES.STARTED_RECORDING_EVENTS:
          setIsRecording(true);
          break;
        case ACTION_TYPES.TOOGLE_INSPECTOR:
          setIsUsingElementInspector(!isUsingElementInspector);
          break;
        case ACTION_TYPES.GET_RECORDING_STATUS:
          cn.postMessage(
            {
              type: ACTION_TYPES.RECORDING_STATUS_RESPONSE,
              value: isUsingElementInspector
                ? IS_RECORDING_USING_INSPECTOR
                : isRecording
                ? IS_RECORDING_WITHOUT_INSPECTOR
                : NOT_RECORDING,
              isFromParent: true,
            },
            "*"
          );
          break;
        case ACTION_TYPES.GET_USER_AGENT:
          const iframeURL = getQueryStringParams("url", window.location.href);
          const crusherAgent = getQueryStringParams(
            "__crusherAgent__",
            iframeURL
          );
          const userAgent = userAgents.find(
            (agent) => agent.name === (crusherAgent || userAgents[6].value)
          );
          cn.postMessage(
            { type: ACTION_TYPES.SET_USER_AGENT, value: userAgent },
            "*"
          );
      }
    }
  };

  function saveTest() {
    sendPostDataWithForm(`${SERVER_ENDPOINT}test/goToEditor`, {
      events: escape(JSON.stringify(steps)),
    });
  }

  function cancelTest() {
    if (isShowingElementForm) {
      setIsShowingElementForm(false);
    } else {
      window.close();
    }
  }

  function RightBottomSection() {
    return (
      <div style={{ display: "flex", marginTop: "auto" }}>
        <div
          onClick={cancelTest}
          style={{
            marginLeft: "auto",
            width: "auto",
            marginRight: "3rem",
            color: "#fff",
            cursor: "pointer",
            fontFamily: "DM Sans",
            fontWeight: 500,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
          }}
        >
          Stop
        </div>
        <div style={{ ...styles.button, width: "auto" }} onClick={saveTest}>
          <img
            style={styles.buttonImage}
            src={chrome.runtime.getURL("icons/record.svg")}
          />
          <span>Save Test</span>
        </div>
      </div>
    );
  }

  function RightMiddleSection(props: any) {
    const isElementSelected = isShowingElementForm;
    return isElementSelected ? (
      <>
        <div style={styles.sectionHeading}>Element Actions</div>
        <Actions
          type={ACTION_FORM_TYPE.ELEMENT_ACTIONS}
          isShowingElementFormCallback={setIsShowingElementForm}
          iframeRef={iframeRef}
          updateState={()=>{}}
        />
      </>
    ) : (
      <>
        <div style={styles.sectionHeading}>Actions</div>
        <Actions
          type={ACTION_FORM_TYPE.PAGE_ACTIONS}
          isShowingElementFormCallback={setIsShowingElementForm}
          iframeRef={iframeRef}
          updateState={updateState}
        />
      </>
    );
  }

  const [state, updateState] = useState(null);

  function RightSection() {
    return (
      <div style={{ ...styles.sidebar, ...styles.paddingContainer }}>
        <div style={styles.sectionHeading}>Steps</div>
        <Steps steps={steps} />
        <RightMiddleSection state={state} updateState={updateState} />
        <RightBottomSection />
      </div>
    );
  }

  // @ts-ignore
  return (
    <div style={styles.container}>
      <DesktopBrowser forwardRef={iframeRef} />
      <RightSection />
      <style>
        {`
                    html, body{
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        font-size: 20px;
                    }
                    .margin-list-item li:not(:first-child){
                        margin-top: 0.75rem;
                    }
                    /* The device with borders */
                    .smartphone {
                        position: relative;
                        width: 360px;
                          height: 640px;
                          margin: auto;
                          border: 16px black solid;
                          border-top-width: 60px;
                          border-bottom-width: 60px;
                          border-radius: 36px;
                    }
                    
                    /* The horizontal line on the top of the device */
                    .smartphone:before {
                      content: '';
                      display: block;
                      width: 60px;
                      height: 5px;
                      position: absolute;
                      top: -30px;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      background: #333;
                      border-radius: 10px;
                    }

                    /* The circle on the bottom of the device */
                    .smartphone:after {
                      content: '';
                      display: block;
                      width: 35px;
                      height: 35px;
                      position: absolute;
                      left: 50%;
                      bottom: -65px;
                      transform: translate(-50%, -50%);
                      background: #333;
                      border-radius: 50%;
                    }

                    /* The screen (or content) of the device */
                    .smartphone .content {
                      width: 360px;
                      height: 640px;
                      background: white;
                    }
                `}
      </style>
      <link
        rel="stylesheet"
        href={chrome.runtime.getURL("/styles/devices.min.css")}
      />
      <link
        rel="stylesheet"
        href={chrome.runtime.getURL("/styles/fonts.css")}
      />
      <Modal state={state} updateState={updateState} />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "auto",
    background: "rgb(40, 40, 40)",
  },
  mainContainer: {
    flex: 1,
    width: "70%",
    maxHeight: "100vh",
    overflow: "auto",
  },
  sidebar: {
    background: "#141528",
    display: "flex",
    flexDirection: "column",
    maxWidth: "19rem",
    marginLeft: "auto",
    maxHeight: "100vh",
  },
  centerItemsVerticalFlex: {
    display: "flex",
    alignItems: "center",
  },
  sectionHeading: {
    fontFamily: "DM Sans",
    fontSize: "0.9rem",
    fontWeight: 700,
    marginBottom: "0rem",
    color: "#fff",
  },
  paddingContainer: {
    padding: "1.9rem 1.25rem",
  },
  stepsContainer: {
    listStyle: "none",
    padding: 0,
  },
  step: {
    display: "flex",
    cursor: "pointer",
    fontFamily: "DM Sans",
    fontStyle: "normal",
    background: "#0C0C1F",
    borderRadius: "0.25rem",
    padding: "0.6rem 0",
    overflow: "hidden",
  },
  stepImage: {
    padding: "0rem 0.9rem",
  },
  stepTextContainer: {
    flex: 1,
  },
  stepAction: {
    fontWeight: "bold",
    color: "#9393BC",
    fontSize: "0.8rem",
  },
  stepSelector: {
    marginTop: "0.25rem",
    color: "#fff",
    fontSize: "0.6rem",
    whiteSpace: "nowrap",
  },
  stepGoImage: {
    paddingRight: "0.75rem",
  },
  browser: {
    background: "rgb(40, 40, 40)",
    minHeight: "100vh",
    overflow: "hidden",
  },
  browserToolbar: {
    display: "flex",
    flexDirection: "column",
  },
  browserSmallShadow: {
    background: "rgb(53, 57, 74)",
    height: "0.4rem",
  },
  browserMainToolbar: {
    background: "rgb(53, 57, 74)",
    display: "flex",
    padding: "0.25rem 0.75rem",
  },
  addressBar: {
    width: "65%",
    padding: "0 0.1rem",
    background: "#2b2e37",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    color: "#fff",
    borderRadius: "1rem",
    marginLeft: "0.9rem",
    height: "1.3rem",
  },
  addressBarInput: {
    flex: 1,
    fontSize: "0.7rem",
    outline: "none",
    display: "flex",
    marginLeft: "0.1rem",
    alignItems: "center",
  },
  recordingStatus: {
    background: "#1E2027",
    color: "#64707C",
    lineHeight: "1.15rem",
    fontSize: "0.6rem",
    display: "flex",
    alignItems: "center",
    fontWeight: "500",
    fontFamily: "DM Sans",
    padding: "0 0.8rem",
  },
  previewBrowser: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    paddingTop: "3rem",
    overflowY: "auto",
    background: "rgb(40, 40, 40)",
  },
  browserFrame: {
    border: "none",
    display: "block",
    borderRadius: 2,
    width: 1280,
    height: 800,
    backgroundColor: "#fff",
  },
  button: {
    background: "#0C0C1F",
    boxShadow: "inset 0px 1px 13px 4px #070718",
    borderRadius: 4,
    fontWeight: 600,
    fontSize: "0.825rem",
    color: "#fff",
    fontFamily: "DM Sans",
    padding: "0.65rem 1rem",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  buttonImage: {
    marginRight: "1.2rem",
  },
  actionListContainer: {
    display: "flex",
    flexDirection: "column",
  },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem",
  },
  actionItem: {
    padding: "0.8rem 0.8rem",
    fontFamily: "DM Sans",
    fontWeight: "bold",
    fontSize: "0.8rem",
    color: "#fff",
    background: "#0D0D20",
    boxShadow: "inset 0px 0px 15px 1px rgba(7, 7, 26, 0.7)",
    borderRadius: "0.2rem",
    width: "6.5rem",
    display: "flex",
    cursor: "pointer",
  },
  actionImage: {},
  actionText: {
    marginLeft: "auto",
  },
  oddItem: {
    marginRight: "1rem",
  },
};

export default App;
