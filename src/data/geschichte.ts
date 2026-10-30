/**
 * Stationen der Geschichte. Quellen (siehe INHALT.md):
 *   AS  = alte Website (quelle/alte-seite/texte.md)
 *   B19 = Presse-PDF „Alles unter einem Dach“, boote, Mai 2019
 *   UM  = Presse-PDF „Büro ahoi!“, Umbauen + Modernisieren
 *   KS  = Kundenstimmen auf der alten Website
 * `nurLang`: nur auf /geschichte/, nicht in der Kurzfassung der Startseite.
 */
import type { Foto } from './bilder';
import { ALTE_BILDER, FOTO_DROHNE_2024, foto } from './bilder';
import { MEDIEN } from '../config';

export interface Station {
  marke: string;
  titel: string;
  kurz: string;
  lang: string;
  foto?: Foto;
  link?: { href: string; text: string; extern?: boolean };
  offen?: string;
  nurLang?: boolean;
}

const tvFoto: Foto = {
  bild: ALTE_BILDER.tv,
  alt: 'Standbild aus „Die Pfefferkörner“: Szene an Deck der Wohldorf mit Wimpelketten.',
  titel: 'Standbild: NDR',
  kategorie: 'video',
  quelle: 'images/ndr-pfefferkoerner-wohldorf.jpg',
};

export const STATIONEN: Station[] = [
  {
    marke: '1959',
    titel: 'In Dienst: eine HADAG-Hafenfähre',
    kurz: 'Die Wohldorf geht 1959 als HADAG-Hafenfähre in Betrieb.',
    // AS: „1959 in Betrieb genommen“, „DES für Diesel Elektrisches Schiff“, Pendler/Touristen/Einheimische. B19: 30 m, Typ III, bis zu 607 Fahrgäste, „600er“.
    lang: 'Die Wohldorf wird 1959 in Betrieb genommen — ein diesel-elektrisches Schiff (DES) aus der Typ-III-Serie der HADAG, 30 Meter lang, gebaut für bis zu 607 Fahrgäste. Viele Jahre bringt sie Pendler, Touristen und Hamburger über die Elbe.',
    link: { href: MEDIEN.lebenslauf, text: 'Lebenslauf der Wohldorf auf elbdampfer-hamburg.de', extern: true },
  },
  {
    marke: 'Danach',
    titel: 'Restaurantschiff und Hausboot',
    kurz: 'Nach dem Fahrbetrieb: Restaurantschiff, dann Hausboot.',
    // B19
    lang: 'Nach dem Fahrbetrieb wird sie Ende der Achtziger zum Restaurantschiff „Wappen von Büsum“ und dient danach fast ein Jahrzehnt als Hausboot in Wilhelmshaven.',
    nurLang: true,
  },
  {
    marke: '2016',
    titel: 'Der Umbau',
    kurz: 'Neuer Eigner, großer Umbau — zum Büro- und Veranstaltungsschiff.',
    // B19: Kauf Januar 2016, anderthalb Jahre Arbeit in Finkenwerder bis Mai 2017; Abwasser, Frischwasser, Sanitär, Heizung, Holzboden.
    lang: 'Im Januar 2016 kauft Ulrich Ritter die Fähre. Anderthalb Jahre wird sie in Finkenwerder von Grund auf erneuert — Frisch- und Abwasser, Sanitäranlagen, Heizung, Elektrik und ein neuer Holzboden. Heraus kommt ein Büro- und Veranstaltungsschiff.',
    foto: foto('wohldorf_umbau_02'),
  },
  {
    marke: 'Mai 2017',
    titel: 'Einzug in den Sandtorhafen',
    kurz: 'Die Wohldorf zieht in den Traditionsschiffhafen — mitten in der HafenCity.',
    // AS: „Einzug in den Sandtorhafen in Hamburg 2017“, Video „Einfahrt in den Sandtorhafen, Mai 2017“; B19: Liegeplatz Traditionsschiffhafen Sandtorhafen.
    lang: 'Im Mai 2017 läuft die Wohldorf in den Traditionsschiffhafen im Sandtorhafen ein, in Sichtweite der Elbphilharmonie. Der Moment ist im Video und in der Galerie festgehalten.',
    foto: foto('wohldorf_ueberfahrt-hamburg_10'),
  },
  {
    marke: 'Segelsport',
    titel: 'Basislager für Boris Herrmann',
    kurz: 'Basislager beim Malizia Ocean Festival.',
    // AS: „Die MS Wohldorf als Basislager für Boris Herrmann“ — Malizia Ocean Festival, Vorbereitung auf die Schiffstaufe.
    lang: 'Beim Malizia Ocean Festival dient die Wohldorf dem Team des Hochseeseglers Boris Herrmann als Basislager — bei den Vorbereitungen auf die Schiffstaufe.',
    link: { href: MEDIEN.malizia.url, text: 'Das offizielle Video auf YouTube', extern: true },
  },
  {
    marke: '2020–2023',
    titel: 'Lernort für Hamburgs Schulklassen',
    kurz: 'Jedes Jahr Mikroplastik-Workshops der Bildungswoche an Bord.',
    // KS: Wetter.Wasser.Waterkant 2020–2023, One Earth – One Ocean e.V., 2023 über 500 Schüler:innen.
    lang: 'In den letzten Septemberwochen 2020 bis 2023 ist die Wohldorf Herzstück der Hamburger Bildungswoche „Wetter.Wasser.Waterkant“: Der Verein One Earth – One Ocean gibt an Bord Mikroplastik-Workshops — 2023 erleben weit über 500 Schülerinnen und Schüler das Programm im Sandtorhafen.',
    nurLang: true,
  },
  {
    marke: 'Film & TV',
    titel: 'Im Fernsehen: Die Pfefferkörner',
    kurz: '„Statist“ in der NDR-Serie „Die Pfefferkörner“.',
    // AS: „Staffel 19 – Folge 246: Spätfolgen“, NDR-Mediathek.
    lang: 'Die Wohldorf spielt als „Statist“ in einer Folge der NDR-Serie „Die Pfefferkörner“ mit: Staffel 19, Folge 246 „Spätfolgen“. Auch Fotoshootings und Lesungen finden an Bord statt.',
    foto: tvFoto,
    link: { href: MEDIEN.tv.url, text: 'Zur Folge in der NDR-Mediathek', extern: true },
  },
  {
    marke: 'Heute',
    titel: 'Auf der Süderelbe',
    kurz: 'Fernab vom Trubel: Liegeplatz auf der Süderelbe.',
    // AS: „Bis Sommer 2024 war sie immernoch Bestandteil des Hamburger Hafens … dient als Büro und Veranstaltungsschiff … fernab des ganzen Trubels auf der Süderelbe.“
    lang: 'Bis Sommer 2024 gehört die Wohldorf zum Hamburger Hafen. Heute liegt sie fernab vom Trubel auf der Süderelbe in Finkenriek — weiter als Büro- und Veranstaltungsschiff, für bis zu 35 Gäste.',
    foto: FOTO_DROHNE_2024,
  },
];
