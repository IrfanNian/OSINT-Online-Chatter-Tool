const keyword = document.getElementById("keyword");
const checkbox = document.querySelector("input[name=disableScraping]");
const file = document.getElementById("file");
const scrapingLabel = document.getElementById("disableScrapingLabel");
const form = document.forms[0];

keyword.addEventListener("input", function () {
    if (keyword.value.length > 0) {
        SearchSubmit.disabled = false;
    } else {
        SearchSubmit.disabled = true;
    }
});

checkbox.addEventListener("change", function () {
    if (this.checked) {
        SearchSubmit.disabled = false;
    } else {
        SearchSubmit.disabled = true;
    }
});

function showCheckbox() {
    if(file.files.length > 0) {
        checkbox.removeAttribute("hidden");
        scrapingLabel.removeAttribute("hidden");
    }
}

function showHide() {
    let customreddit = document.getElementById('platf')
    console.log(customreddit.value)
    if (customreddit.value == 'all') {
        document.getElementById('csubrtexttr').removeAttribute("hidden");
    }
    else if (customreddit.value == 'reddit') {
        document.getElementById('csubrtexttr').removeAttribute("hidden");
    }
    else {
        document.getElementById('csubrtexttr').setAttribute("hidden", true);
    }
}

function checkTime(val) {
    var element1 = document.getElementById('customTimeStartTr');
    if (val == 'custom')
        element1.removeAttribute("hidden");
    else
        element1.setAttribute("hidden", true);

    var element2 = document.getElementById('customTimeEndTr');
    if (val == 'custom')
        element2.removeAttribute("hidden");
    else
        element2.setAttribute("hidden", true);
}

function on() {
  document.getElementById("overlay").style.display = "block";
}
