# WCA browser audits

Diagnostic scripts only — nothing here ships to production, nothing is
linked from any page, and none of it touches live HTML/CSS. Paste the
contents of any file into browser DevTools console on the live site or
a preview URL and it runs a set of real, read-only DOM/Performance API
checks and prints a pass/fail report.

- `01-mobile-first-audit.js` — viewport, touch targets, typography, hamburger menu, images, forms
- `02-seo-audit.js` — meta tags, headings, content, Core Web Vitals for SEO, structured data, internal links, social
- `03-performance-audit.js` — Core Web Vitals, resource weight, caching, script/CSS loading
- `04-accessibility-audit.js` — PARTIAL. Only covers "Perceivable" and part of "Operable" (WCAG POUR). Missing "Understandable" and "Robust" categories, plus the Security and UX audits referenced but not yet provided.

Run each with its exported `run*Audit()` function after pasting.
