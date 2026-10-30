/**
 * Zeitleiste: berechnet den Fahrweg der Kartenspur, bewegt sie (falls der
 * Browser keine CSS scroll-timeline kann) und gibt jeder Karte Tiefe:
 * Karten neben der Bildmitte drehen sich weg und treten zurück.
 */
import { bewegungErlaubt, beiBewegungsWechsel } from './bewegung';

const cssZeitachse = typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: view()');

document.querySelectorAll<HTMLElement>('[data-zeitleiste]').forEach((abschnitt) => {
  const spur = abschnitt.querySelector<HTMLElement>('[data-zl-spur]')!;
  const balken = abschnitt.querySelector<HTMLElement>('[data-zl-balken]');
  const karten = [...abschnitt.querySelectorAll<HTMLElement>('[data-zl-karte]')];
  const marken = [...abschnitt.querySelectorAll<HTMLElement>('[data-zl-marke]')];
  let reise = 0;
  let wartet = false;
  let imBild = false;

  const vermessen = () => {
    if (!bewegungErlaubt()) {
      abschnitt.style.removeProperty('--reise');
      spur.style.transform = '';
      karten.forEach((k) => ['--dreh', '--tiefe', '--gross', '--deckung'].forEach((v) => k.style.removeProperty(v)));
      return;
    }
    reise = Math.max(0, spur.scrollWidth - window.innerWidth);
    abschnitt.style.setProperty('--reise', `${reise}px`);
    if (cssZeitachse) {
      spur.classList.add('css-zeitachse');
      balken?.classList.add('css-zeitachse');
    }
    zeichne();
  };

  const zeichne = () => {
    wartet = false;
    if (!bewegungErlaubt()) return;
    const r = abschnitt.getBoundingClientRect();
    const weg = Math.max(1, r.height - window.innerHeight);
    const p = Math.max(0, Math.min(1, -r.top / weg));
    if (!cssZeitachse) {
      spur.style.transform = `translate3d(${-p * reise}px, 0, 0)`;
      balken?.style.setProperty('--p', p.toFixed(4));
    }
    const mitte = window.innerWidth / 2;
    const breite = window.innerWidth * 0.62;
    for (const k of karten) {
      const kr = k.getBoundingClientRect();
      const d = Math.max(-1.6, Math.min(1.6, (kr.left + kr.width / 2 - mitte) / breite));
      const a = Math.min(1, Math.abs(d));
      k.style.setProperty('--dreh', `${(-d * 16).toFixed(2)}deg`);
      k.style.setProperty('--tiefe', `${(-a * 170).toFixed(1)}px`);
      k.style.setProperty('--gross', (1 - a * 0.05).toFixed(3));
      k.style.setProperty('--deckung', (1 - a * 0.5).toFixed(3));
    }
    const index = Math.round(p * (marken.length - 1));
    marken.forEach((m, i) => m.classList.toggle('aktiv', i === index));
  };

  const anfordern = () => {
    if (!wartet && imBild) {
      wartet = true;
      requestAnimationFrame(zeichne);
    }
  };

  new IntersectionObserver(([e]) => {
    imBild = e.isIntersecting;
    if (imBild) anfordern();
  }).observe(abschnitt);

  window.addEventListener('scroll', anfordern, { passive: true });
  window.addEventListener('resize', () => vermessen());
  beiBewegungsWechsel(() => requestAnimationFrame(vermessen));
  // Schriften/Bilder verändern die Breite: nach dem Laden nachmessen.
  document.fonts?.ready.then(vermessen);
  window.addEventListener('load', vermessen, { once: true });
  vermessen();
});
