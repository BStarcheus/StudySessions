//When the user highlights text and lifts the mouse, a button apears
var newButton = function(event) {
    var sel = document.getSelection().toString();

    if(sel.length) {
        var button = document.createElement("button");
        var img = document.createElement("img");
        img.src = chrome.runtime.getURL("/imgs/buttons.png");
        img.style = "position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);height:50px;width:50px;";
        button.style = "border:2px solid rgb(152,152,152);border-radius:50%;height:50px;width:50px;overflow:hidden;position:absolute;top:" + event.pageY + "px;left:" + event.pageX + "px;z-index: 9999";
        button.appendChild(img);

        //Add the highlighted text to session notes
        button.addEventListener('click', function() {
//TODO
        });
        button.id = "newButton";
        document.body.appendChild(button);
    }
};

//When the user clicks away from the button, it disappears
var removeButton = function() {
    var pastButton = document.getElementById("newButton");
    if (pastButton) {
        pastButton.parentNode.removeChild(pastButton);
    }
};

document.addEventListener('pointerup', newButton);
document.addEventListener('pointerdown', removeButton);
