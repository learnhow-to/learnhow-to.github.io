# Fatur — Personal Engineering Portfolio

Website portofolio personal Fatur yang dirancang dengan pendekatan editorial minimal, jujur, aksesibel, dan berfokus pada engineering.

- **URL Publik (GitHub Pages):** [https://learnhow-to.github.io](https://learnhow-to.github.io)
- **Repository:** [https://github.com/learnhow-to/learnhow-to.github.io](https://github.com/learnhow-to/learnhow-to.github.io)
- **Email:** [faturahon@gmail.com](mailto:faturahon@gmail.com)

---

## 📂 Struktur File

```
fatun-portfolio/
│
├── index.html                  # Halaman utama (HTML5 semantik, WCAG AA, dialog native, skip link)
├── style.css                   # Stylesheet editorial minimal (responsif, prefers-reduced-motion)
├── script.js                   # Client logic (drawer menu, modal dialog, copy feedback, scrollspy)
├── case_study_droidmirror.md   # Studi kasus teknis terstruktur dengan benchmark lokal
└── README.md                   # Dokumentasi ini
```

---

## 🛠️ Fitur & Standar Aksesibilitas
- **Semantic Landmarks:** `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<dialog>`.
- **Keyboard Navigation:** Skip to main content, visible focus indicator (`:focus-visible`), focus trap di modal dialog, dan tombol Escape untuk menutup menu & dialog.
- **Screen Reader Support:** Dialog memiliki `aria-labelledby`, toast status memiliki `aria-live="polite"`, dan mobile menu memiliki `aria-expanded`.
- **Kontras Warna:** Memenuhi standar rasio kontras WCAG AA.
- **Responsive:** Diuji bebas overflow horizontal di resolusi 360px hingga 1440px.
