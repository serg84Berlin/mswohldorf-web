/**
 * Alle Fotos der Website an einer Stelle.
 *
 * - Galerie: Dateien unter src/assets/galerie/** (von scripts/alte-seite-holen.mjs
 *   aus der bisherigen Website übernommen), Beschreibungen in galerie.json.
 * - Standbilder der beiden eigenen Videos (YouTube-Vorschaubilder, Kanal
 *   Finanzelot bzw. ulrichritter) — bis die Galerie da ist, die einzigen Fotos.
 */
import type { ImageMetadata } from 'astro';
import drohne2024 from '../assets/video/ms-wohldorf-2024.jpg';
import sandtorhafen2017 from '../assets/video/einlaufen-sandtorhafen-2017.jpg';
import galerieDaten from './galerie.json';

export interface Foto {
  bild: ImageMetadata;
  alt: string;
  titel?: string;
  /** Slugs der Anlass-Seiten, zu denen das Foto passt. */
  anlaesse: string[];
  quelle: string;
}

interface GalerieEintrag {
  datei: string;
  alt?: string;
  titel?: string;
  anlaesse?: string[];
}

export const FOTO_DROHNE_2024: Foto = {
  bild: drohne2024,
  alt: 'Die MS Wohldorf von oben an ihrem Liegeplatz: weißer Aufbau, grünes Dach, Hamburg-Flagge am Mast, daneben Ponton und Gangway.',
  titel: 'Die Wohldorf von oben (Standbild aus dem Film „MS Wohldorf 2024")',
  anlaesse: ['firmenevent', 'workshop-seminar', 'film-und-foto', 'lesung-ausstellung', 'private-feier'],
  quelle: 'YouTube-Vorschaubild HvahxVqWtg0 (Kanal Finanzelot)',
};

export const FOTO_SANDTORHAFEN_2017: Foto = {
  bild: sandtorhafen2017,
  alt: 'Mai 2017: Die MS Wohldorf läuft in den Sandtorhafen ein — links die Elbphilharmonie, im Hintergrund die Kräne des Hafens.',
  titel: 'Einlaufen im Sandtorhafen, 2017',
  anlaesse: ['film-und-foto'],
  quelle: 'YouTube-Vorschaubild 2ksTeXx8_DA (Kanal ulrichritter)',
};

const dateien = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/galerie/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);

const eintraege = (galerieDaten as { bilder: GalerieEintrag[] }).bilder;

function galerieFotos(): Foto[] {
  const fotos: Foto[] = [];
  for (const [pfad, modul] of Object.entries(dateien)) {
    const datei = pfad.replace('../assets/galerie/', '');
    const e = eintraege.find((x) => x.datei === datei);
    fotos.push({
      bild: modul.default,
      alt: e?.alt?.trim() || 'Foto der MS Wohldorf',
      titel: e?.titel,
      anlaesse: e?.anlaesse ?? [],
      quelle: `bisherige Website, images/galerie/${datei}`,
    });
  }
  // Reihenfolge wie in galerie.json (= wie auf der alten Seite), Rest dahinter.
  const index = (f: Foto) => {
    const i = eintraege.findIndex((x) => f.quelle.endsWith(x.datei));
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return fotos.sort((a, b) => index(a) - index(b));
}

/** Alle Fotos für Galerie und Lightbox. */
export const FOTOS: Foto[] = [...galerieFotos(), FOTO_DROHNE_2024, FOTO_SANDTORHAFEN_2017];

/** Wie viele Galerie-Fotos der alten Website schon übernommen sind. */
export const ANZAHL_UEBERNOMMEN = Object.keys(dateien).length;

export function fotosFuerAnlass(slug: string, anzahl = 6): Foto[] {
  const passend = FOTOS.filter((f) => f.anlaesse.includes(slug));
  return (passend.length ? passend : FOTOS).slice(0, anzahl);
}
