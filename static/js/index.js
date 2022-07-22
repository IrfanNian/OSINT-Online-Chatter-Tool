const keyword = document.getElementById("keyword");
const checkbox = document.querySelector("input[name=disableScraping]");
const file = document.getElementById("file");
const scrapingLabel = document.getElementById("disableScrapingLabel");
const redditCheckBox = document.getElementById("reddit");
const twitterCheckBox = document.getElementById("twitter");
const pbCheckBox = document.getElementById("pastebin");
const refinement = document.getElementById("refinement");
const timeRange = document.getElementById("tRan");
const depth = document.getElementById("depth");
const newstable = document.getElementById("news");
const form = document.forms[0];

keyword.addEventListener("input", function () {
    if (keyword.value.length > 0) {
        SearchSubmit.disabled = false;
    } else {
        SearchSubmit.disabled = true;
    }
});

depth.addEventListener("change", function () {
    if (depth.value == "custom_depth") {
        document.getElementById("customDepthTr").removeAttribute("hidden");
    } else {
        document.getElementById("customDepthTr").setAttribute("hidden", true);
    }
});

timeRange.addEventListener("change", function () {
    if (timeRange.value == "custom") {
        document.getElementById("customTimeStartTr").removeAttribute("hidden");
        document.getElementById("customTimeEndTr").removeAttribute("hidden");
    } else {
        document
            .getElementById("customTimeStartTr")
            .setAttribute("hidden", true);
        document.getElementById("customTimeEndTr").setAttribute("hidden", true);
    }
});

checkbox.addEventListener("change", function () {
    if (this.checked) {
        SearchSubmit.disabled = false;
        keyword.disabled = true;
        redditCheckBox.disabled = true;
        twitterCheckBox.disabled = true;
        pbCheckBox.disabled = true;
        refinement.disabled = true;
        timeRange.disabled = true;
        depth.disabled = true;
        document.getElementById("csubrtexttr").setAttribute("hidden", true);
        document.getElementById("customDepthTr").setAttribute("hidden", true);
    } else {
        SearchSubmit.disabled = true;
        keyword.disabled = false;
        redditCheckBox.disabled = false;
        twitterCheckBox.disabled = false;
        pbCheckBox.disabled = false;
        refinement.disabled = false;
        timeRange.disabled = false;
        depth.disabled = false;
        document.getElementById("csubrtexttr").removeAttribute("hidden");
        document.getElementById("customDepthTr").removeAttribute("hidden");
    }
});

redditCheckBox.addEventListener("change", function () {
    if (this.checked) {
        document.getElementById("csubrtexttr").removeAttribute("hidden");
    } else {
        document.getElementById("csubrtexttr").setAttribute("hidden", true);
    }
});

file.addEventListener("change", function () {
    if (file.files.length > 0) {
        checkbox.removeAttribute("disabled");
    }
});

window.onload = function () {
    document.getElementById("search").reset();
    document.getElementById("overlay").style.display = "none";
};

document.getElementById("SearchSubmit").addEventListener("click", function () {
    document.getElementById("overlay").style.display = "block";
});

document.getElementById("overlay").addEventListener("click", function () {
    document.getElementById("overlay").style.display = "none";
});

function news() {
    var url = 'https://newsapi.org/v2/everything?' +
        'q=cyber attack&' +
        'sortBy=popularity&' +
        'apiKey=7e117f68db8d4818910c235552ee0226';

    var req = new Request(url);

    fetch(req)
        .then(function (response) {
            response.json().then(function (response) {
                var col = [];
                var links = [];
                for (var i = 0; i < response.articles.length; i++) {
                    for (var key in response.articles[i]) {
                        if (col.indexOf(key) === -1) {
                            if (key == "publishedAt" || key == "title") {
                                col.push(key);
                            }
                            if (key == "url") {
                                col.push(key);
                            }
                        }
                    }
                }
                var table = document.createElement("table");
                var tr = table.insertRow(-1);

                for (var i = 0; i < response.articles.length; i++) {

                    tr = table.insertRow(-1);

                    for (var j = 0; j < col.length; j++) {
                        var tabCell = tr.insertCell(-1);
                        if (j == 2) {
                            tabCell.innerHTML = response.articles[i][col[j]].split("T")[0];
                        }
                        else if (j == 0 ){
                            tabCell.innerHTML = "<a href= \" " + response.articles[i][col[1]] + " \" class = \"newslink\" target=\"_blank\"> " + response.articles[i][col[j]] + "</a>";
                        }

                    }
                }

                var divShowData = document.getElementById('news');
                divShowData.innerHTML = "";
                divShowData.appendChild(table);

            });
        })
  
}

news()


