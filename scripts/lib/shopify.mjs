// Shared Admin API helpers for the store scripts. Reads .env from the repo root.
import { readFileSync } from "node:fs";

try {
  for (const line of readFileSync(new URL("../../.env", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
} catch { /* no .env; rely on the environment */ }

export const STORE = process.env.SHOPIFY_STORE;
export const API_VERSION = "2026-07";
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;

if (!STORE || !CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set SHOPIFY_STORE, SHOPIFY_CLIENT_ID, and SHOPIFY_CLIENT_SECRET first (see .env.example).");
  process.exit(1);
}

let token;
export async function mintToken() {
  const res = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: "client_credentials" }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Token request failed: ${JSON.stringify(json)}`);
  console.log(`token minted (scopes: ${json.scope})`);
  token = json.access_token;
  return token;
}

export async function gql(query, variables = {}) {
  if (!token) await mintToken();
  const res = await fetch(`https://${STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

export function isAccessDenied(err) {
  return /ACCESS_DENIED|access scope|Access denied/i.test(String(err && err.message));
}

export async function allProducts() {
  const products = [];
  let cursor = null;
  do {
    const data = await gql(`
      query($cursor: String) {
        products(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id handle title status publishedAt
            variants(first: 100) { nodes { id selectedOptions { name value } } }
          }
        }
      }`, { cursor });
    products.push(...data.products.nodes);
    cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
  } while (cursor);
  return products;
}

export async function publishToOnlineStore(products) {
  let onlineStoreId;
  try {
    const data = await gql(`{ publications(first: 25) { nodes { id catalog { title } } } }`);
    const pub = data.publications.nodes.find((p) => /online store/i.test(p.catalog?.title ?? ""));
    if (!pub) { console.log("publish: no Online Store publication found; skipped"); return; }
    onlineStoreId = pub.id;
  } catch (err) {
    if (isAccessDenied(err)) { console.log("publish: skipped, app lacks read_publications/write_publications"); return; }
    throw err;
  }
  const mutation = `
    mutation Publish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) { userErrors { field message } }
    }`;
  for (const p of products) {
    if (p.status !== "ACTIVE" || p.publishedAt) continue;
    const data = await gql(mutation, { id: p.id, input: [{ publicationId: onlineStoreId }] });
    const errs = data.publishablePublish.userErrors;
    console.log(errs.length ? `publish ${p.handle}: ${JSON.stringify(errs)}` : `published ${p.handle}`);
  }
}

export async function assignShippingProfiles(products) {
  let profiles;
  try {
    const data = await gql(`{ deliveryProfiles(first: 20) { nodes { id name default } } }`);
    profiles = data.deliveryProfiles.nodes;
  } catch (err) {
    if (isAccessDenied(err)) { console.log("shipping: skipped, app lacks read_shipping/write_shipping"); return; }
    throw err;
  }
  const byName = (name) => profiles.find((p) => p.name.toLowerCase() === name.toLowerCase());
  const prints = byName("Prints");
  const originals = byName("Originals");
  if (!prints || !originals) { console.log("shipping: profiles named Prints and Originals not found; skipped"); return; }
  const printIds = [], originalIds = [];
  for (const p of products) {
    for (const v of p.variants.nodes) {
      const edition = (v.selectedOptions.find((o) => o.name === "Edition") || {}).value;
      if (edition === "Print") printIds.push(v.id);
      else if (edition === "Original") originalIds.push(v.id);
    }
  }
  const mutation = `
    mutation Assign($id: ID!, $profile: DeliveryProfileInput!) {
      deliveryProfileUpdate(id: $id, profile: $profile) { userErrors { field message } }
    }`;
  for (const [profile, ids, label] of [[prints, printIds, "Print"], [originals, originalIds, "Original"]]) {
    if (!ids.length) continue;
    for (let i = 0; i < ids.length; i += 100) {
      const data = await gql(mutation, { id: profile.id, profile: { variantsToAssociate: ids.slice(i, i + 100) } });
      const errs = data.deliveryProfileUpdate.userErrors;
      console.log(errs.length ? `shipping ${label}: ${JSON.stringify(errs)}` : `shipping: ${Math.min(i + 100, ids.length)}/${ids.length} ${label} variants in "${profile.name}"`);
    }
  }
}

export function slugify(s) {
  return String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function findOrCreateCollection(title, { isSeries, descriptionHtml = "" } = {}) {
  const found = await gql(`query($q: String!) { collections(first: 5, query: $q) { nodes { id title } } }`, { q: `title:'${title.replace(/'/g, "\\'")}'` });
  const exact = found.collections.nodes.find((c) => c.title.toLowerCase() === title.toLowerCase());
  if (exact) return exact.id;
  const data = await gql(`
    mutation Create($input: CollectionInput!) {
      collectionCreate(input: $input) { collection { id } userErrors { field message } }
    }`, { input: { title, descriptionHtml, metafields: [{ namespace: "art", key: "is_series", type: "boolean", value: String(Boolean(isSeries)) }] } });
  if (data.collectionCreate.userErrors.length) throw new Error(`collection "${title}": ${JSON.stringify(data.collectionCreate.userErrors)}`);
  console.log(`created collection "${title}"`);
  return data.collectionCreate.collection.id;
}
