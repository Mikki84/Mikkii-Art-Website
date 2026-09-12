# Mikkii Art Website — Project Plan

**Status:** Draft v0.1, awaiting approval. Nothing is built yet; this document is the only change on the branch.
**Date:** 2026-09-12
**Branch:** `claude/confident-johnson-gdgelg`

Throughout, "you" is the person steering the project and "the artist" is whoever owns the work and edits the site. If that is the same person, read both as you.

---

## 1. In one paragraph

A fast, image-first portfolio site for an artist working in paintings, drawings, and digital illustration. Version 1 shows the work in a masonry gallery with filters, gives every piece its own page with zoom, lists print sizes and prices, and routes purchase inquiries (prints and originals) to the artist by email. The artist adds and edits work in a hosted editor without touching code. The content model and pages are laid out so that version 2 can add real checkout (Stripe or Shopify, print-on-demand or self-fulfilled) without restructuring anything. Running cost is roughly the price of the domain.

---

## 2. Decisions from the interview

| Topic | Decision | Consequence for the build |
|---|---|---|
| Work shown | Paintings and drawings (physical originals) plus digital illustration | Two kinds of original: physical (available / reserved / sold / inquire) and digital (no physical original, prints only) |
| Who edits | The artist, through a friendly editor | Hosted CMS with image upload, drag-to-reorder, and price/status fields |
| Visual direction | Match the artwork's palette | Design starts with a palette study of 3 to 5 sample pieces |
| Gallery layout | Masonry grid | True aspect ratios, no cropping, zero layout shift |
| What is purchasable | Prints and reproductions | Print options (size, paper, price) modelled per piece |
| Checkout | None in v1, inquiry only | Buttons open a pre-filled inquiry form; checkout is a v2 decision |
| Prices | Prints priced, originals "inquire" | Print prices public; originals show status and an inquire button |
| Location and currency | United States, USD | USD formatting, US privacy norms, Stripe Tax later |
| Inquiries | Site form that emails the artist | Transactional email service, spam protection, auto-reply to the sender |
| Pages at launch | Gallery, artwork pages, About | No CV, news, or commissions page in v1 |
| Marketing | Instagram feed on the site | Official Instagram API with automatic token refresh |
| Images | Some ready, some still to capture | Capture checklist included; launch proceeds with what exists |
| Budget | Under about $25 per month | Free tiers throughout; only the domain costs money |
| Already exists | An Instagram business/creator account | No domain, brand assets, or host yet |
| Print fulfilment later | Undecided | Content model stays fulfilment-agnostic |
| Extras in v1 | Filter by series, medium, and size | Filters ship in v1; view-in-room, sold archive, favorites deferred |

---

## 3. Version 1 scope

### Pages

- **Home** `/` — one featured piece large, a two-line introduction, a curated "selected work" set, the Instagram strip, footer with contact and social links.
- **Work** `/work` — masonry gallery of everything published. Filters: series, medium, size (small / medium / large, derived from dimensions), availability (originals available, prints available). Filters live in the URL so a filtered view can be shared. Sort: artist-defined order or newest first.
- **Series** `/series/[slug]` — one gallery per series with a short introduction. Useful for sharing a body of work as a single link.
- **Artwork** `/work/[slug]` — main image with zoom and lightbox, detail images, title, year, medium, dimensions, description. Original block: status and "Inquire about the original" (or "digital work, available as prints"). Prints block: sizes, papers, prices, and "Request this print" with the size preselected. Previous/next within the series, three related pieces, social share image generated per piece.
- **About** `/about` — portrait, artist statement, short bio, Instagram and contact links.
- **Inquire** `/inquire` — the one form used everywhere. Fields: name, email, message, plus hidden artwork and print-option references when opened from a piece. Sends to the artist with reply-to set to the sender, and an auto-reply confirms receipt.
- **Privacy** `/privacy` — short and plain. Needed because the form collects personal data.
- **Studio** `/studio` — the artist's editor, behind the CMS login. Not linked from the public site.
- **Utility** — 404 page, sitemap, robots, per-artwork Open Graph images.

### Deliberately not in v1

Checkout or cart, CV and exhibitions, news or blog, commissions page, newsletter signup, view-in-a-room mockups, a separate sold archive (sold pieces still appear in the gallery, marked sold), favorites, multiple languages, buyer accounts, stored inquiry log.

### Optional bridge before v2 (no code, artist-controlled)

