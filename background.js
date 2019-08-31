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
            //Activate in all current tabs
            firstTimeActivate();
            //Activate in all future documents
            chrome.tabs.onUpdated.addListener(activateSession);
        } else if (changes["activeSession"].oldValue && changes["activeSession"].newValue == null) {
            chrome.tabs.onUpdated.removeListener(activateSession);
            //Deactivate in all current tabs
            deactivateSession();
        } else {
            console.log("Extension just installed, or invalid change to activeSession.");
        }
    }
});

var firstTimeActivate = function() {
    //Activate on all open tabs
    chrome.tabs.query({}, function (result) {
        for (var i = 0; i < result.length; i++) {
            chrome.tabs.executeScript(result[i].id, {
                file: 'activate.js'
            });
        }
    });
};

var activateSession = function(tabId, changeInfo, tab) {
    //Activate on page load. Only run once per load of a page.
    if (changeInfo && tab && changeInfo.status === "complete" && tab.status === "complete") {
        chrome.tabs.executeScript({
            file: 'activate.js'
        });
    }
};

var deactivateSession = function() {
    //Deactivate in all open tabs
    chrome.tabs.query({}, function (result) {
        for (var i = 0; i < result.length; i++) {
            chrome.tabs.executeScript(result[i].id, {
                code: "document.removeEventListener('mouseup', newButton);"
                 + "document.removeEventListener('mousedown', removeButton);"
                 + "var pastButton = document.getElementById('newButton');"
                 + "pastButton.parentNode.removeChild(pastButton);"
            });
        }
    });
};
