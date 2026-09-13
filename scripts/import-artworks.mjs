#!/usr/bin/env node
/**
 * Bulk-create artworks from the intake spreadsheet (content/artworks-template.xlsx
 * layout, sheet "Artworks"). One product per row, following docs/CONTENT-MODEL.md:
 * Edition option (Original, Print), Print variants by Size and Paper, art.* fields,
 * images attached from a public base URL, series and Selected collections.
 *
 * Usage:
 *   node scripts/import-artworks.mjs content/artworks.xlsx [options]
 *     --images-base URL   where image filenames resolve (default: this repo's
 *                         content/images on GitHub, branch main)
 *     --status active     create as Active instead of Draft
 *     --publish           afterwards publish to the Online Store and assign
 *                         shipping profiles (needs publication + shipping scopes)
 *     --dry-run           print what would be created; no network
 *
 * Idempotent: a row whose handle already exists in the store is skipped, so the
 * sheet can be re-run after fixing rows. Rows whose title starts with "EXAMPLE"
 * are ignored.
 */
import { readFileSync } from "node:fs";
import * as XLSX from "xlsx";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const DRY = args.includes("--dry-run");
const PUBLISH = args.includes("--publish");
const STATUS = (opt("--status", "draft") || "draft").toUpperCase() === "ACTIVE" ? "ACTIVE" : "DRAFT";
const IMAGES_BASE = (opt("--images-base", "https://raw.githubusercontent.com/Mikki84/Mikkii-Art-Website/main/content/images/") || "").replace(/\/?$/, "/");
if (!file) { console.error("Usage: node scripts/import-artworks.mjs <artworks.xlsx> [--images-base URL] [--status active] [--publish] [--dry-run]"); process.exit(1); }

const SIZE_COLUMNS = { price_8x10: "8 × 10 in", price_11x14: "11 × 14 in", price_16x20: "16 × 20 in", price_18x24: "18 × 24 in", price_24x36: "24 × 36 in" };
const STATUSES = ["For sale", "Inquire", "Reserved", "Sold", "Not for sale", "Digital work"];
const MEDIA = ["Painting", "Drawing", "Digital", "Mixed media"];

const wb = XLSX.read(readFileSync(file));
const sheet = wb.Sheets["Artworks"];
if (!sheet) { console.error('Sheet "Artworks" not found'); process.exit(1); }
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

const s = (v) => String(v ?? "").trim();
const num = (v) => (s(v) === "" ? null : Number(String(v).replace(/[$,]/g, "")));
const yes = (v) => /^(y|yes|true|1)$/i.test(s(v));
const list = (v, sep) => s(v).split(sep).map((x) => x.trim()).filter(Boolean);

