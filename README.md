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
- `follow.html`, `follow.css`, `follow.js` — subscription directory with an Everything feed, five section feeds, RSS instructions, and copyable URLs. No email addresses are collected.
- `data/updates.json` — publication records used to generate feeds. Each intentional update has a section, stable ID, title, URL, publication timestamp, and summary.
- `scripts/build-feeds.py`, `feeds/` — generate and validate the combined and per-section RSS feeds. `feed.xml` remains the original Brain Fog feed URL; existing subscriber IDs are preserved.
- `products.html` — Building, the parent section for agricultural products, `experiments.html`, and `apps.html`.
- `writings/research-journey.html` — Groundwork, the science and research portfolio.
- `writings/watching.html` — Screen Time: 23 preserved movie, series, and animation reviews, with format filters and search across titles and notes. All entries remain readable without JavaScript.
- `writings/books.html` — Bookshelf: the published *The Farm Is Here* review on Plot & Proof, plus James Suzman’s *Work* as a reading discovery with the supplied Big Think video. Read books and books to explore are labeled separately.
- `library.css`, `screen-time.js` — responsive reading/screening room layouts and the collection’s search/filter controls. Add reviews as static `.screen-card` articles with a `data-category` of `movies`, `series`, or `animation`; update the visible category and collection counts when adding entries.
- `images/books/` — official cover images; `credits.json` records their source pages and image URLs.
- `writings/writing__social-coin.html`, `writings/writing__pathology-of-more.html` — illustrated essays with matching paper-and-engraving covers, shared site navigation, chapter links, and related reading. Existing essay bodies and figures are retained.
- `essay-visual.css`, `images/essays/` — scoped editorial layouts and original/generated web covers. `credits.json` records the built-in ImageGen prompts and labels the images as conceptual illustrations, not historical photographs or scientific diagrams. The original PNGs are retained alongside JPEGs served on the pages and used in social previews.
- `post-art.css` — responsive illustration openings for Post-AI Economics, The Balance Sheet, Brahmanda, and WDMA. Their ImageGen prompts are saved in `images/essays/additional-posts-prompts.json`; small thumbnails bring all six essay covers into the Brain Fog archive.
- `site-chrome.css` keeps navigation prominent across every essay and section, with a dark background, an orange active section, and upright heading typography. Run `npm run sync:site` after changing the shared navigation.
- `about.html` — the personal story.
- `writings/` — existing essays, research journey, watching list, and book reviews. Their individual essay designs and URLs remain available.
- `hop-explorer/` — app landing, support, and privacy pages.
- `dock.js` — navigation for bespoke older pages, including a route back to Brain Fog.
- `site-links.json` — the five navigation destinations, Follow page, and the owner’s established public profiles: Email, LinkedIn, GitHub, X/Twitter, and Google Scholar. Add new profiles only when the owner supplies or confirms their URLs.
- `scripts/sync-site-shell.py` — renders static navigation and contact footers from those links. Run `npm run sync:site` after a profile or navigation change. All section pages and essays share navigation; each essay retains its own editorial title and body layout.
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
5. Add a publication record to `data/updates.json` with section `brain-fog`, then run `npm run feeds`. Do not change existing IDs or publication dates. Add a new standalone page to `sitemap.xml` and the checker’s page list.
6. Check desktop and phone layouts, keyboard navigation, interactions, image loads, and source links. Run `npm run check`.

## Publish an update in any section

1. Create or edit the content. For an addition to a collection page, give the new entry a stable HTML anchor so readers can go straight to it.
2. Add a record to `data/updates.json` using one of `groundwork`, `brain-fog`, `building`, `screen-time`, or `bookshelf`. Use an ISO 8601 publication timestamp including the timezone. Give each update a permanent unique `id`; the `url` should point to the published page or entry anchor. Keep existing IDs and dates unchanged when fixing typos.
3. Run `npm run feeds`, then `npm run check`. The checker catches stale generated feeds, missing pages, duplicate IDs, incorrect category membership, and invalid ordering. Commit the page, publication record, and generated XML together when authorized to publish.
4. Once deployed, feed readers discover the new entry on their next refresh. Reader settings control alerts; RSS itself does not send email or browser push notifications. An ordinary page edit without a new publication record does not notify subscribers.

The four initial collection entries announce the redesigned sections on October 4, 2026; they do not assign new original publication dates to the projects, films, research, or books mentioned there.

### Email and voluntary support

Website email delivery is not configured. The Follow page states that email signup is unavailable. Do not collect emails in a form until a real provider is connected.

For email delivery with topic preferences, a service such as Kit can connect each section feed to its corresponding opt-in interest tag. An Everything subscriber can receive the combined feed instead; avoid subscribing them to overlapping campaigns. Configure new-post emails or a digest in the provider, confirmation, preference management, and unsubscribe links. Keep broadcasts in draft mode unless Saurav explicitly authorizes sending; no outgoing email is authorized by this repository setup. Verify the chosen plan supports the required features before purchasing.

Provider references: [Kit RSS setup](https://help.kit.com/en/articles/2502636-how-to-connect-your-rss-feed-to-kit), [Kit topic preferences](https://help.kit.com/en/articles/6082488-managing-subscriber-preferences-in-kit). The existing Plot & Proof Substack is a separate publication; subscribing there does not automatically subscribe someone to these website feeds.

Voluntary support links to Saurav’s confirmed public page, https://buymeacoffee.com/sauravdastsk. The `kind: support` entry in `site-links.json` supplies both the shared footer link and the support panel on the Follow page; run `npm run sync:site` after changing it. The site uses ordinary external links, with checkout and payment details handled by Buy Me a Coffee. No third-party payment widget or payment processing code is embedded. The public creator page was verified; no payment was submitted or payout settings changed.

## Deploy

The existing production workflow deploys on a push to `main`. This redesign is prepared in the local workspace; preview it before choosing to publish.
