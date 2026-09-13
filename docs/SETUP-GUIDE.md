# Store setup guide

Step-by-step registration and settings for the artist (the store owner) and for Ezra. Do the parts in order; each takes a few minutes except Payments, which needs identity and bank details at hand. Paths are given as menu labels inside the Shopify admin, which is reached at `admin.shopify.com`.

Have ready before starting:
- Legal name, date of birth, home address (not a PO box), and Social Security or ITIN number (Shopify Payments asks for these even for individuals).
- A US checking account number and routing number (savings and prepaid accounts are not accepted).
- A phone for two-step verification, which Shopify Payments requires.
- The email address that should receive orders and inquiries.

---

## Part A. Create the store (artist, 10 minutes)

1. Go to `shopify.com` and choose **Start free trial**. Sign up with the email that should own the store. This account is the owner; the Basic plan includes no additional staff seats, so everyone else gets access through the tools in Part E.
2. Answer the onboarding questions however you like; they only shape suggestions. When asked for a store name, use the artist's name or the working title; the public name can be changed later.
3. Trial terms as of September 2026: 3 days free, then $1 per month for 3 months, then the regular plan price. Selling is allowed during the trial once a plan is chosen.
4. Turn on two-step authentication now: click the account avatar (top right), **Manage account**, **Security**, **Two-step authentication**. Shopify Payments will not activate without it.

## Part B. Choose the plan (artist, 2 minutes)

1. **Settings** (bottom left), **Plan**, **Choose plan**.
2. Select **Basic**, billed **monthly**. The promotional $1 months apply first. Revisit annual billing after the promotion, as agreed.

## Part C. Payments (artist, 15 minutes)

1. **Settings**, **Payments**.
2. Under Shopify Payments, choose **Activate Shopify Payments** (or **Complete account setup**).
3. Business type: **Individual / sole proprietor** unless the artist has an LLC with an EIN. Enter legal name, date of birth, address, and SSN or ITIN. Shopify may ask for a photo ID later; that is normal.
4. Product description: "Original artwork and fine art prints."
5. Bank account: US checking, ACH-capable. Enter routing and account numbers.
6. Customer billing statement: put the artist's name or the store name so buyers recognise the charge.
7. Leave **Shop Pay** on (it is included). Skip PayPal for now; it can be added later in the same screen.
8. Payout schedule: leave at the default. First payouts take several extra business days while the account is new.
9. Do not turn on **Test mode** yet; that is used during the commerce milestone to place test orders.

## Part D. Store settings (artist or Ezra, 20 minutes)

### D1. Store details
**Settings**, **General**.
- Store name: the artist's name as it should appear on receipts.
- Store contact email: where Shopify sends notices to the owner. Sender email: what customers see; use the inquiries/orders address.
- Billing address: the studio or home address. This is also the shipping origin.
- Store currency: **USD**. Time zone: the artist's. Unit system: **Imperial** (inches, pounds), weight unit **lb**.
- Order processing (this setting lives here now, not under Checkout): **Automatically fulfil only gift cards**; everything else is fulfilled by hand, or by the print partner later.

### D2. Checkout
**Settings**, **Checkout**.
- Customer accounts: in **Settings**, **Customer accounts**, choose not to show the login link (guest checkout). Can be enabled later.
- Customer contact method: **Email**.
- Full name: **Require first and last name**. Company name: **Don't include**. Address line 2: optional. Shipping address phone: **Optional**.
- Marketing options: leave the email sign-up box present but unchecked by default.
- Leave abandoned checkout emails on.

### D3. Shipping
**Settings**, **Shipping and delivery**.
1. Under **Shipping**, confirm the origin location is the studio address.
2. Create two shipping profiles under **Custom shipping rates**: **Prints** and **Originals**. Products are assigned to a profile from the product page later.
3. In each profile add one zone, **United States**, with a flat rate. Placeholders until real costs are known: Prints $9, Originals $45. Leave international out for now; international buyers use the inquiry form.
4. **Shopify Shipping** is already available: labels for USPS, UPS, FedEx, and DHL Express are bought from the order screen at discounted rates, with no fee beyond postage.
5. Local pickup: optional, under **Local pickup**, if the artist wants to hand pieces over in person.

### D4. Taxes
**Settings**, **Taxes and duties**, **United States**.
1. Choose **Shopify Tax** (free until $100,000 of US sales; then 0.35% per order, capped at 99 cents).
2. Under **Regions you're collecting in**, add the artist's home state and enter the state sales tax ID if one exists. Registering for a sales tax permit with the state is the artist's responsibility; Shopify Tax warns as other states' thresholds approach.
3. Leave **Charge tax on shipping** to Shopify Tax's automatic per-state rules.

### D5. Policies
**Settings**, **Policies**. For each of Refund, Privacy, Terms of service, Shipping, and Contact information, click **Create from template**, read it, adjust the refund window and the shipping wording, and save. These appear in the checkout footer automatically.

