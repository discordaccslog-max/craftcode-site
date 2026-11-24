// Creates a PayPal order. The price comes from the server-side catalog,
// never from the browser.
import crypto from "node:crypto";
import { CATALOG } from "../_lib/catalog.js";
import { isConfigured, paypal } from "../_lib/paypal.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  if (!isConfigured()) return res.status(503).json({ error: "Checkout isn't available yet." });

  const body = req.body || {};
  const product = CATALOG[body.product];
  if (!product) return res.status(400).json({ error: "Unknown product." });
  if (body.consent !== true) return res.status(400).json({ error: "Please tick the box above the PayPal buttons first." });

  const money = { currency_code: product.currency, value: product.price };
  try {
    const { ok, status, data } = await paypal("/v2/checkout/orders", {
      method: "POST",
      requestId: crypto.randomUUID(),
      body: {
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: product.id,
          custom_id: product.id,
          description: product.name,
          amount: { ...money, breakdown: { item_total: money } },
          items: [{ name: product.name, sku: product.sku, quantity: "1", category: "DIGITAL_GOODS", unit_amount: money }],
        }],
        application_context: { brand_name: "CraftCode", shipping_preference: "NO_SHIPPING", user_action: "PAY_NOW" },
      },
    });
    if (!ok) {
      console.error("PayPal create-order failed", status, JSON.stringify(data));
      return res.status(502).json({ error: "Couldn't start PayPal checkout. Please try again." });
    }
    return res.status(200).json({ id: data.id });
  } catch (err) {
    console.error("PayPal create-order error", err);
    return res.status(502).json({ error: "Couldn't reach PayPal. Please try again." });
  }
}
