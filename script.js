const adminEmail = "bishalpandey0123@gmail.com";

const contactForm = document.getElementById("contact-form");
const yearElement = document.getElementById("year");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.getElementById("nav-links");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// ── Scroll-triggered reveal animation ──
const revealElements = document.querySelectorAll(".reveal");
if (revealElements.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealElements.forEach((el) => observer.observe(el));
}

// ── Active nav highlight on scroll ──
const sections = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav-links a");

if (sections.length && navAnchors.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => a.classList.remove("active"));
          const active = document.querySelector(
            `.nav-links a[href="#${entry.target.id}"]`
          );
          if (active) active.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => sectionObserver.observe(s));
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function showError(inputId, message) {
  const errorElement = document.getElementById(`${inputId}-error`);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearErrors() {
  ["name", "email", "subject", "message"].forEach((id) => showError(id, ""));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();
    const status = document.getElementById("form-status");

    let hasError = false;

    if (!name) {
      showError("name", "Please enter your name.");
      hasError = true;
    }

    if (!email) {
      showError("email", "Please enter your email.");
      hasError = true;
    } else if (!isValidEmail(email)) {
      showError("email", "Please enter a valid email address.");
      hasError = true;
    }

    if (!subject) {
      showError("subject", "Please add a subject.");
      hasError = true;
    }

    if (!message) {
      showError("message", "Please write a message.");
      hasError = true;
    }

    if (hasError) {
      if (status) {
        status.textContent = "Please fix the highlighted fields and try again.";
        status.style.color = "#ff4060";
      }
      return;
    }

    // Disable the submit button while sending
    const submitBtn = contactForm.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    fetch("https://formsubmit.co/ajax/" + adminEmail, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name,
        email,
        _replyto: email,
        _subject: `[Portfolio Contact] ${subject}`,
        message,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(() => {
        if (status) {
          status.textContent = "";
        }
        contactForm.reset();
        showMsg();
      })
      .catch(() => {
        if (status) {
          status.textContent = "Failed to send message. Please try again.";
          status.style.color = "#ff4060";
        }
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Message";
        }
      });
  });
}

// ── Success confirmation dialog ──
let msgTimer = null;
const msgDialog = document.getElementById("msg-confirm");

function hideMsg() {
  if (msgDialog) {
    msgDialog.classList.remove("show");
    msgDialog.hidden = true;
  }
  clearTimeout(msgTimer);
}

function showMsg() {
  if (!msgDialog) return;
  msgDialog.hidden = false;
  msgDialog.style.display = "";
  void msgDialog.offsetWidth;
  msgDialog.classList.add("show");
  clearTimeout(msgTimer);
  msgTimer = setTimeout(hideMsg, 3000);
}

const msgClose = document.getElementById("msg-confirm-close");
if (msgClose) {
  msgClose.addEventListener("click", hideMsg);
}

if (msgDialog) {
  msgDialog.addEventListener("click", (e) => {
    if (e.target === msgDialog) hideMsg();
  });
}
