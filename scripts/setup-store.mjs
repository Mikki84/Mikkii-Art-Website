#!/usr/bin/env node
/**
 * One-time store setup through the Shopify Admin GraphQL API.
 *
 * Creates the metafield definitions described in docs/CONTENT-MODEL.md and,
 * with --samples, a series collection plus sample artworks so the theme can be
 * previewed before real content exists.
 *
 * Requirements:
 *   - Node 22+
 *   - An app created in the Shopify Dev Dashboard and installed on the store, with
 *     Admin API scopes: write_products, read_products, write_metaobject_definitions,
 *     read_metaobject_definitions (and write_shipping to assign shipping profiles).
 *   - Environment variables (see .env, which is gitignored):
 *       SHOPIFY_STORE=your-store.myshopify.com
 *       SHOPIFY_CLIENT_ID=...
 *       SHOPIFY_CLIENT_SECRET=shpss_...
 *     The script mints a short-lived access token with the client credentials grant.
 *
 * Usage:
 *   node scripts/setup-store.mjs            # definitions only
 *   node scripts/setup-store.mjs --samples  # definitions + sample content
 *
 * Safe to re-run: existing definitions are reported and skipped.
 */

import { readFileSync } from "node:fs";

// Load .env from the repository root if present (no dependency on dotenv).
try {
  for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
} catch { /* no .env; rely on the environment */ }

const STORE = process.env.SHOPIFY_STORE;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const API_VERSION = "2026-07";
const WITH_SAMPLES = process.argv.includes("--samples");

if (!STORE || !CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set SHOPIFY_STORE, SHOPIFY_CLIENT_ID, and SHOPIFY_CLIENT_SECRET first (see .env).");
  process.exit(1);
}

async function mintToken() {
  const res = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: "client_credentials" }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Token request failed: ${JSON.stringify(json)}`);
  console.log(`token minted (scopes: ${json.scope})`);
  return json.access_token;
}
const TOKEN = await mintToken();

async function gql(query, variables = {}) {
  const res = await fetch(`https://${STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

const choices = (values) => [{ name: "choices", value: JSON.stringify(values) }];

const definitions = [
  { ownerType: "PRODUCT", namespace: "art", key: "year", name: "Year", type: "number_integer", description: "Year the piece was completed" },
  { ownerType: "PRODUCT", namespace: "art", key: "medium_detail", name: "Medium detail", type: "single_line_text_field", description: "Shown as written, e.g. Oil on linen" },
  { ownerType: "PRODUCT", namespace: "art", key: "height", name: "Height", type: "dimension", description: "Height of the original" },
  { ownerType: "PRODUCT", namespace: "art", key: "width", name: "Width", type: "dimension", description: "Width of the original" },
  { ownerType: "PRODUCT", namespace: "art", key: "depth", name: "Depth", type: "dimension", description: "Depth of the original, if any" },
  { ownerType: "PRODUCT", namespace: "art", key: "size_class", name: "Size class", type: "single_line_text_field", description: "Small under 12 in, Medium 12 to 30 in, Large over 30 in", validations: choices(["Small", "Medium", "Large"]), filterable: true },
  { ownerType: "PRODUCT", namespace: "art", key: "original_status", name: "Original status", type: "single_line_text_field", description: "What the artwork page shows for the original", validations: choices(["For sale", "Inquire", "Reserved", "Sold", "Not for sale", "Digital work"]), filterable: true },
  { ownerType: "PRODUCT", namespace: "art", key: "original_note", name: "Original note", type: "single_line_text_field", description: "Optional line under the status, e.g. Framed, ready to hang" },
  { ownerType: "PRODUCT", namespace: "art", key: "featured", name: "Featured", type: "boolean", description: "Eligible for the home page hero" },
  { ownerType: "COLLECTION", namespace: "art", key: "is_series", name: "Is a series", type: "boolean", description: "True for series collections; false for curated sets" },
];

async function createDefinitions() {
  const mutation = `
    mutation Create($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition { id name }
        userErrors { field message code }
      }
    }`;
  for (const d of definitions) {
    const definition = {
      name: d.name,
      namespace: d.namespace,
      key: d.key,
      type: d.type,
      description: d.description,
      ownerType: d.ownerType,
      pin: true,
      validations: d.validations ?? [],
      access: { storefront: "PUBLIC_READ" },
      // Admin filtering; storefront filtering for Search & Discovery is enabled
      // per definition under Settings > Custom data if the app does not list it.
      capabilities: d.filterable ? { adminFilterable: { enabled: true } } : undefined,
    };
    const data = await gql(mutation, { definition });
    const r = data.metafieldDefinitionCreate;
    if (r.userErrors.length) {
      const taken = r.userErrors.some((e) => e.code === "TAKEN");
      console.log(`${taken ? "exists " : "ERROR  "} ${d.ownerType.toLowerCase()} ${d.namespace}.${d.key}${taken ? "" : " " + JSON.stringify(r.userErrors)}`);
    } else {
      console.log(`created ${d.ownerType.toLowerCase()} ${d.namespace}.${d.key}`);
    }
  }
}

const sizes = ["8 × 10 in", "11 × 14 in", "16 × 20 in"];
const papers = ["Matte", "Luster"];
const printPrice = { "8 × 10 in": "45.00", "11 × 14 in": "75.00", "16 × 20 in": "120.00" };

