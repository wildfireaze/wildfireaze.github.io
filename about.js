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
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("downloadModal");
    const downloadButton = document.querySelector(".divForDownload .aForDownload");
    const confirmDownloadButton = document.getElementById("confirmDownload");
    const agreeCheckbox = document.getElementById("agreeCheckbox");
    const closeModalButton = document.getElementById("closeModal");
    const termsLink = document.getElementById("termsLink"); // Terms and Conditions link inside the modal

    // Open Modal when clicking "Download Dataset"
    downloadButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent direct download
        modal.style.display = "block";
    });

    // Enable "Confirm & Download" button when checkbox is checked
    agreeCheckbox.addEventListener("change", function () {
        confirmDownloadButton.disabled = !this.checked;
    });

    // Download dataset when "Confirm & Download" is clicked
    confirmDownloadButton.addEventListener("click", function () {
        window.location.href = downloadButton.href; // Start download
        modal.style.display = "none"; // Close modal
    });

    // Close modal when "Cancel" is clicked
    closeModalButton.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // Close modal if user clicks outside the modal
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Close modal when "Terms and Conditions" is clicked
    termsLink.addEventListener("click", function () {
        modal.style.display = "none"; // Close modal before navigating
    });
});
