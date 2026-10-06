/* The directory searches the visible writing and its curated topic keywords. */
(function () {
  const tools = document.querySelector('[data-fog-tools]');
  if (!tools) return;
  const search = document.getElementById('fog-search');
  const topic = document.getElementById('fog-topic');
  const count = document.querySelector('[data-fog-count]');
  const clear = document.querySelector('[data-fog-clear]');
  const empty = document.querySelector('[data-fog-empty]');
  const normalize = text => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const items = [...document.querySelectorAll('[data-fog-item]')].map(element => ({
    element,
    text: normalize(`${element.textContent} ${element.dataset.keywords}`),
    topics: element.dataset.topics.split(' ')
  }));
  const groups = [...document.querySelectorAll('[data-fog-group], .essay-library')];
  const url = new URL(location.href);
  search.value = url.searchParams.get('q') || '';
  const initialTopic = url.searchParams.get('topic') || '';
  if ([...topic.options].some(option => option.value === initialTopic)) topic.value = initialTopic;
  function filter() {
    const terms = normalize(search.value).split(' ').filter(Boolean);
    let visible = 0;
    items.forEach(item => {
      const matches = (!topic.value || item.topics.includes(topic.value)) && terms.every(term =>
        term.length <= 2 ? item.text.split(' ').includes(term) : item.text.includes(term));
      item.element.hidden = !matches;
      if (matches) visible++;
    });
    groups.forEach(group => { group.hidden = ![...group.querySelectorAll('[data-fog-item]')].some(item => !item.hidden); });
    const active = Boolean(search.value.trim() || topic.value);
    count.textContent = active ? `${visible} of ${items.length} pieces match` : `${items.length} pieces to explore · Start anywhere, follow a thread`;
    clear.hidden = !active;
    empty.hidden = visible > 0;
    const current = new URL(location.href);
    search.value.trim() ? current.searchParams.set('q', search.value.trim()) : current.searchParams.delete('q');
    topic.value ? current.searchParams.set('topic', topic.value) : current.searchParams.delete('topic');
    history.replaceState(null, '', current.pathname + current.search + current.hash);
  }
  function reset() { search.value = ''; topic.value = ''; filter(); }
  search.addEventListener('input', filter);
  topic.addEventListener('change', filter);
  clear.addEventListener('click', () => { reset(); search.focus(); });
  document.querySelector('[data-fog-start]').addEventListener('click', reset);
  tools.hidden = false;
  filter();
})();
