/**
 * Startet die 3D-Bühne im Hero — aber nur, wenn es sich lohnt:
 * nach dem ersten Zeichnen, im Leerlauf, mit WebGL2, ohne Datensparmodus,
 * mit genug Speicher und wenn Bewegung erlaubt ist. Sonst bleibt das
 * Poster (mit Ken-Burns-Zoom bzw. ganz ruhig bei reduzierter Bewegung).
 */
import { bewegungErlaubt, beiBewegungsWechsel } from '../bewegung';
import type { SzenenSteuerung } from './szene';

const hero = document.querySelector<HTMLElement>('[data-hero]');
const leinwand = hero?.querySelector<HTMLCanvasElement>('[data-hero-leinwand]');

type NavigatorMitExtras = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };

function geraetFaehig(): boolean {
  const nav = navigator as NavigatorMitExtras;
  if (nav.connection?.saveData) return false;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) return false;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function imLeerlauf(fn: () => void) {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 2500 });
  else setTimeout(fn, 1200);
}

if (hero && leinwand) {
  const schiffUrl = leinwand.dataset.schiff ?? '';
  const posterAufnahme = location.hash === '#poster-aufnahme';
  let steuerung: SzenenSteuerung | null = null;
  let laedt = false;
  let sichtbar = true;

  const aktualisiere = () => {
    if (!steuerung) return;
    if (sichtbar && !document.hidden && bewegungErlaubt()) steuerung.starte();
    else steuerung.halte();
  };

  const lade = async () => {
    if (steuerung || laedt || !schiffUrl) return;
    if (!posterAufnahme && (!bewegungErlaubt() || !geraetFaehig())) return;
    laedt = true;
    try {
      const { erstelleSzene } = await import('./szene');
      steuerung = await erstelleSzene(leinwand, {
        schiffUrl,
        standbild: posterAufnahme ? 6.2 : undefined,
        beiErstemBild: () => {
          hero.classList.add('szene-bereit');
          leinwand.dataset.bereit = '1';
        },
        beiFehler: () => {
          hero.classList.remove('szene-bereit');
          steuerung = null;
        },
      });
      scrollen();
      aktualisiere();
      if (posterAufnahme) steuerung.starte();
    } catch {
      hero.classList.remove('szene-bereit');
    } finally {
      laedt = false;
    }
  };

  // Scroll: Kamera gleitet hinab/nach vorn, Inhalt hebt sich und blendet aus.
  let wartet = false;
  const scrollen = () => {
    wartet = false;
    const h = hero.offsetHeight || 1;
    const p = Math.max(0, Math.min(1, window.scrollY / h));
    hero.style.setProperty('--hero-p', p.toFixed(4));
    steuerung?.setzeScroll(p);
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!wartet) {
        wartet = true;
        requestAnimationFrame(scrollen);
      }
    },
    { passive: true },
  );
  scrollen();

  // Zeiger- und Neigungs-Parallaxe
  window.addEventListener(
    'pointermove',
    (e) => {
      if (!sichtbar || e.pointerType === 'touch') return;
      steuerung?.setzeZeiger((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );
  window.addEventListener(
    'deviceorientation',
    (e) => {
      if (!sichtbar || e.gamma === null || e.beta === null) return;
      const x = Math.max(-1, Math.min(1, e.gamma / 25));
      const y = Math.max(-1, Math.min(1, (e.beta - 50) / 25));
      steuerung?.setzeZeiger(x, y);
    },
    { passive: true },
  );

  new IntersectionObserver(([eintrag]) => {
    sichtbar = eintrag.isIntersecting;
    aktualisiere();
  }).observe(hero);
  document.addEventListener('visibilitychange', aktualisiere);

  beiBewegungsWechsel((an) => {
    if (!an) {
      steuerung?.halte();
      hero.classList.remove('szene-bereit');
    } else if (steuerung) {
      hero.classList.add('szene-bereit');
      aktualisiere();
    } else {
      void lade();
    }
  });

  const nachDemLaden = () => imLeerlauf(() => void lade());
  if (document.readyState === 'complete') nachDemLaden();
  else window.addEventListener('load', nachDemLaden, { once: true });
}
