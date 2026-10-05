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
