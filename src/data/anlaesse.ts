/**
 * Die fünf Anlass-Seiten. Texte nur aus belegten Angaben:
 *   AS  = alte Website (quelle/alte-seite/texte.md): bis zu 35 Personen, Nutzungen
 *         „TV Produktion, Foto Shootings, Lesungen, Ausstellungen, Präsentationen,
 *         Brainstorming Tage, Basislager, Business-Essen (Küche mit Geräten ist
 *         vorhanden)", Süderelbe, Privatstraße, Parkplätze, Zugang nicht barrierefrei,
 *         Pfefferkörner, Kundenstimmen (Bildungswoche).
 *   P19 = Presse-PDFs der alten Website (2019): Raumaufteilung, Heizung,
 *         Raumhöhe, nicht mehr aus eigener Kraft fahrtüchtig, kleinere Feiern.
 *   D   = Uli über Sergiy, 10.11.2026: Dreharbeiten gab es bisher nur einmal („Die Pfefferkörner“) —
 *         daher nirgends „TV-Produktionen“ in der Mehrzahl.
 *   U   = Uli, Antwort vom 07.11.2026 (`AUSSTATTUNG` in config.ts): WLAN, PA-Anlage,
 *         eigene Musik auch mit eigenem DJ, 20 Parkplätze. Der Satz der Presse 2019
 *         „keine Techno- und Disco-Partys“ entfällt seitdem (DJ ausdrücklich erlaubt).
 * Preise, Catering, Technik, Uhrzeiten usw. gibt es auf Anfrage — Entscheidung von
 * Uli (Mail vom 04.11.2026: „Zu Buchungen alles auf Anfrage. Es sei denn wir machen
 * irgendwann eine extra Seite dafür auf.“). Die Themen stehen in `aufAnfrage`; die
 * Seite zeigt daraus EINEN Satz aus `aufAnfrageKurz` („… stimmen wir individuell mit
 * Ihnen ab — sprechen Sie uns an.“), in Vorschau und Produktion gleich.
 */
import type { AnlassWert } from './typen';
import { AUSSTATTUNG } from '../config';

export interface Anlass {
  slug: string;
  /** Wert im Anfrageformular (Auswahl „Anlass“). */
  formWert: AnlassWert;
  titel: string;
  kartenTitel: string;
  kartenText: string;
  seoTitel: string;
  seoBeschreibung: string;
  einleitung: string;
  absaetze: string[];
  vorteile: { titel: string; text: string }[];
  /** Belegte Hinweise („Gut zu wissen“). */
  wissen: string[];
  /** Themen, die es nur auf Anfrage gibt (Entscheidung Uli) — Grundlage für den Satz unten. */
  aufAnfrage: string[];
  /**
   * Dieselben Themen in wenigen Worten. Daraus wird EIN Satz: „{aufAnfrageKurz}
   * stimmen wir individuell mit Ihnen ab — sprechen Sie uns an.“ Also eine
   * Aufzählung, die vorn im Satz stehen kann (Akkusativ). Nur, wenn `aufAnfrage` nicht leer ist.
   */
  aufAnfrageKurz: string;
  zitat?: { text: string; name: string; zusatz: string };
  symbol: 'firma' | 'workshop' | 'kamera' | 'buch' | 'feier';
}

const vorteil = {
  gaeste: { titel: 'Bis zu 35 Gäste', text: 'Überschaubar und persönlich — groß genug für Team, Publikum oder Familie.' },
  geschichte: { titel: 'Hafenfähre von 1959', text: 'Eine echte HADAG-Fähre, 2016 zum Büro- und Veranstaltungsschiff umgebaut.' },
  kueche: { titel: 'Küche mit Geräten', text: 'Eine Kombüse mit Geräten ist an Bord — gut für Business-Essen und Feiern.' },
  parken: { titel: `${AUSSTATTUNG.parkplaetze} Parkplätze vor der Tür`, text: 'Eine kleine Privatstraße führt bis zum Liegeplatz auf der Süderelbe.' },
  interieur: { titel: 'Vintage-Interieur', text: 'Teakholztüren, Eichendielen, Samtsessel und Industrielampen.' },
};

