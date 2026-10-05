/* Progressive enhancement: the complete collection is readable without JS. */
(function () {
  const controls = document.querySelector('[data-screen-controls]');
  if (!controls) return;
  const cards = Array.from(document.querySelectorAll('.screen-card'));
  const buttons = Array.from(controls.querySelectorAll('[data-filter]'));
  const search = document.getElementById('screen-search');
  const results = document.getElementById('screen-results');
  const empty = document.querySelector('[data-screen-empty]');
  const reset = document.querySelector('[data-screen-reset]');
  const entries = cards.map(card => ({ card, text: card.textContent.toLocaleLowerCase() }));
  let category = 'all';

  function update() {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    entries.forEach(({ card, text }) => {
      const matches = (category === 'all' || card.dataset.category === category) && text.includes(query);
      card.hidden = !matches;
      if (matches) count++;
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    results.textContent = `Showing ${count} of ${cards.length} stories${query ? ` matching “${search.value.trim()}”` : ''}.`;
    empty.hidden = count !== 0;
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    update();
  }));
  search.addEventListener('input', update);
  reset.addEventListener('click', () => {
    category = 'all';
    search.value = '';
    update();
    search.focus();
  });
  update();
  controls.hidden = false;
  results.hidden = false;
})();
