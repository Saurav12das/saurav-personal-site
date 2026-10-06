(function () {
  const status = document.querySelector('[data-copy-status]');
  if (!status) return;
  let clearStatus;
  document.querySelectorAll('[data-copy-feed]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      clearTimeout(clearStatus);
      try {
        await navigator.clipboard.writeText(button.dataset.copyFeed);
        status.textContent = 'Feed link copied. Paste it into your RSS reader.';
      } catch (_) {
        // The URL remains visible and selectable without clipboard permission.
        status.textContent = 'Copy the feed address shown below this button.';
      }
      clearStatus = setTimeout(() => { status.textContent = ''; }, 6000);
    });
  });
})();

(function () {
  const form = document.querySelector('[data-newsletter-form]');
  if (!form) return;
  const controls = form.querySelector('[data-newsletter-controls]');
  const status = form.querySelector('[data-newsletter-status]');
  const retry = form.querySelector('[data-newsletter-retry]');
  const submit = form.querySelector('[type="submit"]');
  const choices = [...form.querySelectorAll('[name="topics"]')];
  const chooseAll = form.querySelector('[data-newsletter-all]');
  let token;
  let busy = false;
  const selectedTopic = new URLSearchParams(location.search).get('topic');
  choices.forEach(choice => { choice.checked = choice.value === selectedTopic; });
  const updateAll = () => {
    chooseAll.textContent = choices.every(choice => choice.checked) ? 'Clear selection' : 'Choose all five';
    choices[0].setCustomValidity('');
  };
  choices.forEach(choice => choice.addEventListener('change', updateAll));
  chooseAll.addEventListener('click', () => {
    const select = !choices.every(choice => choice.checked);
    choices.forEach(choice => { choice.checked = select; });
    updateAll();
  });
  async function connect() {
    controls.disabled = true;
    retry.hidden = true;
    try {
      const response = await fetch('/api/subscribe', { cache: 'no-store', signal: AbortSignal.timeout(12000) });
      const data = response.ok ? await response.json() : null;
      if (!data?.enabled || !data.token) throw new Error('not_ready');
      token = data.token;
      controls.disabled = false;
      status.textContent = 'Choose your topics, then join the list.';
      status.removeAttribute('data-error');
      return true;
    } catch (_) {
      status.textContent = 'Email signup is not available right now. No address has been saved. You can follow the RSS feeds below.';
      retry.hidden = false;
      return false;
    }
  }
  retry.addEventListener('click', connect);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const topics = choices.filter(choice => choice.checked).map(choice => choice.value);
    if (!topics.length) {
      choices[0].setCustomValidity('Choose at least one topic.');
      choices[0].reportValidity();
      return;
    }
    if (!form.reportValidity()) return;
    busy = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Saving your subscription…';
    status.removeAttribute('data-error');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.elements.email.value, topics, consent: form.elements.consent.checked, website: form.elements.website.value, token }),
        signal: AbortSignal.timeout(25000)
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.refresh) await connect();
        throw new Error(result.error || 'Please try again shortly.');
      }
      status.textContent = result.message;
      controls.disabled = true;
      form.reset();
    } catch (error) {
      status.textContent = error.name === 'TimeoutError' || error.name === 'TypeError' || error.name === 'SyntaxError'
        ? 'We could not confirm your signup. Please try again; existing subscriptions will not be changed.'
        : error.message;
      status.dataset.error = 'true';
    } finally {
      busy = false;
      submit.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
  connect();
})();
