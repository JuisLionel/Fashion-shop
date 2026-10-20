# Store content

Edit [`Data.json`](./Data.json) to update the products and shared storefront content. The `site` section contains the brand, announcement, homepage copy, footer, and contact details; the `products` array contains the catalog used by the home page, navigation, and search.

Set `site.promo.enabled` to `true` to show the announcement bar, or `false` to hide it. Product prices use Indonesian rupiah values (`price_idr` and `sale_price_idr`).

## Wallet and payment options

Each account starts with Rp 1,000,000 in a storefront preview wallet. Top-ups support the preset amounts Rp 50,000, Rp 100,000, Rp 250,000, and Rp 500,000, or any positive whole-number IDR amount entered manually. Wallet credit is added immediately without charging a payment method. Wallet activity and orders are saved in that browser's local storage.

Create an account at `/sign-up` with a username, email, and password (at least 8 characters), then sign in at `/sign-in`. Accounts are stored in the current browser; Google and Apple buttons are placeholders and need an OAuth provider to work.

The `/orders` page lists the signed-in account's orders, and `/orders/:id` shows item, delivery, and payment details with sample tracking locations and statuses. The tracking preview is not connected to a carrier. Bank transfer, cash on delivery, card, and e-wallet are preview choices only; payment providers and transfer/collection instructions are not connected. Wallet orders are stored as paid; orders placed with the other options are stored as pending. No actual payment is taken.

Account, wallet, and order data are local to the current browser and are not shared across devices. Use a real backend and payment provider before accepting or fulfilling live orders.