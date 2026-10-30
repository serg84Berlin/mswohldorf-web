// Nimmt das Standbild der 3D-Bühne als Hero-Poster auf (LCP-Bild und
// Rückfall für Geräte ohne WebGL/mit reduzierter Bewegung) — dieselbe
// Komposition wie die Szene, quer (Desktop) und hoch (Smartphone).
//
//   npm run build && npm run poster && npm run build
//
// Braucht Playwright mit Chromium (wie die Prüfungen in tests/).
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { starteServer } from '../tests/server.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const PROJEKT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const server = await starteServer({ ordner: join(PROJEKT, 'dist'), port: 4399 });
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  for (const [name, breite, hoehe] of [
    ['quer', 1920, 1200],
    ['hoch', 828, 1792],
  ]) {
    const seite = await browser.newPage({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 1 });
    await seite.goto(`${server.url}/#poster-aufnahme`, { waitUntil: 'load' });
    // Nur die Leinwand: Overlays und das bisherige Poster ausblenden, Einblendung abschalten.
    await seite.addStyleTag({
      content:
        '.hero-poster,.hero-schleier,.hero-inhalt,.hero-runter,.hero-welle,header,.vorschau-band,[data-anfrage-schwebend]{visibility:hidden!important}.hero-leinwand{opacity:1!important;transition:none!important}',
    });
    await seite.waitForSelector('[data-hero-leinwand][data-bereit]', { timeout: 30000 });
    await seite.waitForTimeout(400);
    const bild = await seite.locator('[data-hero-leinwand]').screenshot({ type: 'png' });
    const ziel = join(PROJEKT, `src/assets/hero/poster-${name}.jpg`);
    await sharp(bild).jpeg({ quality: 86, mozjpeg: true }).toFile(ziel);
    console.log(`${ziel} (${breite}×${hoehe})`);
    await seite.close();
  }
} finally {
  await browser.close();
  await server.schliesse();
}
