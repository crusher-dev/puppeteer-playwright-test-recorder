import { h, Component } from 'preact';
import React from 'preact/compat';
import {Chrome} from "../../utils/types";
import {changeExtensionIcon, loadScript} from "../../utils/helpers";
import {getEventsList, sendMessageToBackground, sendMessageToPage} from "../../utils/messageUtil";
import {STOP_RECORDING, DELETE_RECORDING_SESSION, GET_CODE} from "../../constants";
import CodeGenerator from "../code-generator";

class App extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.handleStartRecordingClick = this.handleStartRecordingClick.bind(this);
        this.handleExportTestsClick = this.handleExportTestsClick.bind(this);
    }

    async injectRecorder(){
        const {tabId} = this.props;
        // @ts-ignore
        await loadScript('inject', tabId);
        window.close();
    }

    getEventsList(){
        const {tabId} = this.props;
        return getEventsList(tabId).then(async events => {
            this.setState({events: events});
        });
    }

    async componentDidMount() {
        const {tabId, isSessionGoingOn} = this.props;

        if (isSessionGoingOn) {
            await this.getEventsList();
        }
    }

    renderEventsList(){
        const {events} = this.state;
        if(!events){
            return null;
        }
        return (
            <ol id="events_list">
            { events.map((event: any) => {
            const {event_type, selector, value} = event;
            return (
                <li>
                    <div class="event_item">
                        <div class="event_action">{event_type}  {selector && value ? `("${selector}")` : null}</div>
                        <div class="event_action_or_value">{selector && value ? value : selector}</div>
                    </div>
                </li>
                )
                })}
            </ol>
        );
    }

    stopRecorder(){
        const {tabId} = this.props;
        sendMessageToPage({type: STOP_RECORDING});
        sendMessageToBackground({type: DELETE_RECORDING_SESSION, payload: {tabId: tabId}});
    }

    getPlayWrightCode(){
        const {events} = this.state;
        this.stopRecorder();
        sendMessageToPage({type: GET_CODE, events});
    }

    renderSteps(){
        return (
            <>
                <div id="icon" class="center-aligned" style={{background: `url(${Chrome.runtime.getURL("icons/crusher.svg")})`, width: 98, height: 79}}></div>
                <span class="small_heading">Steps to use</span>
                <ol id="steps" class="numbered-list">
                    <li>Press start Recording.</li>
                    <li>Basic actions are supported by default. For extensive actions, click on plus sign over element.</li>
                    <li>On completion, save and use the code on our service or export.</li>
                </ol>
            </>
        )
    }

    async handleStartRecordingClick(){
        await this.injectRecorder();
        window.close();
    }

    handleExportTestsClick(){
        this.stopRecorder();
        this.getPlayWrightCode();
        window.close();
    }

    render() {
        const {isSessionGoingOn} = this.props;
        const {events} = this.state;

        return (
            <div id="container">
                <div id="header">Crusher Test Recorder</div>
                <div class="content" style={{padding: isSessionGoingOn ? 0 : 18}}>
                    {!isSessionGoingOn && this.renderSteps()}
                    {isSessionGoingOn && this.renderEventsList()}
                </div>
                <div id="footer">
                    {!isSessionGoingOn && (<button class="right-aligned button" onClick={this.handleStartRecordingClick}>Start Recording</button>)}
                    {isSessionGoingOn && (<button class="right-aligned button" onClick={this.handleExportTestsClick}>Export Tests</button>)}
                </div>
                <link rel="stylesheet" href={Chrome.runtime.getURL("/styles/popup.css")}/>
            </div>
        );
    }
}

export default App;
