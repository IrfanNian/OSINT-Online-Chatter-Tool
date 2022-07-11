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
    checkbox.checked = false;
};

document.getElementById("SearchSubmit").addEventListener("click", function () {
    document.getElementById("overlay").style.display = "block";
});

document.getElementById("overlay").addEventListener("click", function () {
    document.getElementById("overlay").style.display = "none";
});