const wissen = {
  raeume: 'Auf dem Hauptdeck liegen ein großer Veranstaltungsbereich und ein kleinerer, verglaster Besprechungsraum; auf dem Oberdeck das Büro mit Kombüse.',
  kueche: 'Eine Küche mit Geräten ist an Bord.',
  heizung: 'Das Schiff hat eine Zentralheizung mit gusseisernen Heizkörpern.',
  liegeschiff: 'Die Wohldorf fährt nicht mehr aus eigener Kraft — Ihre Veranstaltung findet am Liegeplatz auf der Süderelbe statt.',
  barriere: 'Der Zugang ist nicht barrierefrei.',
  parken: `${AUSSTATTUNG.parkplaetze} Parkplätze gibt es vor der Tür, an einer kleinen Privatstraße.`,
  technik: 'WLAN und eine PA-Anlage für Musik und Durchsagen sind an Bord.',
  musik: 'Eigene Musik ist willkommen, auch mit eigenem DJ; die PA-Anlage ist an Bord.',
};

export const ANLAESSE: Anlass[] = [
  {
    slug: 'firmenevent',
    formWert: 'Firmenevent',
    titel: 'Firmenevent an Bord',
    kartenTitel: 'Firmenevent',
    kartenText: 'Teamabend, Kundenempfang oder Business-Essen — mit echtem Hafenflair.',
    seoTitel: 'Firmenevent auf dem Schiff in Hamburg | MS Wohldorf',
    seoBeschreibung:
      'Teamabend, Kundenempfang oder Business-Essen an Bord der MS Wohldorf: historische HADAG-Hafenfähre von 1959 auf der Hamburger Süderelbe, für bis zu 35 Gäste.',
    einleitung:
      'Ein Abend, über den Ihr Team noch lange spricht: Feiern, netzwerken und anstoßen an Bord einer echten Hamburger Hafenfähre.',
    absaetze: [
      'Die MS Wohldorf wurde 1959 als HADAG-Hafenfähre in Dienst gestellt und 2016 zum Büro- und Veranstaltungsschiff umgebaut — überschaubar, persönlich und garantiert anders als jeder Konferenzsaal.',
      'Mit Platz für bis zu 35 Personen eignet sich das Schiff für Teams, Abteilungen und ausgewählte Kundenkreise. Eine Küche mit Geräten ist an Bord — ideal auch für ein Business-Essen. Erzählen Sie uns, was Sie vorhaben; wir melden uns persönlich bei Ihnen.',
    ],
    vorteile: [vorteil.gaeste, vorteil.kueche, vorteil.geschichte, vorteil.parken],
    wissen: [wissen.raeume, wissen.technik, wissen.liegeschiff, wissen.heizung, wissen.barriere, wissen.parken],
    aufAnfrage: [
      'Preise und Pakete für Firmenveranstaltungen',
      'Catering: feste Partner oder freie Wahl? (Eine Küche mit Geräten ist an Bord.)',
      'Technik über WLAN und PA-Anlage hinaus, z. B. Präsentationstechnik',
      'Mögliche Uhrzeiten, Lautstärke und Saison',
    ],
    aufAnfrageKurz: 'Preise und Pakete, Catering, Technik und Uhrzeiten',
    symbol: 'firma',
  },
  {
    slug: 'workshop-seminar',
    formWert: 'Workshop/Seminar',
    titel: 'Workshop & Seminar an Bord',
    kartenTitel: 'Workshop & Seminar',
    kartenText: 'Präsentation, Brainstorming-Tag oder Workshop — neue Gedanken an einem neuen Ort.',
    seoTitel: 'Workshop & Seminar auf dem Schiff in Hamburg | MS Wohldorf',
    seoBeschreibung:
      'Präsentationen, Brainstorming-Tage und Workshops an Bord der MS Wohldorf in Hamburg — erprobter Lernort auf einer HADAG-Hafenfähre von 1959, für bis zu 35 Personen.',
    einleitung:
      'Neue Ideen brauchen neue Orte. An Bord der MS Wohldorf denkt es sich freier — mit Wasser vor dem Fenster statt Flipchart vor der Wand.',
    absaetze: [
      'Präsentation, Brainstorming-Tag oder Seminar: Die ehemalige Hafenfähre bietet einen besonderen Rahmen für Gruppen bis zu 35 Personen — mit einem großen Veranstaltungsbereich und einem kleineren, verglasten Besprechungsraum.',
      'Dass das funktioniert, zeigt die Hamburger Bildungswoche „Wetter.Wasser.Waterkant“: Von 2020 bis 2023 fanden an Bord jedes Jahr Workshops für Schulklassen statt. Wie es innen aussieht, sehen Sie vorab im 3D-Rundgang.',
    ],
    vorteile: [
      { titel: 'Erprobter Lernort', text: 'Jahrelang Workshops der Hamburger Bildungswoche an Bord.' },
      { titel: 'Raum für Gruppenarbeit', text: 'Veranstaltungsbereich plus kleinerer Besprechungsraum.' },
      vorteil.gaeste,
      vorteil.kueche,
    ],
    wissen: [wissen.raeume, wissen.technik, wissen.kueche, wissen.liegeschiff, wissen.barriere, wissen.parken],
    aufAnfrage: [
      'Bestuhlung und Raumaufteilung (z. B. Reihe, U-Form, Gruppentische)',
      'Präsentationstechnik: Bildschirm oder Beamer',
      'Tagespauschalen und Preise',
      'Verpflegung während des Workshops',
    ],
    aufAnfrageKurz: 'Bestuhlung, Präsentationstechnik, Verpflegung und Tagespauschalen',
    zitat: {
      text: 'Die MS Wohldorf ist für meine Workshops der ideale Ort, da das Schiff geschützte Räumlichkeiten für die Seewasser Filtrationsarbeiten, die Versammlung ganzer Klassen und auch Bereiche für Gruppenarbeit bietet.',
      name: 'Dr. Rüdiger Stöhr',
      zusatz: 'One Earth – One Ocean e.V.',
    },
    symbol: 'workshop',
  },
  {
    slug: 'film-und-foto',
    formWert: 'Film & Foto',
    titel: 'Drehort & Fotolocation',
    kartenTitel: 'Film & Foto',
    kartenText: 'Eine Kulisse mit Geschichte — schon im Fernsehen und bei Shootings im Einsatz.',
    seoTitel: 'Drehort & Fotolocation Schiff in Hamburg | MS Wohldorf',
    seoBeschreibung:
      'Drehort mit Charakter: Film- und Fotoproduktionen an Bord der MS Wohldorf, Hamburger HADAG-Hafenfähre von 1959 — bekannt aus „Die Pfefferkörner“ (NDR).',
    einleitung:
      'Teak, Eiche, Vintage-Möbel und Fenster rundum — und eine Geschichte, die man sieht. Die Wohldorf war schon „Statist“ in der NDR-Serie „Die Pfefferkörner“.',
    absaetze: [
      'Als originale Hamburger Hafenfähre von 1959 bringt die Wohldorf eine Kulisse mit, die sich nicht nachbauen lässt: drinnen Vintage-Charme mit Teakholztüren, Eichendielen und Industrielampen, draußen Ponton, Gangway und die Süderelbe.',
      'Vor der Kamera stand die Wohldorf schon für die NDR-Serie „Die Pfefferkörner“, auch Fotoshootings haben an Bord stattgefunden. Für die Planung können Sie das Schiff vorab im 3D-Rundgang erkunden. Sagen Sie uns, was Sie brauchen — wir klären die Details persönlich.',
    ],
    vorteile: [
      { titel: 'Im Fernsehen erprobt', text: '„Die Pfefferkörner“, Staffel 19, Folge 246 „Spätfolgen“ (NDR).' },
      vorteil.interieur,
      { titel: 'Drinnen und draußen', text: 'Innenräume mit Fenstern rundum, draußen Ponton und Elbufer.' },
      vorteil.parken,
    ],
    wissen: [
      'Die Raumhöhe an Bord liegt bei etwa 1,90 Metern.',
      wissen.technik,
      wissen.heizung,
      wissen.liegeschiff,
      wissen.barriere,
      wissen.parken,
    ],
    aufAnfrage: [
      'Konditionen für Drehtage und Fotoproduktionen',
      'Stromanschluss an Bord (Leistung für Licht und Technik)',
      'Drehgenehmigung am Liegeplatz / Ansprechpartner',
    ],
    aufAnfrageKurz: 'Konditionen für Drehtage, Strom für Licht und Technik sowie die Drehgenehmigung am Liegeplatz',
    symbol: 'kamera',
  },
  {
    slug: 'lesung-ausstellung',
    formWert: 'Lesung/Ausstellung',
    titel: 'Lesung & Ausstellung an Bord',
    kartenTitel: 'Lesung & Ausstellung',
    kartenText: 'Kultur mit Nähe: Worte und Bilder in besonderer Atmosphäre.',
    seoTitel: 'Lesung & Ausstellung auf dem Schiff in Hamburg | MS Wohldorf',
    seoBeschreibung:
      'Kultur an Bord: Lesungen, Ausstellungen und kleine Kulturformate auf der MS Wohldorf in Hamburg — historische Hafenfähre auf der Süderelbe für bis zu 35 Gäste.',
    einleitung:
      'Worte und Bilder wirken anders, wenn ringsum Wasser ist. Lesungen und Ausstellungen gehören bereits zum Leben an Bord der MS Wohldorf.',
    absaetze: [
      'Der kompakte Rahmen für bis zu 35 Gäste schafft Nähe zwischen Publikum und Autorinnen, Autoren, Künstlerinnen und Künstlern — ideal für Formate, die vom Gespräch leben.',
      'Samtsessel, Teakholz und Fenster rundum geben jeder Veranstaltung eine eigene Atmosphäre. Sie planen eine Lesung, eine Vernissage oder eine kleine Ausstellung? Schreiben Sie uns — wir melden uns persönlich bei Ihnen.',
    ],
    vorteile: [
      { titel: 'Kultur an Bord erprobt', text: 'Lesungen und Ausstellungen fanden bereits auf der Wohldorf statt.' },
      vorteil.gaeste,
      vorteil.interieur,
      vorteil.geschichte,
    ],
    wissen: [wissen.raeume, wissen.technik, wissen.heizung, wissen.liegeschiff, wissen.barriere, wissen.parken],
    aufAnfrage: [
      'Hängemöglichkeiten und Wandflächen für Ausstellungen',
      'Licht und Tontechnik über die PA-Anlage hinaus',
      'Konditionen für Kulturveranstaltungen',
      'Öffentliche Veranstaltungen mit Ticketverkauf möglich?',
    ],
    aufAnfrageKurz: 'Hängemöglichkeiten, Licht und Ton sowie die Konditionen',
    symbol: 'buch',
  },
  {
    slug: 'private-feier',
    formWert: 'Private Feier',
    titel: 'Private Feier an Bord',
    kartenTitel: 'Private Feier',
    kartenText: 'Geburtstag, Jubiläum oder Familienfest — feiern an einem Ort mit Geschichte.',
    seoTitel: 'Private Feier auf dem Schiff in Hamburg | MS Wohldorf',
    seoBeschreibung:
      'Geburtstag, Jubiläum oder Familienfest an Bord der MS Wohldorf: feiern auf einer historischen Hamburger Hafenfähre an der Süderelbe, für bis zu 35 Gäste, mit Küche an Bord.',
    einleitung:
      'Runder Geburtstag, Jubiläum oder ein Fest im engsten Kreis: Auf der MS Wohldorf feiern Sie an einem Ort, den Ihre Gäste nicht vergessen.',
    absaetze: [
      'Die überschaubare Größe für bis zu 35 Gäste macht das Schiff zur persönlichen Festlocation — Hamburger Hafengeschichte inklusive. Eine Küche mit Geräten ist an Bord.',
      'Erzählen Sie uns, was Sie planen: Anlass, Wunschtermin und Gästezahl genügen für den Anfang. Wir melden uns persönlich bei Ihnen.',
    ],
    vorteile: [vorteil.gaeste, vorteil.kueche, vorteil.geschichte, vorteil.parken],
    wissen: ['Die Wohldorf ist für Feiern im kleineren Kreis gemacht.', wissen.musik, wissen.kueche, wissen.liegeschiff, wissen.barriere, wissen.parken],
    aufAnfrage: ['Preise für private Feiern', 'Catering und Getränke', 'Musik, Lautstärke und späteste Uhrzeit', 'Dekoration: Was ist möglich?'],
    aufAnfrageKurz: 'Preise, Catering und Getränke, Musik und Dekoration',
    symbol: 'feier',
  },
];

export const anlassPerSlug = (slug: string) => ANLAESSE.find((a) => a.slug === slug);
