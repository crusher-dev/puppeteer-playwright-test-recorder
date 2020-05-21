import RecordingOverlay from "./recordingOverlay";
import {setAttributeForAllChildNodes} from "../../../utils/dom";
import {EXTRACT_INFO} from "../../../constants/DOMEventsToRecord";
import EventsController from "../EventsController";
// import CodeMirror from "codemirror";
import {DEFAULT_VALIDATION_SCRIPT} from "../../../constants";
export default class FormWizard{
    recordingOverlay: RecordingOverlay;
    actionType: string;
    eventsController: EventsController;

    _modalHeading: any;
    _modalContentContainer: any;
    _extract_event_form: any;
    _validationScriptTextArea: any;
    _validationScript: any;
    _extractedInfoPreview: any;
    _extractVariableName: any;
    _submitExtractForm: any;


    private state: any = {
        isInvalidScript: false
    };

    constructor(recordingOverlay: RecordingOverlay, eventsController: EventsController) {
        this.recordingOverlay = recordingOverlay;
        this.eventsController = eventsController;
        this.evaluateValidationScript = this.evaluateValidationScript.bind(this);
        this.handleSaveExtractForm = this.handleSaveExtractForm.bind(this);
    }

    initNodes(){
        this._modalHeading = document.querySelector(".overlay_heading_container .overlay_heading");
        this._modalContentContainer = document.querySelector(".overlay_modal_content");
        this._extract_event_form = document.querySelector("#extract_event_form");
        this._validationScriptTextArea = document.querySelector("#validation_script");
        this._validationScript = document.querySelector("#extract_event_form #validation_script");
        this._extractedInfoPreview = document.querySelector("#extract_event_form #extracted_info_preview");
        this._extractVariableName = document.querySelector("#extract_variable_name");
        this._submitExtractForm = document.querySelector("#submit_extract_form");
    }

    evaluateValidationScript(){
        try {
            const {targetElement} = this.recordingOverlay.getState();
            const escapedHTML = targetElement.innerHTML.toString().replace(/\`/g, "\\`").trim();
            const escapedText = targetElement.innerText.replace(/\`/g, "\\`").trim();
            const script = `(` + this._validationScript.value + `)(` + '`' + escapedHTML + '`' + `, ` + '`' + `${escapedText}` + '`' + `)`;
            const output = eval(script);
            this._extractedInfoPreview.value = output;
            this._extractedInfoPreview.style = "";
            this._validationScriptTextArea.style = "";
            this.state.invalid = false;
        } catch {
            this._extractedInfoPreview.style = "border: 1px solid red;"
            this._validationScriptTextArea.style = "border: 1px solid red;";
            this.state.invalid = true;
        }
    }

    handleSaveExtractForm(){
        const variableName = this._extractVariableName.value;
        const scriptContent = this._validationScript.value;
        const {isInvalidScript} = this.state;
        const {targetElement} = this.recordingOverlay.getState();

        if(!isInvalidScript && variableName && scriptContent){
            const payload = {
                  [variableName]: scriptContent
            };
           this.eventsController.saveCapturedEventInBackground(EXTRACT_INFO, targetElement, payload);
           this.recordingOverlay.toggleEventsBox();
        } else {
            console.log(isInvalidScript, variableName, scriptContent);
        }
    }

    initEventListener(){
        this._validationScript.addEventListener("keyup", this.evaluateValidationScript);
        this._submitExtractForm.addEventListener("click", this.handleSaveExtractForm);
    }

    resetExtractFields(){
        this._extractVariableName.value = "";
        this._validationScript.value = DEFAULT_VALIDATION_SCRIPT;
        this._extractedInfoPreview.value = "";
    }

    renderForm(){
        switch(this.actionType){
            case EXTRACT_INFO:
                this.resetExtractFields();
                this._modalHeading.innerHTML = "Extract Info Form";
                this._extract_event_form.removeAttribute("data-gone");
                this.evaluateValidationScript();
                break;
        }
    }

    boot(actionType: string){
        console.debug("Form wizard booted up");

        this.initNodes();
        this.initEventListener();


        this.actionType = actionType;
        // Hide all forms and show the event form
        setAttributeForAllChildNodes(this._modalContentContainer, "data-gone", "true");

        this.renderForm();

    }

}
