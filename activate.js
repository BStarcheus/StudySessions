//When the user highlights text and lifts the mouse, a button apears
var newButton = function(event) {

    //Don't add a new button from the mouseup event of clicking the button.
    if (event.target.className !== "newButtonClass") {
        var sel = document.getSelection().toString();

        if(sel.length) {
            var button = document.createElement("button");
            var img = document.createElement("img");
            img.className = "newButtonClass";
            img.src = chrome.runtime.getURL("/imgs/buttons.png");
            img.style = "position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);height:50px;width:50px;";
            button.style = "border:2px solid rgb(152,152,152);border-radius:50%;height:50px;width:50px;overflow:hidden;position:absolute;top:" + event.pageY + "px;left:" + event.pageX + "px;z-index: 9999";
            button.appendChild(img);

            //Add the highlighted text to session notes
            button.addEventListener('click', function() {
                var note = {
                    text: sel,
                    url: window.location.href
                };

                chrome.storage.sync.get("activeSession", function(result) {
                    sessionName = result.activeSession

                    //Add the new note to the end of the list
                    chrome.storage.sync.get(sessionName, function(result2) {
                        var newObj = result2;
                        newObj[sessionName].push(note);
                        chrome.storage.sync.set(newObj);
                    });

                    //Update date last modified in sessionsList and move it to the beginning of list
                    chrome.storage.sync.get("sessionsList", function(result3) {
                        var newList = result3.sessionsList;
                        for (var i = 0; i < newList.length; i++) {
                            if (newList[i].name === sessionName) {
                                newList.splice(i, 1);
                                break;
                            }
                        }
                        newList.unshift({
                            name: sessionName,
                            dateLastModified: new Date()
                        });
                        chrome.storage.sync.set({sessionsList: newList});
                    })
                });
                this.parentNode.removeChild(this);
            });
            button.id = "newButton";
            button.className = "newButtonClass";
            document.body.appendChild(button);
        }
    }
};

//When the user clicks away from the button, it disappears
var removeButton = function(event) {
    var pastButton = document.getElementById("newButton");
    if (pastButton && event.target.className !== "newButtonClass") {
        pastButton.parentNode.removeChild(pastButton);
    }
};

document.addEventListener('mouseup', newButton);
document.addEventListener('mousedown', removeButton);
