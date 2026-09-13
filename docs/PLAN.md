# Mikkii Art Website — Project Plan

**Status:** v1.0, approved 2026-09-12. Build in progress on this branch.
**Date:** 2026-09-12
**Branch:** `claude/confident-johnson-gdgelg`

Throughout, "you" is the person steering the project and "the artist" is whoever owns the work, the store, and the money. If that is the same person, read both as you.

**What changed since v0.1.** You confirmed that selling starts within months. That makes a store platform worth paying for from day one, so the site moves from a custom Next.js build to Shopify with a custom theme developed in this repository. Shopify now provides checkout, payments, tax, shipping, inventory, order management, and print-on-demand integrations; the repository holds the theme, which is where all the design lives. The v0.1 stack (Next.js, Sanity, Cloudflare) is retired for this project.

**Approved with these decisions.** Sales start immediately in small volume and a backlog of requests already exists, so the store is created first and the backlog is invoiced through draft orders before the theme is finished. Billing is monthly to start, revisited after the promotional months. Print fulfilment is decided after sample prints from Printful and Gelato, within two weeks. Inquiries use the native contact form with no automatic reply; the artist answers personally.

---

## 1. In one paragraph

A Shopify store dressed as an art portfolio. A custom theme, built in this repository from Shopify's reference theme and styled from the artwork's own palette, presents the work in a masonry gallery with filters and gives each piece its own page with zoom, print options with prices, and an inquire path for originals. The artist manages artworks, prints, prices, and pages in the Shopify admin. Checkout, payments, tax, shipping labels, order emails, and print-on-demand fulfilment are Shopify's, configured rather than built. Running cost is Shopify's Basic plan plus the domain; the budget ceiling of about $25 per month set in the interview is exceeded by your decision to sell within months, and this plan says so plainly in section 11.

---

## 2. Decisions from the interview (updated)

| Topic | Decision | Consequence for the build |
|---|---|---|
| Work shown | Paintings and drawings (physical originals) plus digital illustration | Every artwork is a Shopify product; a "sale mode" field decides whether it shows a price, an inquire button, or neither |
| Who edits | The artist, through a friendly editor | Shopify admin: products, collections, pages, and structured fields, all without code |
| Visual direction | Match the artwork's palette | Design starts with a palette study of 3 to 5 sample pieces; the theme's settings carry the result |
| Gallery layout | Masonry grid | Custom collection section that respects each image's aspect ratio |
| What is purchasable | Prints and reproductions | Prints are variants of the artwork product (size × paper), each with its own price |
| Timeline | Sales start immediately, small volume, with a backlog of requests | Store created first; backlog invoiced through draft orders before the theme is done; checkout live at launch |
| Prices | Prints priced, originals "inquire" | Per-product sale mode: prints show Add to cart; originals show Inquire; either can be switched per piece |
| Location and currency | United States, USD | Shopify Payments, Shopify Tax, Shopify Shipping, all US |
| Inquiries | Site form that emails the artist | Shopify's native contact form, pre-filled with the artwork, delivered to the store email; no automatic reply, the artist answers personally |
| Pages at launch | Gallery, artwork pages, About | Plus the policy pages Shopify requires for checkout (privacy, refund, shipping, terms), generated from templates |
| Marketing | Instagram feed on the site | A feed app from the Shopify App Store; the official Meta channel can also tag products in posts |
| Images | Some ready, some still to capture | Capture checklist included; launch proceeds with what exists |
| Budget | Under about $25 per month (interview) | Exceeded: Shopify Basic alone is more. Section 11 has the numbers |
| Already exists | An Instagram business/creator account | No domain, brand assets, host, or store yet |
| Print fulfilment | Sample prints from Printful and Gelato first; decision within two weeks | Both paths are one-click on Shopify; the backlog is fulfilled by hand meanwhile |
| Extras in v1 | Filter by series, medium, and size | Shopify's first-party Search & Discovery app filters by these fields |

---

## 3. Version 1 scope

### Pages (theme templates)

