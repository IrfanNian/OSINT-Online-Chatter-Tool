const keyword = document.getElementById("keyword");
const fileUpload = document.getElementById("ini_file");
const detectUsers = document.getElementById("detect_users");
const level = document.getElementById("level");
const checkbox = document.querySelector("input[name=demoMode]");
const form = document.forms[0];

if (detectUsers.innerText == "No Users") {
    SearchSubmit.disabled = true;
    fileUpload.disabled = true;
    level.disabled = true;
    keyword.disabled = true;
}

keyword.addEventListener("input", function () {
    let input = fileUpload.files[0];
    if (keyword.value.length > 0 && input) {
        SearchSubmit.disabled = false;
    } else if (keyword.value.length > 0) {
        checkbox.disabled = true;
    } else {
        SearchSubmit.disabled = true;
        checkbox.disabled = false;
    }
});

fileUpload.addEventListener("change", function () {
    let input = fileUpload.files[0];
    checkbox.disabled = true;
    if (keyword.value.length > 0 && input) {
        SearchSubmit.disabled = false;
    } else if (keyword.value.length > 0) {
        checkbox.disabled = true;
    } else {
        SearchSubmit.disabled = true;
        checkbox.disabled = false;
    }
});

checkbox.addEventListener("change", function () {
    if (this.checked) {
        SearchSubmit.disabled = false;
        keyword.disabled = true;
        fileUpload.disabled = true;
        level.disabled = true;
    } else if (detectUsers.innerText == "No Users") {
        SearchSubmit.disabled = true;
        fileUpload.disabled = true;
        level.disabled = true;
        keyword.disabled = true;
    } else {
        SearchSubmit.disabled = true;
        keyword.disabled = false;
        fileUpload.disabled = false;
        level.disabled = false;
    }
});

window.onload = function () {
    document.getElementById("search").reset();
};

document.getElementById("SearchSubmit").addEventListener("click", function () {
    document.getElementById("overlay").style.display = "block";
});

document.getElementById("overlay").addEventListener("click", function () {
    document.getElementById("overlay").style.display = "none";
});
