// @ts-nocheck
import domEvents from './dom-events-to-record'
import pptrActions from './pptr-actions'
import Block from './Block'
import {
    ASSERT_TEXT,
    CLICK, EXTRACT_INFO,
    HOVER,
    INPUT,
    NAVIGATE_URL,
    PAGE_SCREENSHOT,
    SCREENSHOT,
    SCROLL_TO_VIEW
} from "../constants/DOMEventsToRecord";

const importPlayWright = `const playwright = require('playwright');\n\n`

const header = `const browser = await playwright["chrome"].launch();
const page = await context.newPage();\n`

const footer = `await browser.close();\n`

const wrappedHeader = `(async () => {
  const browser = await playwright["chromium"].launch();
  const page = await browser.newPage();\n`

const wrappedFooter = `  await browser.close()
})()\n`;


const extractInfoUsingScriptFunction = `async function extractInfoUsingScript(page, selector, validationScript){
    const elHandle = await page.$(selector);
    const escapedInnerHTML = (await elHandle.innerHTML())` + '.toString().replace(/\\`/g, "\\\\`").trim()' + `;
    const escapedInnerText = (await elHandle.innerText())` + '.replace(/\\`/g, "\\\\`").trim();' + `;
    
    `+ "const scriptToEvaluate = \`(\` + validationScript + \`)(\` + '\`' + escapedInnerHTML + '\`' + \`, \` + '\`' + \`${escapedInnerText}\` + '\`' + \`)\`" + `;
    const output = eval(scriptToEvaluate);
    
    return output;
}\n\n`;


export default class CodeGenerator {
    helperFunctionsToInclude: any;

    constructor(options) {
        this.helperFunctionsToInclude = {};
    }

    generate(events){
        const generatedEventsCode = this._handleEvents(events);
        return importPlayWright + this.addHelperFunctionsIfAny() + wrappedHeader + generatedEventsCode + wrappedFooter;
    }

    addHelperFunctionsIfAny(){
        const helperFunctions = Object.keys(this.helperFunctionsToInclude);
        let codeToAdd = "";
        for(let fun of helperFunctions){
            if(fun === EXTRACT_INFO){
                codeToAdd+= extractInfoUsingScriptFunction;
            }
        }
        return codeToAdd;
    }

    _handleEvents(events){
        let code = "\n";
        for(let i = 0; i < events.length; i++){
            const {event_type, selector, value} = events[i];
            switch (event_type) {
                case NAVIGATE_URL:
                    code += `  await page.goto('${value}');\n`;
                    break;
                case CLICK:
                    code += `  await page.click('${selector}');\n`;
                    break;
                case HOVER:
                    code += `  await page.hover('${selector}');\n`;
                    break;
                case SCREENSHOT:
                    const screenShotFileName = selector.replace(/[^\w\s]/gi, '').replace(/ /g,"_") + `_${i}`;
                    code += `  const h_${i} =  await page.$('${selector}');\n   h_${i}.screenshot({path: '${screenShotFileName}.png'});\n`
                    break;
                case PAGE_SCREENSHOT:
                    const screenShotFileName = value.replace(/[^\w\s]/gi, '').replace(/ /g,"_") + `_${i}`;
                    code += `  await page.screenshot({path: '${screenShotFileName}.png'});`;
                    break;
                case SCROLL_TO_VIEW:
                    code += `  const stv_${i} =  await page.$('${selector}');\nstv_${i}.scrollIntoViewIfNeeded();\n`
                    break;
                case INPUT:
                    code += `  await page.type('${selector}', '${value}');\n`;
                    break;
                case EXTRACT_INFO:
                    const variable_name = Object.keys(value)[0];
                    const validation_script = value[variable_name];
                    this.helperFunctionsToInclude[EXTRACT_INFO] = true;
                    code += `  let ${variable_name} = await extractInfoUsingScript(page, '${selector}', ` + '`' + validation_script + '`' + `)\n`;
                    break;
                case ASSERT_TEXT:
                    this.helperFunctionsToInclude[ASSERT_TEXT] = true;
                    ode += ` `
                default:
                    console.error("Not supported event");
            }

        }
        return code;
    }
}
