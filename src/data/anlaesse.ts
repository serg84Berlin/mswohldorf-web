/**
 * Die fünf Anlass-Seiten. Texte nur aus belegten Fakten (Baujahr 1959,
 * HADAG-Hafenfähre, Umbau 2016, bis zu 35 Gäste, bisherige Nutzungen laut
 * alter Website: TV-Produktionen, Fotoshootings, Lesungen, Ausstellungen).
 * Alles Weitere steht in `offen` und erscheint als Platzhalter.
 */
import type { AnlassWert } from './typen';

export interface Anlass {
  slug: string;
  /** Wert im Anfrageformular (Auswahl „Anlass"). */
  formWert: AnlassWert;
  titel: string;
  kartenTitel: string;
  kartenText: string;
  seoTitel: string;
  seoBeschreibung: string;
  einleitung: string;
  absaetze: string[];
  vorteile: { titel: string; text: string }[];
  offen: string[];
  symbol: 'firma' | 'workshop' | 'kamera' | 'buch' | 'feier';
}

const gemeinsameVorteile = {
  gaeste: { titel: 'Bis zu 35 Gäste', text: 'Überschaubar und persönlich — groß genug für Team, Publikum oder Familie.' },
  geschichte: { titel: 'Hafenfähre von 1959', text: 'Ein Original aus dem Hamburger Hafen, 2016 umgebaut für Veranstaltungen.' },
  rundgang: { titel: 'Vorab an Bord', text: 'Schauen Sie sich das Schiff im 3D-Rundgang an, bevor Sie anfragen.' },
  parken: { titel: 'Parken an der Gangway', text: 'Parkplätze direkt vor der Gangway am Liegeplatz.' },
};

