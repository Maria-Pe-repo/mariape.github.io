# Maria Pe website

Maria Pe's freelance portfolio and services site (Freelance Web & Content Consultant). Hosted on Cloudflare as a Worker named `mariape-github-io`, connected to this repo and configured by `wrangler.jsonc` (static assets; `.assetsignore` keeps repo files like CLAUDE.md off the site). Every push to `main` deploys in a minute or two.
Live address until the custom domain is added: https://mariape-github-io.pe-marialourdesp.workers.dev

## Search files
- `sitemap.xml` lists every page with absolute URLs. Add a line when a page is added, and update `lastmod` when a page changes meaningfully.
- `robots.txt` allows all crawlers, including AI search bots. Keep it that way; Maria sells AI search visibility.
- When the custom domain goes live, replace `https://mariape-github-io.pe-marialourdesp.workers.dev` in both files.

## How the site is built
- Plain HTML, CSS and a little JavaScript. No build step, no framework.
- 12 pages at the root: index, services, websites (WaaS + pricing), social-media, seo, ai-search, email-marketing, work, about, blog, teams, contact.
- Shared styles in `site.css`, shared behaviour in `site.js` (mega menu, mobile drawer, PH/AU/US price switcher, motion). Images in `img/`.
- Header, mega menu, drawer and footer are repeated in every page. A change to any of them must be made in all 12 pages.
- When `site.css` or `site.js` changes, bump the `?v=` query string on every page so browsers load the new file.
- Links are relative (`about.html`, `./`). Keep them relative so the site works at any GitHub Pages address or custom domain.

## Rules
- Change only what Maria asks for. Don't restyle or rewrite other sections.
- No em dashes anywhere.
- Never invent facts, numbers, clients, results or testimonials. Missing facts go in [brackets] and get flagged to Maria.
- Write in Maria's voice: warm but clearly expert, plain short sentences, specific proof. Avoid clever slogan pairs and wordplay, and stiff corporate filler.
- Motion must be readable at rest and switch off under `prefers-reduced-motion`.
- Keep WCAG 2.2 AA contrast, one H1 per page, headings in order, alt text on images.
- Never put Roger Roger client material or third-party logos on the site.

## Before pushing
- Check the changed pages in a headless browser at 390px and 1440px wide.
- Tell Maria in plain words what changed. Push to `main` only when she asks for it to go live.

## Known open items
- About page: "[Title and start date from your updated CV]" placeholder.
- Work mega menu heading "Built, not borrowed" is the kind of slogan Maria wants to avoid.
- Contact form opens the visitor's email app (mailto). There is no form backend.