function variantsFor({ original, digital }) {
  const list = [];
  if (!digital) {
    list.push({ optionValues: [{ optionName: "Edition", name: "Original" }, { optionName: "Size", name: "Original" }, { optionName: "Paper", name: "None" }], price: original.price, inventoryPolicy: "DENY", inventoryItem: { tracked: true } });
  }
  for (const s of sizes) for (const p of papers) {
    list.push({ optionValues: [{ optionName: "Edition", name: "Print" }, { optionName: "Size", name: s }, { optionName: "Paper", name: p }], price: printPrice[s], inventoryPolicy: "CONTINUE", inventoryItem: { tracked: false } });
  }
  return list;
}

const samples = [
  { title: "TEMPLATE — duplicate me", type: "Painting", status: "DRAFT", meta: { year: 2026, medium_detail: "Oil on canvas", h: 24, w: 18, size: "Medium", original_status: "Inquire", note: "" }, original: { price: "1200.00" } },
  { title: "Harbor Light", type: "Painting", status: "ACTIVE", meta: { year: 2025, medium_detail: "Oil on linen", h: 30, w: 40, size: "Large", original_status: "For sale", note: "Framed, ready to hang" }, original: { price: "2400.00" }, featured: true },
  { title: "Study in Graphite No. 4", type: "Drawing", status: "ACTIVE", meta: { year: 2024, medium_detail: "Graphite on paper", h: 11, w: 8.5, size: "Small", original_status: "Sold", note: "Private collection" }, original: { price: "350.00" } },
  { title: "Night Garden", type: "Digital", status: "ACTIVE", meta: { year: 2026, medium_detail: "Digital illustration", h: 0, w: 0, size: "Medium", original_status: "Digital work", note: "" }, digital: true },
  { title: "Quiet Room", type: "Mixed media", status: "ACTIVE", meta: { year: 2023, medium_detail: "Acrylic and collage on panel", h: 20, w: 16, size: "Medium", original_status: "Reserved", note: "" }, original: { price: "900.00" } },
];

async function createSamples() {
  const collectionMutation = `
    mutation Create($input: CollectionInput!) {
      collectionCreate(input: $input) { collection { id handle } userErrors { field message } }
    }`;
  const col = await gql(collectionMutation, {
    input: {
      title: "Sample Series",
      descriptionHtml: "<p>Sample pieces used to preview the theme. Delete this series once real work is entered.</p>",
      metafields: [{ namespace: "art", key: "is_series", type: "boolean", value: "true" }],
    },
  });
  if (col.collectionCreate.userErrors.length) console.log("collection:", JSON.stringify(col.collectionCreate.userErrors));
  const collectionId = col.collectionCreate.collection?.id;
  console.log("collection", col.collectionCreate.collection?.handle ?? "(exists or failed)");

  const productMutation = `
    mutation Create($product: ProductCreateInput!) {
      productCreate(product: $product) { product { id handle } userErrors { field message } }
    }`;
  const variantMutation = `
    mutation Add($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: REMOVE_STANDALONE_VARIANT) {
        productVariants { id title }
        userErrors { field message }
      }
    }`;

  for (const s of samples) {
    const metafields = [
      { namespace: "art", key: "year", type: "number_integer", value: String(s.meta.year) },
      { namespace: "art", key: "medium_detail", type: "single_line_text_field", value: s.meta.medium_detail },
      { namespace: "art", key: "size_class", type: "single_line_text_field", value: s.meta.size },
      { namespace: "art", key: "original_status", type: "single_line_text_field", value: s.meta.original_status },
      { namespace: "art", key: "featured", type: "boolean", value: String(Boolean(s.featured)) },
    ];
    if (s.meta.h) metafields.push({ namespace: "art", key: "height", type: "dimension", value: JSON.stringify({ value: s.meta.h, unit: "in" }) });
    if (s.meta.w) metafields.push({ namespace: "art", key: "width", type: "dimension", value: JSON.stringify({ value: s.meta.w, unit: "in" }) });
    if (s.meta.note) metafields.push({ namespace: "art", key: "original_note", type: "single_line_text_field", value: s.meta.note });

    const product = {
      title: s.title,
      productType: s.type,
      status: s.status,
      descriptionHtml: `<p>${s.title} is a sample artwork used to preview the theme.</p>`,
      tags: ["sample"],
      productOptions: [
        { name: "Edition", values: s.digital ? [{ name: "Print" }] : [{ name: "Original" }, { name: "Print" }] },
        { name: "Size", values: (s.digital ? [] : [{ name: "Original" }]).concat(sizes.map((n) => ({ name: n }))) },
        { name: "Paper", values: (s.digital ? [] : [{ name: "None" }]).concat(papers.map((n) => ({ name: n }))) },
      ],
      metafields,
      collectionsToJoin: collectionId ? [collectionId] : [],
    };
    const created = await gql(productMutation, { product });
    if (created.productCreate.userErrors.length) { console.log("product", s.title, JSON.stringify(created.productCreate.userErrors)); continue; }
    const productId = created.productCreate.product.id;
    const v = await gql(variantMutation, { productId, variants: variantsFor(s) });
    if (v.productVariantsBulkCreate.userErrors.length) console.log("variants", s.title, JSON.stringify(v.productVariantsBulkCreate.userErrors));
    console.log(`product ${created.productCreate.product.handle} (${v.productVariantsBulkCreate.productVariants.length} variants)`);
  }
}

await createDefinitions();
if (WITH_SAMPLES) await createSamples();
console.log("done");
