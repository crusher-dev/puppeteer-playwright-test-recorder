import {h, Component, ComponentProps} from 'preact';
import React from 'preact/compat';
import {useRef, useState} from "preact/hooks";
import {addHttpToURLIfNotThere} from "../../utils/url";

function Step(props: ComponentProps<any>){
    return (
        <li style={styles.step}>
            <div style={styles.stepImage}>
                <img src={chrome.runtime.getURL("icons/mouse.svg")}/>
            </div>
            <div style={{...styles.stepTextContainer}}>
                <div style={styles.stepAction}>Click</div>
                <div style={styles.stepSelector}>{"p > a"}</div>
            </div>
            <div style={styles.centerItemsVerticalFlex}>
                <img style={styles.stepGoImage} src={chrome.runtime.getURL("icons/arrow.svg")}/>
            </div>
        </li>
    );
}

function RenderSteps(props: ComponentProps<any>) {
    return (
        <ul style={styles.stepsContainer} className="margin-list-item">
            <Step/>
            <Step/>
            <Step/>
        </ul>
    )

}

function RenderDesktopBrowser(props: any){
    const {changeURLCallback} = props;
    const addressInput = useRef(null);
    const [addressValue, setAddressValue] = useState("http://google.com/?__userAgent__=Samsung%20Phone");

    function handleKeyDown(event: KeyboardEvent){
        if(event.keyCode === 13){
            setAddressValue(addHttpToURLIfNotThere(addressInput.current.innerText.trim()));
        }
    }

    return (
        <div style={styles.browser}>
            <div style={styles.browserToolbar}>
                <div style={styles.browserSmallShadow}></div>
                <div style={styles.browserMainToolbar}>
                    <div style={{display: "flex", alignItems: "center"}}><img src={chrome.runtime.getURL("/icons/navigation-back.svg")}/></div>
                    <div style={{marginLeft: "0.7rem", display: "flex", alignItems: "center"}}><img src={chrome.runtime.getURL("/icons/navigation-forward.svg")}/></div>
                    <div style={{marginLeft: "0.9rem", display: "flex", alignItems: "center"}}><img style={{width: "1.1rem"}} src={chrome.runtime.getURL("/icons/navigation-refresh.svg")}/></div>
                    <div style={styles.addressBar}>
                        <div style={{width: "1.75rem", display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <img style={{width: "0.8rem"}} src={chrome.runtime.getURL("/icons/ssl.svg")}/>
                        </div>
                        <div ref={addressInput} style={styles.addressBarInput} onKeyDown={handleKeyDown} contentEditable={true}>{addressValue}</div>
                        <div style={styles.recordingStatus}>
                            RECORDING
                        </div>
                    </div>
                </div>
            </div>
            <div style={styles.previewBrowser}>
                <iframe style={styles.browserFrame} scrolling="auto" id="screen-iframe-5984a019-7f2b-4f58-ad11-e58cc3cfa634"
                        sandbox="allow-scripts allow-forms allow-same-origin" title="Large Screen - 1280x800"
                        src={addressValue}
                        ></iframe>
            </div>
        </div>
    )
}


function App(props: ComponentProps<any>) {
    return (
        <div style={styles.container}>
            <div style={styles.mainContainer}>
                <RenderDesktopBrowser/>
            </div>
            <div style={{...styles.sidebar, ...styles.paddingContainer }}>
                <div style={{height: 300, overflowY: "hidden"}}>
                    <div style={styles.sectionHeading}>Steps</div>
                    <RenderSteps/>
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
        height: "100%"
    },
    mainContainer: {
        width: "75%"
    },
    sidebar: {
        flex: 1,
        background: "#141528",
        display: "flex",
        flexDirection: "column"
    },
    centerItemsVerticalFlex: {
        display: "flex",
        alignItems: "center"
    },
    sectionHeading: {
        fontFamily: "DM Sans",
        fontSize: "0.9rem",
        fontWeight: 700,
        marginBottom: "1.25rem",
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
        padding: "0.6rem 0"
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
        fontSize: "0.6rem"
    },
    stepGoImage: {
        paddingRight: "0.75rem"
    },
    browser: {
        background: "rgb(40, 40, 40)",
        height: "100vh",
        overflow:"hidden"
    },
    browserToolbar: {
        display: "flex",
        flexDirection: "column"
    },
    browserSmallShadow: {
        background: "rgb(48, 48, 62)",
        height: "0.8rem"
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
    previewBrowser:{
        flex: 1,
        height: "100%",
        display: "flex",
        justifyContent: "center",
        paddingTop: '3rem',
        overflowY: "scroll",
        background: "rgb(40, 40, 40)"
    },
    browserFrame: {
        border: "none",
        display: "block",
        borderRadius: 2,
        width: 1280,
        height: 800,
        backgroundColor: "#fff"
    }
}

export default App;