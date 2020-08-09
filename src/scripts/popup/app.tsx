import { Component } from 'preact';
import React from 'preact/compat';
import {Chrome} from "../../interfaces/GlobalInterface";
import {loadScript} from "../../utils/helpers";

class App extends Component<any, any> {
    constructor(props: any) {
        super(props);

        this.handleStartRecordingClick = this.handleStartRecordingClick.bind(this);
    }

    async injectRecorder(){
        const {tabId} = this.props;

        // @ts-ignore
        await loadScript('inject', tabId);
        window.close();
    }

    async componentDidMount() {
    }

    renderSteps(){
        return (
            <>
                <div id="icon" class="center-aligned" style={{background: `url(${Chrome.runtime.getURL("icons/crusher.svg")})`, width: 98, height: 79}}></div>
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

    async handleStartRecordingClick(){
        Chrome.tabs.create({ url: Chrome.extension.getURL('create_test.html') });

        window.close();
    }


    render() {

        return (
            <div id="container">
                <div id="header">Crusher Test Recorder</div>
                <div class="content" style={{padding: 18}}>
                    {this.renderSteps()}
                </div>
                <div id="footer">
                    <button class="right-aligned button" onClick={this.handleStartRecordingClick}>Start Recording</button>
                </div>
                <link rel="stylesheet" href={Chrome.runtime.getURL("/styles/popup.css")}/>
            </div>
        );
    }
}

export default App;
