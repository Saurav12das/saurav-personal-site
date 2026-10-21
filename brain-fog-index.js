/* The index filters every piece by topic chip and searches titles, summaries, and curated keywords. */
(function () {
  const tools = document.querySelector('[data-fog-tools]');
  if (!tools) return;
  const search = document.getElementById('fog-search');
  const chips = [...tools.querySelectorAll('[data-fog-topic]')];
  const count = document.querySelector('[data-fog-count]');
  const clear = document.querySelector('[data-fog-clear]');
  const empty = document.querySelector('[data-fog-empty]');
  const asides = [...document.querySelectorAll('[data-fog-aside]')];
  const normalize = text => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const items = [...document.querySelectorAll('[data-fog-item]')].map(element => ({
    element,
    kind: element.dataset.kind || '',
    text: normalize(`${element.textContent} ${element.dataset.keywords || ''}`),
    topics: (element.dataset.topics || '').split(' ').filter(Boolean)
  }));
  const topics = chips.map(chip => chip.dataset.fogTopic);
  let topic = '';

  /* The at-a-glance figures and chip counts come from the list itself, so they never go stale. */
  const setText = (selector, value) => document.querySelectorAll(selector).forEach(element => { element.textContent = value; });
  setText('[data-fog-total]', items.length);
  setText('[data-fog-issues]', items.filter(item => item.kind === 'issue').length);
  setText('[data-fog-essays]', items.filter(item => item.kind === 'essay').length);
  chips.forEach(chip => {
    const badge = chip.querySelector('[data-fog-topic-count]');
    if (badge) badge.textContent = chip.dataset.fogTopic ? items.filter(item => item.topics.includes(chip.dataset.fogTopic)).length : items.length;
  });

  const url = new URL(location.href);
  search.value = url.searchParams.get('q') || '';
  const initialTopic = url.searchParams.get('topic') || '';
  if (topics.includes(initialTopic)) topic = initialTopic;

  function render() {
    const terms = normalize(search.value).split(' ').filter(Boolean);
    let visible = 0;
    items.forEach(item => {
      const matches = (!topic || item.topics.includes(topic)) && terms.every(term =>
        term.length <= 2 ? item.text.split(' ').includes(term) : item.text.includes(term));
      item.element.hidden = !matches;
      if (matches) visible++;
    });
    chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.fogTopic === topic)));
    const active = Boolean(search.value.trim() || topic);
    count.textContent = active ? `${visible} of ${items.length} pieces match` : `${items.length} pieces · newest first`;
    clear.hidden = !active;
    empty.hidden = visible > 0;
    asides.forEach(aside => { aside.hidden = active; });
    const current = new URL(location.href);
    search.value.trim() ? current.searchParams.set('q', search.value.trim()) : current.searchParams.delete('q');
    topic ? current.searchParams.set('topic', topic) : current.searchParams.delete('topic');
    history.replaceState(null, '', current.pathname + current.search + current.hash);
  }
  chips.forEach(chip => chip.addEventListener('click', () => {
    topic = chip.dataset.fogTopic === topic ? '' : chip.dataset.fogTopic;
    render();
  }));
  search.addEventListener('input', render);
  clear.addEventListener('click', () => { search.value = ''; topic = ''; render(); search.focus(); });
  tools.hidden = false;
  render();
})();
