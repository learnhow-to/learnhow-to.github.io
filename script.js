/**
 * Fatur Portfolio — Accessible, Zero-Dependency Client Logic
 * Features: Mobile Nav Drawer, Native Accessible Dialog with Focus Trap,
 * Clipboard Copy with Live Feedback, and ScrollSpy Navigation.
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initCaseStudyDialog();
  initEmailCopy();
  initScrollSpy();
});

/**
 * Mobile Navigation Drawer Toggle & Keyboard Handling
 */
function initMobileNav() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (!menuToggle || !mobileNav) return;

  function openMenu() {
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close navigation menu');
    mobileNav.removeAttribute('hidden');
  }

  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
    mobileNav.setAttribute('hidden', '');
  }

  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when a navigation link is clicked
  const mobileLinks = mobileNav.querySelectorAll('a');
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuToggle.focus();
    }
  });

  // Close menu if clicked outside header
  document.addEventListener('click', (e) => {
    const header = document.querySelector('.site-header');
    if (header && !header.contains(e.target) && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });
}

/**
 * Case Study Dialog with Native showModal, Focus Trap & Restoration
 */
function initCaseStudyDialog() {
  const dialog = document.getElementById('case-study-dialog');
  const openBtn = document.getElementById('open-case-study-btn');
  const closeBtn = document.getElementById('dialog-close-btn');
  const bottomCloseBtn = document.getElementById('dialog-bottom-close-btn');

  if (!dialog || !openBtn) return;

  let lastActiveElement = null;

  function openDialog() {
    lastActiveElement = document.activeElement;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.body.style.overflow = 'hidden';

    // Set initial focus to close button
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  function closeDialog() {
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
    document.body.style.overflow = '';

    // Restore focus to element that opened the dialog
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  openBtn.addEventListener('click', openDialog);
  if (closeBtn) closeBtn.addEventListener('click', closeDialog);
  if (bottomCloseBtn) bottomCloseBtn.addEventListener('click', closeDialog);

  // Close on backdrop click
  dialog.addEventListener('click', (e) => {
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      closeDialog();
    }
  });

  // Handle native cancel (Escape key)
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeDialog();
  });

  // Focus Trap inside dialog
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = dialog.querySelectorAll(focusableSelectors);
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  });
}

/**
 * Copy Email to Clipboard with Immediate Button Feedback & Polite Toast
 */
function initEmailCopy() {
  const copyBtn = document.getElementById('copy-email-btn');
  const copyText = document.getElementById('copy-btn-text');
  const toast = document.getElementById('toast');

  if (!copyBtn) return;

  const targetEmail = 'faturahon@gmail.com';
  let resetTimeout = null;

  copyBtn.addEventListener('click', () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(targetEmail)
        .then(() => handleCopySuccess())
        .catch(() => fallbackCopy(targetEmail));
    } else {
      fallbackCopy(targetEmail);
    }
  });

  function handleCopySuccess() {
    if (copyText) {
      copyText.textContent = 'Email Copied to Clipboard!';
      clearTimeout(resetTimeout);
      resetTimeout = setTimeout(() => {
        copyText.textContent = `Copy Email (${targetEmail})`;
      }, 2500);
    }
    showToast(`Copied ${targetEmail} to clipboard.`);
  }

  function fallbackCopy(text) {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = text;
    tempTextarea.style.position = 'fixed';
    tempTextarea.style.left = '-9999px';
    document.body.appendChild(tempTextarea);
    tempTextarea.select();

    try {
      document.execCommand('copy');
      handleCopySuccess();
    } catch (err) {
      showToast('Could not copy automatically. Please select the email manually.');
    }
    document.body.removeChild(tempTextarea);
  }

  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.setAttribute('data-visible', 'true');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.removeAttribute('data-visible');
    }, 3200);
  }
}

/**
 * ScrollSpy: Highlights Active Navigation Link on Scroll
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');

  if (!sections.length || !desktopLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        desktopLinks.forEach((link) => {
          const href = link.getAttribute('href');
          if (href === `#${activeId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}
