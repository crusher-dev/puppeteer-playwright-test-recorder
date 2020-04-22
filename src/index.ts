 class Index {
    constructor(){
        console.log("My name is")
    }

    static getColor(){
        return 'red'
    }
}

 // @ts-ignore
 chrome.browserAction.onClicked.addListener(function(tab:any) {
     // No tabs or host permissions needed!
     console.log('Turning 1' + tab.url + ' red!');
     // @ts-ignore
     chrome.tabs.executeScript({
         code: `document.body.style.backgroundColor="${ Index.getColor()}"`
     });


 });

module .exports = {
    Index
}


