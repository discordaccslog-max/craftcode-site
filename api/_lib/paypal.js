// PayPal REST helpers. Credentials come from Vercel environment variables:
//   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, and optionally PAYPAL_ENV=sandbox
import crypto from "node:crypto";

const API = {
  live: "https://api-m.paypal.com",
  sandbox: "https://api-m.sandbox.paypal.com",
};

// Trim so a stray space or line break pasted into Vercel doesn't break auth.
const clientId = () => (process.env.PAYPAL_CLIENT_ID || "").trim();
const clientSecret = () => (process.env.PAYPAL_CLIENT_SECRET || "").trim();

export function isConfigured() {
  return Boolean(clientId() && clientSecret());
}

export function publicClientId() {
  return clientId();
}

function mode() {
  return (process.env.PAYPAL_ENV || "live").trim().toLowerCase() === "sandbox" ? "sandbox" : "live";
}

function apiBase() {
  return API[mode()];
}

async function accessToken() {
  const auth = Buffer.from(`${clientId()}:${clientSecret()}`).toString("base64");
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    // Log lengths and PayPal's error code only, never the credentials.
    console.error(`PayPal auth failed: HTTP ${res.status} ${detail.error || ""} ${detail.error_description || ""} ` +
      `(mode=${mode()}, clientIdLength=${clientId().length}, secretLength=${clientSecret().length})`);
    throw new Error(`PayPal authentication failed (HTTP ${res.status})`);
  }
  return (await res.json()).access_token;
}

export async function paypal(path, { method = "GET", body, requestId } = {}) {
  const headers = { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" };
  if (requestId) headers["PayPal-Request-Id"] = requestId;
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export const isOrderId = (id) => typeof id === "string" && /^[A-Z0-9]{8,36}$/.test(id);

// Signed download token, so a link can't be built from an order ID alone.
export function downloadToken(orderId) {
  return crypto
    .createHmac("sha256", process.env.PAYPAL_CLIENT_SECRET)
    .update(`craftcode-download:${orderId}`)
    .digest("base64url")
    .slice(0, 32);
}

export function tokenMatches(orderId, token) {
  const expected = Buffer.from(downloadToken(orderId));
  const given = Buffer.from(String(token || ""));
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

// Returns { productId, capture } when the order is fully paid for a known
// product at the right price, otherwise null.
export function paidPurchase(order, catalog) {
  if (!order || order.status !== "COMPLETED") return null;
  const unit = (order.purchase_units || [])[0];
  const capture = unit && unit.payments && unit.payments.captures && unit.payments.captures[0];
  if (!capture || capture.status !== "COMPLETED") return null;

  const productId = unit.custom_id || capture.custom_id || unit.reference_id;
  const product = catalog[productId];
  if (!product) return null;
  if (!capture.amount || capture.amount.currency_code !== product.currency || capture.amount.value !== product.price) return null;

  return { productId, capture };
}

export function captureStatus(order) {
  const unit = order && (order.purchase_units || [])[0];
  const capture = unit && unit.payments && unit.payments.captures && unit.payments.captures[0];
  return capture ? capture.status : null;
}
