/**
 * Kleine Helfer für jede Seite: Kopfzeile & Menüs, Scroll-Reveal, Zähler,
 * Karten-Neigung, magnetische Knöpfe, schwebender Anfrage-Knopf.
 * Ohne Bibliotheken; alles respektiert „Bewegung reduzieren".
 */
import { bewegungErlaubt, beiBewegungsWechsel, initBewegung } from './bewegung';

const feinerZeiger = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------------- Kopfzeile ---------------- */
function initKopf() {
  const kopf = document.querySelector<HTMLElement>('[data-kopf]');
  if (!kopf) return;
  let zuletzt = window.scrollY;
  let wartet = false;
  const pruefe = () => {
    wartet = false;
    const y = window.scrollY;
    kopf.classList.toggle('gescrollt', y > 24);
    const offen = kopf.classList.contains('menue-offen') || kopf.querySelector('.aufklapp.offen');
    if (!offen && y > 420 && y > zuletzt + 4) kopf.classList.add('versteckt');
    else if (y < zuletzt - 4 || y <= 420) kopf.classList.remove('versteckt');
    zuletzt = y;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!wartet) {
        wartet = true;
        requestAnimationFrame(pruefe);
      }
    },
    { passive: true },
  );
  kopf.addEventListener('focusin', () => kopf.classList.remove('versteckt'));
  pruefe();

  // Aufklappmenü „Anlässe" (Desktop)
  kopf.querySelectorAll<HTMLElement>('[data-aufklapp]').forEach((li) => {
    const knopf = li.querySelector<HTMLButtonElement>('[data-aufklapp-knopf]');
    if (!knopf) return;
    let zeit = 0;
    const setze = (offen: boolean) => {
      li.classList.toggle('offen', offen);
      knopf.setAttribute('aria-expanded', String(offen));
    };
    knopf.addEventListener('click', () => setze(!li.classList.contains('offen')));
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && li.classList.contains('offen')) {
        setze(false);
        knopf.focus();
      }
    });
    li.addEventListener('focusout', (e) => {
      if (!li.contains(e.relatedTarget as Node)) setze(false);
    });
    if (feinerZeiger()) {
      li.addEventListener('pointerenter', () => {
        clearTimeout(zeit);
        setze(true);
      });
      li.addEventListener('pointerleave', () => {
        zeit = window.setTimeout(() => setze(false), 180);
      });
    }
    document.addEventListener('click', (e) => {
      if (!li.contains(e.target as Node)) setze(false);
    });
  });

  // Mobilmenü
  const knopf = kopf.querySelector<HTMLAnchorElement>('[data-menue-knopf]');
  const menue = kopf.querySelector<HTMLElement>('[data-mobil-menue]');
  if (!knopf || !menue) return;
  const draussen = () => [document.querySelector('main'), document.querySelector('footer'), document.querySelector('[data-anfrage-schwebend]')].filter(Boolean) as HTMLElement[];
  const setze = (offen: boolean, fokusZurueck = true) => {
    menue.hidden = !offen;
    knopf.setAttribute('aria-expanded', String(offen));
    knopf.querySelector('.menue-text')!.textContent = offen ? 'Schließen' : 'Menü';
    kopf.classList.toggle('menue-offen', offen);
    document.documentElement.style.overflow = offen ? 'hidden' : '';
    draussen().forEach((el) => (el.inert = offen));
    if (offen) menue.querySelector<HTMLElement>('a')?.focus();
    else if (fokusZurueck) knopf.focus();
  };
  const zu = () => menue.hasAttribute('hidden');
  knopf.addEventListener('click', (e) => {
    e.preventDefault();
    setze(zu());
  });
  knopf.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      setze(zu());
    }
  });
  kopf.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !zu()) setze(false);
  });
  menue.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setze(false, false)));
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (mq) => {
    if (mq.matches && !zu()) setze(false, false);
  });
}

