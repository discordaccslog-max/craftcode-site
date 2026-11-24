// Tells the browser whether PayPal checkout is switched on, and which public
// client ID to load the PayPal buttons with. The secret is never sent.
import { CATALOG } from "../_lib/catalog.js";
import { isConfigured, publicClientId } from "../_lib/paypal.js";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!isConfigured()) return res.status(200).json({ enabled: false });
  return res.status(200).json({
    enabled: true,
    clientId: publicClientId(),
    currency: "USD",
    products: Object.keys(CATALOG),
  });
}
