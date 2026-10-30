/**
 * Stationen der Geschichte. Belegt: Baujahr 1959 als HADAG-Hafenfähre,
 * Umbau 2016, Einlaufen im Sandtorhafen Mai 2017 (eigenes Video),
 * Basislager für Boris Herrmann, TV-Produktionen, heutiger Liegeplatz
 * (Navi-Hinweis der alten Website). Lücken → `offen` (Platzhalter).
 */
import type { Foto } from './bilder';
import { FOTO_DROHNE_2024, FOTO_SANDTORHAFEN_2017 } from './bilder';
import { MEDIEN } from '../config';

export interface Station {
  marke: string;
  titel: string;
  kurz: string;
  lang: string;
  foto?: Foto;
  link?: { href: string; text: string };
  offen?: string;
}

export const STATIONEN: Station[] = [
  {
    marke: '1959',
    titel: 'Gebaut für den Hamburger Hafen',
    kurz: 'Die Wohldorf entsteht als Hafenfähre für die HADAG.',
    lang: 'Die Wohldorf wird 1959 als Hafenfähre der HADAG gebaut — ein Stück Hamburger Alltagsgeschichte auf dem Wasser.',
    offen: 'Werft, Indienststellung und Einsatzzeit bei der HADAG',
  },
  {
    marke: '2016',
    titel: 'Der Umbau',
    kurz: 'Die ehemalige Hafenfähre wird umgebaut — ihr zweites Leben beginnt.',
    lang: '2016 wird die ehemalige Hafenfähre umgebaut. Seitdem ist die Wohldorf kein Verkehrsmittel mehr, sondern ein Ort für Begegnungen, Arbeit und Kultur.',
    offen: 'Was wurde beim Umbau gemacht (Innenausbau, Technik, Werft)?',
  },
  {
    marke: 'Mai 2017',
    titel: 'Einlaufen im Sandtorhafen',
    kurz: 'Die Wohldorf zieht in den Sandtorhafen — mitten in die HafenCity.',
    lang: 'Im Mai 2017 läuft die Wohldorf in den Sandtorhafen ein, in Sichtweite der Elbphilharmonie. Der Moment ist im Video festgehalten.',
    foto: FOTO_SANDTORHAFEN_2017,
  },
  {
    marke: 'Segelsport',
    titel: 'Basislager für Boris Herrmann',
    kurz: 'Die Wohldorf dient dem Hochseesegler Boris Herrmann als Basislager.',
    lang: 'Die Wohldorf dient als Basislager für den Hamburger Hochseesegler Boris Herrmann und sein Team Malizia.',
    link: { href: MEDIEN.malizia.url, text: 'Video von Team Malizia auf YouTube' },
    offen: 'Zeitraum und was das Team an Bord gemacht hat',
  },
  {
    marke: 'Film & TV',
    titel: 'Bühne für Fernsehen und Fotografie',
    kurz: 'TV-Produktionen und Fotoshootings nutzen das Schiff als Kulisse.',
    lang: 'TV-Produktionen und Fotoshootings haben die Wohldorf als Kulisse entdeckt — dazu Lesungen, Ausstellungen und vieles mehr.',
    offen: 'Welche Sender/Produktionen und Jahre dürfen genannt werden?',
  },
  {
    marke: 'Heute',
    titel: 'Am Liegeplatz an der Süderelbe',
    kurz: 'Heute liegt die Wohldorf in Finkenriek — bereit für Ihren Anlass.',
    lang: 'Heute liegt die Wohldorf an der Süderelbe in Finkenriek (Hamburg-Wilhelmsburg), am Naturschutzgebiet Heuckenlock — bereit für Veranstaltungen mit bis zu 35 Gästen.',
    foto: FOTO_DROHNE_2024,
    offen: 'Seit wann liegt die Wohldorf in Finkenriek? Liegeplatz bitte bestätigen.',
  },
];
