# Design

Proposal v1, 27 September 2026, built from ten sample pieces. Status: awaiting approval. Review page: the "Right Brain Studios Design" artifact.

## Reading of the work

Saturated jewel tones, hand-drawn ink line, collage energy, and paper showing through. Across the samples nearly half of the saturated color is red, orange, and yellow, a quarter is green and teal, and the rest is ink line and warm paper; the second batch adds two pieces on black paper. The site therefore stays neutral and lets the art carry color.

## Tokens

| Token | Value | Use |
|---|---|---|
| Paper | `#F8F6F1` | Page ground |
| Surface | `#FFFFFF` | Cards, purchase block, inputs |
| Ink | `#1F231A` | Text, primary buttons |
| Muted | `#6E6A5E` | Captions, dimensions, secondary nav |
| Rule | `#E1DDD3` | Borders, dividers |
| Teal | `#178579` | Links, the available dot, one italic word in the hero |
| Coral | `#E5584C` | Rare signals only (sale badge, errors) |
| Marigold | `#D9C34F` | Reserved-status dot only |

Artwork always sits on Paper, never on a saturated color. Pieces on black paper appear as dark rectangles with generous space.

## Typography

- **Pairing A (chosen, 27 September 2026):** Instrument Serif for titles and the wordmark; Karla for body, captions, prices, filters.
- **Pairing B:** Syne for titles; Source Sans 3 for body. Bolder and more graphic; competes slightly with the art.

Both from Google Fonts, self-hosted in the theme at build time.

## Components

Ink primary button, outlined secondary, teal for "Request this print" where checkout is not the action; status dots (teal available, marigold reserved, muted sold); pill filter chips; print picker as bordered option tiles with a serif price.

## Pages

- **Home:** wordmark and nav (Work, Series, About, Contact); hero is the featured piece alone with a caption and one button, no tagline (decided 27 September 2026: her work carries no words); Selected work masonry; Instagram strip; footer with contact block and policies.
- **Work:** title, filters (medium, size, availability), justified rows (each row shares one height, no cropping; decided 27 September 2026 over masonry) with title, medium, and price-from or status.
- **Artwork:** image with zoom left; sticky details right: series and year eyebrow, title, medium detail, dimensions; Original block driven by sale mode; Prints block with size and paper picker, price, Add to cart; description; related pieces from the series.
- **Phone:** single column, details below the image, same blocks.

## Open

Whether a Frida Kahlo epigraph appears on the About page, and the prints shipping copy, which depends on the fulfilment decision.
