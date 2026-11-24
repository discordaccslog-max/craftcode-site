// Connects prices and buy buttons to assets/js/config.js, and renders PayPal
// checkout for products set to checkout: "paypal".
(function () {
  var config = window.CRAFTCODE_CONFIG || { products: {} };
  var symbol = config.currencySymbol || "$";

  function formatPrice(value) {
    var n = Number(value);
    if (!isFinite(n)) return "";
    return symbol + (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2));
  }

  function comingSoon(el) {
    el.removeAttribute("href");
    el.setAttribute("aria-disabled", "true");
    el.setAttribute("role", "link");
    el.textContent = "Coming soon";
    el.addEventListener("click", function (event) { event.preventDefault(); });
  }

  document.querySelectorAll("[data-price]").forEach(function (el) {
    var product = config.products[el.getAttribute("data-price")];
    if (product && product.price != null) el.textContent = formatPrice(product.price);
  });

  var paypalButtons = [];
  document.querySelectorAll("[data-buy]").forEach(function (el) {
    var id = el.getAttribute("data-buy");
    var product = config.products[id];
    if (product && product.checkout === "paypal") {
      paypalButtons.push({ el: el, id: id });
      return;
    }
    var url = product && typeof product.checkoutUrl === "string" ? product.checkoutUrl.trim() : "";
    if (/^https?:\/\//i.test(url)) {
      el.setAttribute("href", url);
      el.removeAttribute("aria-disabled");
    } else {
      comingSoon(el);
    }
  });

  if (paypalButtons.length) setUpPayPal(paypalButtons);

  // ---------- PayPal checkout ----------
  function postJSON(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        data.httpOk = res.ok;
        return data;
      });
    });
  }

  function setUpPayPal(items) {
    fetch("/api/paypal/config", { cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : { enabled: false }; })
      .catch(function () { return { enabled: false }; })
      .then(function (settings) {
        var available = settings.enabled && settings.clientId && Array.isArray(settings.products);
        var ready = items.filter(function (item) { return available && settings.products.indexOf(item.id) !== -1; });
        items.forEach(function (item) { if (ready.indexOf(item) === -1) comingSoon(item.el); });
        if (!ready.length) return;

        var script = document.createElement("script");
        script.src = "https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(settings.clientId) +
          "&currency=" + encodeURIComponent(settings.currency || "USD") + "&intent=capture&components=buttons";
        script.onload = function () { ready.forEach(renderCheckout); };
        script.onerror = function () { ready.forEach(function (item) { comingSoon(item.el); }); };
        document.head.appendChild(script);
      });
  }

  function renderCheckout(item) {
    var box = document.createElement("div");
    box.className = "paypal-checkout";
    box.innerHTML =
      '<label class="consent"><input type="checkbox"> <span>I agree to the <a href="/policies/terms.html">terms</a> and ' +
      '<a href="/policies/refund.html">refund policy</a>. I want immediate access to the download and understand ' +
      "that once the download link is issued I lose the right to cancel.</span></label>" +
      '<div class="paypal-buttons"></div>' +
      '<p class="paypal-status" role="status" aria-live="polite"></p>';
    item.el.replaceWith(box);

    var checkbox = box.querySelector("input");
    var status = box.querySelector(".paypal-status");
    function say(text) { status.textContent = text || ""; }

    window.paypal.Buttons({
      style: { layout: "vertical", shape: "pill", label: "pay", height: 44 },
      onInit: function (data, actions) {
        actions.disable();
        checkbox.addEventListener("change", function () {
          if (checkbox.checked) { actions.enable(); say(""); } else { actions.disable(); }
        });
      },
      onClick: function () {
        if (!checkbox.checked) say("Please tick the box above to continue.");
      },
      createOrder: function () {
        say("");
        return postJSON("/api/paypal/create-order", { product: item.id, consent: checkbox.checked })
          .then(function (data) {
            if (!data.httpOk || !data.id) throw new Error(data.error || "Couldn't start checkout.");
            return data.id;
          });
      },
      onApprove: function (data, actions) {
        say("Confirming your payment with PayPal…");
        return postJSON("/api/paypal/capture-order", { orderID: data.orderID }).then(function (result) {
          if (result.restart) { say(result.error); return actions.restart(); }
          if (result.httpOk && result.redirect) { window.location.href = result.redirect; return; }
          say(result.error || "Something went wrong confirming your payment. If PayPal emailed you a receipt, contact us with the transaction ID.");
        });
      },
      onCancel: function () { say("Payment cancelled. You haven't been charged."); },
      onError: function (err) {
        say((err && err.message && err.message.indexOf("tick") !== -1) ? err.message :
          "PayPal checkout ran into a problem. If PayPal emailed you a receipt, contact us with the transaction ID. Otherwise you haven't been charged, so please try again.");
      }
    }).render(box.querySelector(".paypal-buttons"));
  }

  // close the mobile menu after choosing a link
  document.querySelectorAll(".menu-panel a").forEach(function (link) {
    link.addEventListener("click", function () {
      var menu = link.closest("details");
      if (menu) menu.removeAttribute("open");
    });
  });
})();
