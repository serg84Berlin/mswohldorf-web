/**
 * Alle Fotos der Website an einer Stelle.
 *
 * - Fotos der bisherigen Website: liegen unverändert in quelle/alte-seite/dateien/
 *   (Quelle der Wahrheit) und werden von dort direkt eingebunden; Katalog mit
 *   Alt-Texten in galerie.json (erzeugt von scripts/alte-seite-holen.mjs).
 *   Bildnachweis laut altem Impressum: „Wohldorf: Andrea Klick“.
 * - Zwei Standbilder aus den eigenen Videos (YouTube-Vorschaubilder).
 */
import type { ImageMetadata } from 'astro';
import drohne2024 from '../assets/video/ms-wohldorf-2024.jpg';
import sandtorhafen2017 from '../assets/video/einlaufen-sandtorhafen-2017.jpg';
import katalog from './galerie.json';

export type Kategorie = 'aussen' | 'innen' | 'ueberfahrt' | 'umbau' | 'startseite' | 'video';

export interface Foto {
  bild: ImageMetadata;
  alt: string;
  titel?: string;
  kategorie: Kategorie;
  /** Pfad unter quelle/alte-seite/dateien/ bzw. Herkunft. */
  quelle: string;
}

interface KatalogEintrag {
  datei: string;
  kategorie: Kategorie;
  galerie: string;
  alt?: string;
  altOriginal?: string;
  titel?: string;
}

const dateien = import.meta.glob<{ default: ImageMetadata }>('../../quelle/alte-seite/dateien/images/**/*.{jpg,jpeg,png}', { eager: true });

/** Bild aus quelle/alte-seite/dateien/ — bricht den Build ab, wenn es fehlt. */
export function altesBild(pfad: string): ImageMetadata {
  const m = dateien[`../../quelle/alte-seite/dateien/${pfad}`];
  if (!m) throw new Error(`Bild fehlt in quelle/alte-seite/dateien/: ${pfad}`);
  return m.default;
}

const ERSATZ_ALT: Record<Kategorie, string> = {
  aussen: 'Außenbereich der MS Wohldorf am Liegeplatz an der Süderelbe.',
  innen: 'Innenraum der MS Wohldorf.',
  ueberfahrt: 'Einzug der MS Wohldorf in den Sandtorhafen, Mai 2017.',
  umbau: 'Die MS Wohldorf während des Umbaus 2016.',
  startseite: 'Innenraum der MS Wohldorf.',
  video: 'Standbild aus einem Video der MS Wohldorf.',
};

const TITEL: Record<Kategorie, string> = {
  aussen: 'Außenbereich',
  innen: 'Die MS Wohldorf von innen',
  ueberfahrt: 'Einzug in den Sandtorhafen, Mai 2017',
  umbau: 'Der Umbau 2016',
  startseite: 'An Bord',
  video: 'Aus den Videos',
};

export const KATALOG: Foto[] = (katalog.bilder as KatalogEintrag[]).map((e) => ({
  bild: altesBild(e.datei),
  alt: e.alt?.trim() || ERSATZ_ALT[e.kategorie],
  titel: e.titel ?? TITEL[e.kategorie],
  kategorie: e.kategorie,
  quelle: e.datei,
}));

const perDatei = new Map(KATALOG.map((f) => [f.quelle.split('/').pop()!.replace(/\.jpe?g$/, ''), f]));
/** Foto per Dateiname ohne Endung, z. B. foto('wohldorf_innen_21'). */
export function foto(name: string): Foto {
  const f = perDatei.get(name);
  if (!f) throw new Error(`Foto nicht im Katalog: ${name}`);
  return f;
}

export const FOTO_DROHNE_2024: Foto = {
  bild: drohne2024,
  alt: 'Die MS Wohldorf von oben an ihrem Liegeplatz an der Süderelbe: weißer Aufbau, grünes Dach, Hamburg-Flagge am Mast, daneben Ponton und Gangway.',
  titel: 'Standbild aus dem Video „MS Wohldorf 2024“',
  kategorie: 'video',
  quelle: 'YouTube-Vorschaubild HvahxVqWtg0 (Kanal Finanzelot)',
};

export const FOTO_SANDTORHAFEN_2017: Foto = {
  bild: sandtorhafen2017,
  alt: 'Mai 2017: Die MS Wohldorf fährt in den Sandtorhafen ein — links die Elbphilharmonie, im Hintergrund die Kräne des Hafens.',
  titel: 'Standbild aus dem Video „Einfahrt in den Sandtorhafen“',
  kategorie: 'video',
  quelle: 'YouTube-Vorschaubild 2ksTeXx8_DA (Kanal ulrichritter)',
};

