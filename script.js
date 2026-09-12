// Fatun - Modern Portfolio JavaScript
// Interactive UI logic, modal handling, toast notifications, and keyboard navigation

document.addEventListener('DOMContentLoaded', () => {
  initScrollSpy();
});

/**
 * Open the case study deep-dive modal
 */
function openModal(modalId = 'case-study-modal') {
  const modal = document.getElementById(modalId) || document.getElementById('case-study-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

/**
 * Close the open modal
 */
function closeModal(modalId = 'case-study-modal') {
  const modal = document.getElementById(modalId) || document.getElementById('case-study-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore background scrolling
  }
}

/**
 * Close modal if the backdrop area is clicked
 */
function closeModalOnBackdrop(event) {
  if (event.target.classList.contains('modal-overlay')) {
    closeModal();
  }
}

/**
 * Close modal with Escape key
 */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

/**
 * Copy email address to clipboard with toast notification
 */
function copyEmail() {
  const emailElem = document.getElementById('email-text');
  const email = emailElem ? emailElem.textContent.trim() : 'fatun.dev@gmail.com';

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(email)
      .then(() => showToast(`Copied ${email} to clipboard!`))
      .catch(() => fallbackCopy(email));
  } else {
    fallbackCopy(email);
  }
}

/**
 * Fallback copy method for older browsers or non-HTTPS local contexts
 */
function fallbackCopy(text) {
  const tempInput = document.createElement('textarea');
  tempInput.value = text;
  tempInput.style.position = 'fixed';
  tempInput.style.left = '-9999px';
  document.body.appendChild(tempInput);
  tempInput.select();
  try {
    document.execCommand('copy');
    showToast(`Copied ${text} to clipboard!`);
  } catch (err) {
    showToast('Failed to copy. Please manually select the email.');
  }
  document.body.removeChild(tempInput);
}

/**
 * Display toast alert
 */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/**
 * ScrollSpy: Highlight active nav link while scrolling
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPosition = window.scrollY + 120;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}
