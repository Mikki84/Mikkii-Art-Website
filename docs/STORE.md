# Store facts

Operational facts about the live store, kept here because build sessions are ephemeral. No secrets: credentials live only in the gitignored `.env` (see `.env.example`).

| Item | Value |
|---|---|
| Store name | Right Brain Studios |
| Store address | `m75tiq-bf.myshopify.com` (admin at `admin.shopify.com/store/m75tiq-bf`) |
| Domain | `rightbrainstudios.store`, registered 13 September 2026 at Cloudflare (Cloudflare nameservers), connected to Shopify and set as the primary domain; the myshopify address redirects to it |
| Public contact email | `hello@rightbrainstudios.store` (theme setting `studio_contact_email`; must also be the sender email in Settings > General, and needs forwarding at Cloudflare) |
| Plan | Basic, monthly |
| Payments | Shopify Payments live, payouts to Shopify Balance |
| Tax | Shopify Tax, collecting in Massachusetts |
| Checkout | Guest, email contact method |
| Shipping profiles | `Prints` ($9 flat, US), `Originals` ($45 flat, US); General profile ($8 standard, $15 express, free over $70) catches unassigned variants |
| Apps installed | Theme Access, Search & Discovery, Shopify Flow |
| Dev Dashboard app | "Store Setup": `read/write_products`, `read/write_metaobject_definitions`; needs `read/write_publications` and `read/write_shipping` for `--sync` |
| Live theme | Horizon (stock), id 157864493196 |
| Staging theme | "Staging", unpublished, id 157866459276; preview `https://rightbrainstudios.store/?preview_theme_id=157866459276` behind the storefront password |
| Storefront | Password page on during the build |

## Routine commands

```sh
set -a; . ./.env; set +a
shopify theme push --theme 157866459276          # update Staging from this checkout
shopify theme check                               # lint
node scripts/setup-store.mjs --sync               # publish new products, assign shipping profiles
```

## Content status

Five sample artworks in the "Sample Series" collection (one is the draft "TEMPLATE, duplicate me"). Unpublished to the Online Store until the app has publication scopes or they are published by hand. Delete the samples before launch.
