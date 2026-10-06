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
- `design-system.css` — shared visual tokens and final design layer across all 17 personal-site pages: warm ivory, charcoal, orange, DM Sans for headings and body, and DM Mono for small labels. It loads last and unifies page spacing, article openings, reading columns, figures, and the former dark themes. Keep future visual changes here; content-specific layouts stay in their existing stylesheets. The separate Hop Explorer app pages are outside this editorial system.
- `brain-fog-index.js` — searches the seven unique pieces on Brain Fog by title, summary, and curated keywords, with three topic groups, shareable query parameters, a live count, and a clear empty state. All content remains visible without JavaScript.
- `brain-fog.css` — responsive homepage and edition layouts, loaded after `site.css`.
- `brain-fog.js` — edition interactions: keyboard-accessible timeline, productivity arithmetic, local notes, saving, sharing, print, and reading progress. Notes and saved-edition state stay in the reader’s browser; no backend receives them. Share copies the canonical production URL, with a selectable-link dialog if clipboard access fails.
- `images/brain-fog/` — locally hosted cover and historical portraits. `credits.json` records image sources, licenses, and the exact built-in ImageGen prompt. `automation-original.png` is the retained generation; the smaller JPEG is used on the site.
- `follow.html`, `follow.css`, `follow.js` — email signup with five interests, explicit consent, an Everything RSS feed, and five section feeds. The form stays disabled unless the server integration is enabled.
- `data/updates.json` — publication records used to generate feeds. Each intentional update has a section, stable ID, title, URL, publication timestamp, and summary.
- `scripts/build-feeds.py`, `feeds/` — generate and validate the combined and per-section RSS feeds. `feed.xml` remains the original Brain Fog feed URL; existing subscriber IDs are preserved.
- `products.html` — Building, the parent section for agricultural products, `experiments.html`, and `apps.html`.
- `writings/research-journey.html` — Groundwork: a five-paper question map and three-chapter personal research timeline, followed by the original selected-work archive.
- `data/groundwork.json`, `scripts/build-groundwork.py` — source records, publication status, conceptual connections, and career chapters. Run `npm run groundwork` after editing the records. The checker detects stale rendered content. Every paper links to its DOI; the HLC study is explicitly marked as a preprint. Connections are an editorial reading path, not measured citation links.
- `groundwork.css`, `groundwork.js` — responsive connected map / reading-order views, previous/next questions, related-paper links, chapter switching, keyboard arrow navigation, deep links, reduced-motion support, and printable/no-JavaScript content.
- The shared navbar uses a plain orange circle followed by the full name. A square coffee-cup button links to the verified Buy Me a Coffee page. The header keeps only the five section links and coffee icon, with an orange underline for the current section. The wordmark leads Home; About, Contact, and Follow remain in the content/footer. Descriptions appear inside the mobile Explore menu. On phones, the native Explore disclosure collapses the section list, supports Escape, and shows the current section. Breadcrumbs on interior pages provide a route back to Home and the parent section. `images/brand/` retains the earlier engraved concept and generation prompt; that image is no longer used in the navbar.
- `writings/watching.html` — Screen Time: 23 preserved movie, series, and animation reviews, with format filters and search across titles and notes. All entries remain readable without JavaScript.
- `writings/books.html` — Bookshelf: reviews of *The Farm Is Here* on Plot & Proof and *How to Feed the World* on Medium, plus James Suzman’s *Work* as a reading discovery with the supplied Big Think video. Read books and books to explore are labeled separately; optional Amazon affiliate links include a visible disclosure.
- `library.css`, `screen-time.js` — responsive reading/screening room layouts and the collection’s search/filter controls. Add reviews as static `.screen-card` articles with a `data-category` of `movies`, `series`, or `animation`; update the visible category and collection counts when adding entries.
- `images/books/` — official cover images; `credits.json` records their source pages and image URLs.
- `writings/writing__social-coin.html`, `writings/writing__pathology-of-more.html` — illustrated essays with matching paper-and-engraving covers, shared site navigation, chapter links, and related reading. Existing essay bodies and figures are retained.
- `essay-visual.css`, `images/essays/` — scoped editorial layouts and original/generated web covers. `credits.json` records the built-in ImageGen prompts and labels the images as conceptual illustrations, not historical photographs or scientific diagrams. The original PNGs are retained alongside JPEGs served on the pages and used in social previews.
- All six essays use the same `.essay-masthead`, `.essay-cover`, and `.essay-wayfinding` opening, with `.site-article` reading styles. Their ImageGen prompts are saved in `images/essays/additional-posts-prompts.json` and the credits files; small thumbnails bring all six covers into the Brain Fog archive.
- `site-chrome.css` keeps navigation prominent across every essay and section, with a dark background, an orange active section, and upright heading typography. Run `npm run sync:site` after changing the shared navigation.
- `about.html` — the personal story.
- `writings/` — existing essays, research journey, watching list, and book reviews. Their content, illustrations, diagrams, and URLs are preserved within the shared visual system.
- `hop-explorer/` — app landing, support, and privacy pages.
- `dock.js` — navigation for bespoke older pages, including a route back to Brain Fog.
- `site-links.json` — the five navigation destinations, Follow page, and the owner’s established public profiles: Email, LinkedIn, GitHub, X/Twitter, and Google Scholar. Add new profiles only when the owner supplies or confirms their URLs.
- `scripts/sync-site-shell.py` — renders static navigation and contact footers from those links. Run `npm run sync:site` after a profile or navigation change. All section pages and essays share navigation, the same font request, and the final design stylesheet. Run this after adding a page to the script’s page list.
- `site-chrome.css` — isolated header/footer styling, including the orange-dot brand and prominent navigation.
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

