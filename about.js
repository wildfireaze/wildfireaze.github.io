document.addEventListener("DOMContentLoaded", function () {
    // --- Scroll-to-Top Functionality ---
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    window.onscroll = function() {
      if (document.documentElement.scrollTop > 300) {
        scrollToTopBtn.style.display = "block";
      } else {
        scrollToTopBtn.style.display = "none";
      }
    };
    function scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  
    // --- Modal Download Functionality (if present) ---
    const downloadModal = document.getElementById("downloadModal");
    if (downloadModal) {
      const downloadButton = document.querySelector(".divForDownload .aForDownload");
      const confirmDownloadButton = document.getElementById("confirmDownload");
      const agreeCheckbox = document.getElementById("agreeCheckbox");
      const closeModalButton = document.getElementById("closeModal");
      const termsLink = document.getElementById("termsLink");
    
      if (downloadButton) {
        downloadButton.addEventListener("click", function (event) {
          event.preventDefault();
          downloadModal.style.display = "block";
        });
      }
    
      if (agreeCheckbox && confirmDownloadButton) {
        agreeCheckbox.addEventListener("change", function () {
          confirmDownloadButton.disabled = !this.checked;
        });
      }
    
      if (confirmDownloadButton && downloadButton) {
        confirmDownloadButton.addEventListener("click", function () {
          window.location.href = downloadButton.href;
          downloadModal.style.display = "none";
        });
      }
    
      if (closeModalButton) {
        closeModalButton.addEventListener("click", function () {
          downloadModal.style.display = "none";
        });
      }
    
      window.addEventListener("click", function (event) {
        if (event.target === downloadModal) {
          downloadModal.style.display = "none";
        }
      });
    
      if (termsLink) {
        termsLink.addEventListener("click", function () {
          downloadModal.style.display = "none";
        });
      }
    }
  
    // --- i18next Initialization ---
    i18next
      .use(i18nextBrowserLanguageDetector)
      .use(i18nextXHRBackend)
      .init({
        fallbackLng: "en",
        debug: true,
        backend: {
          // Adjust the path below:
          // If you have a folder named "locales" containing en.json and az.json, use:
          loadPath: "./locales/{{lng}}.json"
          // Otherwise, if the files are in the same folder as about.html, use:
          // loadPath: "./{{lng}}.json"
        }
      }, function (err, t) {
        if (err) {
          console.error("i18next Error:", err);
          return;
        }
        updateContent();
      });
  
    // --- Update About Page Content ---
    function updateContent() {
      console.log("Updating content using language:", i18next.language);
      // Header
      const headerH1 = document.querySelector("header h1");
      if (headerH1) {
        headerH1.textContent = i18next.t("aboutPage.header");
      }
      // Home Link
      const homeLink = document.querySelector("header a.aForDownload");
      if (homeLink) {
        homeLink.textContent = i18next.t("aboutPage.homeLink");
      }
      // Navigation Bar
      const navLinks = document.querySelectorAll("nav.navbar ul li a");
      if (navLinks.length >= 5) {
        navLinks[0].textContent = i18next.t("aboutPage.nav.dataset");
        navLinks[1].textContent = i18next.t("aboutPage.nav.team");
        navLinks[2].textContent = i18next.t("aboutPage.nav.project");
        navLinks[3].textContent = i18next.t("aboutPage.nav.contact");
        navLinks[4].textContent = i18next.t("aboutPage.nav.terms");
      }
      // Dataset Section
      const datasetSection = document.getElementById("about-dataset");
      if (datasetSection) {
        const datasetHeading = datasetSection.querySelector("h2");
        if (datasetHeading) {
          datasetHeading.textContent = i18next.t("aboutPage.dataset.h2");
        }
        const datasetPara = datasetSection.querySelector("p");
        if (datasetPara) {
          datasetPara.textContent = i18next.t("aboutPage.dataset.p");
        }
      }
      // Team Section
      const teamSection = document.getElementById("about-team");
      if (teamSection) {
        const teamHeading = teamSection.querySelector("h2");
        if (teamHeading) {
          teamHeading.textContent = i18next.t("aboutPage.team.h2");
        }
        const teamParagraphs = teamSection.querySelectorAll("p");
        if (teamParagraphs.length > 0) {
          teamParagraphs[0].textContent = i18next.t("aboutPage.team.p1");
          if (teamParagraphs.length > 1) {
            teamParagraphs[1].textContent = i18next.t("aboutPage.team.p2");
          }
        }
      }
      // Project Section
      const projectSection = document.getElementById("about-project");
      if (projectSection) {
        const projectHeading = projectSection.querySelector("h2");
        if (projectHeading) {
          projectHeading.textContent = i18next.t("aboutPage.project.h2");
        }
        const projectPara = projectSection.querySelector("p");
        if (projectPara) {
          projectPara.textContent = i18next.t("aboutPage.project.p");
        }
      }
      // Contact Section
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        const contactHeading = contactSection.querySelector("h2");
        if (contactHeading) {
          contactHeading.textContent = i18next.t("aboutPage.contact.h2");
        }
        const contactPara = contactSection.querySelector("p");
        if (contactPara) {
          contactPara.textContent = i18next.t("aboutPage.contact.p");
        }
      }
      // Terms Section
      const termsSection = document.getElementById("terms");
      if (termsSection) {
        const termsHeading = termsSection.querySelector("h2");
        if (termsHeading) {
          termsHeading.textContent = i18next.t("aboutPage.terms.h2");
        }
        const termsPara = termsSection.querySelector("p");
        if (termsPara) {
          termsPara.textContent = i18next.t("aboutPage.terms.p");
        }
      }
      // Footer
      const footerParagraphs = document.querySelectorAll("footer p");
      if (footerParagraphs.length >= 2) {
        footerParagraphs[0].innerHTML = i18next.t("aboutPage.footer.p1");
        footerParagraphs[1].textContent = i18next.t("aboutPage.footer.p2");
      }
    }
  
    // --- Language Selector Handling ---
    // (If your about.html doesn’t include a language selector, this block won’t run.
    // However, the saved language will still be applied on page load.)
    const languageSelect = document.getElementById("language-select");
    if (languageSelect) {
      languageSelect.addEventListener("change", function () {
        const selectedLang = languageSelect.value;
        console.log("Language changed to:", selectedLang);
        i18next.changeLanguage(selectedLang, function () {
          updateContent();
        });
        localStorage.setItem("language", selectedLang);
      });
    }
    
    // --- Set Initial Language from localStorage ---
    const savedLanguage = localStorage.getItem("language") || "en";
    if (languageSelect) {
      languageSelect.value = savedLanguage;
    }
    i18next.changeLanguage(savedLanguage, function () {
      updateContent();
    });
  });
  