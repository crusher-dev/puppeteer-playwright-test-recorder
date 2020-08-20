import {Component} from 'preact';
import React from 'preact/compat';
import {loadScript} from "../../utils/helpers";
import Tab = chrome.tabs.Tab;
import Select from 'react-select';
import devices from "../../constants/devices";

class App extends Component<any, any> {
    constructor(props: any) {
        super(props);

        this.handleStartRecordingClick = this.handleStartRecordingClick.bind(this);
        this.state = {
            selectedDevice: devices[7].id
        }
    }

    async injectRecorder() {
        const {tabId} = this.props;

        // @ts-ignore
        await loadScript('inject', tabId);
        window.close();
    }

    async componentDidMount() {
    }

    renderSteps() {
        return (
            <>
                <div id="icon" class="center-aligned" style={{
                    background: `url(${chrome.runtime.getURL("icons/crusher.svg")})`,
                    width: 98,
                    height: 79
                }}></div>
                <span class="small_heading">How to create test?</span>
                <ol id="steps" class="numbered-list">
                    <li>Press start Recording.</li>
                    <li>Basic actions are supported by default. For extensive actions, click on plus sign.</li>
                    <li> * For mobile - Decrease window size</li>
                    <li>On completion, press stop sign.</li>
                </ol>
            </>
        )
    }


    async handleStartRecordingClick() {
        chrome.tabs.get(this.props.tabId, ((tab: any) => {
            const {selectedDevice} = this.state;
            chrome.tabs.create({url: chrome.extension.getURL('create_test.html') + `?url="${encodeURI(tab.url)}"&device=${selectedDevice}`});

            window.close();
        }).bind(this));

    }

    renderDeviceInput() {
        const deviceOptions = devices.map((device) => {
            return (<option value={device.id}>{device.name}</option>)
        });
        const {selectedDevice} = this.state;

        function handleDeviceSelection(event: any){
           const newDeviceId = event.target.value;
           this.setState({selectedDevice: newDeviceId});
        }

        return (
            <div style={styles.selectInputContainer} className="select">
                <select id="slct" size={1} value={selectedDevice} onChange={handleDeviceSelection.bind(this)}>
                    <option selected disabled>Select Device Type</option>
                    {deviceOptions}
                </select>
            </div>
        )
    }

    render() {

        return (
            <div id="container" style={styles.container}>
                <div style={styles.headingBlock}>
                    <div style={styles.heading}>Record your test</div>
                    <img style={{cursor: "pointer"}} src={chrome.runtime.getURL("icons/settings.svg")}/>
                </div>
                <div style={styles.paddingContainer}>
                    {this.renderDeviceInput()}
                    <div style={styles.button} onClick={this.handleStartRecordingClick}>
                        Start Recording
                    </div>
                    <div style={styles.watchBlock}>
                        <img src={chrome.runtime.getURL("icons/play.svg")}/>
                        <div style={styles.watchText}>Watch : How to record test</div>
                    </div>
                    <div style={styles.smallButton}>
                        Get help
                    </div>
                </div>
                <link rel="stylesheet" href={chrome.runtime.getURL("/styles/popup.css")}/>
                <link rel="stylesheet" href={chrome.runtime.getURL("/styles/fonts.css")}/>
                <style>
                    {
                        `
                        html, body{
                            padding:0;
                            margin:0;
                            min-height: 300px;
                            max-height: 300px;
                        }
                        `
                    }
                </style>
            </div>
        );
    }
}

const styles = {
    container: {
        background: "#141427",
        color: "#FFFFFF",
        width: 340,
        padding: 0
    },
    paddingContainer: {
        padding: "0rem 1.25rem"
    },
    headingBlock: {
        display: "flex",
        padding: "1rem 1.25rem"
    },
    heading: {
        fontFamily: "DM Sans",
        fontSize: "1rem",
        fontWeight: 700,
        marginRight: "auto"
    },
    selectInputContainer: {
        borderRadius: "0.2rem",
        marginTop: "1rem",
        width: "100%",
        fontWeight: 500,
        fontFamily: "DM Sans",
        color: "#fff",
        fontSize: "0.9rem",
        borderWidth: 0,
    },
    button: {
        background: "#5B76F7",
        border: "1px solid #5B76F7",
        padding: "0.7rem 0.9rem",
        color: "#fff",
        fontSize: "0.9rem",
        cursor: "pointer",
        fontWeight: 700,
        fontFamily: "DM Sans",
        marginTop: "2rem",
        textAlign: "center",
        borderRadius: "0.2rem"
    },
    watchBlock: {
        display: "flex",
        width: "auto",
        margin: "0 auto",
        marginTop: "1.75rem",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer"
    },
    watchText: {
        marginLeft: "1.1rem",
        fontFamily: "DM Sans",
        fontWeight: 600,
        fontSize: "0.9rem",
        color: "#fff"
    },
    smallButton: {
        background: "#04040E",
        display: "inline-block",
        position: "relative",
        left: "50%",
        transform: "translateX(-50%)",
        borderRadius: "0.2rem",
        fontWeight: 500,
        fontFamily: "DM Sans",
        fontSize: "0.84rem",
        color: "#fff",
        padding: "0.5rem 2.7rem",
        cursor: "pointer",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "2rem",
        marginBottom: "1.75rem",
        width: "auto"
    }
}

export default App;
