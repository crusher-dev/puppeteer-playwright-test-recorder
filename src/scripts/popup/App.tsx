import { h, Component } from 'preact';
import React from 'preact/compat';
import {Chrome} from "../../utils/types";
import {loadScript} from "../../utils/helpers";
import {sendMessageToBackground, sendMessageToPage} from "../../utils/messageUtil";
import {GET_EVENTS, STOP_RECORDING, DELETE_RECORDING_SESSION} from "../../constants";
import CodeGenerator from "../code-generator";

class App extends Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    handleIncomingMessagesFromBackground(request: any, sender: any, sendResponse: any){

    }

    startRecorder(){
        return new Promise ((resolve, reject)=> {
            Chrome.tabs.query({ active: true, currentWindow: true }, async (tabs: any) => {
                // @ts-ignore
                await loadScript('inject', tabs[0].id);
                resolve(true);

            });
        });
    }

    componentDidMount(){
        const {tabId, isSessionGoingOn} = this.props;

            sendMessageToBackground({type: GET_EVENTS, payload: {tabId: tabId}}, async (events: any)=>{
                if(!isSessionGoingOn) {
                    await this.startRecorder();
                }
                if(!events || events.length === 0){
                    return window.close();
                }
                this.setState({events: events});
                console.log(events);
            });
    }

    showEvents(){
        const {events} = this.state;
        if(!events){
            return null;
        }
        return events.map((event: any) => {
            const {event_type, selector, value} = event;
            return (
                <div class="event_item">
                    <span style={{fontWeight: "bold"}}>{event_type} -> </span>
                    {selector && (
                        <span style={{fontWeight: "normal"}}>{selector}</span>
                    )}
                    {value &&  (
                        <span style={{fontWeight: "italic"}}>{value}</span>
                    )}
                </div>
            )
        });
    }

    stopRecorder(){
        const {tabId} = this.props;
        try {
            sendMessageToPage({type: STOP_RECORDING});
        } catch(err){}
        Chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
            sendMessageToBackground({type: DELETE_RECORDING_SESSION, payload: {tabId: tabs[0].id}});
        });
    }

    renderPlayWrightCode(){
        this.stopRecorder();
        const _generator = new CodeGenerator({});
        const code = _generator.generate(this.state.events);
        alert("Here's your code, " + code);
        window.close();
    }

    render() {
        const {events} = this.state;

        return (
            <div id="popup-header" style={{width: 270, height: 300}}>
                {this.showEvents()}
                {events && events.length && (
                    <button onClick={this.renderPlayWrightCode.bind(this)} style={{marginTop: 14}}>Get your code</button>
                )}
            </div>
        );
    }
}

export default App;
