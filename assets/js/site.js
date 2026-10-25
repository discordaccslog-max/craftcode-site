// Connects buy buttons and prices to assets/js/config.js.
(function () {
  var config = window.CRAFTCODE_CONFIG || { products: {} };
  var symbol = config.currencySymbol || "$";

  function formatPrice(value) {
    var n = Number(value);
    if (!isFinite(n)) return "";
    return symbol + (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2));
  }

  document.querySelectorAll("[data-price]").forEach(function (el) {
    var product = config.products[el.getAttribute("data-price")];
    if (product && product.price != null) el.textContent = formatPrice(product.price);
  });

  document.querySelectorAll("[data-buy]").forEach(function (el) {
    var product = config.products[el.getAttribute("data-buy")];
    var url = product && typeof product.checkoutUrl === "string" ? product.checkoutUrl.trim() : "";

    if (/^https?:\/\//i.test(url)) {
      el.setAttribute("href", url);
      el.removeAttribute("aria-disabled");
      return;
    }

    el.removeAttribute("href");
    el.setAttribute("aria-disabled", "true");
    el.setAttribute("role", "link");
    el.textContent = "Coming soon";
    el.addEventListener("click", function (event) { event.preventDefault(); });
  });

  // close the mobile menu after choosing a link
  document.querySelectorAll(".menu-panel a").forEach(function (link) {
    link.addEventListener("click", function () {
      var menu = link.closest("details");
      if (menu) menu.removeAttribute("open");
    });
  });
})();
