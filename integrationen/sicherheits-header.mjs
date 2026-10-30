// @ts-check
/**
 * Schreibt nach dem Bau dist/_headers mit der Content-Security-Policy.
 *
 * Warum hier und nicht in netlify.toml? Die CSP hängt vom Build ab:
 *  - connect-src braucht den Ursprung von PUBLIC_ANFRAGE_URL (Umgebungsvariable),
 *  - script-src braucht die Hashes der (wenigen) Inline-Skripte.
 * Alle anderen Sicherheits-Header stehen in netlify.toml.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

/** Inhalte Dritter, die erst nach Klick (Zwei-Klick) als iframe geladen werden. */
export const RAHMEN_QUELLEN = ['https://www.youtube-nocookie.com', 'https://my.matterport.com', 'https://www.openstreetmap.org'];

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
  return liste;
}

/**
 * @param {string} url
 * @returns {string | null}
 */
export function anfrageUrsprung(url) {
  if (!url) return null;
  let u;
  try {
    u = new URL(url);
  } catch {
    throw new Error(`PUBLIC_ANFRAGE_URL ist keine gültige Adresse: ${url}`);
  }
  if (u.protocol !== 'https:' && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') {
    throw new Error(`PUBLIC_ANFRAGE_URL muss https:// verwenden: ${url}`);
  }
  return u.origin;
}

/**
 * @param {{ hashes: string[]; ursprung: string | null }} p
 * @returns {string}
 */
export function bauePolitik({ hashes, ursprung }) {
  return [
    "default-src 'self'",
    `script-src 'self'${hashes.map((h) => ` '${h}'`).join('')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self'${ursprung ? ` ${ursprung}` : ''}`,
    `frame-src ${RAHMEN_QUELLEN.join(' ')}`,
    "media-src 'self'",
    "worker-src 'none'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' mailto:",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

/** @returns {import('astro').AstroIntegration} */
export default function sicherheitsHeader() {
  return {
    name: 'mswohldorf-sicherheits-header',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const umgebung = { ...loadEnv('production', process.cwd(), 'PUBLIC_'), ...process.env };
        const ursprung = anfrageUrsprung((umgebung.PUBLIC_ANFRAGE_URL ?? '').trim());
        const ziel = fileURLToPath(dir);
        /** @type {Set<string>} */
        const hashes = new Set();
        for (const datei of await htmlDateien(ziel)) {
          const html = await readFile(datei, 'utf8');
          for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
            if (/type="application\/ld\+json"/.test(m[1])) continue;
            hashes.add(`sha256-${createHash('sha256').update(m[2], 'utf8').digest('base64')}`);
          }
        }
        const politik = bauePolitik({ hashes: [...hashes].sort(), ursprung });
        await writeFile(join(ziel, '_headers'), `/*\n  Content-Security-Policy: ${politik}\n`);
        logger.info(`_headers geschrieben (${hashes.size} Inline-Skript-Hash(es), Anfrage-Ziel: ${ursprung ?? 'keins'})`);
      },
    },
  };
}
