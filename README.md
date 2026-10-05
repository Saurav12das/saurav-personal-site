# Saurav’s notebook / Brain Fog

A personal site built around “Stay curious”: Groundwork (science and research), Brain Fog (writing), Building (products, apps, experiments), Screen Time (movies, series, anime), and Bookshelf (reading). Static HTML, CSS, and a small amount of JavaScript; deployed on Vercel with no build step. Brain Fog is the weekly visual series. The first edition explores automation and economics.

## Local preview and checks

```bash
npm run dev
npm run check
```

Open http://localhost:8080. Python 3 and Node are needed for these development commands. Production does not need Python. `scripts/check-site.py` verifies the redesigned pages’ local links, anchors, image alternatives, RSS, sitemap, and structured data.

## Structure

- `index.html` — editorial homepage and featured edition.
- `brain-fog.html` — the complete writing home: weekly editions, the existing six-essay archive, and the series introduction. `writing.html` redirects here for old links.
- `brain-fog/automation-and-economics.html` — edition 001, with six timeline entries, historical perspectives, sourced graphics, an interactive productivity experiment, and a private reader notebook.
- `brain-fog.css` — paper/orange/charcoal design system and responsive edition layouts. Loaded after `site.css`, which retains the layouts for the existing section pages.
- `brain-fog.js` — edition interactions: keyboard-accessible timeline, productivity arithmetic, local notes, saving, sharing, print, and reading progress. Notes and saved-edition state stay in the reader’s browser; no backend receives them. Share copies the canonical production URL, with a selectable-link dialog if clipboard access fails.
- `images/brain-fog/` — locally hosted cover and historical portraits. `credits.json` records image sources, licenses, and the exact built-in ImageGen prompt. `automation-original.png` is the retained generation; the smaller JPEG is used on the site.
- `feed.xml` — RSS 2.0 feed for following the weekly series. It updates when another item is added; it is not an email signup.
- `products.html` — Building, the parent section for agricultural products, `experiments.html`, and `apps.html`.
- `writings/research-journey.html` — Groundwork, the science and research portfolio.
- `writings/watching.html` — Screen Time: 23 preserved movie, series, and animation reviews, with format filters and search across titles and notes. All entries remain readable without JavaScript.
- `writings/books.html` — Bookshelf: the published *The Farm Is Here* review on Plot & Proof, plus James Suzman’s *Work* as a reading discovery with the supplied Big Think video. Read books and books to explore are labeled separately.
- `library.css`, `screen-time.js` — responsive reading/screening room layouts and the collection’s search/filter controls. Add reviews as static `.screen-card` articles with a `data-category` of `movies`, `series`, or `animation`; update the visible category and collection counts when adding entries.
- `images/books/` — official cover images; `credits.json` records their source pages and image URLs.
- `about.html` — the personal story.
- `writings/` — existing essays, research journey, watching list, and book reviews. Their individual essay designs and URLs remain available.
- `hop-explorer/` — app landing, support, and privacy pages.
- `dock.js` — navigation for bespoke older pages, including a route back to Brain Fog.
- `site-links.json` — the five navigation destinations and the owner’s established public profiles: Email, LinkedIn, GitHub, X/Twitter, Google Scholar, and RSS. Add new profiles only when the owner supplies or confirms their URLs.
- `scripts/sync-site-shell.py` — renders static headers and contact footers from those links. Run `npm run sync:site` after a profile or navigation change. Main pages share navigation; older essays retain their own headers and receive the shared contact footer.
- `site-chrome.css` — isolated header/footer styling, including the orange-dot brand and the dark Screen Time variant.
- `site.js` — shared navigation sizing, current year, and back-to-top behavior.
- `views.js` — existing GoatCounter essay view counters.
- `api/og.tsx` — existing Open Graph image endpoint. Brain Fog uses its local cover for social previews.
- `sitemap.xml`, `robots.txt`, `vercel.json` — discovery and clean URL configuration.

## Add a weekly edition

1. Create a new HTML page in `brain-fog/`, using edition 001 as the structure. Change the issue number, date, title, description, canonical URL, social metadata, structured data, and content. Set the `data-issue` attribute on `<main>` to a unique issue number; notes, saved state, and downloaded filenames are automatically scoped to that edition.
2. Build a clear learning sequence: question, context, visual evidence, historical perspectives, interpretation, reflection, and sources. Clearly label paraphrases, historical illustrations, hypothetical arithmetic, and uncertainty. Give every quantitative visual units, scales, a source, and any material assumptions.
3. Keep images inside the repository; record sources and generation prompts in a credits file. Use meaningful alt text and leave source links inspectable.
4. Add the edition to `brain-fog.html` and feature it on `index.html`. Keep older editions in the archive.
5. Prepend an item to `feed.xml` with a stable canonical URL as its GUID and a valid RFC 822 publication date. Do not change old GUIDs. Add the new page to `sitemap.xml` and the checker’s page list; update its edition-count check.
6. Check desktop and phone layouts, keyboard navigation, interactions, image loads, and source links. Run `npm run check`.

The current weekly workflow is manual. No scheduled publishing or outgoing email is configured. The site can be followed in an RSS reader.

## Deploy

The existing production workflow deploys on a push to `main`. This redesign is prepared in the local workspace; preview it before choosing to publish.
