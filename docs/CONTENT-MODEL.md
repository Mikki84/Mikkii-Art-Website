# Content model

How the artist's world maps onto Shopify objects, and the exact field names the theme reads. Everything here is created once by `scripts/setup-store.mjs` (or by hand in Settings, Custom data) and then appears as ordinary fields in the product form.

## Artwork = product

One product per piece, including pieces that are not for sale. The artist never sees the word "metafield"; the fields below show up under the product's own form.

### Built-in fields

| Field | Used for |
|---|---|
| Title | Artwork title |
| Description | Statement about the piece |
| Media | Main image first, then detail images. Alt text required. Resize to at most 5,000 px on the long side before upload |
| Product type | Medium category, one of: Painting, Drawing, Digital, Mixed media. Drives the medium filter |
| Tags | Subjects and internal flags (for example `image-redo` for pieces needing a better photo). Selected tags become filters |
| Collections | Series membership (see below) and curated sets such as "Selected" |
| Status | Draft until the piece is ready to show; Active publishes it |

### Options and variants

Every product uses the option **Edition** with the values `Original` and `Print`.

- **Original variant** (Edition = Original): exactly one per physical piece. Price is the original's price; inventory 1, tracked. Whether it is purchasable is decided by the `Original status` field, not by the variant.
- **Print variants** (Edition = Print): one per size and paper combination, using options **Size** (for example `8 × 10 in`) and **Paper** (for example `Matte`, `Luster`). Price per variant. Inventory untracked for print-on-demand, tracked for self-fulfilled stock.
- Digital works have no Original variant, only Print variants.

A template product named "TEMPLATE — duplicate me" carries the standard sizes and papers so the artist duplicates it for each new piece and deletes what does not apply.

### Custom fields (namespace `art`)

| Label in admin | Key | Type | Values / notes |
|---|---|---|---|
| Year | `art.year` | Integer | Year completed |
| Medium detail | `art.medium_detail` | Single line text | Displayed as written, for example "Oil on linen" or "Graphite on paper" |
| Height | `art.height` | Dimension | Of the original; with unit |
| Width | `art.width` | Dimension | Of the original; with unit |
| Depth | `art.depth` | Dimension | Optional |
| Size class | `art.size_class` | Single line text, choices | `Small`, `Medium`, `Large`. Drives the size filter. Guide: Small under 12 in, Medium 12 to 30 in, Large over 30 in on the long side |
| Original status | `art.original_status` | Single line text, choices | `For sale`, `Inquire`, `Reserved`, `Sold`, `Not for sale`, `Digital work`. See theme behaviour below |
| Original note | `art.original_note` | Single line text | Optional line under the status, for example "Framed, ready to hang" or "Private collection" |
| Featured | `art.featured` | Boolean | Eligible for the home page hero |

### Theme behaviour for `Original status`

| Value | Original block on the artwork page |
|---|---|
| For sale | Price of the Original variant and Add to cart. Requires the Original variant with inventory 1 |
| Inquire | "Inquire about the original" button opening the pre-filled inquiry form. No price |
| Reserved | "Reserved" label; inquiry button still shown |
| Sold | "Sold" label; no button. Piece stays in the gallery, marked sold |
| Not for sale | "Not for sale" label; no button |
| Digital work | Block hidden; prints block gets the full width |

Prints block: shown whenever Print variants exist. Sizes and papers rendered as a custom picker with price per selection and Add to cart.

## Series = collection

A manual collection per series, ordered by hand. Collections that are series carry one field so the theme can list them separately from utility collections.

| Label | Key | Type | Notes |
|---|---|---|---|
| Is a series | `art.is_series` | Boolean | True for series; false for "Selected", "Prints available", and other curated sets |

Collection description holds the series introduction. Collection image is the series cover.

## Pages

- **About**: a Shopify page using the `page.about` template. Portrait and statement in the page body.
- **Contact / Inquire**: a page using `page.contact`; the theme pre-fills the artwork and print size when the form is opened from a piece.
- **Policies**: generated in Settings, Policies, and edited by the artist.

## Theme settings (Settings in the theme editor)

Under **Theme settings, Studio**: public contact email (`studio_contact_email`, default `hello@rightbrainstudios.store`), Instagram handle (`studio_instagram_handle`), and tagline (`studio_tagline`). The `Studio contact` block reads these wherever it is placed (footer, contact page). Palette and typography live in Horizon's own settings groups. The store name comes from Settings > General.

## Filters (Search & Discovery app)

Enable these filters on the collection pages: Product type (medium), Tags (subjects only), Availability, Price, and the metafield `art.size_class`. Series filtering is handled by series pages themselves rather than a filter.
