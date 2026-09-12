/* Shared behaviour for the landing page and section pages. */
(function () {
  var y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  /* Keep anchor offsets in sync with the real nav height (two rows on phones) */
  var nav = document.querySelector('.site-nav');
  if (nav) {
    var sync = function () { document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px'); };
    sync();
    window.addEventListener('resize', sync, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
  }

  /* Back to top */
  var btn = document.querySelector('.totop');
  if (btn) {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var onScroll = function () { btn.classList.toggle('show', window.scrollY > 900); };
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });
    onScroll();
  }
})();
