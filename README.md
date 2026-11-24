# CraftCode website

Website for **CraftCode**, a set of self-paced beginner Python lessons sold as digital downloads. Hosted on Vercel at https://craftcode-site.vercel.app.

The pages are plain HTML, CSS and a little JavaScript, with no build step and no framework. A few small Vercel serverless functions in `api/` handle PayPal checkout and secure downloads.

```
index.html                    Home page: lessons, what's included, pricing, how it works, FAQ
products/                     One page per product (Parts 1–3 and the Complete Edition)
policies/                     Refund, delivery, terms of service, privacy
contact.html                  Contact page
thank-you.html                Download page buyers land on after paying
404.html                      "Page not found" page
assets/css/site.css           All styles (light and dark mode)
assets/js/config.js           Prices shown on the site, and which checkout each product uses
assets/js/site.js             Prices, buy buttons and the PayPal checkout widget
assets/img/                   Favicon and product cover images
api/_lib/catalog.js           Products sold through PayPal, and the price PayPal charges
api/_lib/paypal.js            PayPal API helpers and download-link signing
api/paypal/config.js          Gives the browser the public PayPal client ID
api/paypal/create-order.js    Creates a PayPal order at the server-side price
api/paypal/capture-order.js   Charges the approved order and returns the download page
api/download.js               Re-checks the order with PayPal, then streams the zip
```

## PayPal checkout

**Part 1: Foundations ($15)** is sold through PayPal. The flow:

1. The buyer ticks the consent box (terms, refund policy, immediate access) and pays with PayPal or card.
2. `create-order` creates the order at the price in `api/_lib/catalog.js`. The browser can't change the price.
3. `capture-order` charges it, checks that it was paid in full, and sends the buyer to `thank-you.html` with a signed download link.
4. `download` checks the order with PayPal again (paid, not refunded, under 30 days old), then streams the zip from private Vercel Blob storage.

### Credentials (Vercel environment variables)

The PayPal credentials are **never** stored in this repo. Set them in the Vercel dashboard under **craftcode-site → Settings → Environment Variables**:

| Name | Value |
|---|---|
| `PAYPAL_CLIENT_ID` | Client ID of your PayPal REST app (live) |
| `PAYPAL_CLIENT_SECRET` | Secret of the same app. Mark it **Sensitive**. |
| `PAYPAL_ENV` | Optional. `sandbox` for test keys. Leave unset for live. |
| `BLOB_READ_WRITE_TOKEN` | Already set automatically by the connected Blob store |

After adding or changing them, redeploy (**Deployments → ⋯ → Redeploy**) so the functions pick them up. Until both PayPal values are set, the Part 1 button shows **Coming soon**.

Get the keys at https://developer.paypal.com → **Apps & Credentials** → switch to **Live** → create (or open) a REST app.

### Changing the price or adding products to PayPal

- **Price:** change `price` in `api/_lib/catalog.js` (what PayPal charges, as a string like `"15.00"`) **and** in `assets/js/config.js` (what the site shows).
- **Another product:** upload its zip to the private Blob store, add an entry to `api/_lib/catalog.js`, and set `checkout: "paypal"` for it in `assets/js/config.js`.

```bash
vercel blob put "CraftCode-Part-2-Logic-and-Functions.zip" --access private --pathname products/CraftCode-Part-2-Logic-and-Functions.zip
```

> **Never commit the paid `.zip` or `.pdf` product files to this repository.** It's public, so anyone could download them. They belong in the private Blob store. `.gitignore` blocks `*.zip` and `*.pdf` as a safety net.

### Other products

Products without `checkout: "paypal"` use `checkoutUrl` in `assets/js/config.js`. While that's empty, their button shows **Coming soon**.

## Deploying

The Vercel project is connected to this GitHub repo, so every push to `main` deploys automatically. GitHub Pages can't run the `api/` functions, so host this site on Vercel.

To use your own domain (e.g. codecraftprogram.com): Vercel dashboard → **craftcode-site → Settings → Domains** → add the domain, then add the DNS records Vercel shows at your registrar.

## Editing content

- **Text and sections:** edit the HTML files directly.
- **Contact email:** `craftmail@codecraftprogram.com` appears in the footer, contact page, thank-you page, policies and `api/download.js`. Use find-and-replace across the repo to change it.
- **Policies:** these are written for this specific product (digital downloads, no live instruction). They aren't legal advice. Review them, and consider having them checked for the countries you sell to.
- **Compliance:** the copy deliberately makes no job, income or outcome claims, shows no testimonials or ratings, and states the format plainly (downloadable files, no live instruction, no video, no feedback). Keep it that way when editing, because payment processors check for these things.

## Local preview

```bash
vercel dev
```

This runs the pages and the `api/` functions together, using your Vercel environment variables. Opening `index.html` directly works too, but checkout then shows **Coming soon**.

## Rights

© 2026 CraftCode. All rights reserved. The website code is public so it can be hosted, but the text, lesson content and images are not licensed for reuse.
