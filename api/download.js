// Streams a purchased zip from private Vercel Blob storage after checking,
// with PayPal, that the order was paid and hasn't been refunded.
import { Readable } from "node:stream";
import { get } from "@vercel/blob";
import { CATALOG, DOWNLOAD_WINDOW_DAYS } from "./_lib/catalog.js";
import { isConfigured, isOrderId, paidPurchase, paypal, tokenMatches } from "./_lib/paypal.js";

const EMAIL = "craftmail@codecraftprogram.com";

function message(res, status, title, text) {
  res.status(status).setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title} | CraftCode</title><link rel="stylesheet" href="/assets/css/site.css"></head><body><main class="wrap"><article class="prose"><h1>${title}</h1><p>${text}</p><p>Need help? Email <a href="mailto:${EMAIL}">${EMAIL}</a> with your PayPal transaction ID.</p><p><a href="/">Back to CraftCode</a></p></article></main></body></html>`);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (!isConfigured()) return message(res, 503, "Downloads unavailable", "Downloads are temporarily unavailable.");

  const { order, token } = req.query || {};
  if (!isOrderId(order) || !tokenMatches(order, token)) {
    return message(res, 403, "Invalid download link", "This download link isn't valid. Please use the exact link from your purchase page.");
  }

  try {
    const { ok, data } = await paypal(`/v2/checkout/orders/${order}`);
    const paid = ok && paidPurchase(data, CATALOG);
    if (!paid) {
      return message(res, 403, "Download not available", "We couldn't find a completed payment for this link. If the order was refunded, the download is no longer available.");
    }

    const ageDays = (Date.now() - Date.parse(paid.capture.create_time)) / 86400000;
    if (!(ageDays <= DOWNLOAD_WINDOW_DAYS)) {
      return message(res, 410, "Download link expired", `Download links work for ${DOWNLOAD_WINDOW_DAYS} days after purchase. Email us and we'll help you get your files again.`);
    }

    const product = CATALOG[paid.productId];
    const file = await get(product.blob, { access: "private" });
    if (!file || file.statusCode !== 200) {
      console.error("Blob missing for", product.blob);
      return message(res, 500, "Download problem", "Your payment is confirmed, but the file couldn't be loaded. Please try again in a few minutes.");
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${product.filename}"`);
    Readable.fromWeb(file.stream).pipe(res);
  } catch (err) {
    console.error("Download error", err);
    return message(res, 502, "Download problem", "We couldn't confirm your purchase with PayPal just now. Please try again in a few minutes.");
  }
}