Resend is the subscriber provider. `data/newsletter.json` maps the five website interests to Resend Topics and the dedicated **Saurav Das — Stay curious** segment. Topics default to opt-out and stay private to their subscribers. The `website_consent` string property records signup time, selected topics, source, and consent wording version. These resources were created in the logged-in account; no contacts were imported and no emails were sent.

`api/subscribe.js` is a Vercel Node function. It requires the server-only `RESEND_API_KEY` and `NEWSLETTER_SIGNUP_ENABLED=true`. Never put the key in static JavaScript, JSON, source control, or a public environment variable. Without both settings, the form stays disabled and RSS remains available. Environment changes require a new deployment.

This is **single opt-in**: a reader chooses interests and checks an initially unchecked consent box. The endpoint saves new contacts with selected topics opted in and all others opted out, in one Resend request. It does not send a confirmation, welcome email, or newsletter. It never intentionally updates existing contacts, including global unsubscribers; repeat visitors are directed to a newsletter’s preference link or the contact address. Adding interests or resubscribing an existing address needs an authenticated preference flow or owner assistance. Do not claim email ownership has been verified.

Requests require a same-site Origin, JSON, a bounded body, valid email and topic selections, consent, and a signed, expiring form token. A honeypot and a bounded per-instance IP throttle filter basic spam. **Before enabling production**, add a Vercel Firewall rate limit for POST `/api/subscribe` (5 requests per IP per 15 minutes); the in-memory throttle cannot enforce a global limit across serverless instances. The edge rule is staged in the Vercel project but not published yet. Resend was checked and has no automations. Production enablement is still pending the credential, publishing the edge rule, deployment, and end-to-end verification.

For local full-stack preview, use `npm run dev:newsletter` (port 8081). It loads `.env.local` only on the server; without configuration, signup stays unavailable. `npm run test:newsletter` uses mocked Resend responses, including provider outages and existing unsubscribers; it cannot send emails or create real contacts.

Newsletter delivery is a separate, deliberate action. Before the first broadcast, verify a sending domain for `sauravdas.me`, use the website segment and the corresponding Topic, and include Resend’s unsubscribe/preferences footer. Never select all account contacts or an unrelated project segment. Keep broadcasts as drafts unless Saurav explicitly authorizes sending the specific email. There is no scheduled or automatic newsletter delivery. RSS updates continue to work independently.

References: [Resend contacts](https://resend.com/docs/api-reference/contacts/create-contact), [Topics](https://resend.com/docs/dashboard/topics/introduction), [Broadcasts](https://resend.com/docs/dashboard/broadcasts/introduction). The existing Plot & Proof Substack is a separate publication.

Voluntary support links to Saurav’s confirmed public page, https://buymeacoffee.com/sauravdastsk. The `kind: support` entry in `site-links.json` supplies both the shared footer link and the support panel on the Follow page; run `npm run sync:site` after changing it. The site uses ordinary external links, with checkout and payment details handled by Buy Me a Coffee. No third-party payment widget or payment processing code is embedded. The public creator page was verified; no payment was submitted or payout settings changed.

### Bookshelf affiliate links

Bookshelf has optional Amazon purchase links for The Farm Is Here (paperback, ASIN `B0GPGVZX8X`), How to Feed the World (hardcover, ASIN `0593834518`), and Work (paperback, ASIN `0525561773`). These were generated through Amazon SiteStripe on October 5, 2026 using Saurav’s confirmed Associates tracking ID `sauravdas-20`. The account’s website list already includes `https://sauravdas.me`.

For new books, verify the title, author, and edition on Amazon and generate a SiteStripe link using that tracking ID. Keep the affiliate attribution parameters intact. Do not copy account, payment, tax, or signed dashboard URLs into the site. Purchase links must remain visibly labeled “affiliate link”, use `rel="sponsored nofollow noopener"`, and reference the visible disclosure with `aria-describedby="affiliate-disclosure"`. Keep the disclosure “As an Amazon Associate I earn from qualifying purchases.” on every page containing affiliate links, following [Amazon’s disclosure requirement](https://affiliate-program.amazon.com/help/operating/agreement/). Preserve review and publisher links. Do not hard-code Amazon prices, ratings, availability, or commission rates.

These are ordinary outbound links; no Amazon script or tracking pixel is loaded on the website. Adding an affiliate link alone is not a new publication and does not require another RSS entry.

## Deploy

The existing production workflow deploys on a push to `main`. Run the site checks and preview the changes before publishing.