Stripe Payment Links. The artist can create a payment link per print size in the Stripe dashboard and paste it into that print option in the CMS. When a link is present, the button reads "Buy this print" and Stripe collects payment, shipping address, and tax on its hosted page. This turns on real sales for individual prints without building checkout. It also covers a one-of-a-kind original: a payment link can be capped at a single completed payment, after which Stripe deactivates it and the artist marks the piece sold in the CMS. Suggested, not required.

---

## 4. Content model (what the artist fills in)

**Artwork**
- Title, slug, year, medium (pick list), subjects/tags, series, description, featured flag, manual sort order.
- Images: one main image and optional detail images. Alt text is required on every image.
- Dimensions: height, width, optional depth, unit. Used for the size filter and, in v2, shipping.
- Original: kind (physical or digital), status (available, reserved, sold, not for sale, inquire), price (optional, hidden when status is inquire).
- Prints: available yes/no; a list of options, each with size, paper, price, an optional Stripe payment link, and reserved fields for v2 (fulfilment provider, product id).

**Series** — title, slug, description, cover image, order.

**Print presets** — site-wide default sizes, papers, and prices. The artist applies a preset to a piece in one click and then adjusts.

**About page** — portrait, statement, bio, links.

**Site settings** — artist display name, tagline, inquiry recipient email, Instagram handle, social links, default social image, SEO defaults.

Inquiries are emailed, not stored, per your choice. A stored log is a small later addition.

---

## 5. Architecture and stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript) | Best-supported CMS live preview; largest ecosystem for the v2 store; React components carry straight into a cart later |
| Styling | Tailwind CSS 4 with design tokens from the palette study | Fast iteration; tokens keep the palette consistent everywhere |
| CMS | Sanity, studio embedded at `/studio` | Friendly editor, image hotspot and crop, free tier fits a solo artist, structured fields drive the filters and the v2 catalog |
| Images | Sanity image CDN through a custom `next/image` loader | Automatic WebP/AVIF, exact aspect ratios, blur-up placeholders; works on any host |
| Hosting | Cloudflare Workers via the OpenNext adapter | Free tier permits commercial use (static assets unlimited, 100k dynamic requests per day); one account also covers domain, DNS, bot protection, analytics, and email forwarding |
| Transactional email | Resend | Free tier covers inquiry volume; domain-verified sender for deliverability |
| Bot protection | Cloudflare Turnstile plus a honeypot field | Free; no puzzles for humans |
| Instagram | Instagram API with Instagram Login, long-lived token refreshed by a scheduled job, feed cached server-side | Official and free; the refresh job removes the "feed went blank after 60 days" failure mode |
| Analytics (optional) | Cloudflare Web Analytics | Free, cookie-less, no banner; one line to remove if unwanted |
| CI | GitHub Actions: lint, typecheck, unit tests, build, Playwright smoke tests | Every push checked; preview URL per branch |

**Rendering.** Pages are generated statically and refreshed on publish: Sanity sends a webhook, the affected pages regenerate within seconds. Visitors always hit cached pages, so the site stays fast under traffic spikes.

**Alternatives considered**

- *Astro instead of Next.js.* Lighter pages and the smoothest Cloudflare deploy. Slightly less convenient for the v2 cart and for CMS preview. Reasonable if minimal JavaScript matters more than v2 convenience.
- *Vercel instead of Cloudflare.* Smoothest Next.js hosting, but the free Hobby plan forbids commercial use, so it means Pro at about $20 per month. Fits the budget, but buys little for a portfolio.
- *Netlify free tier.* Permits commercial use (credit-based, roughly 15 GB of bandwidth per month) and runs Next.js well. The fallback if the Cloudflare adapter causes friction.
- *Keystatic (git-based CMS) instead of Sanity.* Free and simple, but images live in the repository and large uploads are awkward for a non-technical editor.

---

## 6. Third-party connections

| Service | Role | Plan | Cost | What I need from you |
|---|---|---|---|---|
| Cloudflare | Hosting, DNS, domain registration, Turnstile, optional analytics and email forwarding | Free (domain at cost) | $10.44 per year for a .com today, about $11.15 after 1 November 2026 | Create the account, buy the domain there, create an API token for deployments (I will give exact scopes) |
| Sanity | CMS and image CDN | Free: 20 seats, 100 GB of assets, 100 GB bandwidth per month | $0 | Create the account and a project; give me the project id and a write token |
| Resend | Inquiry delivery and auto-reply | Free: 3,000 emails per month, 100 per day | $0 | Create the account; give me an API key; add the DNS records I provide (or let me add them via the Cloudflare token) |
| Meta for Developers | Instagram feed | Free | $0 | Confirm the Instagram account is business or creator; authorize the app once (I will walk you through it) |
| GitHub | Code, CI, repository secrets | Free | $0 | Already in place |

