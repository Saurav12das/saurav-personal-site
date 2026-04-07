/* Article view counter — fetches/increments /api/views and renders a small badge.
   Loaded by each article page via <script defer src="/views.js"></script>. */
(function () {
  if (typeof window === 'undefined') return;

  // Derive slug from the URL: /writings/writing__brahmanda -> writing__brahmanda
  var path = (location.pathname || '').replace(/\/+$/, '');
  var last = path.split('/').pop() || '';
  var slug = last.toLowerCase().replace(/\.html?$/, '').replace(/[^a-z0-9_\-]/g, '');
  if (!slug) return;

  function render() {
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
    badge.textContent = '\u00B7 \u00B7 \u00B7';
    document.body.appendChild(badge);

    // Avoid double-counting within a session
    var sessionKey = 'viewed:' + slug;
    var alreadyViewed = false;
    try { alreadyViewed = !!sessionStorage.getItem(sessionKey); } catch (e) {}
    var method = alreadyViewed ? 'GET' : 'POST';
    if (!alreadyViewed) {
      try { sessionStorage.setItem(sessionKey, '1'); } catch (e) {}
    }

    fetch('/api/views?slug=' + encodeURIComponent(slug), { method: method })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || typeof data.count !== 'number') return;
        var n = data.count.toLocaleString();
        badge.textContent = '\u{1F441} ' + n + (data.count === 1 ? ' view' : ' views');
        badge.style.opacity = '1';
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
