/** 3D-Karussell: drehen per Ziehen (mit Schwung), Pfeiltasten, Knöpfen und Fokus. */
import { bewegungErlaubt } from './bewegung';

document.querySelectorAll<HTMLElement>('[data-karussell]').forEach((wurzel) => {
  const buehne = wurzel.querySelector<HTMLElement>('[data-k-buehne]')!;
  const ring = wurzel.querySelector<HTMLElement>('[data-k-ring]')!;
  const flaechen = [...wurzel.querySelectorAll<HTMLElement>('[data-k-flaeche]')];
  const zaehler = wurzel.querySelector<HTMLElement>('[data-k-zaehler]');
  const n = flaechen.length;
  const schritt = 360 / n;
  let winkel = 0;
  let ziel = 0;
  let laeuft = false;
  let gezogen = false;

  const radius = () => {
    const b = ring.offsetWidth || 240; // Layoutbreite, unabhängig von der Drehung
    const r = (b / 2 / Math.tan(Math.PI / n)) * 1.32;
    wurzel.style.setProperty('--radius', `${Math.round(r)}px`);
  };

  const vorn = () => ((Math.round(-winkel / schritt) % n) + n) % n;

  const setze = () => {
    ring.style.setProperty('--winkel', `${winkel.toFixed(2)}deg`);
    const v = vorn();
    flaechen.forEach((f, i) => f.classList.toggle('vorn', i === v));
    if (zaehler) zaehler.textContent = `${v + 1} / ${n}`;
  };

  const animiere = () => {
    if (!bewegungErlaubt()) {
      winkel = ziel;
      setze();
      laeuft = false;
      return;
    }
    winkel += (ziel - winkel) * 0.12;
    if (Math.abs(ziel - winkel) < 0.05) winkel = ziel;
    setze();
    if (winkel !== ziel) requestAnimationFrame(animiere);
    else laeuft = false;
  };
  const gehe = (w: number) => {
    ziel = w;
    if (!laeuft) {
      laeuft = true;
      requestAnimationFrame(animiere);
    }
  };
  const einrasten = () => gehe(Math.round(ziel / schritt) * schritt);

  wurzel.querySelector('[data-k-vor]')?.addEventListener('click', () => gehe(Math.round(ziel / schritt) * schritt - schritt));
  wurzel.querySelector('[data-k-zurueck]')?.addEventListener('click', () => gehe(Math.round(ziel / schritt) * schritt + schritt));
  buehne.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      gehe(Math.round(ziel / schritt) * schritt - schritt);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      gehe(Math.round(ziel / schritt) * schritt + schritt);
    }
  });
  // Fokus auf einer Fläche → nach vorn drehen (kürzester Weg)
  flaechen.forEach((f, i) =>
    f.addEventListener('focus', () => {
      const soll = -i * schritt;
      const delta = ((((soll - ziel) % 360) + 540) % 360) - 180;
      gehe(ziel + delta);
    }),
  );

  // Ziehen mit Schwung
  let x0 = 0;
  let letzteX = 0;
  let letzteZeit = 0;
  let tempo = 0;
  let unten = false;
  buehne.addEventListener('pointerdown', (e) => {
    unten = true;
    gezogen = false;
    x0 = letzteX = e.clientX;
    letzteZeit = performance.now();
    tempo = 0;
  });
  window.addEventListener('pointermove', (e) => {
    if (!unten) return;
    const dx = e.clientX - letzteX;
    if (Math.abs(e.clientX - x0) > 6 && !gezogen) {
      gezogen = true;
      buehne.setPointerCapture?.(e.pointerId);
    }
    if (!gezogen) return;
    const jetzt = performance.now();
    tempo = dx / Math.max(1, jetzt - letzteZeit);
    letzteZeit = jetzt;
    letzteX = e.clientX;
    ziel += dx * 0.28;
    winkel = ziel;
    setze();
  });
  window.addEventListener('pointerup', () => {
    if (!unten) return;
    unten = false;
    if (gezogen) {
      ziel += tempo * 120;
      einrasten();
    }
  });
  // Nach dem Ziehen keinen Klick (= Lightbox) auslösen
  buehne.addEventListener(
    'click',
    (e) => {
      if (gezogen) {
        e.preventDefault();
        e.stopPropagation();
        gezogen = false;
      }
    },
    true,
  );

  new ResizeObserver(radius).observe(ring);
  radius();
  setze();
});