- **Home** — one featured piece large, a two-line introduction, a curated "selected work" collection, the Instagram strip, footer with contact, social, and policy links.
- **Work** (`/collections/all` styled as the gallery) — masonry grid of every published artwork. Filters: series, medium, size (small / medium / large, from a dimension field), availability (original available, prints available). Filters live in the URL so a filtered view can be shared. Sort: artist-defined or newest first.
- **Series** (`/collections/[series]`) — one page per series with an introduction. A Shopify collection per series, ordered by hand.
- **Artwork** (`/products/[slug]`) — main image with zoom, detail images, title, year, medium, dimensions, description. Original block driven by sale mode: "Inquire about the original", "Sold", "Not for sale", or a price with Add to cart if you ever choose to sell an original directly. Prints block: size and paper as variants with prices, quantity, Add to cart. Previous and next within the series, related pieces, share image per piece.
- **About** — portrait, artist statement, short bio, Instagram and contact links.
- **Contact / Inquire** — Shopify's native contact form. When opened from an artwork the piece and, for prints, the chosen size are pre-filled into the message. Submissions go to the store's contact email, with Shopify's hCaptcha for spam. The native form sends no automatic confirmation to the sender; if that matters, the free Shopify Forms app plus a Shopify Flow automation adds one, at the cost of less control over pre-filling. Decided: native form, no auto-reply, and the artist answers personally. Shopify Forms plus Flow remains available if that changes.
- **Cart and checkout** — Shopify's. Cart page styled by the theme; checkout is Shopify's hosted, Shop Pay-enabled page with tax and shipping calculated.
- **Policies** — privacy, refund, shipping, terms of service, generated from Shopify's templates and edited by the artist.
- **Utility** — 404, search, sitemap and robots (automatic), Open Graph metadata per product.

### Deliberately not in v1

CV and exhibitions, news or blog (Shopify has one built in if wanted later), commissions page, newsletter signup (Shopify Email is available whenever wanted), view-in-a-room mockups, favorites, multiple languages, customer accounts (checkout is guest by default).

---

## 4. Content model (how the artist's world maps to Shopify)

| Artist's concept | Shopify object | Notes |
|---|---|---|
| Artwork | Product | One per piece, including pieces not for sale |
| Series | Collection (manual) | Ordered by hand; also drives the series filter |
| Medium | Product type or a metafield with a fixed list | Drives the medium filter |
| Year, dimensions | Metafields (date, dimension) | Dimensions feed the size buckets and, later, shipping |
| Original status | Metafield "sale mode": price, inquire, sold, not for sale, digital (no original) | Theme reads it to decide what the original block shows |
| Original price | The product's base variant price, used only when sale mode is "price" | Inventory 1; sells once |
| Prints | Variants: option 1 size, option 2 paper | Each variant has price, SKU, and optional inventory |
| Print presets | A template product to duplicate | Duplicate, rename, swap images; variants come along |
| Featured / selected work | A "Selected" collection | Home pulls from it |
| About page | Page | Rich text plus images |
| Site-wide settings | Theme settings | Artist name, tagline, palette, type, social links, Instagram handle |
| Inquiries | Contact form submissions to the store email | Not stored in Shopify; forward or file in the inbox |

Metafield definitions are created once (M1) and appear as ordinary fields in the product form. The artist never sees the word "metafield".

---

## 5. Architecture and stack

| Layer | Choice | Why |
|---|---|---|
| Platform | Shopify, Basic plan | Everything commercial is built and maintained by Shopify; the artist runs the store alone |
| Theme | Custom theme in this repository, started from Horizon, Shopify's current flagship theme; Skeleton as the fallback base if Horizon's structure fights the design | Full design control for the palette-matched look and the masonry gallery, with cart, product forms, and checkout wiring already correct |
| Theme tooling | Shopify CLI for local development and push; theme-check for linting in CI; Shopify's GitHub integration syncing one dedicated branch to a staging theme | Every change is reviewed on a preview URL before it is published. The integration is two-way: edits made in Shopify's theme editor are committed back to the branch automatically |
| Structured content | Metafield definitions and, where needed, metaobjects | Purpose-built fields without an external CMS |
| Filtering | Search & Discovery app (first-party, free) | Storefront filters on metafields, tags, availability, and price without custom code |
| Payments | Shopify Payments with Shop Pay | Lowest fees on Shopify, no third-party gateway surcharge |
| Tax | Shopify Tax | Automatic US sales tax at checkout; free until $100,000 of US sales, then 0.35% per order capped at 99 cents |
| Shipping | Shipping profiles with flat rates by region; Shopify Shipping for discounted labels if self-fulfilling | No carrier API work; Shopify Shipping on Basic covers USPS, UPS, FedEx, and DHL Express with no label fee beyond postage |
| Print fulfilment (optional) | Printful, Gelato, or Printify app | Products sync from the app; orders route automatically |
| Inquiries | Native contact form with hCaptcha, pre-filled by the theme | No email service to run; no auto-reply, see section 3 |
| Instagram | Instafeed app, free tier (grid or slider, hourly sync) | Handles Meta authorization and token renewal |
| Analytics | Shopify Analytics, built in | Sales, sessions, top products; no extra tool |
| Domain | Registered at Cloudflare at cost, pointed at Shopify | About $10 per year at Cloudflare versus about $16 through Shopify; Cloudflare also gives free email forwarding |

