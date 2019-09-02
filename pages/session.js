chrome.storage.sync.get("viewedSession", function(r) {
    var session = r.viewedSession;

    //Set the page title to the session name
    document.title = session;
    document.getElementById("titleh1").innerText = session;

    chrome.storage.sync.get(session, function(result) {

        if (result[session].length < 1) {
            //No notes exist yet
            var message = document.createElement("div");
            message.innerText = "No notes";
            message.style = "font-size:16px;text-align:center;padding:40px;";
            document.getElementById("pageContain").appendChild(message);
        } else {
            //Notes exist. Create a table listing all text and urls.

            var table = document.createElement("table");
            var thead = document.createElement("thead");
            var tr = document.createElement("tr");
            var th1 = document.createElement("th");
            var th2 = document.createElement("th");
            th2.innerText = "Note Text";
            var th3 = document.createElement("th");
            th3.innerText = "Website";
            var th4 = document.createElement("th");
            tr.appendChild(th1);
            tr.appendChild(th2);
            tr.appendChild(th3);
            tr.appendChild(th4);
            thead.appendChild(tr);
            table.appendChild(thead);
            var tbody = document.createElement("tbody");

            //Fill the rows of the table with data.
            for (var i = 0; i < result[session].length; i++) {
                var tr = document.createElement("tr");

                var tableRowId = document.createElement("td");
                tableRowId.className = "tableRowId";
                tableRowId.innerText = i + 1;
                tr.appendChild(tableRowId);

                var textData = document.createElement("td");
                textData.className = "textData";
                textData.innerText = result[session][i].text;
                tr.appendChild(textData);

                var urlData = document.createElement("td");
                urlData.className = "urlData";
                urlData.innerHTML = "<a href='" + result[session][i].url + "' target='_blank'>" + result[session][i].url + "</a>";
                tr.appendChild(urlData);

                //Trash button
                var trash = document.createElement("td");
                trash.className = "delete";
                trash.innerHTML = '<img src="'+ chrome.runtime.getURL("/imgs/trash.png") + '" alt="Delete Note">';
                trash.addEventListener('click', function(event) {
                    var tdId = event.target;
                    while (!tdId.matches("table") && !tdId.matches("tr")) {
                        tdId = tdId.parentNode;
                    }

                    if (tdId.matches("table")) {
                        console.log("No row element found");
                    } else {
                        tdId = tdId.firstElementChild;

                        //Show a dialog box to confirm the delete.
                        var dialog = document.createElement("dialog");
                        dialog.id = "dialog1";

                        var label = document.createElement("label");
                        label.innerText = "Delete this note?";

                        var buttons = document.createElement("div");
                        var noButton = document.createElement("button");
                        noButton.className = "formButton";
                        noButton.innerText = "No";
                        noButton.value = "cancel";
                        noButton.addEventListener('click', function(event) {
                            dialog.close();
                            var prev = document.getElementById("dialog1");
                            if (prev) {
                                prev.parentNode.removeChild(prev);
                            }
                        });

                        var yesButton = document.createElement("button");
                        yesButton.className = "formButton";
                        yesButton.innerText = "Yes";
                        yesButton.value = "default";
                        yesButton.addEventListener('click', function(event) {
                            var newList = result[session];
                            newList.splice(parseInt(tdId.innerText) - 1, 1);

                            //Update notes for this session
                            var newObj = {};
                            newObj[session] = newList;
                            chrome.storage.sync.set(newObj);

                            //Update date last modified in sessionsList and move it to the beginning of list
                            chrome.storage.sync.get("sessionsList", function(resultDate) {
                                var newList2 = resultDate.sessionsList;
                                for (var i = 0; i < newList2.length; i++) {
                                    if (newList2[i].name === session) {
                                        newList2.splice(i, 1);
                                        break;
                                    }
                                }
                                newList2.unshift({
                                    name: session,
                                    dateLastModified: new Date()
                                });
                                chrome.storage.sync.set({sessionsList: newList2});
                            });

                            dialog.close();
                            window.location.reload();
                            //Reload the page to show the changes.
                        });
                        dialog.appendChild(label);
                        buttons.appendChild(noButton);
                        buttons.appendChild(yesButton);
                        dialog.appendChild(buttons);
                        document.body.appendChild(dialog);
                        dialog.showModal();
                    }
                });
                tr.appendChild(trash);
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            document.getElementById("pageContain").appendChild(table);
        }
    });
});


//The back button links back to the sessions page
var backButton = document.getElementById("back");
backButton.addEventListener('click', function() {
    window.open('/pages/sessionsList.html', '_self');
});

//The rename button allows users to rename the session
var renameButton = document.getElementById("rename");
renameButton.addEventListener('click', function() {
    //Show a dialog box to get input of session name.
    var dialog2 = document.createElement("dialog");
    dialog2.id = "dialog2";

    var label2 = document.createElement("label");
    label2.innerText = "Rename your session: ";

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
        dialog2.close();
        var prev = document.getElementById("dialog2");
        if (prev) {
            prev.parentNode.removeChild(prev);
        }
    });

    var submitButton = document.createElement("button");
    submitButton.className = "formButton";
    submitButton.innerText = "Confirm";
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
                //Put the session at the beginning of the sessionsList.
                var newList = result.sessionsList;
                for (var i = 0; i < result.sessionsList.length; i++) {
                    if (result.sessionsList[i].name === document.title) {
                        newList.splice(i, 1);
                    }
                }
                newList.unshift({
                    name: textInput.value,
                    dateLastModified: new Date()
                });
                chrome.storage.sync.set({sessionsList: newList});

                //Rename the list of notes in storage to match the new name.
                chrome.storage.sync.get(document.title, function(newResult) {
                    var newObj = {};
                    newObj[textInput.value] = newResult[document.title];
                    chrome.storage.sync.set(newObj);
                });

                //Remove all past mentions of the old name.
                chrome.storage.sync.set({viewedSession: textInput.value});
                chrome.storage.sync.get("activeSession", function(activeResult) {
                    if (activeResult.activeSession === document.title) {
                        chrome.storage.sync.set({activeSession: textInput.value});
                    }
                });

                dialog2.close();
                window.location.reload();
                //Reload the page to show the new name.
            });
        }
    });
    dialog2.appendChild(label2);
    dialog2.appendChild(textInput);
    buttons.appendChild(cancelButton);
    buttons.appendChild(submitButton);
    dialog2.appendChild(buttons);
    document.body.appendChild(dialog2);
    dialog2.showModal();
});

