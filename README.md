# Fashion Shop

A responsive fashion storefront built with React, TypeScript, Vite, Tailwind CSS, and DaisyUI. Browse the catalog, save favorites, manage a cart, and complete a sample checkout with account and wallet features.

> **Project status:** This is a storefront demo. Accounts and orders are stored in the browser, and payment options are previews rather than connected payment services. Read [Limitations](#limitations-before-production) before using it for a real shop.

## Features

- Responsive home page and product catalog with categories, search, sorting, and product details.
- Product variants, shopping cart, and wishlist.
- Sign up, sign in, account settings, and password changes.
- Browser-local wallet with transaction history and sample top-ups.
- Checkout with configurable promo codes from `Data.json`.
- Optional location detection in checkout. After permission is granted, coordinates are sent to the app's same-origin server endpoint and forwarded to a private reverse-geocoding service to fill the address fields.
- Light and dark themes.
- Configurable announcement banner with `promo`, `notice`, and `alert` styles.

## Run locally

### Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm

### Install and start

```bash
git clone https://github.com/JuisLionel/Fashion-shop.git
cd Fashion-shop
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:3000`).

### Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server on port 3000 |
| `npm run build` | Run the TypeScript project build and create the production bundle in `dist/` |
| `npm run preview` | Preview the production bundle locally |
| `npm run lint` | Run Oxlint |

## How the shop works

### Catalog and storefront content

The root [`Data.json`](./Data.json) file provides product information and shared site content. Product records drive the catalog and product pages. The `site` object supplies the brand copy, category content, FAQs, contact details, and promo banner.

To edit the announcement banner, update `site.promo`:

```json
{
  "enabled": true,
  "type": "promo",
  "text": "10% off all shirts with code FASHION10"
}
```

- `enabled`: show or hide the banner.
- `type`: `promo` uses the storefront's theme styling, `notice` shows an informational announcement, and `alert` displays a red warning.
- `text`: the announcement message.

Checkout promo codes are configured in `site.checkoutPromoCodes` in `Data.json`, separately from the announcement banner. Each entry has a `code`, `type`, `value`, and `enabled` flag. Supported types are `percentage`, `fixed`, and `free-shipping`. Add another entry to offer another code, or set `enabled` to `false` to turn a code off.

For example, to add a 15% discount, add this object to `site.checkoutPromoCodes`:

```json
{
  "code": "STYLE15",
  "type": "percentage",
  "value": 15,
  "enabled": true
}
```

### Accounts and saved data

Create an account from `/sign-up`, then sign in at `/sign-in`. Account records, credentials, cart, wishlist, wallet, and orders are saved in the browser's `localStorage`. Passwords are hashed in the browser with PBKDF2. A signed-in session and its saved data belong to that browser profile and are not synchronized across devices.

The account menu links to account settings, orders, wishlist, and wallet pages. Password changes require the current password. Deleting an account removes its locally saved account data from that browser.

### Cart and checkout

Add products to the cart, choose available variants, and continue to `/checkout`. Enter a shipping address and choose regular or express delivery, then continue to `/payment` to select a payment method and review the order total. Shipping is free over Rp 300,000; otherwise the demo rates are Rp 25,000 for regular or Rp 50,000 for express delivery.

The starter checkout codes in `Data.json` are:

- `FASHION10`: 10% off the item subtotal.
- `FREESHIP`: free shipping.

The discount, promo code, shipping cost, and total are saved on the order and shown in the order details. Wallet payment updates the local wallet balance. Other payment methods create a pending demo order and do not take payment.

## Routes

| Route | Page |
| --- | --- |
| `/` | Home |
| `/shop` | Product catalog |
| `/product/:id` | Product details |
| `/cart` | Shopping cart |
| `/wishlist` | Saved products |
| `/checkout` | Shipping details and delivery method |
| `/payment` | Payment method and order review |
| `/sign-in` | Sign in |
| `/sign-up` | Create account |
| `/account` | Account settings |
| `/account/wallet` | Wallet and transaction history |
| `/orders` | Order history |
| `/orders/:id` | Order details |
| `/size-guide`, `/shipping`, `/exchanges` | Placeholder information pages |

## Project structure

```text
api/                 API/serverless function area
public/              Static assets and product imagery
src/
  auth/               Browser-local auth and account state
  Components/         Shared UI, navigation, footer, promo, and notifications
  page/               Route-level pages
  App.tsx             App providers and route definitions
  index.css           Tailwind, DaisyUI themes, and global styles
Data.json             Product catalog and editable storefront content
```

## Deployment

The project includes a Vercel configuration. Connect the GitHub repository to Vercel and deploy with:

- Build command: `npm run build`
- Output directory: `dist`

Open the deployed HTTPS URL on mobile. Deploying the static storefront does not turn browser-local accounts into shared server accounts and does not connect payment processing.

## Limitations before production

- **Authentication is browser-local.** There is no server-side identity, session management, password reset, or cross-device account sync. Browser storage is not a production credential store.
- **Payments are not connected.** Wallet balances and top-ups are demo values. External payment choices do not charge a customer.
- **Orders and inventory are not server-validated.** Local browser data can be modified and should not be treated as authoritative.
- **Promo codes are client-side demo logic.** They are not securely validated by a server.
- **Shipping costs and delivery tracking are mock estimates.** No carrier integration is configured.
- **Location lookup requires a private server endpoint.** Configure the endpoint and its credentials securely; address results should be reviewed before checkout.

Before accepting real customers or payments, add a secure backend, server-side authentication and validation, a payment provider, and appropriate privacy and security controls.