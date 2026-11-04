/**
 * Zentrale Angaben der Website — an EINER Stelle.
 *
 * Was noch nicht bekannt ist, erscheint auf der Seite als Platzhalter
 * (src/components/Platzhalter.astro, siehe OFFENE-ANGABEN.md). Nichts davon erfinden.
 */

/** Datenschutz-Seite: Hinweis „Entwurf — vor Veröffentlichung rechtlich prüfen“.
 *  Nach der rechtlichen Prüfung auf `false` setzen. Steht er auf `true`, bricht
 *  ein Produktions-Build ab (integrationen/livegang-sperre.mjs) — kein Livegang
 *  mit einer Entwurfs-Datenschutzerklärung aus Versehen. */
export const ENTWURF_HINWEIS_ANZEIGEN = true;

/**
 * Vorschau-Build (`PUBLIC_VORSCHAU=1`): noindex,nofollow + „Vorschau“-Band,
 * alle Platzhalter als Kasten, Livegang-Sperre aus.
 * Ohne: Produktions-Build — inhaltliche Platzhalter als neutraler Text,
 * rechtliche (`pflicht`) und der Entwurf-Hinweis sperren den Build.
 */
export const VORSCHAU = import.meta.env.PUBLIC_VORSCHAU === '1';

/** Ziel des Anfrageformulars. Kein Standardwert im Code. */
export const ANFRAGE_URL = (import.meta.env.PUBLIC_ANFRAGE_URL ?? '').trim();

/**
 * `PUBLIC_ANFRAGE_ERWEITERT=1`: Die Anfrage enthält zusätzlich `art` (voll/schnell)
 * und `herkunft` (Seite, vorherige Seite, fremde Herkunftsdomain, utm-Parameter) —
 * für die Lead-Quelle in Zoho. Erst einschalten, wenn der Lotse-Server die Felder
 * annimmt; dann erscheint auch der passende Absatz in der Datenschutzerklärung.
 */
export const ANFRAGE_ERWEITERT = import.meta.env.PUBLIC_ANFRAGE_ERWEITERT === '1';

/** Exposé als PDF (erzeugt mit `npm run expose` aus /expose/, liegt in public/pdf/). */
export const EXPOSE = {
  pfad: '/pdf/ms-wohldorf-expose.pdf',
  datei: 'public/pdf/ms-wohldorf-expose.pdf',
} as const;

export const SEITE = {
  name: 'MS Wohldorf',
  url: 'https://www.mswohldorf.de',
  sprache: 'de-DE',
  beschreibung:
    'Die MS Wohldorf: ehemalige HADAG-Hafenfähre von 1959, 2016 umgebaut — heute Eventschiff in Hamburg für bis zu 35 Gäste. Für Firmenevents, Workshops, Film- und Fotoproduktionen, Lesungen, Ausstellungen und private Feiern.',
} as const;

/**
 * Impressum-Angaben. Anschrift und Postfach wie auf der bisherigen Website
 * (quelle/alte-seite/texte.md); Komplementärin, Registergericht und USt-IdNr.
 * wie im Impressum von finanzelot.de (abgerufen 01.11.2026, von Sergiy
 * freigegeben). Die USt-IdNr. der alten Seite (DE3223275031) war ungültig.
 */
export const BETREIBER = {
  firma: 'Finanzelot GmbH & Co. KG',
  strasse: 'Moorfleeter Deich 344',
  plz: '22113',
  ort: 'Hamburg',
  registergericht: 'Amtsgericht Hamburg',
  register: 'HRA 124152',
  /** Persönlich haftende Gesellschafterin (Komplementärin). */
  komplementaerin: {
    firma: 'Finanzelot Verwaltungs GmbH',
    registergericht: 'Amtsgericht Hamburg',
    register: 'HRB 154872',
    geschaeftsfuehrer: 'Ulrich Ritter',
  },
  /** Laut VIES gültig (geprüft 01.11.2026). */
  ustId: 'DE326098307',
} as const;

export const KONTAKT = {
  person: 'Ulrich Ritter',
  mail: 'info@finanzelot.de',
  telefon: '+49 40 277347',
  /** Für tel:-Links. */
  telefonLink: '+4940277347',
  fax: '+49 40 277387',
} as const;

/**
 * Liegeplatz laut alter Website: „Auf der Süderelbe – an einer kleinen
 * Privatstraße mit Parkplätzen vor der Tür"; Koordinaten und „dichteste
 * Adresse für ein Navi"; „Achtung: Der Zugang ist nicht barrierefrei!“.
 * Beschreibung Heuckenlock/Finkenriek: Navi-Hinweis im Lotsen-Repo.
 */
