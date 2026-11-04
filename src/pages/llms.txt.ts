/**
 * /llms.txt — kompakte Zusammenfassung für KI-Assistenten und KI-Suchmaschinen
 * (Format nach llmstxt.org: Titel, Kurzbeschreibung, Abschnitte mit Links).
 * Erzeugt aus denselben belegten Daten wie die Seite — nie von Hand pflegen.
 */
import type { APIRoute } from 'astro';
import { FAKTEN, KONTAKT, LIEGEPLATZ, SEITE, BETREIBER } from '../config';
import { ANLAESSE } from '../data/anlaesse';
import { FRAGEN } from '../data/fragen';
import { ratgeberArtikel } from '../lib/ratgeber';

export const GET: APIRoute = async () => {
  const artikel = await ratgeberArtikel();
  const url = (pfad: string) => new URL(pfad, SEITE.url).href;
  const zeilen = [
    `# ${SEITE.name}`,
    '',
    `> ${SEITE.beschreibung}`,
    '',
    '## Eckdaten',
    '',
    `- Schiff: ehemalige ${FAKTEN.herkunft}, Baujahr ${FAKTEN.baujahr}, Umbau ${FAKTEN.umbau} zum Büro- und Veranstaltungsschiff`,
    `- Kapazität: bis zu ${FAKTEN.maxGaeste} Personen`,
    `- Liegeplatz: ${LIEGEPLATZ.name}, ${LIEGEPLATZ.beschreibung}; Navi-Adresse ${LIEGEPLATZ.navi}; Koordinaten ${LIEGEPLATZ.breite.toFixed(5)}, ${LIEGEPLATZ.laenge.toFixed(5)}`,
    '- Veranstaltungen finden am Liegeplatz statt (das Schiff fährt nicht mehr aus eigener Kraft)',
    '- Küche mit Geräten an Bord; Parkplätze vor der Tür; Zugang nicht barrierefrei',
    `- Kontakt: ${KONTAKT.person}, ${KONTAKT.mail}, ${KONTAKT.telefon}`,
    `- Betreiber: ${BETREIBER.firma}, ${BETREIBER.ort}`,
    '- Preise: auf Anfrage, je nach Anlass, Dauer und Gästezahl',
    '',
    '## Anlässe',
    '',
    ...ANLAESSE.map((a) => `- [${a.kartenTitel}](${url(`/anlaesse/${a.slug}/`)}): ${a.kartenText}`),
    '',
    '## Häufige Fragen',
    '',
    ...FRAGEN.map((f) => `- **${f.frage}** ${f.antwort}`),
    '',
    '## Ratgeber',
    '',
    ...artikel.map((a) => `- [${a.data.titel}](${url(`/ratgeber/${a.id}/`)}): ${a.data.beschreibung}`),
    '',
    '## Seiten',
    '',
    `- [Startseite](${url('/')}): Überblick, 3D-Rundgang, Anfahrt`,
    `- [Häufige Fragen](${url('/haeufige-fragen/')}): alle Antworten mit Links`,
    `- [Offsite in Hamburg](${url('/offsite-hamburg/')}): für Teams aus Berlin und Norddeutschland, mit Anreise`,
    `- [Geschichte](${url('/geschichte/')}): von der HADAG-Hafenfähre zum Eventschiff`,
    `- [Galerie](${url('/galerie/')}): Fotos innen, außen, Umbau, Überfahrt`,
    `- [Anfrage](${url('/anfrage/')}): unverbindliche Anfrage`,
    `- [Exposé (PDF)](${url('/pdf/ms-wohldorf-expose.pdf')}): Räume, Anlässe, Anreise, Planungs-Checkliste`,
    `- [English](${url('/en/')}): English overview, offsite from Berlin, enquiry form; [FAQ in English](${url('/en/faq/')})`,
    '',
  ];
  return new Response(zeilen.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