Secrets are stored as GitHub repository secrets and Cloudflare environment variables. I never need any password.

Estimated running cost: the domain, and nothing else. Optional paid upgrades if ever wanted: Vercel Pro (about $20/month), Plausible analytics (about $9/month), a hosted Instagram widget such as Behold (a few dollars a month) instead of the self-managed feed.

Limits and prices above were verified against the providers' current pricing pages on 12 September 2026.

One clause worth knowing: Cloudflare's free-plan terms forbid collecting card details on a free-plan site. Version 1 collects none. In version 2, Stripe's hosted Checkout and Payment Links keep card entry on Stripe's own pages, which stays within the terms. Embedding card fields in our own pages would mean moving to the $5 per month Workers plan or to Netlify.

---

## 7. Design process

Because the direction is "match the artwork's palette", design starts from the work itself.

1. You share 3 to 5 representative pieces (commit them under `design/samples/` or send links).
2. Palette study: I extract dominant and accent colors, then choose a tinted near-white background (or a deep tone if the work calls for it), an ink color for text, and one accent. Every pairing is checked for WCAG AA contrast.
3. Typography: two pairings proposed, one serif-led and one sans-led.
4. A style tile and mockups of Home, Work, and one Artwork page, delivered as a page you can review and comment on.
5. You approve or redirect. The interface is then built to the approved mockups.

Rule that holds regardless of palette: artwork always sits on the neutral background tint, never on a saturated color, so colors read true.

---

## 8. Milestones

Each milestone ends with a preview URL for you to check. I do not proceed past M2 without your approval of the mockups.

| # | Milestone | Contents | Done when |
|---|---|---|---|
| M0 | Setup (you and me) | Accounts, domain, sample images, secrets | A hello-world deploys to a preview URL; Sanity project exists; Resend domain verified |
| M1 | Foundation | Repo scaffold, tooling, CI, Sanity schemas and studio, seed content, deploy pipeline | Studio usable at `/studio`; preview deploy on every push |
| M2 | Design | Palette study, typography, style tile, mockups | You approve the mockups |
| M3 | Gallery and artwork pages | Masonry, filters, series pages, artwork page with lightbox and zoom, related and prev/next, social images, sitemap | Lighthouse performance 90+ on mobile for gallery and artwork pages; fully keyboard-navigable |
| M4 | Inquiries, About, Privacy | Form, validation, Turnstile, Resend delivery and auto-reply, About and Privacy pages | A test inquiry lands in the artist's inbox with the right pre-filled piece and size; auto-reply received |
| M5 | Instagram and Home | Meta app, one-time authorization, feed fetch with cache, token refresh job with failure alert, Home assembled | Feed renders; a simulated expired token recovers without manual work |
| M6 | Content and launch | One-page editor guide, artist loads the work, image QA, accessibility and performance audit, domain cutover, launch checklist | Live on the domain with real content |

---

## 9. Version 2 outlook (separate approval later)

- **Checkout engine.** Stripe Checkout: no monthly fee, 2.9% plus 30 cents per US card payment, a hosted page with Apple and Google Pay, fixed shipping rates by region, and Stripe Tax at 0.5% per transaction. The site owns the catalog and marks originals sold through a webhook. Shopify: the cheapest plan open to new stores is Basic at $29 to $39 per month (the $5 Starter plan was discontinued), which buys a full store admin, discounts, inventory, and one-click print-on-demand apps.
- **Fulfilment.** Print-on-demand: Printful, Gelato, and Printify all offer free accounts, giclée fine-art papers, and order APIs that a Stripe webhook can call, so this path needs no Shopify. Self-fulfilment: order emails to the artist and discounted labels through Pirate Ship (free, US origin only).
- **Shipping rates.** Stripe's hosted page supports fixed rates only. Live carrier-calculated rates would require embedded checkout plus a rating service such as Shippo. Flat rates by region avoid the whole issue.
- **Originals.** Buy-now with an automatic flip to sold, or keep them inquiry-only.
- **Already prepared in v1.** Per-piece print options with prices, original status, reserved product-id and fulfilment fields, dimensions for shipping, USD formatting, and a hosted checkout flow that plugs into the existing "Request this print" buttons.