/* ---------------- Scroll-Reveal ---------------- */
function initReveal() {
  const elemente = document.querySelectorAll<HTMLElement>('[data-reveal]');
  document.querySelectorAll<HTMLElement>('[data-reveal-gruppe]').forEach((gruppe) => {
    gruppe.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el, i) => el.style.setProperty('--verzoegerung', `${i * 90}ms`));
  });
  if (!('IntersectionObserver' in window)) {
    elemente.forEach((el) => el.classList.add('sichtbar'));
    return;
  }
  const beobachter = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) {
        if (e.isIntersecting) {
          e.target.classList.add('sichtbar');
          beobachter.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  elemente.forEach((el) => beobachter.observe(el));
}

/* ---------------- Zähler ---------------- */
function initZaehler() {
  const zaehler = document.querySelectorAll<HTMLElement>('[data-zaehler]');
  if (!zaehler.length || !bewegungErlaubt() || !('IntersectionObserver' in window)) return;
  const zaehle = (el: HTMLElement) => {
    const ziel = Number(el.dataset.zaehler);
    const start = Number(el.dataset.start ?? 0);
    const dauer = 1800;
    const t0 = performance.now();
    const schritt = (jetzt: number) => {
      const t = Math.min(1, (jetzt - t0) / dauer);
      const e = 1 - Math.pow(1 - t, 4);
      el.textContent = String(Math.round(start + (ziel - start) * e));
      if (t < 1 && bewegungErlaubt()) requestAnimationFrame(schritt);
      else el.textContent = String(ziel);
    };
    requestAnimationFrame(schritt);
  };
  const beobachter = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) {
        if (e.isIntersecting) {
          zaehle(e.target as HTMLElement);
          beobachter.unobserve(e.target);
        }
      }
    },
    { threshold: 0.6 },
  );
  zaehler.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top > window.innerHeight) el.textContent = el.dataset.start ?? '0';
    beobachter.observe(el);
  });
}

/* ---------------- Karten neigen (3D) + Lichtschimmer ---------------- */
function initKippen() {
  if (!feinerZeiger()) return;
  document.querySelectorAll<HTMLElement>('[data-kippen]').forEach((karte) => {
    let rahmen = 0;
    karte.addEventListener('pointermove', (e) => {
      if (!bewegungErlaubt()) return;
      cancelAnimationFrame(rahmen);
      rahmen = requestAnimationFrame(() => {
        const r = karte.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        karte.style.setProperty('--ry', `${(x - 0.5) * 12}deg`);
        karte.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
        karte.style.setProperty('--lx', `${x * 100}%`);
        karte.style.setProperty('--ly', `${y * 100}%`);
        karte.classList.add('kippt');
      });
    });
    karte.addEventListener('pointerleave', () => {
      cancelAnimationFrame(rahmen);
      karte.classList.remove('kippt');
      karte.style.setProperty('--ry', '0deg');
      karte.style.setProperty('--rx', '0deg');
    });
  });
}

/* ---------------- Magnetische Knöpfe ---------------- */
function initMagnet() {
  if (!feinerZeiger()) return;
  document.querySelectorAll<HTMLElement>('[data-magnet]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      if (!bewegungErlaubt()) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate3d(${dx * 0.22}px, ${dy * 0.3}px, 0)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
  beiBewegungsWechsel((an) => {
    if (!an) document.querySelectorAll<HTMLElement>('[data-magnet]').forEach((el) => (el.style.transform = ''));
  });
}

/* ---------------- Schwebender Anfrage-Knopf ---------------- */
function initAnfrageKnopf() {
  const knopf = document.querySelector<HTMLElement>('[data-anfrage-schwebend]');
  const bereiche = document.querySelectorAll('[data-anfrage-verbergen], footer');
  if (!knopf || !('IntersectionObserver' in window)) return;
  const sichtbar = new Set<Element>();
  const beobachter = new IntersectionObserver((eintraege) => {
    for (const e of eintraege) {
      if (e.isIntersecting) sichtbar.add(e.target);
      else sichtbar.delete(e.target);
    }
    knopf.classList.toggle('weg', sichtbar.size > 0);
  });
  bereiche.forEach((b) => beobachter.observe(b));
}

initBewegung();
initKopf();
initReveal();
initZaehler();
initKippen();
initMagnet();
initAnfrageKnopf();
