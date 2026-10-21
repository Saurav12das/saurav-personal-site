/* Progressive enhancement: the thread index follows the reader. Every paper and chapter reads without it. */
(() => {
  'use strict';
  const root = document.querySelector('.groundwork');
  if (!root || !('IntersectionObserver' in window)) return;
  const links = [...root.querySelectorAll('[data-thread-link]')];
  const steps = links.map(link => document.getElementById(`paper-${link.dataset.threadLink}`));
  if (!links.length || steps.some(step => !step)) return;
  const mark = index => links.forEach((link, i) => {
    if (i === index) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length) mark(steps.indexOf(visible[0].target));
  }, { rootMargin: '-15% 0px -45% 0px', threshold: 0 });
  steps.forEach(step => observer.observe(step));
  links.forEach((link, i) => link.addEventListener('click', () => mark(i)));
})();
