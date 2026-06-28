# White Collar Academy — Agent Briefing

Read this entire file before touching anything.

## What this site is

whitecollaracademy.com — a front-door static site for a book and audio course called
"Start Here: a calm guide to the federal process, for the people inside it and the
families beside them" (short: "Start Here: a calm guide to the federal process";
one-word shelf ref: "Start Here"). The author is Sonny Saggar, a physician
(Oxford/Barts, 25 years emergency medicine) who went through the federal system himself.

There are TWO books on this site:
1. START HERE — the practical 15-chapter guide to the federal process. This is the
   main work. Its serialised chapters are the Free Chapters section.
2. GROUND — a reflective companion book about losing everything and still having
   somewhere to stand. It appears ONLY as the email-capture giveaway PDF.
   Do not attribute the Free Chapters to Ground. Do not call Ground a navigation guide.

Byline for Start Here: "by Sonny Saggar, a physician who went through it"
(credentials sit behind the title, never above it).

The site builds trust, offers free content, and captures emails.
It does NOT handle payments or paid video access — that goes to Thinkific (not yet live).

## What this site is NOT

- Not newphysician.org. That is a completely separate Cloudflare Pages project
  called "the-new-physician". Do not touch it. Do not connect this repo to it.
- Not a service business. No individual advice, consulting, coaching, or
  one-to-one help is offered anywhere on the public site. Ever. This is a
  compliance requirement, not a preference.

## Stack

Plain HTML + CSS + vanilla JS. No framework. No build step.
Hosted on Cloudflare Pages (project: whitecollaracademy).
Branch: claude/wca-front-door-newphysician-9osq7s
Repo: saggarsonny-boop/wca

## File structure

```
index.html              Home page (live)
about.html              Author bio (live, bio copy still placeholder)
videos.html             Free video library (live, no videos yet)
writing.html            SSRN / Medium / Substack links (live, links still placeholder)
_draft/course.html      Course sales page (NOT live, NOT linked in public nav)
css/style.css           All styles
data/videos.js          Video library data — edit this to add videos
js/videos.js            Renders video library from data/videos.js
js/subscribe.js         Email form handler
functions/api/subscribe.js  Cloudflare Pages Function for email capture
assets/portrait.jpg     Author portrait (real file, in use)
assets/favicon.svg      WCA favicon (SVG)
wrangler.toml           Cloudflare Pages config
PLACEHOLDERS.md         Every placeholder that still needs filling
SITE_MAP.md             What is live, what is hidden, how to enable each piece
```

## What is hidden and why

### Video section (index.html)
The intro video section is hidden with `display:none` until a YouTube ID is available.
To enable: set `display:block` on `#free-video` section and add the YouTube embed ID.
Search for `VIDEO FLAG` in index.html.

### Course page (_draft/course.html)
Not linked in public nav. Has noindex meta tag. Has yellow draft banner.
Pricing section inside is hidden with CSS class `pricing-section` (display:none).
To enable the whole page: add nav link, remove draft banner, remove noindex.
To enable pricing: change class to `pricing-section--live` and add rule to style.css.
Search for `PRICING FLAG` in _draft/course.html.

### Thinkific buy buttons
All href="#" with comments. Thinkific account not yet created.
Will be created once all 15 course videos are filmed.

### D1 email database
wrangler.toml has D1 binding commented out — placeholder database_id.
Email form returns 503 until D1 is set up.
Setup instructions are in the header comment of functions/api/subscribe.js.

## Compliance rules — never violate

1. No language anywhere on public pages about individual help, consulting,
   coaching, or one-to-one services.
2. Framing is always: writing, videos, general information, a map.
3. Footer disclaimer must stay on every public page:
   "General information only — not legal advice."
4. _draft/course.html must keep noindex and draft banner until owner says go live.

## Key people / accounts

- Author: Sonny Saggar (saggarsonny@gmail.com)
- GitHub: saggarsonny-boop
- Cloudflare account ID: 31a6ab4af182c6db3d73cbce12807f23
- Medium: https://medium.com/@saggarsonny
- Substack: https://substack.com/@drsonny
- SSRN: https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=10558116

## What still needs filling (summary — see PLACEHOLDERS.md for full list)

- About page: author bio paragraphs
- writing.html: SSRN paper URLs, essay URLs
- data/videos.js: YouTube video IDs, titles, descriptions
- index.html: YouTube intro video ID (VIDEO FLAG section)
- _draft/course.html: 15 chapter titles, course name, pricing (when ready)
- Privacy policy page (required before email goes live)
- D1 database ID in wrangler.toml

## Environment variables (set in Cloudflare Pages dashboard, never in code)

| Variable | Purpose | Required now? |
|---|---|---|
| EMAIL_PROVIDER_API_KEY | Third-party email provider (optional) | No |
| EMAIL_LIST_ID | Provider list ID (optional) | No |

## Tone and copy rules

- Calm, credible, plain. The visitor is often frightened.
- No hype. No em dashes in body copy. No AI-sounding phrases.
- Do not rewrite the hero copy on index.html. It is final.
- Do not add features, animations, or abstractions not asked for.
- Mobile first always.
