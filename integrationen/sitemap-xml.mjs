// @ts-check
/**
 * Stellt die Sitemap zusätzlich unter /sitemap.xml bereit.
 *
 * @astrojs/sitemap schreibt sitemap-index.xml (+ sitemap-0.xml). Viele Dienste und Menschen erwarten
 * aber /sitemap.xml — in der Search Console war genau diese Adresse eingereicht und lief auf einen
 * 404 (gesehen am 14.11.2026 mit `npm run suchdaten`). Deshalb: nach dem Bau die Index-Datei kopieren.
 * Steht in astro.config.mjs NACH sitemap().
 */
import { copyFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/** @returns {import('astro').AstroIntegration} */
export default function sitemapXml() {
  return {
    name: 'sitemap-xml',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const quelle = fileURLToPath(new URL('sitemap-index.xml', dir));
        const ziel = fileURLToPath(new URL('sitemap.xml', dir));
        try {
          await access(quelle);
        } catch {
          logger.warn('sitemap-index.xml fehlt — /sitemap.xml wird nicht geschrieben.');
          return;
        }
        await copyFile(quelle, ziel);
        logger.info('sitemap.xml geschrieben (Kopie von sitemap-index.xml).');
      },
    },
  };
}
