/* ============================================================
   Agent Malaica — interactions
   ============================================================ */

/* ---------- CONFIG — edit these two values to go live ---------- */
const WHATSAPP_NUMBER = "237690000000"; // international format, digits only
const DEFAULT_WA_MESSAGE =
  "Hello Agent Malaica, I would like to inquire about residential properties in Douala.";
const AGENT_NAME = "Agent Malaica";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const waLink = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/* ============================================================
   Header scroll state
   ============================================================ */
const header = document.getElementById("siteHeader");
const onHeaderScroll = () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
};
onHeaderScroll();
window.addEventListener("scroll", onHeaderScroll, { passive: true });

/* ============================================================
   Mobile navigation
   ============================================================ */
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

mainNav.addEventListener("click", (e) => {
  if (e.target.closest("a, button")) {
    mainNav.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

/* ============================================================
   Reveal-on-scroll
   ============================================================ */
document
  .querySelectorAll(".reveal, .reveal-left, .reveal-right")
  .forEach((el) => {
    const delay = el.dataset.delay;
    if (delay) el.style.setProperty("--d", `${delay}ms`);
  });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
);

document
  .querySelectorAll(".reveal, .reveal-left, .reveal-right")
  .forEach((el) => revealObserver.observe(el));

/* ============================================================
   Animated counters
   ============================================================ */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const runCounter = (el) => {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";

  if (prefersReducedMotion) {
    el.textContent = `${target}${suffix}`;
    return;
  }

  const duration = 1700;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = `${Math.round(easeOutCubic(progress) * target)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll(".counter").forEach((el) => counterObserver.observe(el));

/* ============================================================
   Hero parallax (scroll-based, disabled for reduced motion)
   ============================================================ */
const heroImg = document.getElementById("heroBgImg");

if (heroImg && !prefersReducedMotion) {
  let ticking = false;

  const parallax = () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      heroImg.style.transform = `translate3d(0, ${y * 0.28}px, 0) scale(1.06)`;
    }
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(parallax);
        ticking = true;
      }
    },
    { passive: true }
  );
}

/* ============================================================
   Button ripple micro-interaction
   ============================================================ */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn || prefersReducedMotion) return;

  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 650);
});

/* ============================================================
   WhatsApp + phone links
   ============================================================ */
document
  .querySelectorAll(".js-whatsapp-hero, .js-whatsapp-fab, .js-whatsapp-footer")
  .forEach((link) => {
    link.href = waLink(DEFAULT_WA_MESSAGE);
  });

document.querySelectorAll(".js-phone-link").forEach((link) => {
  link.href = `tel:+${WHATSAPP_NUMBER}`;
});

/* ============================================================
   Inquiry forms (contact section + modal clone)
   ============================================================ */
const buildInquiryMessage = (data) => {
  const lines = [
    `Hello ${AGENT_NAME}, I would like to inquire about residential properties in Douala.`,
    ``,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Property type: ${data.propertyType}`,
    `Neighborhood: ${data.neighborhood}`,
    `Budget: ${data.budget}`,
  ];
  if (data.timeline) lines.push(`Timeline: ${data.timeline}`);
  if (data.notes) lines.push(`Notes: ${data.notes}`);
  return lines.join("\n");
};

const collectFormData = (form) => {
  const fd = new FormData(form);
  return {
    name: (fd.get("name") || "").toString().trim(),
    phone: (fd.get("phone") || "").toString().trim(),
    propertyType: (fd.get("propertyType") || "").toString(),
    neighborhood: (fd.get("neighborhood") || "").toString(),
    budget: (fd.get("budget") || "").toString(),
    timeline: (fd.get("timeline") || "").toString(),
    notes: (fd.get("notes") || "").toString().trim(),
  };
};

const validateForm = (form) => {
  let firstInvalid = null;

  form.querySelectorAll("[required]").forEach((input) => {
    const field = input.closest(".field");
    let valid = input.value.trim() !== "";

    if (valid && input.type === "tel") {
      valid = /^[+()\-\s\d]{7,20}$/.test(input.value.trim());
    }

    field.classList.toggle("invalid", !valid);
    if (!valid && !firstInvalid) firstInvalid = input;
  });

  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
};

const initInquiryForm = (form) => {
  const card = form.closest(".form-card");
  const successPanel = card.querySelector(".form-success");

  // clear error state as the user types
  form.addEventListener("input", (e) => {
    const field = e.target.closest(".field");
    if (field) field.classList.remove("invalid");
  });
  form.addEventListener("change", (e) => {
    const field = e.target.closest(".field");
    if (field) field.classList.remove("invalid");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const data = collectFormData(form);
    const mode = e.submitter?.dataset.submitMode || "whatsapp";

    if (mode === "whatsapp") {
      window.open(waLink(buildInquiryMessage(data)), "_blank", "noopener");
      return;
    }

    // simulated request submission (no backend wired)
    const submitBtn = e.submitter;
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    setTimeout(() => {
      form.hidden = true;
      successPanel.hidden = false;

      const nameSlot = successPanel.querySelector(".success-name");
      if (nameSlot) nameSlot.textContent = data.name.split(" ")[0] || "friend";

      const waBtn = successPanel.querySelector(".js-whatsapp-success");
      if (waBtn) waBtn.href = waLink(buildInquiryMessage(data));

      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }, 900);
  });

  // success panel actions
  const resetBtn = successPanel.querySelector(".js-reset-form");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      form.reset();
      form.hidden = false;
      successPanel.hidden = true;
    });
  }
};

