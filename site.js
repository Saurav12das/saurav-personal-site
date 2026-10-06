/* Shared behaviour for the landing page and section pages. */
(function () {
  const currentPath =
    location.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const path = new URL(link.href).pathname.replace(/\.html$/, "");
    if (
      currentPath === path ||
      (path === "/brain-fog" && currentPath.startsWith("/brain-fog/"))
    )
      link.setAttribute("aria-current", "page");
  });

  document.querySelectorAll("[data-current-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });
  var y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  /* Keep anchor offsets in sync with the real nav height (two rows on phones) */
  var nav = document.querySelector(".site-nav");
  if (nav) {
    const explore = nav.querySelector('[data-nav-explore]');
    const mobile = window.matchMedia('(max-width: 980px)');
    if (explore) {
      const layout = () => { explore.open = !mobile.matches; };
      layout();
      mobile.addEventListener('change', layout);
      explore.addEventListener('keydown', event => {
        if (event.key === 'Escape' && mobile.matches) {
          explore.open = false;
          explore.querySelector('summary').focus();
        }
      });
      explore.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
        if (mobile.matches) explore.open = false;
      }));
    }
    var sync = function () {
      document.documentElement.style.setProperty(
        "--nav-h",
        nav.offsetHeight + "px",
      );
    };
    sync();
    window.addEventListener("resize", sync, { passive: true });
    if (explore) explore.addEventListener('toggle', sync);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
  }

  /* Back to top */
  var btn = document.querySelector(".totop");
  if (btn) {
    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    var onScroll = function () {
      btn.classList.toggle("show", window.scrollY > 900);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
    onScroll();
  }
})();
