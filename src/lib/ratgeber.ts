/**
 * Ratgeber-Artikel laden: Entwürfe (`entwurf: true`) nur in der Vorschau,
 * neueste zuerst. Gemeinsam für Übersicht, Artikelseiten, Sitemap-Liste und llms.txt.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { VORSCHAU } from '../config';

export type Artikel = CollectionEntry<'ratgeber'>;

export async function ratgeberArtikel(): Promise<Artikel[]> {
  const alle = await getCollection('ratgeber', (a) => VORSCHAU || !a.data.entwurf);
  return alle.sort((a, b) => b.data.veroeffentlicht.getTime() - a.data.veroeffentlicht.getTime());
}

export const datumLang = (d: Date) => d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin' });
export const datumIso = (d: Date) => d.toISOString().slice(0, 10);