document.querySelectorAll(".js-inquiry-form").forEach(initInquiryForm);

/* ============================================================
   Consultation modal — clones the contact form into the dialog
   ============================================================ */
const modal = document.getElementById("consultModal");
const modalBody = document.getElementById("modalBody");
const sourceCard = document.getElementById("formCard");
let lastFocused = null;
let modalLoaded = false;

const buildModalContent = () => {
  const template = document.getElementById("modalFormTemplate");

  const card = document.createElement("div");
  card.className = "form-card";
  card.style.background = "none";
  card.style.border = "none";
  card.style.boxShadow = "none";
  card.style.padding = "0";
  card.style.backdropFilter = "none";
  card.appendChild(template.content.cloneNode(true));
  card.appendChild(sourceCard.querySelector(".js-inquiry-form").cloneNode(true));
  card.appendChild(sourceCard.querySelector(".form-success").cloneNode(true));

  // avoid duplicate IDs in the cloned form
  card.querySelectorAll("[id]").forEach((el) => {
    el.id = `${el.id}-modal`;
  });
  card.querySelectorAll("label[for]").forEach((label) => {
    label.setAttribute("for", `${label.getAttribute("for")}-modal`);
  });

  modalBody.appendChild(card);
  initInquiryForm(card.querySelector(".js-inquiry-form"));
  modalLoaded = true;
};

const openModal = () => {
  if (!modalLoaded) buildModalContent();
  lastFocused = document.activeElement;

  modal.hidden = false;
  document.body.classList.add("modal-open");
  requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add("open")));

  const firstInput = modal.querySelector("input, select, textarea");
  setTimeout(() => firstInput?.focus(), 380);
};

const closeModal = () => {
  modal.classList.remove("open");
  document.body.classList.remove("modal-open");

  setTimeout(() => {
    modal.hidden = true;
    lastFocused?.focus();
  }, 420);
};

document.querySelectorAll("[data-open-modal]").forEach((btn) => {
  btn.addEventListener("click", openModal);
});

modal.addEventListener("click", (e) => {
  if (e.target.closest("[data-close-modal]")) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeModal();
});

/* ============================================================
   Footer year
   ============================================================ */
document.getElementById("year").textContent = new Date().getFullYear();
