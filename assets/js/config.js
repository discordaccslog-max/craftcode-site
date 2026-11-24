/*
  CraftCode site settings
  =======================

  price
    The number shown on the site. Keep it in sync with what checkout
    actually charges.

  checkout: "paypal"
    Sells the product through the built-in PayPal checkout. The amount
    PayPal charges is set on the server in api/_lib/catalog.js, so change
    it there too. PayPal credentials live in Vercel environment
    variables (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET), never in this repo.
    If they aren't set, the button shows "Coming soon".

  checkoutUrl
    For products sold through an external checkout link instead. While a
    link is empty, that product's button shows "Coming soon".

  The paid .zip files must NOT be uploaded to this repository. They are
  stored privately in Vercel Blob and delivered after payment.
*/
window.CRAFTCODE_CONFIG = {
  currency: "USD",
  currencySymbol: "$",

  products: {
    "part-1":   { price: 15, checkout: "paypal" },
    "part-2":   { price: 19, checkoutUrl: "" },
    "part-3":   { price: 24, checkoutUrl: "" },
    "complete": { price: 49, checkoutUrl: "" }
  }
};
