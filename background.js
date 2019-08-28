chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.get(null, function(items) {
        //Initialize storage
        if (items.sessionsList) {
            //Don't delete existing sessions.
            //This can run on update or reinstall.
        } else {
            chrome.storage.sync.set({sessionsList: []});
        }
        chrome.storage.sync.set({activeSession: null});
    });
});

//When storage is changed, activate or deactiveate a session.
//This adds or removes listeners for highlighting text
chrome.storage.onChanged.addListener(function(changes, areaName) {
    if (changes["activeSession"]) {
        if (changes["activeSession"].oldValue == null && changes["activeSession"].newValue) {
            activateSession();
            chrome.tabs.onUpdated.addListener(activateSession);
        } else if (changes["activeSession"].oldValue && changes["activeSession"].newValue == null) {
            chrome.tabs.onUpdated.removeListener(activateSession);
            deactivateSession();
        } else {
            console.log("Extension just installed, or invalid change to activeSession.");
        }
    }
});

var activateSession = function() {
    chrome.tabs.executeScript({
        file: 'activate.js'
    });
};
var deactivateSession = function() {
    chrome.tabs.executeScript({
        code: "document.removeEventListener('pointerup', newButton);"
         + "document.removeEventListener('pointerdown', removeButton);"
    });
};
