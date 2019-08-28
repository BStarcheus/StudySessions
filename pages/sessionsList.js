chrome.storage.sync.get("sessionsList", function(result) {
    if (result.sessionsList.length < 1) {
        //No sessions exist yet
        var message = document.createElement("div");
        message.innerText = "No sessions";
        message.style = "font-size:16px;text-align:center;";
        document.body.appendChild(message);
    } else {
        //Sessions exist. Create a table listing all names and dates.
        //Click on name or date to open a details page.
        //Click on resume to make the session active.
        var table = document.createElement("table");
        var thead = document.createElement("thead");
        var tr = document.createElement("tr");
        var th1 = document.createElement("th");
        th1.innerText = "Session Name";
        var th2 = document.createElement("th");
        th2.innerText = "Date Last Modified";
        var th3 = document.createElement("th");
        tr.appendChild(th1);
        tr.appendChild(th2);
        tr.appendChild(th3);
        thead.appendChild(tr);
        table.appendChild(thead);
        var tbody = document.createElement("tbody");

        //Fill the rows of the table with data.
        for (var i = 0; i < result.sessionsList.length; i++) {
            var tr = document.createElement("tr");
            var name = document.createElement("td");
            name.className = "name";
            var dlm = document.createElement("td");
            dlm.className = "dlm";
            var resume = document.createElement("td");
            resume.className = "resume";

            name.innerText = result.sessionsList[i].name;
            dlm.innerText = Date(result.sessionsList[i].dateLastModified).toString().substring(0,15);
            resume.innerHTML = 'Resume Session<img src="'+ chrome.runtime.getURL("/imgs/resume.png") + '" alt="Resume Session">';

            tr.appendChild(name);
            tr.appendChild(dlm);
            tr.appendChild(resume);
            tbody.appendChild(tr);
        }
        table.addEventListener('click', function(event) {
            //If the table is clicked, determine which type of cell was clicked

            var td = event.target;
            while (td !== this && !td.matches("td")) {
                td = td.parentNode;
            }
            if (td === this) {
                console.log("No table cell found");
            } else {

            //If it is the name element, set viewedSession to the name
                if (td.className === "name") {
                    chrome.storage.sync.set({viewedSession: td.innerText});
                    window.open('/pages/session.html', '_self');
                }
            //If it is not the name element, get the name
                else if (td.className === "dlm" || td.className === "resume") {
                    var tdName = td;
                    while (tdName !== this && !tdName.matches("tr")) {
                        tdName = tdName.parentNode;
                    }
                    if (tdName === this) {
                        console.log("No row element found");
                    } else if (tdName.firstElementChild.className === "name") {
                        tdName = tdName.firstElementChild;
            //If it is dateLastModified element, set viewedSession to
            //the name, and open the session page
                        if (td.className === "dlm") {
                            chrome.storage.sync.set({viewedSession: tdName.innerText});
                            window.open('/pages/session.html', '_self');
                        }
            //If it is the resume element, set activeSession to name
                        else if (td.className === "resume") {
                            console.log("Resuming" + tdName.innerText);
                            chrome.storage.sync.set({activeSession: tdName.innerText});
                        }
                    } else {
                        console.log("No name element found");
                    }
                } else {
                    console.log("Unknown table cell");
                }
            }
        });

        table.appendChild(tbody);
        document.body.appendChild(table);
    }
});


//The New button creates a new session and sets it to active.
var newButton = document.getElementById("new");
newButton.addEventListener('click', function() {
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
        var prev = document.getElementById("dialog1");
        if (prev) {
            prev.parentNode.removeChild(prev);
        }
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
                chrome.storage.sync.set({sessionsList: newList});

                //Setup an empty array of notes for this session
                var newObj = {};
                newObj[textInput.value] = [];
                chrome.storage.sync.set(newObj);
                dialog.close();
                window.location.reload();
                //Reload the page to show the new session.
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
});

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
};