**Alternatives considered**

- *Configure a ready-made theme instead of building one.* A premium art theme (one-time purchase) gets close on layout but not to a palette-matched design or a true masonry gallery without code anyway. A custom theme costs more up front and nothing per month.
- *Headless Shopify (custom front end on the Storefront API).* Maximum freedom, but it reintroduces hosting, a framework, and ongoing upkeep, which is what this decision removes.
- *Keep v0.1 and add Stripe later.* Cheaper by roughly the Shopify subscription, at the cost of building and maintaining checkout, tax, shipping, order emails, and fulfilment integrations ourselves. Reasonable only if selling were far off.

---

## 6. Third-party connections

| Service | Role | Plan | Cost | What I need from you |
|---|---|---|---|---|
| Shopify | Store, admin, checkout, payments, tax, shipping, analytics, hosting | Basic | See section 11 | The artist creates the store and completes Shopify Payments onboarding (name, date of birth, address, SSN or ITIN, and a US checking account); then installs the Theme Access app and sends me a password, since Basic includes no staff seats; optionally connects this GitHub repository to the store's theme library |
| Cloudflare | Domain registration, DNS, free email forwarding | Free (domain at cost) | $10.44 per year for a .com today, about $11.15 after 1 November 2026 | Create the account and buy the domain; I provide the DNS records for Shopify |
| Search & Discovery | Gallery filters | Free, first-party | $0 | Install from the App Store (one click) |
| Instafeed | Feed on Home | Free tier; Pro at $8 per month adds product tagging | $0 | Install, authorize with the Instagram business account once |
| Print-on-demand app (optional) | Print fulfilment | Free to install. Printful's giclée on enhanced matte or premium luster paper is confirmed; Gelato's and Printify's fine-art papers should be confirmed with samples | $0 monthly, product cost per order | Install the chosen app, connect, and set retail prices |
| Meta "Facebook & Instagram" channel (optional) | Tag products in Instagram posts | Free | $0 | Needs a Facebook Page and business portfolio as well as the Instagram professional account; skip unless product tagging in posts is wanted |
| GitHub | Theme source, CI | Free | $0 | Grant Claude's GitHub App access to this repository (currently blocked, see section 15) |

I never need any password. Access to the store is by a scoped theme token or the GitHub connection.

Plan features, prices, limits, and tooling in this document were verified against Shopify's current documentation and pricing pages on 12 September 2026.

---

## 7. Design process

Unchanged from v0.1, because the direction is still "match the artwork's palette".

1. You share 3 to 5 representative pieces (commit them under `design/samples/` or send links).
2. Palette study: dominant and accent colors extracted; a tinted near-white background (or a deep tone if the work calls for it), an ink color for text, and one accent, all checked for WCAG AA contrast.
3. Typography: two pairings proposed, one serif-led and one sans-led.
4. A style tile and mockups of Home, Work, and one Artwork page, delivered as a page you can review and comment on.
5. You approve or redirect. The theme is then built to the approved mockups, with the palette and type exposed as theme settings so the artist can adjust later without code.

Rule that holds regardless of palette: artwork always sits on the neutral background tint, never on a saturated color, so colors read true.

---

## 8. Milestones

Each milestone ends with a preview link to an unpublished staging theme (visitor links expire after two days, so I generate a fresh one for each review). I do not proceed past M2 without your approval of the mockups, and nothing is published to the live storefront until M7.

