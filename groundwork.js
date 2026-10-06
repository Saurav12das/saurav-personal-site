/* Progressive enhancement: every paper and chapter is readable without JavaScript. */
(() => {
  'use strict';
  const root = document.querySelector('.groundwork');
  if (!root) return;
  const nodes = [...root.querySelectorAll('[data-paper]')];
  const panels = nodes.map(node => document.getElementById(node.getAttribute('aria-controls')));
  const eras = [...root.querySelectorAll('[data-chapter]')];
  const chapters = eras.map(era => document.getElementById(era.getAttribute('aria-controls')));
  if (!nodes.length || panels.some(panel => !panel) || chapters.some(chapter => !chapter)) return;
  const previous = root.querySelector('[data-paper-prev]');
  const next = root.querySelector('[data-paper-next]');
  const count = root.querySelector('[data-paper-count]');
  const edges = [...root.querySelectorAll('[data-edge]')];
  const status = root.querySelector('[data-research-status]');
  let current = 0;

  function selectPaper(index, announce = true) {
    current = Math.max(0, Math.min(nodes.length - 1, index));
    const selected = nodes[current];
    const id = selected.dataset.paper;
    const related = selected.dataset.related.split(' ');
    nodes.forEach((node, i) => {
      if (i === current) node.setAttribute('aria-current', 'true');
      else node.removeAttribute('aria-current');
      node.classList.toggle('is-related', related.includes(node.dataset.paper));
      panels[i].hidden = i !== current;
    });
    edges.forEach(edge => edge.classList.toggle('is-connected', edge.dataset.edge.split(' ').includes(id)));
    previous.disabled = current === 0;
    next.disabled = current === nodes.length - 1;
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(nodes.length).padStart(2, '0')}`;
    if (announce) {
      status.textContent = `Question ${current + 1} of ${nodes.length}: ${panels[current].querySelector('h3').textContent}`;
      history.replaceState(null, '', `#paper-${id}`);
    }
  }
  function revealQuestion(focus = false) {
    const panel = panels[current];
    const navHeight = document.querySelector('[data-site-nav]')?.offsetHeight || 97;
    if (focus || matchMedia('(max-width:900px)').matches || panel.getBoundingClientRect().top < navHeight) {
      panel.scrollIntoView({block:'start', behavior:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth'});
    }
    if (focus) {
      const heading = panel.querySelector('h3');
      heading.tabIndex = -1;
      heading.focus({preventScroll:true});
    }
  }
  nodes.forEach((node, i) => node.addEventListener('click', event => {
    event.preventDefault();
    selectPaper(i);
    revealQuestion();
  }));
  root.querySelectorAll('[data-paper-link]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    selectPaper(nodes.findIndex(node => node.dataset.paper === link.dataset.paperLink));
    // The old related link is now hidden: move focus into the newly opened question.
    revealQuestion(true);
  }));
  previous.addEventListener('click', () => { selectPaper(current - 1); revealQuestion(true); });
  next.addEventListener('click', () => { selectPaper(current + 1); revealQuestion(true); });

  function arrowNavigation(event, controls, callback) {
    const index = controls.indexOf(event.target.closest('a'));
    if (index < 0) return;
    const key = event.key;
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) return;
    event.preventDefault();
    let to = key === 'Home' ? 0 : key === 'End' ? controls.length - 1 :
      (index + (key === 'ArrowRight' || key === 'ArrowDown' ? 1 : -1) + controls.length) % controls.length;
    callback(to);
    controls[to].focus({preventScroll:true});
  }
  root.querySelector('.research-nodes').addEventListener('keydown', event => arrowNavigation(event, nodes, selectPaper));
  root.querySelectorAll('[data-map-mode]').forEach(button => button.addEventListener('click', () => {
    root.querySelector('.research-explorer').classList.toggle('is-list', button.dataset.mapMode === 'list');
    root.querySelectorAll('[data-map-mode]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  }));
  function selectChapter(index, announce = true) {
    eras.forEach((era, i) => {
      if (i === index) era.setAttribute('aria-current', 'true');
      else era.removeAttribute('aria-current');
      chapters[i].hidden = i !== index;
    });
    root.querySelector('.journey-eras').style.setProperty('--journey-progress', `${index / eras.length * 100}%`);
    if (announce) {
      root.querySelector('[data-journey-status]').textContent = chapters[index].querySelector('h3').textContent;
      history.replaceState(null, '', `#chapter-${eras[index].dataset.chapter}`);
    }
  }
  eras.forEach((era, i) => era.addEventListener('click', event => {
    event.preventDefault(); selectChapter(i);
  }));
  root.querySelector('.journey-eras').addEventListener('keydown', event => arrowNavigation(event, eras, selectChapter));
  function followHash(scroll = false) {
    const paper = nodes.findIndex(node => `#paper-${node.dataset.paper}` === location.hash);
    const chapter = eras.findIndex(era => `#chapter-${era.dataset.chapter}` === location.hash);
    if (paper >= 0) {
      selectPaper(paper, false);
      if (scroll) panels[paper].scrollIntoView({block:'start'});
    }
    if (chapter >= 0) {
      selectChapter(chapter, false);
      if (scroll) chapters[chapter].scrollIntoView({block:'start'});
    }
  }
  root.classList.add('research-interactive');
  root.querySelector('.map-modes').hidden = false;
  root.querySelector('.research-pagination').hidden = false;
  selectPaper(0, false);
  selectChapter(0, false);
  followHash(true);
  window.addEventListener('hashchange', () => followHash(true));
})();