---

## 10. Quality bar

- **Performance.** Largest Contentful Paint under 2.5 seconds on a mid-range phone; zero layout shift (aspect ratios known before images load); hero image prioritised, everything else lazy.
- **Accessibility.** Keyboard-navigable gallery and lightbox, visible focus states, required alt text, reduced-motion respected, AA contrast on all text.
- **SEO.** Per-artwork titles, descriptions, and Open Graph images; VisualArtwork structured data; clean slugs; sitemap; canonical URLs.
- **Privacy and security.** No cookies from the site itself; form data is emailed, not stored; Turnstile and rate limiting on the form; secrets server-side only; security headers including a content security policy; the CMS token never reaches the browser.
- **Color fidelity.** sRGB throughout, moderate compression (quality around 82), neutral surround in the lightbox. Screens vary and cannot be fully controlled; the site avoids making it worse.

---

## 11. Costs

| Item | v1 | Notes |
|---|---|---|
| Domain (.com at Cloudflare) | $10.44 per year, about $11.15 after 1 November 2026 | The only required spend; registering before November locks the lower price for the first year |
| Hosting, CMS, email, bot protection, Instagram API | $0 | Free tiers, all of which allow commercial use |
| Total | about $1 per month | Budget headroom of roughly $24 per month for later choices |

---

## 12. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Instagram token expires and the feed goes blank | Scheduled refresh well before expiry, cached last-good feed, alert email if refresh fails, and a plain "Follow on Instagram" fallback |
| Free hosting tier forbids commercial use | Cloudflare chosen for this reason; Vercel Hobby avoided |
| Cloudflare's Next.js adapter causes friction | Netlify free tier is a tested fallback; the code does not change |
| Sanity free-tier bandwidth exceeded by a traffic spike | Image sizes are capped and cached at the CDN edge; the next tier is a known monthly price if ever needed |
| Colors look different on the artist's screen versus visitors' | sRGB export, light compression, neutral surround; calibrate the artist's monitor if prints are sold from these files later |
| Form spam | Turnstile, honeypot, rate limiting, server-side validation |
| Email lands in spam | Domain-verified sender with SPF, DKIM, and DMARC records |
| Artist uploads phone photos that look poor next to scans | Capture checklist below; a "needs better image" flag in the CMS |
| The Instagram refresh job is more upkeep than wanted | Behold's free tier (one feed, six posts, 1,200 views per month) or its $10 per month plan replaces it with no code |
| Cloudflare free-plan terms and card data | v1 collects none; v2 uses Stripe-hosted pages; embedded card fields would require the paid Workers plan or Netlify |

---

## 13. Image capture checklist (for the pieces still to shoot)

- Even, diffuse light: north-facing window or two lights at 45 degrees to the surface. No direct sun, no flash.
- Camera square to the artwork, lens at the center of the piece; a tripod if available.
- A gray card or color checker in one frame per session so colors can be corrected.
- Glossy or varnished work: a polarizing filter or angled lights to kill glare.
- Resolution: at least 3,000 pixels on the long edge for the web. If prints may later be made from these files, capture at 300 dots per inch at the intended print size.
- Drawings and works on paper: scan at 600 dots per inch when they fit the scanner.
- Export as sRGB JPEG at high quality or as TIFF; keep the originals.
- File names: `year-title-slug.jpg`.

---

## 14. Checklist: what I need from you to start M0

1. The artist's display name for the site and a one-line tagline (can be placeholder).
2. Three to five sample images for the palette study.
3. Two or three candidate domain names, in order of preference. I will check availability; the purchase is yours.
4. The email address that should receive inquiries.
5. The Instagram handle.
6. Accounts created: Cloudflare, Sanity, Resend. Then the tokens listed in section 6, added as GitHub repository secrets.
7. Initial print sizes, papers, and prices, or a note to use placeholders.

---

## 15. Assumptions and open questions

- Assumed: a single artist and a single editor seat; no team workflow or approvals in the CMS.
- Assumed: English only.
- Assumed: prices shown in whole US dollars; no tax shown until checkout exists.
- Confirmed: the Instagram API with Instagram Login needs a business or creator account and no Facebook Page. Tokens last 60 days and can be refreshed programmatically, which is what the M5 refresh job does.
- Open: how many pieces exist today and roughly how many arrive per month. This only affects whether the filters need pagination.
- Open: whether the digital illustration work is offered as downloads later. Nothing in v1 depends on the answer.
