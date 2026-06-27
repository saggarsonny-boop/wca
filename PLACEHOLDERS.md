# Placeholders to fill before launch

Every item tagged `PLACEHOLDER` in the HTML/JS files is listed here.
Fill these before going live. Search the codebase for `PLACEHOLDER` to find each one.

---

## Content (copy)

| File | What to fill |
|---|---|
| `index.html` | `<title>` tagline |
| `index.html` | `<meta name="description">` |
| `index.html` | Hero headline (h1) |
| `index.html` | Hero sub-paragraph (the "lead" paragraph) |
| `index.html` | About teaser paragraph |
| `about.html` | Author name (h2) |
| `about.html` | Author role description |
| `about.html` | Bio paragraphs (3–4 paragraphs) |
| `writing.html` | `<meta name="description">` |
| `writing.html` | Intro sentence for the Writing page |
| All pages | Email offer headline ("Get the free …") |
| All pages | Email offer paragraph |

---

## Media

| File | What to add |
|---|---|
| `assets/portrait.jpg` | Drop your portrait photo here, then update the `<img>` tags in `index.html` and `about.html` |

---

## Videos

| File | What to fill |
|---|---|
| `index.html` | Intro video YouTube embed ID (in the `<!-- PLACEHOLDER: Replace … -->` comment block) |
| `index.html` | Intro video title and one-line description below the embed |
| `data/videos.js` | Each video object: set `id` to the YouTube video ID, update `title` and `description` |

---

## Writing page links

| File | What to fill |
|---|---|
| `writing.html` | Each `href="#"` → real SSRN paper URL |
| `writing.html` | Paper titles, years, descriptions |
| `writing.html` | Medium / Substack URL |
| `writing.html` | Essay titles, dates, descriptions |

---

## Course page (`_draft/course.html`) — fill before enabling

| What | Where |
|---|---|
| Course name | h1 in hero |
| Course positioning paragraph | hero lead paragraph |
| Who it helps — 3–5 bullet points | "Who this is for" section |
| 15 chapter titles | `<ol class="curriculum">` — replace each `PLACEHOLDER: Chapter N title` |
| Option names (e.g. "Full Access") | Pricing section |
| Prices | `$PLACEHOLDER` in pricing section |
| Thinkific one-time checkout URL | `href="#"` on "Get access" button |
| Thinkific monthly checkout URL | `href="#"` on "Start monthly" button |

---

## Infrastructure (before launch)

| Step | Detail |
|---|---|
| Create D1 database | `npx wrangler d1 create newphysician-subscribers` |
| Paste database ID | Into `wrangler.toml` → `database_id` |
| Create subscribers table | Command is in the comment at the top of `functions/api/subscribe.js` |
| Connect repo to Cloudflare Pages | Cloudflare dashboard → Workers & Pages → Create → Connect to Git |
| Set build settings | Build command: *(none — static site)* · Output directory: `/` |
| Add D1 binding in dashboard | Pages → Settings → Functions → D1 database bindings → name: `DB` |

## Environment variables (set in Cloudflare Pages dashboard, not in code)

| Variable | When needed |
|---|---|
| `EMAIL_PROVIDER_API_KEY` | Only if you add a third-party email provider (ConvertKit, Mailchimp, Beehiiv). See comments in `functions/api/subscribe.js`. |
| `EMAIL_LIST_ID` | Same — only with a third-party provider. |

---

## To go live with the course page

1. Fill all course-page placeholders above.
2. In `_draft/course.html`: find the `<div class="pricing-section">` and change `class="pricing-section"` → `class="pricing-section--live"` (then add `.pricing-section--live { display: block; }` to `css/style.css`).
3. Remove the `<div class="draft-banner">` at the top of `_draft/course.html`.
4. Remove `<meta name="robots" content="noindex, nofollow">` from `_draft/course.html`.
5. Add the course link to `<nav>` in all four public HTML files (search for the commented-out nav link).
6. Optionally move `_draft/course.html` to `course.html` at the root.
