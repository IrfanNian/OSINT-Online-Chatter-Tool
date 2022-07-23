const keyword = document.getElementById("keyword");
const fileUpload = document.getElementById("ini_file");
const detectUsers = document.getElementById("detect_users");
const level = document.getElementById("level");
const form = document.forms[0];

if (detectUsers.innerText === "No Users") {
    SearchSubmit.disabled = true;
    fileUpload.disabled = true;
    level.disabled = true;
    keyword.disabled = true;
}

keyword.addEventListener("input", function () {
    let input = fileUpload.files[0];
    if (keyword.value.length > 0 && input) {
        SearchSubmit.disabled = false;
    } else {
        SearchSubmit.disabled = true;
    }
});

fileUpload.addEventListener("change", function () {
    let input = fileUpload.files[0];
    if (keyword.value.length > 0 && input) {
        SearchSubmit.disabled = false;
    } else {
        SearchSubmit.disabled = true;
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
