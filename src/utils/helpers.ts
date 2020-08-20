const url = require('url');

export function loadScript(name: string, tabId: any, cb: any) {
    return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV === 'production') {
            chrome.tabs.executeScript(tabId, { file: `/js/${name}.js`, runAt: 'document_end' }, function () {
                resolve(true);
                if(cb) {
                    cb();
                }
            });
        } else {
            // dev: async fetch bundle
            fetch(`http://localhost:2400/js/${name}.js`)
                .then((res) => res.text())
                .then((fetchRes) => {
                    chrome.tabs.executeScript(tabId, { code: fetchRes, runAt: 'document_end' }, function(){
                        resolve(true);
                        if(cb) {
                            cb();
                        }
                    });
                });
        }
    });
}

export function loadAssetScript(path: string, tabId: any){
    return new Promise((resolve, reject)=> {
        chrome.tabs.executeScript(null, { file: "codemirror.js" }, function() {
            resolve(true);
        });
    });
}

export function getHTMLContentOfTemplate(template: string, cb:any) {
    fetch(chrome.runtime.getURL(`${template}.html`))
        .then((res) => res.text())
        .then((res) => { if(cb) { cb(res);} });
}

export function getActiveTabId() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs: any) => {
            resolve(tabs[0].id);
        });
    });
}

export function sendPostDataWithForm(url: string, options: any = {}){
    const form = document.createElement('form');
    form.method = "post";
    form.action = url;
    form.target = "_blank";
    const optionKeys = Object.keys(options);
    for(let optionKey of optionKeys){
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = optionKey;
        hiddenField.value = options[optionKey];

        form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
    form.remove();
}

export function changeExtensionIcon(icon: string){
    chrome.browserAction.setIcon({path:icon});
}

export function getSentenceCaseString(str: string){
    return str[0].toUpperCase()+str.slice(1).toLowerCase();
}

export function resolveToFrontendUrl(path: string){
    return url.resolve("https://crusher-test.com", path);
}

export function createNewTab(path: string){
    return new Promise((resolve, reject)=>{
        chrome.browserAction.onClicked.addListener(function(activeTab: any){
            chrome.tabs.create({ url: path });
            resolve(true);
        });
    });
}