/**
 * JINOY K S — PORTFOLIO · script.js
 * Vanilla JS — no libraries, no dependencies
 * Features:
 *   1. Sticky navbar scroll effect
 *   2. Active nav link tracking (IntersectionObserver)
 *   3. Hamburger / mobile menu toggle
 *   4. Close mobile menu on outside click or link click
 *   5. Scroll-triggered fade-in-up animations (IntersectionObserver)
 *   6. Contact form client-side validation
 *   7. Footer year auto-update
 */

/* ─── Utility: DOM selector helpers ─────────────────────────── */
const qs  = (sel, scope = document) => scope.querySelector(sel);
const qsa = (sel, scope = document) => [...scope.querySelectorAll(sel)];


/* ═══════════════════════════════════════════════════════════════
   1. STICKY NAVBAR — adds .scrolled class after 10px scroll
═══════════════════════════════════════════════════════════════ */
(function initNavScroll() {
  const header = qs('#site-header');
  if (!header) return;

  const THRESHOLD = 10; // px from top before nav changes

  function handleScroll() {
    if (window.scrollY > THRESHOLD) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on load
})();


/* ═══════════════════════════════════════════════════════════════
   2. ACTIVE NAV LINK — highlights link for section in viewport
═══════════════════════════════════════════════════════════════ */
(function initActiveNav() {
  const sections   = qsa('section[id]');
  const navLinks   = qsa('.nav__link');

  if (!sections.length || !navLinks.length) return;

  // Build a map from section id → nav link
  const linkMap = {};
  navLinks.forEach(link => {
    const href = link.getAttribute('href'); // e.g. "#about"
    if (href && href.startsWith('#')) {
      linkMap[href.slice(1)] = link;
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Remove active from all
          navLinks.forEach(l => l.classList.remove('active'));
          // Add active to matching
          const link = linkMap[entry.target.id];
          if (link) link.classList.add('active');
        }
      });
    },
    {
      rootMargin: '-20% 0px -70% 0px', // trigger when section is ~20% from top
      threshold: 0
    }
  );

  sections.forEach(section => observer.observe(section));
})();


/* ═══════════════════════════════════════════════════════════════
   3. HAMBURGER MENU — toggle mobile nav drawer
═══════════════════════════════════════════════════════════════ */
(function initHamburger() {
  const hamburger  = qs('#hamburger-btn');
  const mobileMenu = qs('#mobile-menu');
  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.removeAttribute('aria-hidden');
    // Prevent body scroll while menu is open
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  }

  // Button click
  hamburger.addEventListener('click', toggleMenu);

  // Close when any menu link is clicked
  qsa('.mobile-menu__link', mobileMenu).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    const header = qs('#site-header');
    if (mobileMenu.classList.contains('open') && !header.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });
})();


/* ═══════════════════════════════════════════════════════════════
   4. SCROLL-TRIGGERED FADE-IN-UP ANIMATIONS
   Uses IntersectionObserver to add .visible class when
   elements with .fade-in-up enter the viewport
═══════════════════════════════════════════════════════════════ */
(function initScrollAnimations() {
  const animatedEls = qsa('.fade-in-up, .skill-group, .project-card');
  if (!animatedEls.length) return;

  // Add fade-in-up class to skill-group and project-card if not already present
  animatedEls.forEach(el => {
    if (!el.classList.contains('fade-in-up')) {
      el.classList.add('fade-in-up');
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve once animated — no need to re-trigger
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '0px 0px -60px 0px', // trigger slightly before element fully enters
      threshold: 0.1
    }
  );

  animatedEls.forEach(el => observer.observe(el));
})();


/* ═══════════════════════════════════════════════════════════════
   5. CONTACT FORM — client-side validation + success state
═══════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form        = qs('#contact-form');
  const successMsg  = qs('#form-success');
  if (!form) return;

  // Field config: { id, type, label, minLength? }
  const fields = [
    { id: 'name',    type: 'text',  label: 'Name',    minLength: 2 },
    { id: 'email',   type: 'email', label: 'Email'                  },
    { id: 'message', type: 'text',  label: 'Message', minLength: 10 },
  ];

  /* Validator — returns error string or empty string if valid */
  function validateField({ id, type, label, minLength }) {
    const input = qs(`#${id}`, form);
    const value = input.value.trim();

    if (!value) {
      return `${label} is required.`;
    }

    if (type === 'email') {
      // Basic RFC-compliant-ish email check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address.';
      }
    }

    if (minLength && value.length < minLength) {
      return `${label} must be at least ${minLength} characters.`;
    }

    return ''; // valid
  }

  /* Show or clear error for a field */
  function setFieldError(id, message) {
    const input     = qs(`#${id}`, form);
    const errorEl   = qs(`#${id}-error`, form);

    if (message) {
      input.classList.add('error');
      errorEl.textContent = message;
    } else {
      input.classList.remove('error');
      errorEl.textContent = '';
    }
  }

  /* Live validation — clear error as user types after first submit attempt */
  let hasSubmitted = false;

  fields.forEach(({ id }) => {
    const input = qs(`#${id}`, form);
    if (!input) return;

    input.addEventListener('input', () => {
      if (!hasSubmitted) return; // only live-validate after first attempt
      const field  = fields.find(f => f.id === id);
      const error  = validateField(field);
      setFieldError(id, error);
    });

    input.addEventListener('blur', () => {
      if (!hasSubmitted) return;
      const field  = fields.find(f => f.id === id);
      const error  = validateField(field);
      setFieldError(id, error);
    });
  });

  /* Form submit */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hasSubmitted = true;

    // Validate all fields
    let isValid = true;
    fields.forEach(field => {
      const error = validateField(field);
      setFieldError(field.id, error);
      if (error) isValid = false;
    });

    if (!isValid) {
      // Focus the first invalid input for accessibility
      const firstInvalid = qs('.form-input.error', form);
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Simulate submission (no backend)
    const submitBtn = qs('[type="submit"]', form);
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      // Show success
      form.reset();
      hasSubmitted = false;
      fields.forEach(({ id }) => setFieldError(id, ''));

      if (successMsg) {
        successMsg.removeAttribute('hidden');
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      submitBtn.textContent = 'Send Message →';
      submitBtn.disabled = false;

      // Hide success message after 6s
      setTimeout(() => {
        if (successMsg) successMsg.setAttribute('hidden', '');
      }, 6000);
    }, 1000); // simulated async delay
  });
})();


/* ═══════════════════════════════════════════════════════════════
   6. FOOTER YEAR — auto-update copyright year
═══════════════════════════════════════════════════════════════ */
(function initFooterYear() {
  const el = qs('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ═══════════════════════════════════════════════════════════════
   7. SMOOTH ANCHOR SCROLL — extra insurance for older browsers
   (html { scroll-behavior: smooth } handles modern browsers,
   this adds a JS fallback for anchor clicks)
═══════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
    // Update URL without triggering scroll
    history.pushState(null, '', `#${targetId}`);
  });
})();
