// Erzeugt das Exposé-PDF (Lead-Magnet) aus der druckbaren Seite /expose/.
//
//   npm run expose        → public/pdf/ms-wohldorf-expose.pdf
//
// Baut die Seite dafür selbst als Vorschau in einen eigenen Ordner (die
// Livegang-Sperre stört so nicht), liefert ihn wie Netlify aus und druckt
// /expose/ als A4-PDF. Danach normal bauen, damit das PDF in dist/ landet.
// Neu erzeugen, wenn sich Angaben im Exposé ändern (src/config.ts, src/data/*).
// Braucht Playwright mit Chromium (wie die Prüfungen in tests/).
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { starteServer } from '../tests/server.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const PROJEKT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORDNER = join(PROJEKT, 'dist-expose');
const ZIEL = join(PROJEKT, 'public/pdf/ms-wohldorf-expose.pdf');

const bau = spawnSync(process.execPath, [join(PROJEKT, 'node_modules/astro/bin/astro.mjs'), 'build', '--outDir', ORDNER], {
  cwd: PROJEKT,
  env: { ...process.env, PUBLIC_VORSCHAU: '1' },
  stdio: 'inherit',
});
if (bau.status !== 0) process.exit(bau.status ?? 1);

const server = await starteServer({ ordner: ORDNER, port: 4398 });
const browser = await chromium.launch();
try {
  const seite = await browser.newPage();
  await seite.goto(`${server.url}/expose/`, { waitUntil: 'networkidle' });
  await seite.evaluate(() => document.fonts.ready);
  await seite.emulateMedia({ media: 'print' });
  await seite.pdf({ path: ZIEL, format: 'A4', printBackground: true, preferCSSPageSize: true });
  const { size } = await stat(ZIEL);
  console.log(`${ZIEL} (${(size / 1024 / 1024).toFixed(1)} MB)`);
} finally {
  await browser.close();
  await server.schliesse();
}
