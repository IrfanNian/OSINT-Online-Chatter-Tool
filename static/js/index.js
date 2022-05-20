const keyword = document.getElementById("keyword");
const form = document.forms[0];

keyword.addEventListener("input", function () {
    if (keyword.value.length > 0) {
        SearchSubmit.disabled = false;
    } else {
        SearchSubmit.disabled = true;
    }
});

form.addEventListener("submit", () => {
    form.action = `/results?q=${keyword.value}`;
    console.log(form.action);
});