export const LIEGEPLATZ = {
  /** So nennt Uli den Liegeplatz (Mail vom 04.11.2026). */
  name: 'Anleger Finkenriek',
  beschreibung: 'auf der Süderelbe in Finkenriek (Hamburg-Wilhelmsburg), am Naturschutzgebiet Heuckenlock',
  strasse: 'Finkenrieker Hauptdeich 14',
  plz: '21109',
  ort: 'Hamburg',
  breite: 53.474464814706096,
  laenge: 10.013551864414687,
  navi: 'Finkenrieker Hauptdeich 14, 21109 Hamburg',
  hinweis: 'Eine kleine Privatstraße führt zum Liegeplatz, Parkplätze gibt es direkt vor der Tür. Die Koordinaten führen Sie genau hin.',
  barrierefrei: false,
} as const;

export const KARTEN_LINKS = {
  google: `https://www.google.com/maps/search/?api=1&query=${LIEGEPLATZ.breite},${LIEGEPLATZ.laenge}`,
  apple: `https://maps.apple.com/?ll=${LIEGEPLATZ.breite},${LIEGEPLATZ.laenge}&q=MS%20Wohldorf`,
  osm: `https://www.openstreetmap.org/?mlat=${LIEGEPLATZ.breite}&mlon=${LIEGEPLATZ.laenge}#map=16/${LIEGEPLATZ.breite}/${LIEGEPLATZ.laenge}`,
  /** Nur nach Klick (Zwei-Klick-Lösung) geladen. */
  osmEinbettung: (() => {
    const d = 0.012;
    const bbox = [LIEGEPLATZ.laenge - d * 1.6, LIEGEPLATZ.breite - d * 0.6, LIEGEPLATZ.laenge + d * 1.6, LIEGEPLATZ.breite + d * 0.6].join('%2C');
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${LIEGEPLATZ.breite}%2C${LIEGEPLATZ.laenge}`;
  })(),
} as const;

/**
 * Belegte Eckdaten. Alte Website: 1959, HADAG, Umbau 2016, Mai 2017
 * Sandtorhafen, bis zu 35 Personen, DES, bis Sommer 2024 im Hamburger Hafen.
 * Presse (PDFs der alten Seite, 2019): 30 m, Typ-III-Serie („600er“), bis zu
 * 607 Fahrgäste, 165 m² Nutzfläche.
 */
export const FAKTEN = {
  baujahr: 1959,
  herkunft: 'HADAG-Hafenfähre',
  umbau: 2016,
  sandtorhafen: 'Mai 2017',
  maxGaeste: 35,
  laengeM: 30,
  nutzflaecheM2: 165,
  fahrgaesteFrueher: 607,
} as const;

export const MEDIEN = {
  matterport: 'https://my.matterport.com/show/?m=9eU3eAd8TLz',
  videos: [
    {
      id: 'HvahxVqWtg0',
      titel: 'MS Wohldorf 2024',
      kanal: 'Finanzelot',
    },
    {
      id: '2ksTeXx8_DA',
      titel: 'Einfahrt in den Sandtorhafen — Mai 2017',
      kanal: 'ulrichritter',
    },
  ],
  malizia: {
    url: 'https://www.youtube.com/watch?v=ABHuBRonV4k',
    titel: 'Malizia Ocean Festival — Vorbereitung auf die Schiffstaufe',
    kanal: 'Team Malizia – Boris Herrmann',
  },
  tv: {
    url: 'https://www.ndr.de/fernsehen/sendungen/pfefferkoerner/folgen/Die-Pfefferkoerner-Staffel-19-Folge-246-Spaetfolgen,folgen810.html',
    sendung: 'Die Pfefferkörner',
    folge: 'Staffel 19 – Folge 246: Spätfolgen',
    sender: 'NDR',
  },
  lebenslauf: 'https://www.elbdampfer-hamburg.de/lebenslauf-hadag-hafenfaehre-wohldorf-23917/',
} as const;

/** Auswahl im Anfrageformular — Werte gehen 1:1 an den Server. */
export const ANLAESSE_AUSWAHL = [
  'Firmenevent',
  'Workshop/Seminar',
  'Film & Foto',
  'Lesung/Ausstellung',
  'Private Feier',
  'Sonstiges',
] as const;
