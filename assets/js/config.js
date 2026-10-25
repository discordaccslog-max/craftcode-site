/*
  CraftCode site settings
  =======================
  This is the only file you need to edit to connect checkout.

  checkoutUrl
    Paste the full checkout / payment link for each product, e.g.
    "https://your-checkout.example.com/buy/part-1". While a link is
    empty, that product's buy button shows "Coming soon" and
    can't be clicked.

  price
    The number shown on the site. Keep it in sync with what your
    checkout actually charges.

  The paid .zip files must NOT be uploaded to this repository. They
  belong in your checkout / delivery system, which sends them to
  buyers after payment.
*/
window.CRAFTCODE_CONFIG = {
  currency: "USD",
  currencySymbol: "$",

  products: {
    "part-1":   { price: 19, checkoutUrl: "" },
    "part-2":   { price: 19, checkoutUrl: "" },
    "part-3":   { price: 24, checkoutUrl: "" },
    "complete": { price: 49, checkoutUrl: "" }
  }
};
