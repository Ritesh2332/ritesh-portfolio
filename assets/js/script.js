// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
navigationLinks.forEach((link, index) => {
  link.addEventListener("click", () => {

    // remove active from all
    pages.forEach(page => page.classList.remove("active"));
    navigationLinks.forEach(nav => nav.classList.remove("active"));

    // add active to clicked
    pages[index].classList.add("active");
    link.classList.add("active");

    window.scrollTo(0, 0);
  });
});

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
const formStatus = document.querySelector("[data-form-status]");

// add event to all form input field
if (form && formInputs.length > 0 && formBtn) {
  formInputs.forEach((input) => {
    input.addEventListener("input", function () {
      // check form validation
      if (form.checkValidity()) {
        formBtn.removeAttribute("disabled");
      } else {
        formBtn.setAttribute("disabled", "");
      }
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const action = form.getAttribute("action");
    if (!action) return;

    if (formStatus) {
      formStatus.textContent = "Sending...";
      formStatus.classList.remove("success", "error");
    }

    formBtn.setAttribute("disabled", "");

    try {
      const formData = new FormData(form);
      const res = await fetch(action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        form.reset();
        if (formStatus) {
          formStatus.textContent = "Message sent successfully.";
          formStatus.classList.add("success");
        }
      } else {
        if (formStatus) {
          formStatus.textContent = "Failed to send message. Please try again.";
          formStatus.classList.add("error");
        }
      }
    } catch (err) {
      if (formStatus) {
        formStatus.textContent = "Network error. Please check your connection and try again.";
        formStatus.classList.add("error");
      }
    }
  });
}

// certificate lightbox
const certLightbox = document.querySelector("[data-cert-lightbox]");
const certLightboxImg = document.querySelector("[data-cert-lightbox-img]");
const certLightboxCloseEls = document.querySelectorAll("[data-cert-lightbox-close]");
const certificateCards = document.querySelectorAll(".certificate-card");

const openCertLightbox = (src, alt) => {
  if (!certLightbox || !certLightboxImg || !src) return;

  certLightboxImg.src = src;
  certLightboxImg.alt = alt || "Certificate";
  certLightbox.classList.add("active");
  document.body.style.overflow = "hidden";
};

const closeCertLightbox = () => {
  if (!certLightbox || !certLightboxImg) return;

  certLightbox.classList.remove("active");
  certLightboxImg.src = "";
  certLightboxImg.alt = "";
  document.body.style.overflow = "";
};

if (certLightbox && certificateCards.length > 0) {
  certificateCards.forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");

    const img = card.querySelector("img");
    if (!img) return;

    const openFromImg = () => openCertLightbox(img.getAttribute("src"), img.getAttribute("alt"));

    card.addEventListener("click", openFromImg);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFromImg();
      }
    });
  });

  certLightboxCloseEls.forEach((el) => {
    el.addEventListener("click", closeCertLightbox);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && certLightbox.classList.contains("active")) {
      closeCertLightbox();
    }
  });
}



// project filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");
const filterBtns = document.querySelectorAll("[data-filter-btn]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]");
const filterSelect = document.querySelector("[data-select]");

// filter function
const filterFunc = (selectedValue) => {
  filterItems.forEach((item) => {
    const category = item.dataset.category.toLowerCase();
    if (selectedValue === "all" || selectedValue === category) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
};

// add event to filter buttons (desktop)
filterBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    const selectedValue = (this.dataset.filterValue || this.textContent).toLowerCase().trim();

    // update active state on buttons
    filterBtns.forEach(b => b.classList.remove("active"));
    this.classList.add("active");

    filterFunc(selectedValue);
  });
});

// toggle mobile select dropdown
if (filterSelect) {
  filterSelect.addEventListener("click", function () {
    this.classList.toggle("active");
  });
}

// add event to mobile select items
selectItems.forEach((item) => {
  item.addEventListener("click", function () {
    const selectedValue = (this.dataset.filterValue || this.textContent).toLowerCase().trim();
    if (selectValue) selectValue.textContent = this.textContent;
    if (filterSelect) filterSelect.classList.remove("active");
    filterFunc(selectedValue);
  });
});

const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let skillsAnimated = false;

const setSkillBarsToZero = () => {
  const fills = document.querySelectorAll(".skill-progress-fill");
  fills.forEach((fill) => {
    const target = (fill.style.width || "0%").trim();
    if (!fill.dataset.targetWidth) fill.dataset.targetWidth = target;
    fill.style.width = "0%";
  });
};

const animateSkillBars = () => {
  if (skillsAnimated) return;

  const fills = document.querySelectorAll(".skill-progress-fill");
  if (fills.length === 0) return;

  skillsAnimated = true;
  const applyTargets = () => {
    fills.forEach((fill) => {
      const target = (fill.dataset.targetWidth || fill.style.width || "0%").trim();
      fill.style.width = target;
    });
  };

  if (prefersReducedMotion) {
    applyTargets();
    return;
  }

  requestAnimationFrame(applyTargets);
};

if (!prefersReducedMotion) setSkillBarsToZero();

const skillsSection = document.querySelector(".skill");
if (skillsSection && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateSkillBars();
        }
      });
    },
    { threshold: 0.25 }
  );
  observer.observe(skillsSection);
}

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (link.textContent && link.textContent.trim().toLowerCase() === "resume") {
      setTimeout(animateSkillBars, 50);
    }
  });
});

// certificates tabs (Training / Achievements / Certificates)
const certTabButtons = document.querySelectorAll("[data-cert-tab]");
const certPanels = document.querySelectorAll("[data-cert-panel]");

if (certTabButtons.length > 0 && certPanels.length > 0) {
  certTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.certTab;
      if (!tab) return;

      certTabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      certPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.certPanel === tab);
      });
    });
  });
}