/** Weitere Bilder der alten Seite (Social-Bild, TV, Presse, Stimmen). */
export const ALTE_BILDER = {
  social: altesBild('images/og_wohldorf.jpg'),
  tv: altesBild('images/ndr-pfefferkoerner-wohldorf.jpg'),
  logoWww: altesBild('images/www23_logo.jpg'),
  logoOeoo: altesBild('images/oeoo_logo.jpg'),
};

/* ------------------------------------------------------------------
   Auswahl je Ort der Seite (Dateinamen ohne Endung)
   ------------------------------------------------------------------ */
const liste = (namen: string[]) => namen.map(foto);

/** Start: die Galerie der alten Startseite (ohne die drei Sanitär-Bilder). */
export const FOTOS_START = liste(['wohldorf01', 'wohldorf02', 'wohldorf03', 'wohldorf04', 'wohldorf05', 'wohldorf06']);

/** 3D-Karussell auf /galerie/: Höhepunkte aus allen Galerien. */
export const FOTOS_KARUSSELL = liste([
  'wohldorf-schiffs-location-118',
  'wohldorf_innen_21',
  'wohldorf_ueberfahrt-hamburg_11',
  'wohldorf_umbau_02',
  'wohldorf_innen_08',
  'wohldorf-schiffs-location-114',
  'wohldorf_innen_31',
  'wohldorf_ueberfahrt-hamburg_14',
  'wohldorf_innen_22',
  'wohldorf-schiffs-location-108',
  'wohldorf_innen_10',
  'wohldorf_umbau_06',
]);

/** Anlass-Seiten: Außenbereich → Firmenevent, Film & Foto; Innen → Workshop, Lesung/Ausstellung, Private Feier. */
const ANLASS_FOTOS: Record<string, string[]> = {
  firmenevent: ['wohldorf-schiffs-location-118', 'wohldorf-schiffs-location-105', 'wohldorf-schiffs-location-114', 'wohldorf-schiffs-location-101', 'wohldorf-schiffs-location-107', 'wohldorf-schiffs-location-108'],
  'film-und-foto': ['wohldorf-schiffs-location-114', 'wohldorf-schiffs-location-113', 'wohldorf-schiffs-location-110', 'wohldorf-schiffs-location-103', 'wohldorf-schiffs-location-116', 'wohldorf-schiffs-location-115'],
  'workshop-seminar': ['wohldorf_innen_18', 'wohldorf_innen_19', 'wohldorf_innen_31', 'wohldorf_innen_15', 'wohldorf_innen_32', 'wohldorf_innen_10'],
  'lesung-ausstellung': ['wohldorf_innen_21', 'wohldorf_innen_22', 'wohldorf_innen_14', 'wohldorf_innen_24', 'wohldorf_innen_29', 'wohldorf_innen_26'],
  'private-feier': ['wohldorf_innen_31', 'wohldorf_innen_08', 'wohldorf_innen_16', 'wohldorf_innen_07', 'wohldorf_innen_21', 'wohldorf_innen_13'],
};

export function fotosFuerAnlass(slug: string): Foto[] {
  return liste(ANLASS_FOTOS[slug] ?? []);
}

/** /galerie/: Abschnitte wie auf der alten Seite (ohne die Startseiten-Dubletten). */
export const GALERIE_ABSCHNITTE: { id: string; titel: string; text: string; fotos: Foto[] }[] = [
  { id: 'aussen', titel: 'Außenbereich', text: 'Ponton, Gangway und die Süderelbe — so empfängt die Wohldorf ihre Gäste.', fotos: KATALOG.filter((f) => f.kategorie === 'aussen') },
  { id: 'innen', titel: 'Von innen', text: 'Teak, Eiche, Vintage-Möbel und Fenster rundum.', fotos: KATALOG.filter((f) => f.kategorie === 'innen') },
  { id: 'sandtorhafen', titel: 'Einzug in den Sandtorhafen, Mai 2017', text: 'Vom Elbstrom in die HafenCity, vorbei an der Elbphilharmonie.', fotos: KATALOG.filter((f) => f.kategorie === 'ueberfahrt') },
  { id: 'umbau', titel: 'Der Umbau 2016', text: 'Aufgebockt auf der Werft: Rumpf, Propeller und Ruder.', fotos: KATALOG.filter((f) => f.kategorie === 'umbau') },
  { id: 'video', titel: 'Aus den Videos', text: 'Standbilder aus den eigenen Filmen von 2017 und 2024.', fotos: [FOTO_DROHNE_2024, FOTO_SANDTORHAFEN_2017] },
];

export const ANZAHL_FOTOS = GALERIE_ABSCHNITTE.reduce((n, a) => n + a.fotos.length, 0);
