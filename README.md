# Saurav Personal Site

Personal site and hub for everything Saurav makes — static HTML deployed on Vercel, no build step.

## Structure

- `index.html` — the homepage hub: products, essays, experiments, apps, watching, research, about. Self-contained (styles and scripts inline).
- `writings/` — essays, the research journey, the watching list, and book reviews (`books.html` — add a review by copying the commented template in the file). Each page is its own designed object with its own stylesheet.
- `hop-explorer/` — landing, support, and privacy pages for the Hop Explorer iOS app.
- `dock.js` — the floating navigation pill shared by every page outside the homepage. Self-styled, adapts to light or dark pages; include it with `<script defer src="/dock.js"></script>` before `</body>`.
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

1. Create the HTML file (essays live in `writings/`).
2. Add `<script defer src="/dock.js"></script>` before `</body>` so it gets the shared navigation.
3. Link it from the relevant section and the footer site map in `index.html`.
4. Add it to `sitemap.xml`.
