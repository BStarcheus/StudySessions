chrome.storage.sync.get("activeSession", function(result) {
    if (result.activeSession) {
        //If there is an active session, show the name,
        //and show the stop button.
        var currentSession = document.createElement("div");
        currentSession.innerText = result.activeSession;
        document.body.appendChild(currentSession);

        var stopButton = document.createElement("button");
        stopButton.innerText = "Stop Session";
        stopButton.id = "stopButton";
        stopButton.className = "popupButton";
        stopButton.addEventListener('click', function() {
            chrome.storage.sync.set({activeSession: null});
            window.location.reload();
        });
        document.body.appendChild(stopButton);
    } else {
        //If there is no active session, show the new button.
        var newButton = document.createElement("button");
        newButton.innerText = "New Session";
        newButton.id = "newSession";
        newButton.className = "popupButton";
        newButton.addEventListener('click', newInput);
        document.body.appendChild(newButton);

        //Show the resume button only if there is at least one existing session.
        var resumeButton = document.createElement("button");
        resumeButton.innerText = "Resume Last Session";
        resumeButton.id = "resumeSession";
        resumeButton.className = "popupButton";
        resumeButton.addEventListener('click', function() {
            chrome.storage.sync.get("sessionsList", function(result) {
                chrome.storage.sync.set({activeSession: result.sessionsList[0].name});
                window.location.reload();
            });
        });
        chrome.storage.sync.get("sessionsList", function(result) {
            if (result.sessionsList.length > 0) {
                document.body.appendChild(resumeButton);
            }
        });
    }
});


//Open the Sessions List page from the viewSessions button
let viewSessions = document.getElementById('viewSessions');
viewSessions.onclick = function() {
    window.open('/pages/sessionsList.html', '_blank');
};


//The New button creates a new session and sets it to active.
var newInput = function() {
    //Show a dialog box to get input of session name.
    var dialog = document.createElement("dialog");
    dialog.id = "dialog1";

    var label = document.createElement("label");
    label.innerText = "Enter your new session name: ";

    var textInput = document.createElement("input");
    textInput.type = "text";
    textInput.name = "newSessionName";
    textInput.required = true;

    var buttons = document.createElement("div");
    var cancelButton = document.createElement("button");
    cancelButton.className = "formButton";
    cancelButton.innerText = "Cancel";
    cancelButton.value = "cancel";
    cancelButton.addEventListener('click', function(event) {
        dialog.close();
    });

    var submitButton = document.createElement("button");
    submitButton.className = "formButton";
    submitButton.innerText = "Create";
    submitButton.value = "default";
    submitButton.addEventListener('click', function(event) {
        //Remove previous error
        var prev = document.getElementById("validation");
        if (prev) {
            prev.parentNode.removeChild(prev);
        }

        //Validate if the name is not empty, and it does not exist already in storage.
        if (textInput.value.length < 1) {
            validateErrors("Must enter a session name.");
        } else {
            chrome.storage.sync.get("sessionsList", function(result) {
                for (var i = 0; i < result.sessionsList.length; i++) {
                    if (result.sessionsList[i].name === textInput.value) {
                        validateErrors("There is already a session named " + textInput.value + '.');
                        return;
                    }
                }
                //Put the new session at the beginning of the list and make it active.
                chrome.storage.sync.set({activeSession: textInput.value});
                var newList = result.sessionsList;
                newList.unshift({
                    name: textInput.value,
                    dateLastModified: new Date()
                });
                chrome.storage.sync.set({
                    sessionsList: newList
                });
                dialog.close();
                window.location.reload();
                //Reload the popup to show the new session.
            });
        }
    });
    dialog.appendChild(label);
    dialog.appendChild(textInput);
    buttons.appendChild(cancelButton);
    buttons.appendChild(submitButton);
    dialog.appendChild(buttons);
    document.body.appendChild(dialog);
    dialog.showModal();
};


//Display validation errors on dialog box
function validateErrors(err) {
    if (err) {
        var d = document.getElementById("dialog1");
        var validation = document.createElement("div");
        validation.id = "validation";
        validation.style = "color:red;";
        validation.innerText = err;
        d.appendChild(validation);
    }
}
