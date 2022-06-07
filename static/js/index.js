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


function CheckTime(val) {
    var element1 = document.getElementById('customTimeStart');
    if (val == 'custom')
        element1.style.display = 'block';
    else
        element1.style.display = 'none';

    var element2 = document.getElementById('customTimeEnd');
    if (val == 'custom')
        element2.style.display = 'block';
    else
        element2.style.display = 'none';
    var element1 = document.getElementById('from');
    if (val == 'custom')
        element1.style.display = 'block';
    else
        element1.style.display = 'none';

    var element1 = document.getElementById('to');
    if (val == 'custom')
        element1.style.display = 'block';
    else
        element1.style.display = 'none';
}

function on() {
  document.getElementById("overlay").style.display = "block";
}
