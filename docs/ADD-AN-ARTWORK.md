# Adding an artwork

For the artist. Every piece is one product, copied from the template so the structure is always the same. Ten minutes per piece once the images are ready.

## 1. Duplicate the template

1. In the admin go to **Products** and open **TEMPLATE — duplicate me**.
2. Click the **⋯** (or **More actions**) button, then **Duplicate**.
3. Enter the artwork's title, untick **Images** so no placeholder media is copied, keep the copy as a **draft**, and click **Duplicate**.

## 2. Fill in the product

| Field | What to enter |
|---|---|
| Title | The artwork's title |
| Description | A few sentences about the piece |
| Media | The main image first, then details. Resize copies to at most 5,000 px on the long side and under 20 MB before uploading; keep the full-size original for printing. Add alt text (a short description of what is pictured) to each image |
| Product type | The medium: `Painting`, `Drawing`, `Digital`, or `Mixed media`. This drives the medium filter |
| Tags | Subjects, such as `landscape` or `figure`. Selected tags become filters |
| Collections | The series it belongs to, and **Selected** if it should appear on the home page |
| Status | Leave **Draft** until everything below is done |

## 3. Variants: the original and the prints

The template comes with an **Original** variant and six **Print** variants (three sizes × two papers).

- **Original**: set its price. Inventory is tracked, so set the quantity to **1** at the studio location. Whether visitors can buy it is decided by the *Original status* field below, not by the price.
- **Prints**: keep the sizes and papers you offer for this piece and set each price. Delete the ones you do not offer. Inventory stays untracked so prints never show as sold out.
- **Digital work** (no physical original): delete the Original variant entirely.

## 4. The art fields

Under the product form, in the **Art** section (Shopify calls these metafields):

| Field | What to enter |
|---|---|
| Year | Year completed |
| Medium detail | As it should read on the page, for example `Oil on linen` |
| Height, Width, Depth | Of the original, with the unit. Depth only for panels, canvases with depth, or sculpture |
| Size class | `Small` under 12 in, `Medium` 12 to 30 in, `Large` over 30 in on the long side. Drives the size filter |
| Original status | `For sale` (price and Add to cart), `Inquire` (button opens the inquiry form, no price), `Reserved`, `Sold`, `Not for sale`, or `Digital work` (no original block at all) |
| Original note | Optional line under the status, such as `Framed, ready to hang` or `Private collection` |
| Featured | On, if the piece may be used as the home page hero |

## 5. Shipping profiles

New products land in the **General** shipping profile, which charges its default rates ($8 standard, $15 express, free over $70) until the variants are moved. Do this once per piece:

1. **Settings**, **Shipping and delivery**.
2. Under **Custom shipping rates**, open **Prints**, click **Manage**, then **Add products**. Search the artwork, tick only its **Print** variants, and save.
3. Open **Originals**, **Manage**, **Add products**, search the artwork, tick only the **Original** variant, and save.

(Ezra can also run `node scripts/setup-store.mjs --sync`, which does this for every product at once, once the store app has shipping permission.)

## 6. Publish

1. Back on the product, set **Status** to **Active**.
2. In the **Sales channels** box on the right, make sure **Online Store** is ticked.
3. Save. The piece appears in the gallery within a minute.

## Later changes

- **Sell the original directly**: set *Original status* to `For sale`, check the Original variant's price and that its quantity is 1.
- **Mark it sold**: set *Original status* to `Sold`. The piece stays in the gallery, marked sold.
- **Retire a piece**: set the product to **Draft**. Nothing is deleted.
