/**
 * Zentrale Angaben der Website — an EINER Stelle.
 *
 * Alles, was hier `null` ist, ist noch nicht bekannt und erscheint auf der
 * Seite als Platzhalter (siehe OFFENE-ANGABEN.md). Nichts davon erfinden.
 */

/** Datenschutz-Seite: Hinweis „Entwurf — vor Veröffentlichung rechtlich prüfen".
 *  Nach der rechtlichen Prüfung auf `false` setzen. */
export const ENTWURF_HINWEIS_ANZEIGEN = true;

/** Vorschau-Build (`PUBLIC_VORSCHAU=1`): noindex,nofollow + „Vorschau"-Band. */
export const VORSCHAU = import.meta.env.PUBLIC_VORSCHAU === '1';

/** Ziel des Anfrageformulars. Kein Standardwert im Code. */
export const ANFRAGE_URL = (import.meta.env.PUBLIC_ANFRAGE_URL ?? '').trim();

export const SEITE = {
  name: 'MS Wohldorf',
  url: 'https://www.mswohldorf.de',
  sprache: 'de-DE',
  beschreibung:
    'Die MS Wohldorf: ehemalige HADAG-Hafenfähre von 1959, 2016 umgebaut — heute Eventschiff in Hamburg für bis zu 35 Gäste. Für Firmenevents, Workshops, Film- und Fotoproduktionen, Lesungen, Ausstellungen und private Feiern.',
} as const;

export const BETREIBER = {
  firma: 'Finanzelot GmbH & Co. KG',
  ort: 'Hamburg',
} as const;

export const KONTAKT = {
  mail: 'info@finanzelot.de',
  /** Telefonnummer wie auf der bisherigen Seite — noch nicht übernommen. */
  telefon: null as string | null,
  /** Telefon im Format für tel:-Links, z. B. "+4940…". */
  telefonLink: null as string | null,
  fax: null as string | null,
} as const;

/**
 * Liegeplatz. Quelle: Navi-Hinweis der bisherigen Website, wie im
 * Finanzelot-Lotsen-Repo (docs/BUCHUNG-MAILTEXTE.md) festgehalten; die
 * Koordinaten stehen so auch im Auftrag. Bitte bestätigen (OFFENE-ANGABEN.md).
 */
export const LIEGEPLATZ = {
  beschreibung: 'an der Süderelbe, am Naturschutzgebiet Heuckenlock in Finkenriek (Hamburg-Wilhelmsburg)',
  strasse: 'Finkenrieker Hauptdeich 14',
  plz: '21109',
  ort: 'Hamburg',
  breite: 53.474464814706096,
  laenge: 10.013551864414687,
  navi: 'Finkenrieker Hauptdeich 14, 21109 Hamburg',
  hinweis:
    'Mit den Koordinaten führt Google Maps Sie über die Privatstraße direkt zum Liegeplatz. Parkplätze gibt es direkt vor der Gangway.',
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

/** Belegte Eckdaten (aus dem Auftrag bzw. der bisherigen Website). */
export const FAKTEN = {
  baujahr: 1959,
  herkunft: 'HADAG-Hafenfähre',
  umbau: 2016,
  sandtorhafen: 'Mai 2017',
  maxGaeste: 35,
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
      titel: 'Wohldorf 2017 — Einlaufen im Sandtorhafen',
      kanal: 'ulrichritter',
    },
  ],
  malizia: {
    url: 'https://www.youtube.com/watch?v=ABHuBRonV4k',
    titel: 'Malizia Ocean Festival — Preparation for the Christening',
    kanal: 'Team Malizia – Boris Herrmann',
  },
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