### D6. Notifications
**Settings**, **Notifications**.
- **Staff notifications**: add the artist's email so every new order arrives in her inbox.
- Sender email: confirm it matches D1. Shopify will show a **Authenticate your domain** prompt once the custom domain is connected; do that then, it stops order emails landing in spam.

### D7. Password page
**Online Store**, **Preferences**, **Password protection**: leave **Restrict access to visitors with the password** on during the build, and write a short message such as "New site coming soon. For prints and originals, email hello@…". Nobody sees the store until the theme is ready; draft-order invoices still work.

### D8. Markets
**Settings**, **Markets**: keep only the United States for now.

## Part E. Developer access (artist, 10 minutes)

Basic has no staff seats, so Ezra and Claude work through two scoped credentials instead of a login. Both can be revoked at any time.

### E1. Theme Access password (for pushing the theme)
1. **Apps**, search the App Store for **Theme Access** (by Shopify), and install it.
2. Open the app, **Create password**. Name: "Ezra / Claude". Email: Ezra's email.
3. Shopify emails Ezra a link that expires after 7 days and can be opened once. Ezra opens it, copies the password (it starts with `shptka_`), and pastes it into the Claude session.

### E2. App credentials for the setup script
Shopify no longer allows custom apps created inside the admin, so the app is created in the Shopify Dev Dashboard and installed on the store. The setup script mints its own short-lived tokens from the app's client credentials.
1. Go to `dev.shopify.com` (the Dev Dashboard) and sign in with the store owner's account.
2. **Create app**, name it "Store setup".
3. Under the app's **Access** or **Configuration** settings, set the Admin API scopes: `read_products`, `write_products`, `read_metaobject_definitions`, `write_metaobject_definitions`, `read_publications`, `write_publications`, `read_shipping`, `write_shipping`. The last four let the script publish artworks to the Online Store and assign print and original variants to their shipping profiles.
4. **Install** the app on the store and approve the scopes.
5. From the app's settings copy the **Client ID** and **Client secret** (starts with `shpss_`) and send both to Ezra privately. They go into the gitignored `.env` file, never into git.
6. If scopes are added later, save the app configuration and reinstall it on the store so the new scopes take effect.

## Part F. Free apps to install now (artist, 5 minutes)

**Apps**, search the App Store, install:
- **Search & Discovery** (by Shopify). Provides the gallery filters. No configuration yet; Claude sets the filters after the fields exist.
- **Shopify Flow** (by Shopify). Not used until later; installing it now costs nothing.

Not yet: Instafeed (Instagram) and the print-on-demand app come at their milestones, after the print samples decide the provider.

## Part G. Domain (Ezra, 15 minutes)

Status: `rightbrainstudios.store` is registered at Cloudflare (13 September 2026). Steps 2 to 5 remain.

1. Create a Cloudflare account at `cloudflare.com`. In the dashboard, **Domain Registration**, **Register Domains**, search the candidate names, and buy the chosen one (a .com is about $10 per year; the price rises slightly after 1 November 2026).
2. In Cloudflare **DNS** for the domain, add: an **A** record, name `@`, content `23.227.38.65`, proxy **off** (grey cloud); and a **CNAME** record, name `www`, content `shops.myshopify.com`, proxy **off**.
3. In Shopify: **Settings**, **Domains**, **Connect existing domain**, enter the domain, verify. Set it as the primary domain, with `www` redirecting to the bare domain or the reverse, whichever you prefer.
4. Optional email forwarding: Cloudflare **Email**, **Email Routing**, create `hello@yourdomain` forwarding to the artist's inbox. This address can then be the store's sender and inquiry email; Shopify's own forwarding only works for domains bought through Shopify.
5. Keep the proxy off on the two Shopify records permanently; Shopify manages the SSL certificate itself.

## Part H. Instagram (artist, 2 minutes)

In the Instagram app: **Settings**, **Account type and tools**. Confirm the account is **Business** or **Creator**. A personal account cannot feed the site. Nothing else is needed until the Instagram milestone.

## Part I. Selling to the backlog now (artist)

Available as soon as Part C is approved, before the theme exists:
1. **Orders**, **Create order**.
2. **Add custom item** (or a product once products exist): name, price, quantity. Add the shipping charge as a line or under **Add shipping**.
3. **Add customer**: name, email, shipping address.
4. **Send invoice**. The buyer receives an email with a link to Shopify's secure checkout and pays by card or Shop Pay. The paid order appears under Orders like any other.
5. Fulfil from the order page: **Create shipping label** (Shopify Shipping) or **Mark as fulfilled** with a tracking number.

## Part J. What to send to Ezra and Claude

- Theme Access password (`shptka_…`) and the store's `.myshopify.com` address.
- The app's Client ID and Client secret (`shpss_…`) from Part E2.
- The chosen domain name.
- Three to five sample images, the artist's display name and tagline, the inquiry email, the Instagram handle, and initial print sizes and prices (or "use placeholders").

Secrets go in a private message, never in a public issue or commit. Both credentials are revocable from the store at any time.
