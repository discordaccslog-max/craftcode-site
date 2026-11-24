// Products that can be bought through PayPal checkout.
// The price here is what PayPal actually charges. Keep it in sync with the
// price shown on the site (assets/js/config.js).
export const CATALOG = {
  "part-1": {
    id: "part-1",
    name: "CraftCode Part 1: Foundations (digital download)",
    sku: "CC-PART-1",
    price: "15.00",
    currency: "USD",
    blob: "products/CraftCode-Part-1-Foundations.zip",
    filename: "CraftCode-Part-1-Foundations.zip",
  },
};

// How long a buyer's download link keeps working after payment.
export const DOWNLOAD_WINDOW_DAYS = 30;
