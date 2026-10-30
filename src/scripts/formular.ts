/**
 * Anfrageformular: Prüfen (barrierearm), als JSON senden, Antworten freundlich
 * anzeigen. Vertrag mit dem Server (nicht ändern, ohne den Server mitzuziehen):
 *
 *   POST <PUBLIC_ANFRAGE_URL>   Content-Type: application/json
 *   { quelle: "mswohldorf", anlass, datum, ausweichdatum, gaeste, name, email,
 *     telefon, nachricht, einwilligung: true, website, dauerMs }
 *   202 {ok:true} · 400 {fehler:"feld",feld,satz} · 429 {fehler:"zu_viele"}
 *   503 {fehler:"aus"} · Netzwerkfehler
 */

export interface AnfrageDaten {
  quelle: 'mswohldorf';
  anlass: string;
  datum: string | null;
  ausweichdatum: string | null;
  gaeste: number | null;
  name: string;
  email: string;
  telefon: string | null;
  nachricht: string;
  einwilligung: true;
  website: string;
  dauerMs: number;
}

const MAX_GAESTE = 35;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATUM = /^\d{4}-\d{2}-\d{2}$/;

function heute(): string {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function escape(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

document.querySelectorAll<HTMLFormElement>('form[data-anfrage]').forEach((form) => {
  const ziel = (form.dataset.ziel ?? '').trim();
  const mail = form.dataset.mail ?? '';
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const liste = form.querySelector<HTMLElement>('[data-fehlerliste]')!;
  const punkte = form.querySelector<HTMLElement>('[data-fehlerliste-punkte]')!;
  const senden = form.querySelector<HTMLButtonElement>('[data-senden]')!;
  const sendenText = form.querySelector<HTMLElement>('[data-senden-text]')!;
  const erfolg = document.querySelector<HTMLElement>(`[data-erfolg="${form.id}"]`);
  const geladen = form.querySelector<HTMLInputElement>('[data-geladen]')!;
  const feld = <T extends HTMLElement = HTMLInputElement>(name: string) => form.elements.namedItem(name) as T | null;

  geladen.value = String(Date.now());
  const min = heute();
  feld('datum')?.setAttribute('min', min);
  feld('ausweichdatum')?.setAttribute('min', min);

  // Vorauswahl aus ?anlass=slug (Anlass-Seiten verlinken so)
  const slug = new URLSearchParams(location.search).get('anlass');
  const auswahl = feld<HTMLSelectElement>('anlass');
  if (slug && auswahl) {
    const passend: Record<string, string> = {
      firmenevent: 'Firmenevent',
      'workshop-seminar': 'Workshop/Seminar',
      'film-und-foto': 'Film & Foto',
      'lesung-ausstellung': 'Lesung/Ausstellung',
      'private-feier': 'Private Feier',
      sonstiges: 'Sonstiges',
    };
    if (passend[slug]) auswahl.value = passend[slug];
  }

  /* ---------- Prüfen ---------- */
  const regeln: Record<string, () => string | null> = {
    anlass: () => (feld<HTMLSelectElement>('anlass')?.value ? null : 'Bitte wählen Sie einen Anlass.'),
    gaeste: () => {
      const v = feld('gaeste')?.value.trim() ?? '';
      if (!v) return null;
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= MAX_GAESTE ? null : `Bitte geben Sie eine Gästezahl zwischen 1 und ${MAX_GAESTE} an.`;
    },
    datum: () => {
      const v = feld('datum')?.value ?? '';
      if (!v) return null;
      if (!DATUM.test(v)) return 'Bitte geben Sie das Datum vollständig an.';
      return v < min ? 'Bitte wählen Sie ein Datum ab heute.' : null;
    },
    ausweichdatum: () => {
      const v = feld('ausweichdatum')?.value ?? '';
      if (!v) return null;
      if (!DATUM.test(v)) return 'Bitte geben Sie das Ausweichdatum vollständig an.';
      return v < min ? 'Bitte wählen Sie ein Ausweichdatum ab heute.' : null;
    },
    name: () => ((feld('name')?.value.trim().length ?? 0) >= 2 ? null : 'Bitte geben Sie Ihren Namen an.'),
    email: () => (EMAIL.test(feld('email')?.value.trim() ?? '') ? null : 'Bitte geben Sie eine gültige E-Mail-Adresse an, z. B. name@beispiel.de.'),
    telefon: () => {
      const v = feld('telefon')?.value.trim() ?? '';
      if (!v) return null;
      return /^[+()\d\s/.-]{6,}$/.test(v) && (v.match(/\d/g)?.length ?? 0) >= 6 ? null : 'Bitte prüfen Sie die Telefonnummer (nur Ziffern, Leerzeichen, + / - ( )).';
    },
    nachricht: () => ((feld<HTMLTextAreaElement>('nachricht')?.value.trim().length ?? 0) >= 10 ? null : 'Bitte schreiben Sie uns kurz, was Sie planen (mindestens 10 Zeichen).'),
    einwilligung: () => (feld('einwilligung')?.checked ? null : 'Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.'),
  };

  const zeigeFehler = (name: string, satz: string | null) => {
    const el = feld<HTMLElement>(name);
    if (!el) return;
    const ausgabe = form.querySelector<HTMLElement>(`#${form.id}-${name}-fehler`);
    if (satz) {
      el.setAttribute('aria-invalid', 'true');
      if (ausgabe) {
        ausgabe.textContent = satz;
        ausgabe.hidden = false;
      }
      // Feld in zugeklappten „Weitere Angaben“ sichtbar machen
      const details = el.closest('details');
      if (details) details.open = true;
    } else {
      el.removeAttribute('aria-invalid');
      if (ausgabe) {
        ausgabe.textContent = '';
        ausgabe.hidden = true;
      }
    }
  };

  let versucht = false;
  const pruefeAlle = () => {
    const fehler: [string, string][] = [];
    for (const [name, regel] of Object.entries(regeln)) {
      if (!feld(name)) continue;
      const satz = regel();
      zeigeFehler(name, satz);
      if (satz) fehler.push([name, satz]);
    }
    return fehler;
  };

  const zeigeListe = (fehler: [string, string][]) => {
    punkte.replaceChildren(
      ...fehler.map(([name, satz]) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${form.id}-${name}`;
        a.textContent = satz;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          feld<HTMLElement>(name)?.focus();
        });
        li.append(a);
        return li;
      }),
    );
    liste.hidden = fehler.length === 0;
    if (fehler.length) liste.focus();
  };

  // Nach dem ersten Absenden: Fehler verschwinden, sobald das Feld stimmt —
  // schon beim Tippen. Nicht bei „focusout“: Sonst verschiebt sich das Layout
  // genau in dem Moment, in dem man das nächste Feld anklickt.
  const nachpruefen = (e: Event) => {
    const el = e.target as HTMLInputElement;
    if (!versucht || !regeln[el.name]) return;
    const satz = regeln[el.name]();
    if (!satz || e.type === 'change') zeigeFehler(el.name, satz);
  };
  form.addEventListener('input', nachpruefen);
  form.addEventListener('change', nachpruefen);

  /* ---------- Daten & Mail-Ersatz ---------- */
  const daten = (): AnfrageDaten => {
    const text = (n: string) => (feld<HTMLInputElement>(n)?.value ?? '').trim();
    const oderNull = (n: string) => text(n) || null;
    const start = Number(geladen.value);
    return {
      quelle: 'mswohldorf',
      anlass: text('anlass'),
      datum: oderNull('datum'),
      ausweichdatum: oderNull('ausweichdatum'),
      gaeste: text('gaeste') ? Number(text('gaeste')) : null,
      name: text('name'),
      email: text('email'),
      telefon: oderNull('telefon'),
      nachricht: text('nachricht'),
      einwilligung: true,
      website: feld<HTMLInputElement>('website')?.value ?? '',
      dauerMs: start ? Math.max(0, Date.now() - start) : 0,
    };
  };

  const mailLink = (d: AnfrageDaten) => {
    const zeilen = [
      `Anlass: ${d.anlass}`,
      d.datum ? `Wunschdatum: ${d.datum}` : '',
      d.ausweichdatum ? `Ausweichdatum: ${d.ausweichdatum}` : '',
      d.gaeste ? `Gäste: ${d.gaeste}` : '',
      `Name: ${d.name}`,
      `E-Mail: ${d.email}`,
      d.telefon ? `Telefon: ${d.telefon}` : '',
      '',
      d.nachricht,
    ].filter((z, i, a) => z !== '' || a[i - 1] !== '');
    return `mailto:${mail}?subject=${encodeURIComponent(`Anfrage MS Wohldorf – ${d.anlass}`)}&body=${encodeURIComponent(zeilen.join('\n'))}`;
  };

  const meldung = (html: string) => {
    status.innerHTML = html;
  };

  const ersatz = (d: AnfrageDaten) =>
    `<a href="${escape(mailLink(d))}">Anfrage per E-Mail senden</a> (öffnet Ihr Mailprogramm mit Ihren Angaben) oder direkt an <a href="mailto:${escape(mail)}">${escape(mail)}</a>.`;

  const beschaeftigt = (an: boolean) => {
    senden.disabled = an;
    senden.setAttribute('aria-busy', String(an));
    sendenText.textContent = an ? 'Wird gesendet …' : 'Anfrage senden';
  };

  /* ---------- Senden ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    versucht = true;
    meldung('');
    const fehler = pruefeAlle();
    zeigeListe(fehler);
    if (fehler.length) return;

    const d = daten();
    if (!ziel) {
      meldung(`<strong>Vorschau: Das Formular ist noch nicht verbunden.</strong> Bitte schreiben Sie an ${escape(mail)}: ${ersatz(d)}`);
      return;
    }

    beschaeftigt(true);
    const abbruch = new AbortController();
    const uhr = setTimeout(() => abbruch.abort(), 20000);
    try {
      const antwort = await fetch(ziel, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(d),
        mode: 'cors',
        credentials: 'omit',
        signal: abbruch.signal,
      });
      let inhalt: { ok?: boolean; fehler?: string; feld?: string; satz?: string } = {};
      try {
        inhalt = await antwort.json();
      } catch {
        /* kein JSON */
      }

      if (antwort.status === 202 || (antwort.ok && inhalt.ok)) {
        form.hidden = true;
        if (erfolg) {
          erfolg.hidden = false;
          erfolg.focus();
        }
        return;
      }
      if (antwort.status === 400) {
        if (inhalt.fehler === 'feld' && inhalt.feld && feld(inhalt.feld)) {
          const satz = inhalt.satz || 'Bitte prüfen Sie dieses Feld.';
          zeigeFehler(inhalt.feld, satz);
          zeigeListe([[inhalt.feld, satz]]);
        } else {
          meldung('Bitte prüfen Sie Ihre Angaben und senden Sie die Anfrage noch einmal.');
        }
        return;
      }
      if (antwort.status === 429) {
        meldung(`Gerade kommen sehr viele Anfragen auf einmal. Bitte versuchen Sie es in ein paar Minuten noch einmal — oder ${ersatz(d)}`);
        return;
      }
      if (antwort.status === 503) {
        meldung(`Das Formular ist im Moment abgeschaltet. Bitte schreiben Sie uns direkt: ${ersatz(d)}`);
        return;
      }
      meldung(`Das hat leider nicht geklappt (Fehler ${antwort.status}). Bitte versuchen Sie es später noch einmal — oder ${ersatz(d)}`);
    } catch {
      meldung(`Wir konnten den Server gerade nicht erreichen. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut — oder ${ersatz(d)}`);
    } finally {
      clearTimeout(uhr);
      beschaeftigt(false);
    }
  });
});
