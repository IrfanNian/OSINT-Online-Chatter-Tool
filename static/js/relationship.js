const keyword = document.getElementById("keyword");
const fileUpload = document.getElementById("ini_file");
const checkbox = document.querySelector("input[name=demoMode]");
const form = document.forms[0];

keyword.addEventListener("input", function () {
    let input = fileUpload.files[0]
    if (keyword.value.length > 0 && input) {
        SearchSubmit.disabled = false;
    } else {
        SearchSubmit.disabled = true;
    }
});

fileUpload.addEventListener("change", function () {
    let input = fileUpload.files[0]
    if (keyword.value.length > 0 && input) {
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

document.getElementById("SearchSubmit").addEventListener("click", function() {
    document.getElementById("overlay").style.display = "block";
});


document.getElementById("overlay").addEventListener("click", function() {
    document.getElementById("overlay").style.display = "none";
});