const plans = [];
const problems = [];
for (const [i, r] of rows.entries()) {
  const line = i + 2;
  const title = s(r.title);
  if (!title || /^example\b/i.test(title)) continue;
  const errs = [];
  const medium = s(r.medium); if (!MEDIA.includes(medium)) errs.push(`medium must be one of ${MEDIA.join(", ")}`);
  const status = s(r.original_status); if (!STATUSES.includes(status)) errs.push(`original_status must be one of ${STATUSES.join(", ")}`);
  const originalPrice = num(r.original_price);
  if (status === "For sale" && !(originalPrice > 0)) errs.push("original_price is required when original_status is For sale");
  const sizes = Object.entries(SIZE_COLUMNS).filter(([col]) => num(r[col]) !== null).map(([col, label]) => ({ label, price: num(r[col]) }));
  const papers = list(r.papers || "Matte;Luster", ";");
  const digital = status === "Digital work";
  const height = num(r.height_in), width = num(r.width_in), depth = num(r.depth_in);
  let sizeClass = s(r.size_class);
  if (!sizeClass && (height || width)) { const m = Math.max(height || 0, width || 0); sizeClass = m > 30 ? "Large" : m >= 12 ? "Medium" : "Small"; }
  if (errs.length) { problems.push(`row ${line} (${title}): ${errs.join("; ")}`); continue; }
  plans.push({
    line, title, handle: slug(title), medium, mediumDetail: s(r.medium_detail), year: num(r.year), height, width, depth, sizeClass,
    status, originalPrice, originalNote: s(r.original_note), series: s(r.series), selected: yes(r.selected), featured: yes(r.featured),
    tags: list(r.tags, ","), description: s(r.description), images: list(r.images, ";"), papers, sizes, digital,
  });
}
function slug(t) { return String(t).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

if (problems.length) { console.error("Fix these rows first:\n  " + problems.join("\n  ")); process.exit(1); }
console.log(`${plans.length} artwork(s) to import from ${file}`);
for (const p of plans) {
  const variants = (p.digital ? 0 : 1) + p.sizes.length * p.papers.length;
  console.log(`  ${p.handle}: ${p.medium}, ${p.status}${p.originalPrice ? " $" + p.originalPrice : ""}, ${p.sizes.length} print size(s) × ${p.papers.length} paper(s) = ${variants} variant(s), ${p.images.length} image(s)${p.series ? `, series "${p.series}"` : ""}`);
}
if (DRY) { console.log("dry run; nothing created"); process.exit(0); }

const lib = await import("./lib/shopify.mjs");
const { gql, findOrCreateCollection, allProducts, publishToOnlineStore, assignShippingProfiles } = lib;
await lib.mintToken();

const collectionCache = new Map();
async function collectionId(title, isSeries) {
  const key = title.toLowerCase();
  if (!collectionCache.has(key)) collectionCache.set(key, await findOrCreateCollection(title, { isSeries }));
  return collectionCache.get(key);
}

const dim = (v) => JSON.stringify({ value: v, unit: "INCHES" });
for (const p of plans) {
  const existing = await gql(`query($h: String!) { productByHandle(handle: $h) { id } }`, { h: p.handle });
  if (existing.productByHandle) { console.log(`skip ${p.handle}: already exists`); continue; }

  const collections = [];
  if (p.series) collections.push(await collectionId(p.series, true));
  if (p.selected) collections.push(await collectionId("Selected", false));

  const metafields = [
    { namespace: "art", key: "size_class", type: "single_line_text_field", value: p.sizeClass || "Medium" },
    { namespace: "art", key: "original_status", type: "single_line_text_field", value: p.status },
    { namespace: "art", key: "featured", type: "boolean", value: String(p.featured) },
  ];
  if (p.year) metafields.push({ namespace: "art", key: "year", type: "number_integer", value: String(Math.round(p.year)) });
  if (p.mediumDetail) metafields.push({ namespace: "art", key: "medium_detail", type: "single_line_text_field", value: p.mediumDetail });
  if (p.height) metafields.push({ namespace: "art", key: "height", type: "dimension", value: dim(p.height) });
  if (p.width) metafields.push({ namespace: "art", key: "width", type: "dimension", value: dim(p.width) });
  if (p.depth) metafields.push({ namespace: "art", key: "depth", type: "dimension", value: dim(p.depth) });
  if (p.originalNote) metafields.push({ namespace: "art", key: "original_note", type: "single_line_text_field", value: p.originalNote });

  const hasPrints = p.sizes.length > 0;
  const productOptions = [];
  if (!p.digital || hasPrints) {
    productOptions.push({ name: "Edition", values: [...(p.digital ? [] : [{ name: "Original" }]), ...(hasPrints ? [{ name: "Print" }] : [])] });
    if (hasPrints) {
      productOptions.push({ name: "Size", values: [...(p.digital ? [] : [{ name: "Original" }]), ...p.sizes.map((x) => ({ name: x.label }))] });
      productOptions.push({ name: "Paper", values: [...(p.digital ? [] : [{ name: "None" }]), ...p.papers.map((x) => ({ name: x }))] });
    }
  }
  const product = {
    title: p.title, handle: p.handle, productType: p.medium, status: STATUS, tags: p.tags,
    descriptionHtml: p.description ? `<p>${p.description.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>` : "",
    metafields, collectionsToJoin: collections, productOptions,
  };
  const created = await gql(`
    mutation Create($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
      productCreate(product: $product, media: $media) { product { id handle } userErrors { field message } }
    }`, {
    product,
    media: p.images.map((f, i) => ({ originalSource: IMAGES_BASE + encodeURIComponent(f), mediaContentType: "IMAGE", alt: i === 0 ? `${p.title}${p.mediumDetail ? ", " + p.mediumDetail : ""}${p.year ? ", " + Math.round(p.year) : ""}` : `${p.title}, detail` })),
  });
  if (created.productCreate.userErrors.length) { console.log(`ERROR ${p.handle}: ${JSON.stringify(created.productCreate.userErrors)}`); continue; }
  const productId = created.productCreate.product.id;

  const variants = [];
  const opt3 = (edition, size, paper) => hasPrints
    ? [{ optionName: "Edition", name: edition }, { optionName: "Size", name: size }, { optionName: "Paper", name: paper }]
    : [{ optionName: "Edition", name: edition }];
  if (!p.digital && productOptions.length) {
    variants.push({ optionValues: opt3("Original", "Original", "None"), price: String(p.originalPrice ?? 0), inventoryPolicy: "DENY", inventoryItem: { tracked: true } });
  }
  for (const size of p.sizes) for (const paper of p.papers) {
    variants.push({ optionValues: opt3("Print", size.label, paper), price: String(size.price), inventoryPolicy: "CONTINUE", inventoryItem: { tracked: false } });
  }
  if (variants.length) {
    const v = await gql(`
      mutation Add($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: REMOVE_STANDALONE_VARIANT) {
          productVariants { id } userErrors { field message }
        }
      }`, { productId, variants });
    if (v.productVariantsBulkCreate.userErrors.length) console.log(`variants ${p.handle}: ${JSON.stringify(v.productVariantsBulkCreate.userErrors)}`);
    if (!p.digital && productOptions.length) {
      // Set the original's stock to 1 at the first location so a "For sale" original can be bought once.
      const loc = await gql(`{ locations(first: 1) { nodes { id } } }`);
      const originalId = v.productVariantsBulkCreate.productVariants[0]?.id;
      const inv = await gql(`query($id: ID!) { productVariant(id: $id) { inventoryItem { id } } }`, { id: originalId });
      const adj = await gql(`
        mutation Set($input: InventorySetQuantitiesInput!) {
          inventorySetQuantities(input: $input) { userErrors { field message } }
        }`, { input: { name: "available", reason: "correction", ignoreCompareQuantity: true, quantities: [{ inventoryItemId: inv.productVariant.inventoryItem.id, locationId: loc.locations.nodes[0].id, quantity: 1 }] } });
      if (adj.inventorySetQuantities.userErrors.length) console.log(`inventory ${p.handle}: ${JSON.stringify(adj.inventorySetQuantities.userErrors)}`);
    }
  }
  console.log(`created ${p.handle} (${variants.length} variant(s), ${p.images.length} image(s), ${STATUS.toLowerCase()})`);
}

if (PUBLISH) {
  const products = await allProducts();
  await publishToOnlineStore(products);
  await assignShippingProfiles(products);
}
console.log("done");
