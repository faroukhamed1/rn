(function () {
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  if (btn && nav) btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* ---------- Consent + tracking (GA4 / Meta Pixel), only when IDs are configured ---------- */
  var cfg = window.RN_TRACKING, KEY = 'rn_consent';
  function getC() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setC(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function load(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  var loaded = false;
  function startTracking() {
    if (loaded || !cfg) return; loaded = true;
    if (cfg.ga4) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); };
      gtag('consent', 'default', { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
      gtag('js', new Date()); gtag('config', cfg.ga4);
      load('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga4));
    }
    if (cfg.pixel) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', cfg.pixel); fbq('track', 'PageView');
    }
  }
  var banner = document.getElementById('cookie');
  if (cfg && banner) {
    var c = getC();
    if (c === 'granted') startTracking(); else if (!c) banner.hidden = false;
    banner.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-consent]'); if (!b) return;
      setC(b.dataset.consent); banner.hidden = true;
      if (b.dataset.consent === 'granted') startTracking(); else if (loaded) location.reload();
    });
    document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
      el.addEventListener('click', function () { banner.hidden = false; });
    });
  }
  function track(name, data) {
    if (window.gtag && cfg && cfg.ga4) gtag('event', name, data || {});
    if (window.fbq) fbq('track', name === 'generate_lead' ? 'Lead' : 'Contact', data || {});
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('a[href^="https://wa.me"],a[href^="mailto:"],a[href^="tel:"]');
    if (a) track('contact_click', { method: a.href.split(':')[0].indexOf('http') === 0 ? 'whatsapp' : a.href.split(':')[0] });
  });

  /* ---------- Quote form → WhatsApp / email ---------- */
  var form = document.getElementById('quote');
  if (!form) return;
  var ar = form.dataset.lang === 'ar', via = 'wa';
  form.querySelectorAll('button[type=submit]').forEach(function (b) {
    b.addEventListener('click', function () { via = b.value; });
  });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = form.elements, name = f.name.value.trim();
    f.name.classList.toggle('invalid', !name);
    if (!name) { f.name.focus(); return; }
    var L = ar
      ? ['طلب عرض سعر — رواد النجاح', 'الاسم', 'الشركة', 'المنتج', 'الكمية', 'ميناء الوصول', 'ملاحظات']
      : ['Quote request — Rowad Alnajah', 'Name', 'Company', 'Product', 'Quantity', 'Destination port', 'Notes'];
    var vals = [name, f.company.value, f.product.value, f.qty.value, f.port.value, f.msg.value];
    var lines = [L[0]];
    vals.forEach(function (v, i) { if (v && v.trim()) lines.push(L[i + 1] + ': ' + v.trim()); });
    var text = lines.join('\n');
    track('generate_lead', { method: via, product: f.product.value });
    if (via === 'mail') {
      location.href = 'mailto:' + form.dataset.email + '?subject=' + encodeURIComponent(L[0] + ' — ' + f.product.value) + '&body=' + encodeURIComponent(text);
    } else {
      window.open('https://wa.me/' + form.dataset.phone + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    }
  });
})();
