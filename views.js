/* Article view counter — GoatCounter.
   Sends a tracking pixel and renders a small badge with the public count.
   Loaded by each article via <script defer src="/views.js"></script>.

   SETUP (one-time):
     1. Sign up at https://www.goatcounter.com and pick a subdomain code,
        e.g. "sauravdas" → sauravdas.goatcounter.com.
     2. Replace GOATCOUNTER_CODE below with that code.
     3. In GoatCounter → Settings → Site settings, enable
        "Allow public viewing of the counter". Otherwise the badge
        will still track views but won't display a number.
*/
(function () {
  var GOATCOUNTER_CODE = 'YOUR_GOATCOUNTER_CODE';

  if (typeof window === 'undefined') return;
  if (!GOATCOUNTER_CODE || GOATCOUNTER_CODE === 'YOUR_GOATCOUNTER_CODE') return;

  var host = 'https://' + GOATCOUNTER_CODE + '.goatcounter.com';
  var path = location.pathname + location.search;

  // 1) Send view to GoatCounter via image pixel (no third-party script, no cookies).
  try {
    var params =
      'p=' + encodeURIComponent(path) +
      '&t=' + encodeURIComponent(document.title || '') +
      '&r=' + encodeURIComponent(document.referrer || '') +
      '&rnd=' + Math.random().toString(36).slice(2);
    new Image().src = host + '/count?' + params;
  } catch (e) {}

  // 2) Fetch public count and render a floating badge.
  function render(count) {
    var badge = document.createElement('div');
    badge.id = 'view-counter';
    badge.setAttribute('aria-live', 'polite');
    badge.style.cssText = [
      'position:fixed',
      'top:14px',
      'right:14px',
      'z-index:9999',
      'font:500 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif',
      'background:rgba(0,0,0,0.55)',
      'color:#fff',
      '-webkit-backdrop-filter:blur(8px)',
      'backdrop-filter:blur(8px)',
      'padding:8px 12px',
      'border-radius:999px',
      'border:1px solid rgba(255,255,255,0.18)',
      'box-shadow:0 4px 16px rgba(0,0,0,0.25)',
      'letter-spacing:0.02em',
      'opacity:0',
      'transition:opacity 0.6s ease',
      'pointer-events:none',
      'user-select:none'
    ].join(';');
    badge.textContent = '\u{1F441} ' + count.toLocaleString() + (count === 1 ? ' view' : ' views');
    document.body.appendChild(badge);
    requestAnimationFrame(function () { badge.style.opacity = '1'; });
  }

  function loadCount() {
    var url = host + '/counter/' + encodeURIComponent(path) + '.json';
    fetch(url)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        // GoatCounter returns count as a formatted string, e.g. "1,234".
        var raw = (data.count_unique || data.count || '').toString();
        var n = parseInt(raw.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(n)) render(n);
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCount);
  } else {
    loadCount();
  }
})();
