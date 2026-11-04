/**
 * Ratgeber (Blog) als Content Collection: src/content/ratgeber/*.md.
 *
 * Regeln wie überall (CLAUDE.md): nur belegte Angaben — die Quellen jedes
 * Artikels stehen in `quellen` und werden unter dem Artikel gezeigt.
 * `entwurf: true` → nur in der Vorschau sichtbar (mit Hinweis), im
 * Produktions-Build nicht gebaut.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const ratgeber = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ratgeber' }),
  schema: z.object({
    titel: z.string().max(90),
    /** Meta-Beschreibung und Vorspann — die Antwort in einem Satz. */
    beschreibung: z.string().min(70).max(170),
    thema: z.enum(['Planung', 'Anlässe', 'Geschichte']),
    veroeffentlicht: z.coerce.date(),
    aktualisiert: z.coerce.date().optional(),
    /** Foto aus dem Katalog (Dateiname ohne Endung, src/data/bilder.ts) oder 'drohne-2024' / 'sandtorhafen-2017'. */
    titelfoto: z.string(),
    /** Weitere Fotos für die Bildstrecke unter dem Artikel. */
    fotos: z.array(z.string()).default([]),
    /** Vorauswahl der Schnellanfrage am Ende des Artikels. */
    anlass: z.enum(['Firmenevent', 'Workshop/Seminar', 'Film & Foto', 'Lesung/Ausstellung', 'Private Feier', 'Sonstiges']).default('Sonstiges'),
    quellen: z.array(z.object({ titel: z.string(), url: z.url().optional() })).min(1),
    entwurf: z.boolean().default(false),
  }),
});

export const collections = { ratgeber };