export const ANLAESSE: Anlass[] = [
  {
    slug: 'firmenevent',
    formWert: 'Firmenevent',
    titel: 'Firmenevent an Bord',
    kartenTitel: 'Firmenevent',
    kartenText: 'Teamabend, Kundenempfang oder Sommerfest — mit echtem Hafenflair.',
    seoTitel: 'Firmenevent auf dem Schiff in Hamburg | MS Wohldorf',
    seoBeschreibung:
      'Teamabend, Kundenempfang oder Sommerfest an Bord der MS Wohldorf: historische Hamburger Hafenfähre von 1959 für bis zu 35 Gäste. Jetzt unverbindlich anfragen.',
    einleitung:
      'Ein Abend, über den Ihr Team noch lange spricht: Feiern, netzwerken und anstoßen an Bord einer echten Hamburger Hafenfähre.',
    absaetze: [
      'Die MS Wohldorf wurde 1959 als HADAG-Hafenfähre gebaut. Seit ihrem Umbau 2016 ist sie ein Ort für Begegnungen — überschaubar, persönlich und garantiert anders als jeder Konferenzsaal.',
      'Mit Platz für bis zu 35 Gäste eignet sich das Schiff besonders für Teams, Abteilungen und ausgewählte Kundenkreise. Erzählen Sie uns, was Sie vorhaben — wir melden uns persönlich bei Ihnen.',
    ],
    vorteile: [gemeinsameVorteile.gaeste, gemeinsameVorteile.geschichte, gemeinsameVorteile.rundgang, gemeinsameVorteile.parken],
    offen: [
      'Preise und Pakete für Firmenveranstaltungen',
      'Catering: feste Partner, freie Wahl oder Selbstversorgung?',
      'Ausstattung: Technik, Musik, Heizung, Toiletten, Barrierefreiheit',
      'Mögliche Uhrzeiten und Saison',
    ],
    symbol: 'firma',
  },
  {
    slug: 'workshop-seminar',
    formWert: 'Workshop/Seminar',
    titel: 'Workshop & Seminar an Bord',
    kartenTitel: 'Workshop & Seminar',
    kartenText: 'Klausur, Kreativtag oder Seminar — neue Gedanken an einem neuen Ort.',
    seoTitel: 'Workshop & Seminar auf dem Schiff in Hamburg | MS Wohldorf',
    seoBeschreibung:
      'Tagen mit Weitblick: Workshops, Seminare und Klausuren an Bord der MS Wohldorf in Hamburg — historische Hafenfähre für bis zu 35 Personen.',
    einleitung:
      'Neue Ideen brauchen neue Orte. An Bord der MS Wohldorf denkt es sich freier — mit Wasser vor dem Fenster statt Flipchart vor der Wand.',
    absaetze: [
      'Ob Strategieklausur, Kreativworkshop oder Seminar: Die ehemalige Hafenfähre bietet einen besonderen Rahmen für Gruppen bis zu 35 Personen — weit weg vom Büroalltag und doch mitten in Hamburg.',
      'Wie es an Bord aussieht, sehen Sie vorab im 3D-Rundgang. So planen Sie Ablauf und Gruppengröße mit einem genauen Bild vom Raum.',
    ],
    vorteile: [gemeinsameVorteile.gaeste, gemeinsameVorteile.rundgang, gemeinsameVorteile.geschichte, gemeinsameVorteile.parken],
    offen: [
      'Bestuhlung und Raumaufteilung (z. B. Reihe, U-Form, Gruppentische)',
      'Präsentationstechnik: Bildschirm oder Beamer, Strom, WLAN',
      'Tagespauschalen und Preise',
      'Verpflegung während des Workshops',
    ],
    symbol: 'workshop',
  },
  {
    slug: 'film-und-foto',
    formWert: 'Film & Foto',
    titel: 'Drehort & Fotolocation',
    kartenTitel: 'Film & Foto',
    kartenText: 'Eine Kulisse mit Geschichte — bewährt bei TV-Produktionen und Shootings.',
    seoTitel: 'Drehort & Fotolocation Schiff in Hamburg | MS Wohldorf',
    seoBeschreibung:
      'Drehort mit Charakter: TV-Produktionen und Fotoshootings an Bord der MS Wohldorf, Hamburger Hafenfähre von 1959. Location jetzt anfragen.',
    einleitung:
      'Weißer Aufbau, grünes Dach, Elbwasser ringsum — und eine Geschichte, die man sieht. Die MS Wohldorf war bereits Schauplatz für TV-Produktionen und Fotoshootings.',
    absaetze: [
      'Als originale Hamburger Hafenfähre von 1959 bringt die Wohldorf eine Kulisse mit, die sich nicht nachbauen lässt: Innen wie außen bieten sich Motive mit maritimem Charakter.',
      'Für die Planung Ihres Drehs oder Shootings können Sie das Schiff vorab im 3D-Rundgang erkunden. Sagen Sie uns, was Sie brauchen — wir klären die Details persönlich.',
    ],
    vorteile: [
      { titel: 'Erfahrung mit Produktionen', text: 'TV-Produktionen und Fotoshootings fanden bereits an Bord statt.' },
      gemeinsameVorteile.geschichte,
      gemeinsameVorteile.rundgang,
      gemeinsameVorteile.parken,
    ],
    offen: [
      'Konditionen für Drehtage und Fotoproduktionen',
      'Stromanschluss und Lademöglichkeiten an Bord',
      'Drehgenehmigung am Liegeplatz / Ansprechpartner',
      'Referenzen: Welche Produktionen dürfen genannt werden?',
    ],
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
      'Kultur an Bord: Lesungen, Ausstellungen und kleine Kulturformate auf der MS Wohldorf in Hamburg — historische Hafenfähre für bis zu 35 Gäste.',
    einleitung:
      'Worte und Bilder wirken anders, wenn ringsum Wasser ist. Lesungen und Ausstellungen gehören bereits zum Leben an Bord der MS Wohldorf.',
    absaetze: [
      'Der kompakte Rahmen für bis zu 35 Gäste schafft Nähe zwischen Publikum und Autorinnen, Autoren, Künstlerinnen und Künstlern — ideal für Formate, die vom Gespräch leben.',
      'Sie planen eine Lesung, eine Vernissage oder eine kleine Ausstellung? Schreiben Sie uns, was Ihnen vorschwebt — wir melden uns persönlich bei Ihnen.',
    ],
    vorteile: [
      { titel: 'Kultur an Bord erprobt', text: 'Lesungen und Ausstellungen fanden bereits auf der Wohldorf statt.' },
      gemeinsameVorteile.gaeste,
      gemeinsameVorteile.geschichte,
      gemeinsameVorteile.rundgang,
    ],
    offen: [
      'Hängemöglichkeiten und Wandflächen für Ausstellungen',
      'Licht und Tontechnik für Lesungen',
      'Konditionen für Kulturveranstaltungen',
      'Öffentliche Veranstaltungen mit Ticketverkauf möglich?',
    ],
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
      'Geburtstag, Jubiläum oder Familienfest an Bord der MS Wohldorf: feiern auf einer historischen Hamburger Hafenfähre für bis zu 35 Gäste.',
    einleitung:
      'Runder Geburtstag, Jubiläum oder ein Fest im engsten Kreis: Auf der MS Wohldorf feiern Sie an einem Ort, den Ihre Gäste nicht vergessen.',
    absaetze: [
      'Die überschaubare Größe für bis zu 35 Gäste macht das Schiff zur persönlichen Festlocation — Hamburger Hafenflair inklusive.',
      'Erzählen Sie uns, was Sie planen: Anlass, Wunschtermin und Gästezahl genügen für den Anfang. Wir melden uns persönlich bei Ihnen.',
    ],
    vorteile: [gemeinsameVorteile.gaeste, gemeinsameVorteile.geschichte, gemeinsameVorteile.parken, gemeinsameVorteile.rundgang],
    offen: [
      'Preise für private Feiern',
      'Catering und Getränke',
      'Musik, Lautstärke und späteste Uhrzeit',
      'Dekoration: Was ist möglich?',
    ],
    symbol: 'feier',
  },
];

export const anlassPerSlug = (slug: string) => ANLAESSE.find((a) => a.slug === slug);
