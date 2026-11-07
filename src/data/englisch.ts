/**
 * Englische Inhalte (/en/, /en/faq/) — Übersetzungen derselben belegten Angaben
 * wie auf den deutschen Seiten (src/data/fragen.ts, anreise.ts, anlaesse.ts).
 * Nichts Neues behaupten: Ändert sich ein Fakt, hier mitziehen. Britisches Englisch.
 */
import { FAKTEN, KONTAKT, LIEGEPLATZ, AUSSTATTUNG } from '../config';
import { ANREISE } from './anreise';
import type { AnlassWert } from './typen';

export const SEITE_EN = {
  titel: 'MS Wohldorf — Event ship in Hamburg for up to 35 guests',
  beschreibung: `The MS Wohldorf: a 1959 HADAG harbour ferry, converted in 2016 — today an event ship in Hamburg for up to ${FAKTEN.maxGaeste} guests. For corporate events, offsites, workshops, film and photo shoots, readings, exhibitions and private celebrations.`,
} as const;

export const BESCHREIBUNG_LIEGEPLATZ_EN = 'on the Süderelbe river in Finkenriek (Hamburg-Wilhelmsburg), next to the Heuckenlock nature reserve';

export const ANLAESSE_EN: { wert: AnlassWert; slug: string; titel: string; text: string }[] = [
  { wert: 'Firmenevent', slug: 'firmenevent', titel: 'Corporate events', text: 'Team evening, client reception or business dinner — with genuine harbour character.' },
  { wert: 'Workshop/Seminar', slug: 'workshop-seminar', titel: 'Workshops & seminars', text: 'Presentation, brainstorming day or workshop — new ideas in a new place.' },
  { wert: 'Film & Foto', slug: 'film-und-foto', titel: 'Film & photo', text: 'A set with history — already used for television and photo shoots.' },
  { wert: 'Lesung/Ausstellung', slug: 'lesung-ausstellung', titel: 'Readings & exhibitions', text: 'Culture up close: words and images in a special atmosphere.' },
  { wert: 'Private Feier', slug: 'private-feier', titel: 'Private celebrations', text: 'Birthday, anniversary or family gathering — celebrate in a place with history.' },
];

export const ROUTE_EN = [
  { ort: 'Berlin Hbf', mittel: 'ICE train', dauer: 'just under two hours' },
  { ort: 'Hamburg Hbf', mittel: 'Taxi or car', dauer: `${ANREISE.hbfKm} km · 15 to 25 minutes` },
  { ort: 'MS Wohldorf', mittel: '', dauer: '' },
] as const;

export interface FrageEn {
  id: string;
  frage: string;
  antwort: string;
  link?: { href: string; text: string };
  start?: boolean;
}

export const FRAGEN_EN: FrageEn[] = [
  {
    id: 'guests',
    frage: 'How many guests fit on the MS Wohldorf?',
    antwort: `Up to ${FAKTEN.maxGaeste} people. That suits teams, departments, selected client groups and smaller celebrations.`,
    start: true,
  },
  {
    id: 'berth',
    frage: 'Where is the MS Wohldorf?',
    antwort: `At the ${LIEGEPLATZ.name} pier: the MS Wohldorf lies ${BESCHREIBUNG_LIEGEPLATZ_EN}. Satnav address: ${LIEGEPLATZ.navi}. A small private road leads to the berth, and there are ${AUSSTATTUNG.parkplaetze} parking spaces right outside.`,
  },
  {
    id: 'equipment',
    frage: 'Is there Wi-Fi and a sound system on board?',
    antwort:
      'Yes. Wi-Fi and a PA system for music and announcements are on board. You are welcome to bring your own music, including your own DJ. Anything beyond that, such as presentation equipment, we arrange with you personally.',
  },
  {
    id: 'sailing',
    frage: 'Does the ship sail during the event?',
    antwort: 'No. The Wohldorf no longer runs under her own power — your event takes place at the berth on the Süderelbe.',
  },
  {
    id: 'occasions',
    frage: 'What occasions can the MS Wohldorf be hired for?',
    antwort:
      'Corporate events, workshops and seminars, film and photo productions, readings and exhibitions, and private celebrations. The ship has also hosted TV productions, presentations, brainstorming days and business dinners, and served as a base camp.',
  },
  {
    id: 'berlin',
    frage: 'How do I get to the MS Wohldorf from Berlin?',
    antwort: `By ICE train from Berlin Hbf to Hamburg Hbf in just under two hours. From there it is about ${ANREISE.hbfKm} km to the berth — 15 to 25 minutes by taxi or car, depending on traffic. From Hamburg Airport it is about ${ANREISE.flughafenKm} km, roughly half an hour.`,
    start: true,
  },
  {
    id: 'kitchen',
    frage: 'Is there a kitchen on board?',
    antwort: 'Yes, there is a kitchen with appliances on board — good for business dinners and celebrations. Food and drinks are arranged with you individually.',
    start: true,
  },
  {
    id: 'rooms',
    frage: 'What rooms are there on board?',
    antwort: 'The main deck has a large event area and a smaller, glazed meeting room; the upper deck has the office with galley.',
    start: true,
  },
  {
    id: 'winter',
    frage: 'Can we meet or celebrate on board in winter?',
    antwort: 'Yes. The ship has central heating with cast-iron radiators.',
  },
  {
    id: 'access',
    frage: 'Is the ship barrier-free?',
    antwort: 'No, access to the MS Wohldorf is not barrier-free.',
  },
  {
    id: 'viewing',
    frage: 'Can I see the ship beforehand?',
    antwort: 'Yes — in the 3D tour you can move freely through the ship. It was recorded at the former berth in the Sandtorhafen. A viewing can be arranged personally.',
    link: { href: '/#rundgang', text: 'Open the 3D tour' },
  },
  {
    id: 'history',
    frage: 'What makes the MS Wohldorf special?',
    antwort: `She is a genuine ${FAKTEN.baujahr} HADAG harbour ferry: built for up to ${FAKTEN.fahrgaesteFrueher} passengers and converted into an office and event ship in ${FAKTEN.umbau}. She is also known from the NDR television series “Die Pfefferkörner”.`,
  },
  {
    id: 'prices',
    frage: 'How much does it cost to hire the MS Wohldorf?',
    antwort: 'That depends on the occasion, duration and number of guests. Tell us briefly what you are planning — we will get back to you personally with an offer.',
    start: true,
  },
  {
    id: 'enquiry',
    frage: 'How do I enquire about a date?',
    antwort: `Via the enquiry form, by email to ${KONTAKT.mail} or by phone on ${KONTAKT.telefon}. The occasion, preferred date and number of guests are enough to start with.`,
    link: { href: '/en/#enquiry', text: 'Go to the enquiry form' },
  },
];
