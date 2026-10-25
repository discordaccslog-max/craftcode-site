# CraftCode website

Static website for **CraftCode**, a set of self-paced beginner Python lessons sold as digital downloads.

It's plain HTML, CSS and a little JavaScript. There's no build step, no framework and no backend, so it can be hosted anywhere that serves static files.

```
index.html                 Home page: lessons, what's included, pricing, how it works, FAQ
products/                  One page per product (Parts 1–3 and the Complete Edition)
policies/                  Refund, delivery, terms of service, privacy
contact.html               Contact page
404.html                   "Page not found" page
assets/css/site.css        All styles (light and dark mode)
assets/js/config.js        Prices and checkout links  <-- edit this
assets/js/site.js          Connects the buy buttons to config.js
assets/img/                Favicon and product cover images
```

## Connecting checkout

Open `assets/js/config.js` and paste each product's checkout link into `checkoutUrl`:

```js
"part-1": { price: 19, checkoutUrl: "https://your-checkout.example.com/part-1" },
```

- While a `checkoutUrl` is empty, that product's button reads **Coming soon** and can't be clicked.
- Keep `price` the same as what your checkout actually charges. It's the price shown on the site.
- Your checkout or delivery system is what sends the `.zip` files to buyers after payment.

> **Never commit the paid `.zip` or `.pdf` product files to this repository.** It's public, so anyone could download them. `.gitignore` blocks `*.zip` and `*.pdf` as a safety net.

### EU and UK buyers

The refund policy says buyers agree to immediate delivery and lose the 14-day cancellation right once the download link is issued. For that to hold, your checkout should show a checkbox or notice confirming it before payment. Most digital-product checkouts have a setting for this.

## Hosting on GitHub Pages

1. On GitHub, open the repository and go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose **main** and **/ (root)**, then click **Save**.
3. After a minute or two the site is live at `https://<your-username>.github.io/craftcode-site/`.

### Using your own domain (e.g. codecraftprogram.com)

1. In **Settings → Pages → Custom domain**, enter your domain and click **Save**. GitHub adds a `CNAME` file to the repo.
2. At your domain registrar, add the DNS records GitHub shows you (`A` records for the root domain, or a `CNAME` record for `www`).
3. Once DNS has updated, tick **Enforce HTTPS**.

All links in the site are relative, so it works both at the `github.io` address and on a custom domain.

### Other hosts

Netlify, Cloudflare Pages and Vercel all work too. Connect the repo, leave the build command empty, and set the publish directory to the repository root.

## Editing content

- **Text and sections:** edit the HTML files directly.
- **Contact email:** `craftmail@codecraftprogram.com` appears in the footer, the contact page and the policies. Use find-and-replace across the repo to change it.
- **Policies:** these are written for this specific product (digital downloads, no live instruction). They aren't legal advice. Review them, and consider having them checked for the countries you sell to.
- **Compliance:** the copy deliberately makes no job, income or outcome claims, shows no testimonials or ratings, and states the format plainly (downloadable files, no live instruction, no video, no feedback). Keep it that way when editing, because payment processors check for these things.

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Rights

© 2026 CraftCode. All rights reserved. The website code is public so it can be hosted, but the text, lesson content and images are not licensed for reuse.
