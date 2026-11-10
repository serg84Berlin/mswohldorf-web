/**
 * Häufige Fragen — Seite /haeufige-fragen/ (mit FAQPage-Schema), Auszüge auf
 * /offsite-hamburg/, Grundlage für llms.txt.
 *
 * Jede Antwort beginnt mit der direkten Antwort (gut für Suchmaschinen und
 * KI-Assistenten) und nutzt NUR belegte Angaben: src/config.ts, src/data/anreise.ts,
 * src/data/anlaesse.ts (Quellen dort und in INHALT.md). Was nicht belegt ist
 * (Preise, Catering, Technik), wird nicht beantwortet, sondern an die Anfrage verwiesen.
 */
import { FAKTEN, LIEGEPLATZ, KONTAKT, AUSSTATTUNG } from '../config';
import { ANREISE } from './anreise';

export interface Frage {
  id: string;
  frage: string;
  /** Klartext — geht 1:1 ins FAQPage-Schema und in llms.txt. */
  antwort: string;
  link?: { href: string; text: string };
  /** Auch auf /offsite-hamburg/ zeigen. */
  offsite?: boolean;
}

export const FRAGEN: Frage[] = [
  {
    id: 'gaeste',
    frage: 'Wie viele Gäste passen auf die MS Wohldorf?',
    antwort: `Bis zu ${FAKTEN.maxGaeste} Personen. Das Schiff eignet sich damit für Teams, Abteilungen, ausgewählte Kundenkreise und Feiern im kleineren Kreis.`,
    offsite: true,
  },
  {
    id: 'liegeplatz',
    frage: 'Wo liegt die MS Wohldorf?',
    antwort: `Am ${LIEGEPLATZ.name}: Die MS Wohldorf liegt ${LIEGEPLATZ.beschreibung}. Für das Navi: ${LIEGEPLATZ.navi}. Eine kleine Privatstraße führt zum Liegeplatz, ${AUSSTATTUNG.parkplaetze} Parkplätze gibt es direkt vor der Tür.`,
    link: { href: '/#anfahrt', text: 'Anfahrt und Karte' },
  },
  {
    id: 'fahrt',
    frage: 'Fährt das Schiff während der Veranstaltung?',
    antwort:
      'Nein. Die Wohldorf fährt nicht mehr aus eigener Kraft — Ihre Veranstaltung findet am Liegeplatz auf der Süderelbe statt.',
  },
  {
    id: 'anlaesse',
    frage: 'Für welche Anlässe kann man die MS Wohldorf mieten?',
    antwort:
      'Für Firmenevents, Workshops und Seminare, Film- und Fotoproduktionen, Lesungen und Ausstellungen sowie private Feiern. Genutzt wurde das Schiff auch für eine TV-Produktion („Die Pfefferkörner“, NDR), für Präsentationen, Brainstorming-Tage, Business-Essen und als Basislager.',
    link: { href: '/#anlaesse', text: 'Alle Anlässe' },
  },
  {
    id: 'berlin',
    frage: 'Wie kommt man aus Berlin zur MS Wohldorf?',
    antwort: `Mit dem ICE in ${ANREISE.berlinBahn} von Berlin Hbf nach Hamburg Hbf. Von dort sind es rund ${ANREISE.hbfKm} Kilometer bis zum Liegeplatz — mit Taxi oder Auto je nach Verkehr ${ANREISE.hbfMinuten}. Vom Flughafen Hamburg sind es rund ${ANREISE.flughafenKm} Kilometer, ${ANREISE.flughafenMinuten}.`,
    link: { href: '/offsite-hamburg/', text: 'Offsite in Hamburg planen' },
    offsite: true,
  },
  {
    id: 'kueche',
    frage: 'Gibt es eine Küche an Bord?',
    antwort:
      'Ja, eine Küche mit Geräten ist an Bord — gut für Business-Essen und Feiern. Wie Verpflegung und Getränke für Ihren Anlass aussehen, stimmen wir persönlich mit Ihnen ab.',
    offsite: true,
  },
  {
    id: 'ausstattung',
    frage: 'Gibt es WLAN und eine Musikanlage an Bord?',
    antwort:
      'Ja. WLAN und eine PA-Anlage für Musik und Durchsagen sind an Bord. Eigene Musik ist willkommen, auch mit eigenem DJ. Weitere Technik, etwa für Präsentationen, stimmen wir persönlich mit Ihnen ab.',
    offsite: true,
  },
  {
    id: 'parken',
    frage: 'Gibt es Parkplätze?',
    antwort: `Ja, ${AUSSTATTUNG.parkplaetze} Parkplätze direkt vor der Tür. Eine kleine Privatstraße führt bis zum Liegeplatz.`,
  },
  {
    id: 'raeume',
    frage: 'Welche Räume gibt es an Bord?',
    antwort:
      'Auf dem Hauptdeck liegen ein großer Veranstaltungsbereich und ein kleinerer, verglaster Besprechungsraum; auf dem Oberdeck das Büro mit Kombüse.',
    link: { href: '/#rundgang', text: 'Zum 3D-Rundgang' },
    offsite: true,
  },
  {
    id: 'winter',
    frage: 'Kann man auch im Winter an Bord feiern oder tagen?',
    antwort: 'Ja. Das Schiff hat eine Zentralheizung mit gusseisernen Heizkörpern.',
  },
  {
    id: 'barrierefrei',
    frage: 'Ist der Zugang barrierefrei?',
    antwort: 'Nein, der Zugang zur MS Wohldorf ist nicht barrierefrei.',
  },
  {
    id: 'ansehen',
    frage: 'Kann ich das Schiff vorab ansehen?',
    antwort:
      'Ja, im 3D-Rundgang bewegen Sie sich frei durch das Schiff. Er entstand am früheren Liegeplatz im Sandtorhafen. Einen Besichtigungstermin vereinbaren wir gern persönlich.',
    link: { href: '/#rundgang', text: 'Zum 3D-Rundgang' },
  },
  {
    id: 'geschichte',
    frage: 'Was ist das Besondere an der MS Wohldorf?',
    antwort: `Sie ist eine echte ${FAKTEN.herkunft} von ${FAKTEN.baujahr}: einst für bis zu ${FAKTEN.fahrgaesteFrueher} Fahrgäste gebaut, ${FAKTEN.umbau} zum Büro- und Veranstaltungsschiff umgebaut. Bekannt ist sie auch aus der NDR-Serie „Die Pfefferkörner“.`,
    link: { href: '/geschichte/', text: 'Zur Geschichte' },
  },
  {
    id: 'preise',
    frage: 'Was kostet es, die MS Wohldorf zu mieten?',
    antwort:
      'Das hängt von Anlass, Dauer und Gästezahl ab. Schreiben Sie uns kurz, was Sie vorhaben — wir melden uns persönlich mit einem Angebot.',
    link: { href: '/anfrage/', text: 'Unverbindlich anfragen' },
    offsite: true,
  },
  {
    id: 'anfrage',
    frage: 'Wie frage ich einen Termin an?',
    antwort: `Über das Anfrageformular, per E-Mail an ${KONTAKT.mail} oder telefonisch unter ${KONTAKT.telefon}. Anlass, Wunschtermin und Gästezahl genügen für den Anfang.`,
    link: { href: '/anfrage/', text: 'Zum Anfrageformular' },
  },
];
