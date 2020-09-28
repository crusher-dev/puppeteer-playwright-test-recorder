import {finder} from "@medv/finder";

const uniqueSelector = require('unique-selector');

function getXpathTo(element: any) : any {
    if (element.id!=='')
        return 'id("'+element.id+'")';
    if (element===document.body)
        return element.tagName;

    let ix = 0;
    const siblings = element.parentNode.childNodes;
    for (let i= 0; i<siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling===element)
            return getXpathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
        if (sibling.nodeType===1 && sibling.tagName===element.tagName)
            ix++;
    }
}



function getFinderSelector(elementNode: HTMLElement) {
    const optimizedMinLength = (elementNode.getAttribute("id")) ? 2 : 10 // if the target has an id, use that instead of multiple frames selectors
    // @ts-ignore
    return finder(elementNode, {seedMinLength: 5, optimizedMinLength: optimizedMinLength});
}

export function getSelectors(elementNode: HTMLElement){
    return [getFinderSelector(elementNode), uniqueSelector.default(elementNode), getXpathTo(elementNode)];
}
