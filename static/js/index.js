const keyword = document.getElementById("keyword");
const PastebinSubmit = document.getElementById("PastebinSubmit");
const TwitterSubmit = document.getElementById("TwitterSubmit");
const RedditSubmit = document.getElementById("RedditSubmit");

keyword.addEventListener("input", function () {
    if (keyword.value.length > 0) {
        PastebinSubmit.disabled = false;
        TwitterSubmit.disabled = false;
        RedditSubmit.disabled = false;
    } else {
        PastebinSubmit.disabled = true;
        TwitterSubmit.disabled = true;
        RedditSubmit.disabled = true;
    }
});
PastebinSubmit.addEventListener("click", () => {
    window.location.href = `/pastebin?q=${keyword.value}`;
});
TwitterSubmit.addEventListener("click", () => {
    window.location.href = `/twitter?q=${keyword.value}`;
});
RedditSubmit.addEventListener("click", () => {
    window.location.href = `/reddit?q=${keyword.value}`;
});
