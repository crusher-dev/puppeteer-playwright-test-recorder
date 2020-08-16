import {h, Component, ComponentProps, Ref} from 'preact';
import React from 'preact/compat';
import {useEffect, useRef, useState} from "preact/hooks";
import {addHttpToURLIfNotThere, getQueryStringParams} from "../../utils/url";
import {sendPostDataWithForm} from "../../../../chrome-extension/src/utils/helpers";
import {resolveToFrontendUrl} from "../../utils/helpers";
import {act} from "preact/test-utils";
import {ACTION_TYPES} from "../../constants/ActionTypes";
import {IS_RECORDING_USING_INSPECTOR, IS_RECORDING_WITHOUT_INSPECTOR, NOT_RECORDING} from "../../constants";

function Step(props: any) {
    const {type, path, value} = props;
    return (
        <li style={styles.step}>
            <div style={styles.stepImage}>
                <img src={chrome.runtime.getURL("icons/mouse.svg")}/>
            </div>
            <div style={{...styles.stepTextContainer}}>
                <div style={styles.stepAction}>{type}</div>
                <div style={{width: "70%", overflow: "hidden"}}>
                    <div style={styles.stepSelector}>{value ? value : path}</div>
                </div>
            </div>
            <div style={styles.centerItemsVerticalFlex}>
                <img style={styles.stepGoImage} src={chrome.runtime.getURL("icons/arrow.svg")}/>
            </div>
        </li>
    );
}

function RenderSteps(props: any) {
    const {steps} = props;

    const out = steps.map((step: any) => {
        const {event_type, selector, value} = step;
        return (<Step type={event_type} path={selector} value={value}/>)
    });
    return (
        <ul style={styles.stepsContainer} className="margin-list-item">
            {out}
        </ul>
    )

}

