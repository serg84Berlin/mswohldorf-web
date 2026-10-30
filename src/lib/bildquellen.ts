import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

export interface GrossesBild {
  avif: string;
  webp: string;
  src: string;
  breite: number;
  hoehe: number;
}

/** Quellen für die Lightbox: AVIF/WebP in mehreren Breiten, nie größer als das Original. */
export async function grosseQuellen(bild: ImageMetadata): Promise<GrossesBild> {
  const breiten = [960, 1600, 2400].filter((b) => b < bild.width);
  breiten.push(Math.min(bild.width, 2400));
  const eindeutig = [...new Set(breiten)];
  const satz = async (format: 'avif' | 'webp') =>
    (
      await Promise.all(
        eindeutig.map(async (w) => `${(await getImage({ src: bild, width: w, format, quality: format === 'avif' ? 60 : 78 })).src} ${w}w`),
      )
    ).join(', ');
  const rueckfall = await getImage({ src: bild, width: Math.min(bild.width, 1600), format: 'webp', quality: 78 });
  return { avif: await satz('avif'), webp: await satz('webp'), src: rueckfall.src, breite: bild.width, hoehe: bild.height };
}
