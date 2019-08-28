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
            th1.innerText = "Note Text";
            var th2 = document.createElement("th");
            th2.innerText = "Website";
            tr.appendChild(th1);
            tr.appendChild(th2);
            thead.appendChild(tr);
            table.appendChild(thead);
            var tbody = document.createElement("tbody");

            //Fill the rows of the table with data.
            for (var i = 0; i < result[session].length; i++) {
                var tr = document.createElement("tr");
                var textData = document.createElement("td");
                textData.className = "textData";
                var urlData = document.createElement("td");
                urlData.className = "urlData";

                textData.innerText = result[session][i].text;
                urlData.innerHTML = "<a href='" + result[session][i].url + "' target='_blank'>" + result[session][i].url + "</a>";

                tr.appendChild(textData);
                tr.appendChild(urlData);
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
