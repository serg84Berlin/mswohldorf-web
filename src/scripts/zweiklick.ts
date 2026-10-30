/**
 * Zwei-Klick: Erst der Klick auf „Inhalt laden" erzeugt das iframe.
 * Bis dahin geht keine einzige Anfrage an den Anbieter.
 */
document.querySelectorAll<HTMLElement>('[data-zweiklick]').forEach((box) => {
  const knopf = box.querySelector<HTMLButtonElement>('[data-zk-laden]');
  const flaeche = box.querySelector<HTMLElement>('[data-zk-flaeche]');
  if (!knopf || !flaeche) return;
  knopf.addEventListener('click', () => {
    const rahmen = document.createElement('iframe');
    rahmen.src = box.dataset.src ?? '';
    rahmen.title = box.dataset.titel ?? 'Eingebetteter Inhalt';
    rahmen.loading = 'eager';
    rahmen.referrerPolicy = 'strict-origin-when-cross-origin';
    if (box.dataset.erlaubt) rahmen.allow = box.dataset.erlaubt;
    rahmen.allowFullscreen = true;
    flaeche.replaceChildren(rahmen);
    box.dataset.geladen = '1';
    rahmen.focus();
  });
});
