// @ts-nocheck
import domEvents from './dom-events-to-record'
import pptrActions from './pptr-actions'
import Block from './Block'
import {CLICK, NAVIGATE_URL} from "../constants/DOMEventsToRecord";

const importPlayWright = `const playwright = require('playwright');\n`

const header = `const browser = await playwright["chrome"].launch();
const page = await context.newPage();`

const footer = `await browser.close()`

const wrappedHeader = `(async () => {
  const browser = await playwright["chrome"].launch();
  const page = await browser.newPage()\n`

const wrappedFooter = `  await browser.close()
})()`


export default class CodeGenerator {
    constructor(options) {

    }

    generate(events){
        return importPlayWright + wrappedHeader + this._handleEvents(events) + wrappedFooter;
    }

    _handleEvents(events){
        let code = "\n";
        for(let i = 0; i < events.length; i++){
            const {event_type, selector, value} = events[i];
            switch (event_type) {
                case NAVIGATE_URL:
                    code += `await page.goto('${value}');\n`;
                    break;
                case CLICK:
                    code += `await page.click('${selector}');\n`;
                    break;
                default:
                    console.error("Not supported event");
            }

        }
        return code;
    }
}
