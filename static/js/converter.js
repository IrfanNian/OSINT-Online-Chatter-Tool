const file = document.getElementById("file");
const form = document.forms[0];

file.addEventListener("change", function () {
    if (file.files.length > 0) {
        SearchSubmit.disabled = false;
    }
    else {
        SearchSubmit.disabled = true;
    }
});

window.onload = function () {
    document.getElementById("search").reset();
};
