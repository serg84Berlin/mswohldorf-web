/**
 * „Bewegung reduzieren“: ein Zustand für die ganze Seite.
 * <html data-bewegung="an|aus"> wird schon im <head> gesetzt (Basis.astro):
 * gespeicherte Wahl aus dem Footer-Schalter, sonst der Wunsch des Systems.
 */
const SCHLUESSEL = 'mswohldorf-bewegung';
const EREIGNIS = 'mswohldorf:bewegung';

export function bewegungErlaubt(): boolean {
  return document.documentElement.dataset.bewegung !== 'aus';
}

function gespeichert(): string | null {
  try {
    return localStorage.getItem(SCHLUESSEL);
  } catch {
    return null;
  }
}

export function setzeBewegung(an: boolean, merken = true) {
  document.documentElement.dataset.bewegung = an ? 'an' : 'aus';
  if (merken) {
    try {
      localStorage.setItem(SCHLUESSEL, an ? 'an' : 'aus');
    } catch {
      /* privates Fenster o. Ä.: Wahl gilt nur für diesen Besuch */
    }
  }
  window.dispatchEvent(new CustomEvent(EREIGNIS, { detail: { an } }));
}

export function beiBewegungsWechsel(fn: (an: boolean) => void) {
  window.addEventListener(EREIGNIS, (e) => fn((e as CustomEvent<{ an: boolean }>).detail.an));
}

/** Footer-Schalter verdrahten und Systemwechsel beachten. */
export function initBewegung() {
  const schalter = document.querySelectorAll<HTMLButtonElement>('[data-bewegung-schalter]');
  const zeige = () => schalter.forEach((s) => s.setAttribute('aria-pressed', String(!bewegungErlaubt())));
  zeige();
  schalter.forEach((s) =>
    s.addEventListener('click', () => {
      setzeBewegung(!bewegungErlaubt());
      zeige();
    }),
  );
  try {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', () => {
      if (gespeichert()) return; // eigene Wahl hat Vorrang
      setzeBewegung(!mq.matches, false);
      zeige();
    });
  } catch {
    /* alte Browser */
  }
}