function RenderActions(props: any) {
    const {iframeRef} = props;
    const actions = [
        {
            id: ACTION_TYPES.INSPECT,
            value: "Inspect",
            icon: chrome.runtime.getURL("icons/action.svg")
        },
        {
            id: ACTION_TYPES.SEO_META,
            value: "SEO/Meta",
            icon: chrome.runtime.getURL("icons/action.svg")
        },
        {
            id: ACTION_TYPES.NETWORK,
            value: "Network",
            icon: chrome.runtime.getURL("icons/action.svg")
        },
        {
            id: ACTION_TYPES.CAPTURE_CONSOLE,
            value: "Console",
            icon: chrome.runtime.getURL("icons/action.svg")
        },
        {
            id: ACTION_TYPES.SCREENSHOT,
            value: "Screenshot",
            icon: chrome.runtime.getURL("icons/action.svg")
        },
        {
            id: ACTION_TYPES.SANITY,
            value: "Sanity",
            icon: chrome.runtime.getURL("icons/action.svg")
        }
    ]

    function handleActionClick(actionType: string) {
        const cn = (iframeRef).current.contentWindow;

        switch (actionType) {
            case ACTION_TYPES.INSPECT:
                cn.postMessage({type: ACTION_TYPES.INSPECT, value: true}, '*');
                break;
            case ACTION_TYPES.SCREENSHOT:
                cn.postMessage({type: ACTION_TYPES.SCREENSHOT, value: true}, '*');
                break;
            case ACTION_TYPES.CAPTURE_CONSOLE:
                cn.postMessage({type: ACTION_TYPES.CAPTURE_CONSOLE, value: true}, '*')
                break;
        }

    }

    let out = [];
    for (let i = 0; i < actions.length; i += 2) {
        out.push(
            <div style={styles.actionRow}>
                <div style={{...styles.actionItem, ...styles.oddItem}} id={actions[i].id} onClick={() => {
                    handleActionClick(actions[i].id)
                }}>
                    <img style={styles.actionImage} src={actions[i].icon}/>
                    <span style={styles.actionText}>{actions[i].value}</span>
                </div>
                {actions[i + 1] && (
                    <div style={styles.actionItem} id={actions[i + 1].id} onClick={() => {
                        handleActionClick(actions[i + 1].id)
                    }}>
                        <img style={styles.actionImage} src={actions[i + 1].icon}/>
                        <span style={styles.actionText}>{actions[i + 1].value}</span>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div style={{...styles.actionListContainer, marginTop: "2rem"}}>
            {out}
        </div>
    )
}

function RenderDesktopBrowser(props: any) {
    const urlParams = getQueryStringParams("url", window.location.href);
    const urlEncoded: any = urlParams;
    const url = urlEncoded ? decodeURI(urlEncoded.replace(/^["']/, '').replace(/["']$/, '')) : "https://google.com";
    const {changeURLCallback, forwardRef} = props;
    const addressInput = useRef(null);
    const [addressValue, setAddressValue] = useState(url);

    function handleKeyDown(event: KeyboardEvent) {
        if (event.keyCode === 13) {
            setAddressValue(addHttpToURLIfNotThere(addressInput.current.innerText.trim()));
        }
    }

    function goBack() {
        const cn = (forwardRef).current.contentWindow;
        cn.postMessage({type: ACTION_TYPES.GO_BACK, value: true}, '*');
    }

    function goForward() {
        const cn = (forwardRef).current.contentWindow;
        cn.postMessage({type: ACTION_TYPES.GO_FORWARD, value: true}, '*');
    }

    function refreshPage() {
        const cn = (forwardRef).current.contentWindow;
        cn.postMessage({type: ACTION_TYPES.REFRESH_PAGE, value: true}, '*');
    }

    return (
        <div style={styles.browser}>
            <div style={styles.browserToolbar}>
                <div style={styles.browserSmallShadow}></div>
                <div style={styles.browserMainToolbar}>
                    <div style={{display: "flex", alignItems: "center"}}><img
                        src={chrome.runtime.getURL("/icons/navigation-back.svg")} onClick={goBack}/></div>
                    <div style={{marginLeft: "0.7rem", display: "flex", alignItems: "center"}}><img
                        src={chrome.runtime.getURL("/icons/navigation-forward.svg")} onClick={goForward}/></div>
                    <div style={{marginLeft: "0.9rem", display: "flex", alignItems: "center"}}><img
                        style={{width: "1.1rem"}} src={chrome.runtime.getURL("/icons/navigation-refresh.svg")}
                        onClick={refreshPage}/></div>
                    <div style={styles.addressBar}>
                        <div
                            style={{width: "1.75rem", display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <img style={{width: "0.8rem"}} src={chrome.runtime.getURL("/icons/ssl.svg")}/>
                        </div>
                        <div ref={addressInput} style={styles.addressBarInput} onKeyDown={handleKeyDown}
                             contentEditable={true}>{addressValue}</div>
                        <div style={styles.recordingStatus}>
                            RECORDING
                        </div>
                    </div>
                </div>
            </div>
            <div style={styles.previewBrowser}>
                <iframe ref={forwardRef} style={styles.browserFrame} scrolling="auto"
                        id="screen-iframe-5984a019-7f2b-4f58-ad11-e58cc3cfa634"
                        sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                        title="Large Screen - 1280x800"
                        src={addressValue}
                ></iframe>
            </div>
        </div>
    )
}

let messageListenerCallback: any = null;

window.addEventListener("message", (event) => {
    if (!!messageListenerCallback) {
        messageListenerCallback(event);
    }
});

function App(props: ComponentProps<any>) {

    const [steps, setSteps] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isUsingElementInspector, setIsUsingElementInspector] = useState(false);

    const iframeRef = useRef(null);
    let hasRegisteredListener = false;

    function getSteps() {
        return steps;
    }

    messageListenerCallback = function (event: any) {
        const {type, eventType, value, path} = event.data;
        console.log(event.data);
        if (eventType && path) {
            setSteps([...(getSteps()), {event_type: eventType, value, selector: path}]);
        } else if (type) {
            switch (type) {
                case ACTION_TYPES.STARTED_RECORDING_EVENTS:
                    setIsRecording(true);
                    break;
                case ACTION_TYPES.TOOGLE_INSPECTOR:
                    setIsUsingElementInspector(!isUsingElementInspector);
                    break;
                case ACTION_TYPES.CHECK_RECORDING_STATUS:
                    const cn = (iframeRef).current.contentWindow;
                    cn.postMessage({
                        type: ACTION_TYPES.CHECK_RECORDING_STATUS,
                        value: isUsingElementInspector ? IS_RECORDING_USING_INSPECTOR : (isRecording ? IS_RECORDING_WITHOUT_INSPECTOR : NOT_RECORDING)
                    }, '*');
                    break;
            }
        }
    }


    function saveTest() {
        console.log(steps);
        sendPostDataWithForm(resolveToFrontendUrl("app/tests/editor"), {events: JSON.stringify(steps)})
    }

    function cancelTest() {
        window.close();
    }

    return (
        <div style={styles.container}>
            <div style={styles.mainContainer}>
                <RenderDesktopBrowser forwardRef={iframeRef}/>
            </div>
            <div style={{...styles.sidebar, ...styles.paddingContainer}}>
                <div style={styles.sectionHeading}>Steps</div>

                <div style={{height: 300, minHeight: "30%", overflowY: "auto", marginBottom: '2rem'}}>
                    <RenderSteps steps={steps}/>
                </div>
                <div style={styles.sectionHeading}>Test Actions</div>
                <RenderActions iframeRef={iframeRef}/>

                <div style={{display: "flex", marginTop: "auto"}}>
                    <div onClick={cancelTest} style={{
                        marginLeft: "auto",
                        width: "auto",
                        marginRight: "3rem",
                        color: "#fff",
                        cursor: "pointer",
                        fontFamily: "DM Sans",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center"
                    }}>
                        Cancel
                    </div>
                    <div style={{...styles.button, width: "auto"}} onClick={saveTest}>
                        <img style={styles.buttonImage} src={chrome.runtime.getURL("icons/record.svg")}/>
                        <span>Save Test</span>
                    </div>
                </div>
            </div>
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
                `}
            </style>
            <link rel="stylesheet" href={chrome.runtime.getURL("/styles/fonts.css")}/>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        height: "auto",
        background: "rgb(40, 40, 40)"
    },
    mainContainer: {
        flex: 1,
        width: "70%",
        maxHeight: "100vh",
        overflow: "auto"
    },
    sidebar: {
        background: "#141528",
        display: "flex",
        flexDirection: "column",
        maxWidth: "19rem",
        marginLeft: "auto",
        maxHeight: "100vh"
    },
    centerItemsVerticalFlex: {
        display: "flex",
        alignItems: "center"
    },
    sectionHeading: {
        fontFamily: "DM Sans",
        fontSize: "0.9rem",
        fontWeight: 700,
        marginBottom: "0rem",
        color: "#fff"
    },
    paddingContainer: {
        padding: "1.9rem 1.25rem"
    },
    stepsContainer: {
        listStyle: "none",
        padding: 0
    },
    step: {
        display: "flex",
        cursor: "pointer",
        fontFamily: "DM Sans",
        fontStyle: "normal",
        background: "#0C0C1F",
        borderRadius: "0.25rem",
        padding: "0.6rem 0",
        overflow: "hidden"
    },
    stepImage: {
        padding: "0rem 0.9rem"
    },
    stepTextContainer: {
        flex: 1
    },
    stepAction: {
        fontWeight: "bold",
        color: "#9393BC",
        fontSize: "0.8rem"
    },
    stepSelector: {
        marginTop: "0.25rem",
        color: "#fff",
        fontSize: "0.6rem",
        whiteSpace: "nowrap",
    },
    stepGoImage: {
        paddingRight: "0.75rem"
    },
    browser: {
        background: "rgb(40, 40, 40)",
        minHeight: "100vh",
        overflow: "hidden"
    },
    browserToolbar: {
        display: "flex",
        flexDirection: "column"
    },
    browserSmallShadow: {
        background: "rgb(53, 57, 74)",
        height: "0.4rem"
    },
    browserMainToolbar: {
        background: "rgb(53, 57, 74)",
        display: "flex",
        padding: "0.25rem 0.75rem"
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
        height: "1.3rem"
    },
    addressBarInput: {
        flex: 1,
        fontSize: "0.7rem",
        outline: "none",
        display: "flex",
        marginLeft: "0.1rem",
        alignItems: "center"
    },
    recordingStatus: {
        background: "#1E2027",
        color: "#64707C",
        lineHeight: "1.15rem",
        fontSize: "0.6rem",
        fontWeight: "500",
        fontFamily: "DM Sans",
        padding: "0 0.8rem"
    },
    previewBrowser: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        paddingTop: '3rem',
        overflowY: "auto",
        background: "rgb(40, 40, 40)"
    },
    browserFrame: {
        border: "none",
        display: "block",
        borderRadius: 2,
        width: 1280,
        height: 800,
        backgroundColor: "#fff"
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
        cursor: "pointer"
    },
    buttonImage: {
        marginRight: "1.2rem",
    },
    actionListContainer: {
        display: "flex",
        flexDirection: "column"
    },
    actionRow: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "1rem"
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
        cursor: "pointer"
    },
    actionImage: {},
    actionText: {
        marginLeft: "auto"
    },
    oddItem: {
        marginRight: "1rem"
    }
}

export default App;