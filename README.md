# Saurav Personal Site

Personal site and hub for everything Saurav makes — static HTML deployed on Vercel, no build step.

## Structure

- `index.html` — the landing page: a short hello plus one card per section of the site.
- `products.html`, `writing.html`, `experiments.html`, `apps.html`, `about.html` — one page per section, all sharing `site.css` and `site.js`.
- `site.css` / `site.js` — the shared design system (white, one serif, dark green + black) and small shared behaviour for the pages above and `writings/books.html`.
- `writings/` — essays, the research journey, the watching list, and book reviews (`books.html` — add a review by copying the commented template in the file). Each page is its own designed object with its own stylesheet.
- `hop-explorer/` — landing, support, and privacy pages for the Hop Explorer iOS app.
- `dock.js` — the floating navigation pill for pages that have their own bespoke design (essays, research journey, watching, Hop Explorer). It stays out of the way on pages that already carry the shared top nav. Self-styled, adapts to light or dark pages; include it with `<script defer src="/dock.js"></script>` before `</body>`.
- `views.js` — GoatCounter view counter badge for essays.
- `api/og.tsx` — Open Graph image generator (`/api/og?title=…&kicker=…`).
- `sitemap.xml`, `robots.txt`, `vercel.json` (`cleanUrls` on).

## Local preview

Any static server from the repo root works, e.g.

```bash
ruby -rwebrick -e "WEBrick::HTTPServer.new(:Port=>8080,:DocumentRoot=>'.').start"
```

## Deploy

Push to `main` — Vercel deploys automatically.

## Adding a page

1. Create the HTML file (essays live in `writings/`). For a page in the shared design, copy the head/nav/footer from `about.html` and link `/site.css` + `/site.js`; for a bespoke page, add `<script defer src="/dock.js"></script>` before `</body>` instead.
2. Link it from the relevant section page and the footer site map in `index.html`.
3. Add it to `sitemap.xml`.
