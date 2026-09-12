/* Site dock — a small floating navigation pill shared by every page outside
   the homepage, so you're never more than one tap from anywhere else on the
   site. Self-styled (no CSS include needed), adapts to light or dark pages,
   and steps out of the way of an essay's share bar on small screens.
   Loaded by each page via <script defer src="/dock.js"></script>. */
(function () {
  if (typeof window === 'undefined') return;
  var path = location.pathname;
  if (path === '/' || path === '/index.html') return;

  // `all: initial/unset` first, so a page's own `nav {}` / `a {}` rules can't
  // leak into the dock — every essay ships its own stylesheet.
  var css = [
    '.sd-dock{all:initial;position:fixed;left:50%;bottom:16px;top:auto;right:auto;transform:translateX(-50%);z-index:9000;display:flex;align-items:center;gap:2px;padding:5px;margin:0;width:auto;height:auto;border-radius:999px;box-sizing:border-box;',
    'background:rgba(255,255,255,0.94);color:#111111;border:1px solid #e0e0e0;box-shadow:0 10px 28px -14px rgba(0,0,0,0.35);',
    '-webkit-backdrop-filter:saturate(160%) blur(14px);backdrop-filter:saturate(160%) blur(14px);',
    'font:500 14px/1 "Source Serif 4",Georgia,"Times New Roman",serif;letter-spacing:0;text-transform:none;max-width:calc(100vw - 24px);white-space:nowrap;transition:bottom .25s ease,opacity .25s ease}',
    '.sd-dock a{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:7px;padding:9px 12px;border-radius:999px;color:inherit;font:inherit;opacity:.82;transition:background-color .2s,opacity .2s;box-sizing:border-box}',
    '.sd-dock a:hover,.sd-dock a:focus-visible{background:rgba(0,0,0,0.05);opacity:1}',
    '.sd-dock a:focus-visible{outline:2px solid #1f5c3a;outline-offset:2px}',
    '.sd-dock a[aria-current="page"]{background:#1f5c3a;color:#ffffff;opacity:1}',
    '.sd-dock .sd-home{font-weight:600;opacity:1}',
    '.sd-dock .sd-home i{all:unset;width:8px;height:8px;border-radius:50%;background:#1f5c3a;display:inline-block}',
    '.sd-dock.sd-dark{background:rgba(24,24,24,0.86);color:#f2f2f2;border-color:rgba(255,255,255,0.16);box-shadow:0 12px 32px -14px rgba(0,0,0,.85)}',
    '.sd-dock.sd-dark a:hover,.sd-dock.sd-dark a:focus-visible{background:rgba(255,255,255,0.12)}',
    '.sd-dock.sd-dark a[aria-current="page"]{background:#ffffff;color:#111111}',
    '.sd-dock.sd-raised{bottom:66px}',
    // Phones: drop the least-used links so the pill never spills past the screen
    '@media (max-width:480px){.sd-dock{padding:4px;gap:0}.sd-dock a{padding:9px 8px;font-size:12.5px}.sd-dock a[data-k="experiments"],.sd-dock a[data-k="books"],.sd-dock a[data-k="about"]{display:none}}',
    '@media (max-width:360px){.sd-dock a[data-k="products"]{display:none}}',
    '@media (prefers-reduced-motion:reduce){.sd-dock{transition:none}}',
    '@media print{.sd-dock{display:none}}'
  ].join('');

  var links = [
    { href: '/', label: 'Home', home: true },
    { href: '/products.html', label: 'Products', match: /^\/products$/ },
    { href: '/writing.html', label: 'Writing', match: /^\/writing$|^\/writings\/writing__/ },
    { href: '/experiments.html', label: 'Experiments', match: /^\/experiments$/ },
    { href: '/apps.html', label: 'Apps', match: /^\/apps$|^\/hop-explorer/ },
    { href: '/writings/watching.html', label: 'Watching', match: /^\/writings\/watching$/ },
    { href: '/writings/books.html', label: 'Books', match: /^\/writings\/books$/ },
    { href: '/about.html', label: 'About', match: /^\/about$/ }
  ];

  function luminance() {
    // Read the page's real background so the dock can pick light or dark.
    var els = [document.body, document.documentElement];
    for (var i = 0; i < els.length; i++) {
      var m = getComputedStyle(els[i]).backgroundColor.match(/[\d.]+/g);
      if (!m || m.length < 3) continue;
      if (m.length > 3 && parseFloat(m[3]) === 0) continue; // transparent
      return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
    }
    return 1;
  }

  function mount() {
    // Pages on the shared design system carry the top nav already; essays may reuse
    // the class name '.site-nav' for their own headers, so key off the stylesheet.
    if (document.querySelector('link[href="/site.css"]')) return;
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var nav = document.createElement('div');
    nav.className = 'sd-dock';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Site');
    var clean = path.replace(/\.html$/, '');
    links.forEach(function (l) {
      var a = document.createElement('a');
      a.href = l.href;
      a.setAttribute('data-k', l.label.toLowerCase());
      if (l.home) { a.className = 'sd-home'; a.appendChild(document.createElement('i')); }
      a.appendChild(document.createTextNode(l.label));
      if (l.match && l.match.test(clean)) a.setAttribute('aria-current', 'page');
      nav.appendChild(a);
    });
    if (luminance() < 0.5) nav.classList.add('sd-dark');
    document.body.appendChild(nav);

    // Essays show a share bar along the bottom on small screens; lift the
    // dock above it whenever that bar is visible.
    var share = document.getElementById('shareBar');
    if (share && 'MutationObserver' in window) {
      var sync = function () { nav.classList.toggle('sd-raised', share.classList.contains('visible') && window.innerWidth <= 640); };
      new MutationObserver(sync).observe(share, { attributes: true, attributeFilter: ['class'] });
      window.addEventListener('resize', sync, { passive: true });
      sync();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