//The edit button allows users to edit the notes
var editButton = document.getElementById("edit");
editButton.addEventListener('click', function() {
    //Remove the rename and edit buttons
    var rB = document.getElementById("rename");
    rB.parentNode.removeChild(rB);
    var eB = document.getElementById("edit");
    eB.parentNode.removeChild(eB);

    //Add the Save and Cancel buttons
    var cB = document.createElement("button");
    cB.id = "cancel";
    cB.innerText = "Cancel";
    cB.addEventListener('click', function() {
        window.location.reload();
    });
    document.getElementById("header").appendChild(cB);

    var sB = document.createElement("button");
    sB.id = "save";
    sB.innerText = "Save";
    sB.addEventListener('click', function() {
        var newText = document.getElementsByClassName("newTextInputs");
        var newUrls = document.getElementsByClassName("newUrlInputs");

        var newList = [];

        for (var i = 0; i < newText.length; i++) {
            var newElement = {};
            newElement.text = newText[i].value;
            newElement.url = newUrls[i].value;
            newList.push(newElement);
        }

        //Update notes for this session
        var newObj = {};
        newObj[document.title] = newList;
        chrome.storage.sync.set(newObj);

        //Update date last modified in sessionsList and move it to the beginning of list
        chrome.storage.sync.get("sessionsList", function(resultDate) {
            var newList2 = resultDate.sessionsList;
            for (var i = 0; i < newList2.length; i++) {
                if (newList2[i].name === document.title) {
                    newList2.splice(i, 1);
                    break;
                }
            }
            newList2.unshift({
                name: document.title,
                dateLastModified: new Date()
            });
            chrome.storage.sync.set({sessionsList: newList2});
        });
        window.location.reload();
    });
    document.getElementById("header").appendChild(sB);

    //Replace all text and urls with text inputs with data prefilled
    replaceAsInput();
});


//Display validation errors on dialog box
function validateErrors(err) {
    if (err) {
        var d = document.getElementById("dialog2");
        var validation = document.createElement("div");
        validation.id = "validation";
        validation.style = "color:red;";
        validation.innerText = err;
        d.appendChild(validation);
    }
}

function replaceAsInput() {
    var texts = document.getElementsByClassName("textData");
    var urls = document.getElementsByClassName("urlData");

    for (var i = 0; i < texts.length; i++) {
        texts[i].innerHTML = "<input class='newTextInputs' style='width:100%;' type='text' name='newTextInputs' value='" + texts[i].innerText + "' required>";
        urls[i].innerHTML = "<input class='newUrlInputs' style='width:100%;' type='text' name='newUrlInputs' value='" + urls[i].innerText + "' required>";
    }
}
