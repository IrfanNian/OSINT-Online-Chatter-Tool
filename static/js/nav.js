// Nav Functionality
function makeRespo() {
    const nav = document.querySelector("nav");

    const menu = document.getElementsByClassName("menu")[0];
    if (nav.className === "responsive") {
        nav.className = "";
        menu.style.transform = "rotate(0deg)";
    } else {
        nav.className = "responsive";
        menu.style.transform = "rotate(45deg)";
    }
}
