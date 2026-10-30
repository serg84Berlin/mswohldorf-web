import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

export interface GrossesBild {
  /** leer = kein AVIF (Galerie-Fotos nur als WebP, das hält den Build schnell). */
  avif: string;
  webp: string;
  src: string;
  breite: number;
  hoehe: number;
}

/** Quellen für die Lightbox: WebP in zwei Breiten, nie größer als das Original. */
export async function grosseQuellen(bild: ImageMetadata): Promise<GrossesBild> {
  const breiten = [...new Set([960, Math.min(bild.width, 1600)].filter((b) => b <= bild.width))];
  const webp = (
    await Promise.all(breiten.map(async (w) => `${(await getImage({ src: bild, width: w, format: 'webp', quality: 78 })).src} ${w}w`))
  ).join(', ');
  const rueckfall = await getImage({ src: bild, width: Math.min(bild.width, 1600), format: 'webp', quality: 78 });
  return { avif: '', webp, src: rueckfall.src, breite: bild.width, hoehe: bild.height };
}
