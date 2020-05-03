// navigation
let menuIcon = document.querySelector(".menu-icon");
let navMenu = document.querySelector(".nav-links");

menuIcon.addEventListener("click", () => {
  navMenu.classList.toggle("nav-active");

  menuIcon.classList.toggle("cross-icon");
});
