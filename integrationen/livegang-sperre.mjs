// @ts-check
/**
 * Livegang-Sperre: Ein Produktions-Build veröffentlicht keine rechtliche Lücke.
 *
 * Im Produktions-Build (ohne PUBLIC_VORSCHAU=1) tragen
 *   - rechtliche Platzhalter (<Platzhalter pflicht>, src/components/Platzhalter.astro) und
 *   - der Entwurf-Hinweis der Datenschutzerklärung (ENTWURF_HINWEIS_ANZEIGEN, EntwurfHinweis.astro)
 * das Attribut data-livegang-sperre="…". Diese Integration sucht es nach dem
 * Bau in allen HTML-Dateien — also in genau dem, was veröffentlicht würde —
 * und bricht den Build ab: mit Seite und Text jeder offenen Stelle.
 *
 * Im Vorschau-Build fehlt das Attribut (die Komponenten lesen VORSCHAU aus
 * src/config.ts): Die Kästen bleiben sichtbar, der Build läuft durch — mit
 * noindex und „Vorschau“-Band.
 *
 * Steht in astro.config.mjs als LETZTE Integration: Sitemap und _headers sind
 * dann geschrieben, dist/ ist vollständig (für `npm run pruefen`). Veröffentlicht
 * wird ein abgebrochener Build trotzdem nicht: Netlify zeigt weiter den letzten
 * erfolgreichen Stand.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @param {string} ordner
 * @returns {Promise<string[]>}
 */
async function htmlDateien(ordner) {
  /** @type {string[]} */
  const liste = [];
  for (const e of await readdir(ordner, { withFileTypes: true })) {
    const pfad = join(ordner, e.name);
    if (e.isDirectory()) liste.push(...(await htmlDateien(pfad)));
    else if (e.name.endsWith('.html')) liste.push(pfad);
  }
  return liste.sort();
}

/** @type {Record<string, string>} */
const ENTITAETEN = { '&amp;': '&', '&#38;': '&', '&quot;': '"', '&#34;': '"', '&lt;': '<', '&gt;': '>', '&#39;': "'" };

/**
 * „datenschutz/index.html“ → „/datenschutz/“, „404.html“ → „/404.html“.
 * @param {string} datei Pfad relativ zum Ausgabeordner
 */
export function seitenPfad(datei) {
  const p = datei.split(sep).join('/');
  if (p === 'index.html') return '/';
  if (p.endsWith('/index.html')) return `/${p.slice(0, -'index.html'.length)}`;
  return `/${p}`;
}

/**
 * Alle Sperr-Gründe einer HTML-Seite (Klartext aus data-livegang-sperre).
 * @param {string} html
 * @returns {string[]}
 */
export function sperrGruende(html) {
  return [...html.matchAll(/\sdata-livegang-sperre="([^"]*)"/g)].map((m) => m[1].replace(/&(?:amp|quot|lt|gt|#38|#34|#39);/g, (e) => ENTITAETEN[e]));
}

/**
 * @param {{ seite: string; grund: string }[]} funde
 * @returns {string}
 */
export function sperrMeldung(funde) {
  const breite = Math.max(...funde.map((f) => f.seite.length));
  return [
    `LIVEGANG GESPERRT — ${funde.length} rechtliche Angabe(n) offen. Ein Produktions-Build darf so nicht veröffentlicht werden:`,
    '',
    ...funde.map((f) => `  ${f.seite.padEnd(breite)}  ${f.grund}`),
    '',
    'Was tun?',
    '  • Angaben ergänzen und den Platzhalter entfernen — alle Stellen: npm run offen (Abschnitt „Pflicht“), OFFENE-ANGABEN.md Abschnitt A.',
    '  • Bis dahin nur als Vorschau bauen: PUBLIC_VORSCHAU=1 (noindex + „Vorschau“-Band, Kästen sichtbar, Build läuft durch).',
    '    Netlify: unter Site configuration → Environment variables für den Kontext „Production“ PUBLIC_VORSCHAU = 1 setzen (README).',
  ].join('\n');
}

/** @returns {import('astro').AstroIntegration} */
export default function livegangSperre() {
  return {
    name: 'mswohldorf-livegang-sperre',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const ziel = fileURLToPath(dir);
        /** @type {{ seite: string; grund: string }[]} */
        const funde = [];
        let kaesten = 0;
        for (const datei of await htmlDateien(ziel)) {
          const html = await readFile(datei, 'utf8');
          kaesten += (html.match(/\sdata-platzhalter="pflicht"|\sdata-entwurf-hinweis[\s>]/g) ?? []).length;
          for (const grund of sperrGruende(html)) funde.push({ seite: seitenPfad(relative(ziel, datei)), grund });
        }
        if (funde.length > 0) {
          logger.error(sperrMeldung(funde));
          const fehler = new Error(`Livegang gesperrt: ${funde.length} rechtliche Angabe(n) offen (Liste oben). Vorschau statt Produktion: PUBLIC_VORSCHAU=1.`);
          fehler.stack = fehler.message;
          throw fehler;
        }
        if (kaesten > 0) logger.warn(`Vorschau-Build: ${kaesten} rechtliche Stelle(n) noch offen — ein Produktions-Build wäre gesperrt (npm run offen).`);
        else logger.info('Keine offenen rechtlichen Angaben — Livegang frei.');
      },
    },
  };
}
