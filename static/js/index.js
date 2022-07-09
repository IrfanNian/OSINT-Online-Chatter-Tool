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
const form = document.forms[0];

keyword.addEventListener("input", function () {
    if (keyword.value.length > 0) {
        SearchSubmit.disabled = false;
    }
    else {
        SearchSubmit.disabled = true;
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
        document.getElementById('csubrtexttr').setAttribute("hidden", true);
    }
    else {
        SearchSubmit.disabled = true;
        keyword.disabled = false;
        redditCheckBox.disabled = false;
        twitterCheckBox.disabled = false;
        pbCheckBox.disabled = false;
        refinement.disabled = false;
        timeRange.disabled = false;
        depth.disabled = false;
        document.getElementById('csubrtexttr').removeAttribute("hidden");
    }
});

redditCheckBox.addEventListener("change", function() {
    if (this.checked) {
         document.getElementById('csubrtexttr').removeAttribute("hidden");
    }
    else {
        document.getElementById('csubrtexttr').setAttribute("hidden", true);
    }
})

file.addEventListener("change", function() {
    if(file.files.length > 0) {
        checkbox.removeAttribute("disabled");
    }
})

window.onload = function(){
    checkbox.checked = false;
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

document.getElementById("SearchSubmit").addEventListener("click", function() {
    document.getElementById("overlay").style.display = "block";
});

document.getElementById("overlay").addEventListener("click", function() {
    document.getElementById("overlay").style.display = "none";
});

