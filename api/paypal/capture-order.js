// Captures (charges) an approved PayPal order, checks it was paid in full for
// a known product, and returns the buyer's download page.
import { CATALOG } from "../_lib/catalog.js";
import { captureStatus, downloadToken, isConfigured, isOrderId, paidPurchase, paypal } from "../_lib/paypal.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  if (!isConfigured()) return res.status(503).json({ error: "Checkout isn't available yet." });

  const orderId = (req.body || {}).orderID;
  if (!isOrderId(orderId)) return res.status(400).json({ error: "Invalid order." });

  try {
    let { ok, status, data } = await paypal(`/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      requestId: `capture-${orderId}`,
    });

    const issue = data && data.details && data.details[0] && data.details[0].issue;
    if (!ok && issue === "INSTRUMENT_DECLINED") {
      return res.status(422).json({ restart: true, error: "Your payment method was declined. Please try another one." });
    }
    if (!ok && issue === "ORDER_ALREADY_CAPTURED") {
      ({ ok, status, data } = await paypal(`/v2/checkout/orders/${orderId}`));
    }
    if (!ok) {
      console.error("PayPal capture failed", status, JSON.stringify(data));
      return res.status(502).json({ error: "PayPal couldn't complete the payment. You haven't been charged." });
    }

    const paid = paidPurchase(data, CATALOG);
    if (!paid) {
      if (captureStatus(data) === "PENDING") {
        return res.status(202).json({
          error: "PayPal is still processing your payment. Once it clears, email us your PayPal transaction ID and we'll send your download.",
        });
      }
      console.error("Order not paid as expected", orderId, JSON.stringify(data));
      return res.status(402).json({ error: "The payment wasn't completed. If PayPal emailed you a receipt, contact us with the transaction ID." });
    }

    const query = new URLSearchParams({ order: orderId, token: downloadToken(orderId) });
    return res.status(200).json({ status: "COMPLETED", redirect: `/thank-you.html?${query}` });
  } catch (err) {
    console.error("PayPal capture error", err);
    return res.status(502).json({ error: "Couldn't confirm the payment with PayPal. If you received a PayPal receipt, contact us with the transaction ID." });
  }
}