| # | Milestone | Contents | Done when |
|---|---|---|---|
| M0 | Setup (you and me) | Store created, Shopify Payments onboarding started, domain bought and pointed, theme access granted, sample images shared | I can push a theme to the store and open its preview URL |
| M1 | Foundation | Theme scaffold from Horizon, CLI workflow, theme-check in CI, branch-to-staging-theme sync, metafield definitions, sample products and collections | Staging theme updates from a push; a sample artwork shows all fields |
| M2 | Design | Palette study, typography, style tile, mockups | You approve the mockups |
| M3 | Gallery and artwork pages | Masonry collection section, Search & Discovery filters wired to the fields, series pages, product template with zoom, sale-mode logic, variants for prints, related and prev/next, share metadata | Lighthouse performance 80+ on mobile for gallery and product pages (Shopify's own scripts set the ceiling); fully keyboard-navigable |
| M4 | Inquiries, About, policies | Contact template with pre-fill from artworks, About page, policy pages from templates | A test inquiry arrives at the store email with the right piece and size named |
| M5 | Commerce configuration | Shopify Payments live, shipping profiles and flat rates, Shopify Tax on, order notification emails styled to match, print-on-demand app connected if chosen, test orders in test mode and one real order refunded | A print can be bought end to end; the artist receives the order and can fulfil or watch it route to the print partner |
| M6 | Instagram and Home | Feed app installed and authorized, Home assembled from its sections | Feed renders; Home matches the mockup |
| M7 | Content and launch | One-page "add an artwork" guide, artist enters the work, image QA, accessibility and performance audit, theme published, domain live, launch checklist | Live on the domain with real content and a working checkout |

### Selling before the theme is live

The backlog does not wait for M7. As soon as the store exists and Shopify Payments onboarding is complete:

1. The artist creates a draft order in the admin for each waiting buyer (Orders, Create order), adds the print or original as a line item with the agreed price and shipping, and sends the invoice by email. The buyer pays on Shopify's hosted checkout; the order lands in the admin like any other.
2. The storefront stays password-protected with a short "coming soon" note until the custom theme is ready, so no one sees an unstyled store. The password page can carry the contact email for new requests.
3. Fulfilment by hand for these first orders, with Shopify Shipping labels from the order screen. If the print samples decide the question sooner, the print-on-demand app takes over from that point.
4. First payouts from Shopify Payments take several business days to clear; plan for that before promising delivery dates.

---

## 9. After launch

- **Originals for direct sale.** Switch a piece's sale mode to "price", set inventory to 1. No code.
- **Newsletter.** Shopify Email with a signup section in the footer. One theme setting to turn on.
- **Blog, CV, commissions.** Shopify pages and blog templates; the theme gets a template each when wanted.
- **View in a room, favorites, digital downloads.** Apps exist for each; evaluate against price and upkeep when the store has traffic.

---

## 10. Quality bar

- **Performance.** Custom sections ship minimal JavaScript; images request exact widths from Shopify's CDN; layout shift zero through known aspect ratios. Shopify's checkout and app scripts set a floor that a custom theme cannot remove, so the target is 80+ on mobile rather than 90+.
- **Accessibility.** Keyboard-navigable gallery, filters, and zoom; visible focus; required alt text on every product image; reduced motion respected; AA contrast on all text.
- **SEO.** Per-product titles, descriptions, and share images; structured data for products; clean handles; Shopify's automatic sitemap.
- **Privacy and security.** Shopify handles card data and PCI. The theme sets no cookies of its own beyond Shopify's. The native contact form uses hCaptcha. Apps are kept to the minimum listed above.
- **Color fidelity.** sRGB uploads, images served at high quality, neutral surround in the zoom view.

---

## 11. Costs

| Item | Monthly | Notes |
|---|---|---|
| Shopify Basic | $39 monthly to start; annual at $29 revisited after the promotion | Verified 12 September 2026. New stores get 3 days free, then $1 per month for the first 3 months |
| Domain (.com at Cloudflare) | about $1 | $10.44 per year today; about $11.15 after 1 November 2026 |
| Search & Discovery, Instagram feed app, print-on-demand app | $0 | Free tiers; paid tiers only if you choose them |
| Card processing (Shopify Payments) | 2.9% plus 30 cents per online transaction | Per sale, not monthly |
| Shopify Tax | $0 until $100,000 of US sales | Then 0.35% per order, capped at 99 cents |
| Print-on-demand product cost | per order | Deducted from each print sale; margin is the retail price you set minus this |
| **Total fixed** | **about $30 to $40** after the three promotional months | Above the $25 ceiling from the interview, by your decision to sell within months |

Not needed: a paid theme, hosting, an email service, an external CMS, analytics tools.

---

## 12. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Paying the subscription before the first sale | The first three months cost $1 per month on Shopify's standard promotion, which covers most of the build; annual billing lowers it afterwards |
| Theme-editor edits and repository edits collide, since the GitHub integration is two-way | The live theme is bound to one dedicated branch; feature work merges into it; the settings files are edited only through the theme editor |
| Large scans are rejected on upload | Shopify caps images at 20 MB and 5,000 pixels per side; the capture checklist adds a resize step; full-size originals stay off-platform for printing |
| A custom theme does not receive the reference theme's updates automatically | Kept deliberately small; Shopify's checkout and cart are outside the theme and always current |
| App costs creep as features are added | Every app is listed in section 6; new ones need a yes from you |
| Instagram feed app changes pricing or stops working | Swap for another app; the theme only reserves a section for it |
| Shopify Payments holds or verification delays | Start onboarding in M0 so it is cleared long before M5 |
| Print-on-demand quality disappoints | Order a sample from each candidate before choosing; the theme is neutral to the provider |
| Colors look different on the artist's screen versus visitors' | sRGB export, high-quality delivery, neutral surround; calibrate the artist's monitor before ordering print samples |
| Artist uploads phone photos that look poor next to scans | Capture checklist below; an "image needs redo" tag in the admin |
| Backlog buyers waiting on the theme | Draft orders invoice them from the admin the day the store exists; see "Selling before the theme is live" in section 8 |

---

## 13. Image capture checklist (for the pieces still to shoot)

- Even, diffuse light: north-facing window or two lights at 45 degrees to the surface. No direct sun, no flash.
- Camera square to the artwork, lens at the center of the piece; a tripod if available.
- A gray card or color checker in one frame per session so colors can be corrected.
- Glossy or varnished work: a polarizing filter or angled lights to kill glare.
- Resolution: at least 3,000 pixels on the long edge for the web. For prints made from these files, capture at 300 dots per inch at the largest print size you will offer.
- Drawings and works on paper: scan at 600 dots per inch when they fit the scanner.
- Export as sRGB JPEG at high quality or as TIFF; keep the originals.
- Before uploading to Shopify: resize a copy to at most 5,000 pixels on the long side and under 20 MB. Keep the full-size original for printing.
- File names: `year-title-slug.jpg`.

---

## 14. Checklist: what I need from you to start M0

1. The artist's display name for the store and a one-line tagline (placeholder is fine).
2. Three to five sample images for the palette study.
3. Domain: `rightbrainstudios.store`, registered 13 September 2026 at Cloudflare. Still to do: point it at Shopify and set up forwarding for `hello@`.
4. Public contact address: `hello@rightbrainstudios.store` (decided). It is a theme setting used by the footer and contact page, and must also be the store's sender email once forwarding exists.
5. The Instagram handle.
6. The Shopify store created by the artist, with Shopify Payments onboarding started, and a Theme Access password sent to me (the app's delivery link expires after seven days).
7. Initial print sizes, papers, and prices, or a note to use placeholders.
8. Sample prints ordered from Printful and Gelato, so the fulfilment decision can be made within two weeks.

---

## 15. Assumptions, open questions, and blockers

- Resolved: Claude's GitHub App now has access to this repository; commits push normally.
- Confirmed: Basic includes no staff seats. The artist is the owner; developer access is by Theme Access password, which needs no seat.
- Decided: no automatic confirmation email; the artist replies personally.
- Assumed: English only, US shipping only at launch; international can be added as a shipping zone later.
- Assumed: guest checkout; customer accounts off.
- Open: how many pieces exist today and roughly how many arrive per month. Affects only pagination.
- Decided: monthly billing to start; revisit annual after the promotional months.
