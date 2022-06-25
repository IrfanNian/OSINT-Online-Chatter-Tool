const keyword = document.getElementById("keyword");
const checkbox = document.querySelector("input[name=demoMode]");
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

window.onload = function() {
   var checkboxes = document.getElementsByTagName("INPUT");
   for(let x=0; x < checkboxes.length; x++) {
      if (checkboxes[x].type == "checkbox") {
          checkboxes[x].checked = false;
      }
   }
}

function showCheckbox() {
    if(file.files.length > 0) {
        checkbox.removeAttribute("hidden");
        scrapingLabel.removeAttribute("hidden");
    }
}

function on() {
  document.getElementById("overlay").style.display = "block";
}
