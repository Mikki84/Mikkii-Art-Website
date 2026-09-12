# Mikkii Art Website

Shopify theme for an artist's store: paintings, drawings, and digital illustration shown as a portfolio, with prints sold as products and originals available on inquiry.

The theme is a customization of Shopify's [Horizon](https://github.com/Shopify/horizon) theme (version 4.1.5 at fork time). Horizon's license is in `LICENSE-HORIZON.md`. The project plan, decisions, and milestones are in `docs/PLAN.md`.

## Layout

Standard Shopify theme structure at the repository root, which the Shopify CLI and the Shopify GitHub integration both expect:

| Folder | Contents |
|---|---|
| `assets/` | CSS, JavaScript, icons |
| `blocks/` | Theme blocks used inside sections |
| `config/` | Theme settings schema and the merchant's saved settings |
| `layout/` | Page shells |
| `locales/` | Translations |
| `sections/` | Page sections |
| `snippets/` | Reusable Liquid partials |
| `templates/` | JSON templates mapping sections to page types |
| `docs/` | Project documentation (not pushed to Shopify) |

`.shopifyignore` keeps documentation and CI files out of theme pushes.

## Developer workflow

Requirements: Node 22 and the Shopify CLI (`npm install -g @shopify/cli`).

Connect to the store with a Theme Access password (the store owner generates one in the Theme Access app; Basic plans have no staff seats, so this is the intended route):

```sh
export SHOPIFY_FLAG_STORE=your-store.myshopify.com
export SHOPIFY_CLI_THEME_TOKEN=shptka_...
```

Then:

```sh
shopify theme dev          # local preview with hot reload, against the store's data
shopify theme check        # lint (CI runs this with --fail-level error)
shopify theme push --unpublished --theme "Staging"   # push to the staging theme
shopify theme list         # see themes and their ids
```

Never push to the live theme by hand; the live theme is published from the staging theme in the Shopify admin after review.

## Branches

- `main` is bound to the store's live theme through the Shopify GitHub integration once the store exists. The integration is two-way: changes the merchant makes in the theme editor are committed back to this branch automatically, so settings files (`config/settings_data.json`, `templates/*.json`) are edited only through the editor once the store is live.
- Feature work happens on branches and merges into `main`.

## Keeping up with Horizon

Horizon is added as an `upstream` remote. To review upstream changes:

```sh
git fetch upstream
git log --oneline HEAD..upstream/main
```

Merges from upstream are deliberate and reviewed; the custom sections are kept separate from Horizon's files wherever possible to keep those merges small.
