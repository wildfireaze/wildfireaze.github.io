// Get the button
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// Show or hide the button when scrolling
window.onscroll = function() {
    if (document.documentElement.scrollTop > 300) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
};

// Smooth scrolling to top
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}
