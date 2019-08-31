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
            message.style = "font-size:16px;text-align:center;";
            document.body.appendChild(message);
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
            document.body.appendChild(table);
        }
    });
});


//The back button links back to the sessions page
var backButton = document.getElementById("back");
backButton.addEventListener('click', function() {
    window.open('/pages/sessionsList.html', '_self');
});
