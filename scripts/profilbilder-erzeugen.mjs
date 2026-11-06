/**
 * Bilder für die Unternehmensprofile (Google, Bing, Apple) und Location-Portale.
 *
 *   npm run profilbilder   →  dist-profilbilder/ (nicht im Repo)
 *
 * Nur Bilder, die auch auf der Website stehen (Quellen: INHALT.md). Nichts wird
 * hochskaliert; Metadaten (EXIF) werden entfernt. Welche Datei wofür: PROFILE.md
 * und dist-profilbilder/LIESMICH.txt.
 */
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const ZIEL = 'dist-profilbilder';
const ALT = 'quelle/alte-seite/dateien/images';

/** [Zieldatei, Quelle, Verwendung] */
const FOTOS = [
  ['01-titelbild-16x9.jpg', 'src/assets/video/ms-wohldorf-2024.jpg', 'Titelbild/Cover (Google, Apple) — Drohnenbild 2024, Standbild aus dem Video des Kanals Finanzelot'],
  ['03-aussen-schiff-am-ponton.jpg', `${ALT}/galerie/04_aussenbereich/wohldorf-schiffs-location-118.jpg`, 'Außen — die Wohldorf längsseits am Ponton an der Süderelbe'],
  ['04-aussen-schriftzug-bug.jpg', `${ALT}/galerie/04_aussenbereich/wohldorf-schiffs-location-114.jpg`, 'Außen — Schriftzug „Wohldorf“ am Bug (zeigt den Namen am Standort)'],
  ['05-aussen-gangway-schiff.jpg', `${ALT}/galerie/04_aussenbereich/wohldorf-schiffs-location-109.jpg`, 'Außen — Gangway zwischen Büschen, dahinter das Schiff'],
  ['06-aussen-zugang-ponton.jpg', `${ALT}/galerie/04_aussenbereich/wohldorf-schiffs-location-105.jpg`, 'Außen — Gangway vom Ufer zum Ponton (Zugang)'],
  ['07-innen-besprechungsraum.jpg', `${ALT}/galerie/03_innen/wohldorf_innen_31.jpg`, 'Innen — runder Tisch im verglasten Besprechungsraum'],
  ['08-innen-sessel.jpg', `${ALT}/galerie/03_innen/wohldorf_innen_21.jpg`, 'Innen — Ohrensessel in Samt vor den Schiffsfenstern'],
  ['09-innen-buero-oberdeck.jpg', `${ALT}/galerie/03_innen/wohldorf_innen_19.jpg`, 'Innen — Büro auf dem Oberdeck, rundum Fenster'],
  ['10-innen-kombuese.jpg', `${ALT}/galerie/03_innen/wohldorf_innen_16.jpg`, 'Innen — Kombüse mit Werkbank-Zeile und Herd'],
  ['11-innen-treppe-lampe.jpg', `${ALT}/galerie/03_innen/wohldorf_innen_10.jpg`, 'Innen — Industrielampe vor der Teakholztreppe'],
  ['12-innen-steuerrad.jpg', `${ALT}/galerie/03_innen/wohldorf_innen_26.jpg`, 'Innen — das alte Steuerrad auf der Brücke'],
  ['13-geschichte-sandtorhafen-2017.jpg', 'src/assets/video/einlaufen-sandtorhafen-2017.jpg', 'Geschichte — Einfahrt in den Sandtorhafen, Mai 2017 (früherer Liegeplatz, nur als Geschichtsbild verwenden)'],
];

await rm(ZIEL, { recursive: true, force: true });
await mkdir(ZIEL, { recursive: true });

const zeilen = [];
for (const [datei, quelle, zweck] of FOTOS) {
  const info = await sharp(quelle)
    .rotate()
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(join(ZIEL, datei));
  zeilen.push(`${datei}  (${info.width} × ${info.height})\n    ${zweck}`);
}

// Logo: Bildmarke (public/favicon.svg) quadratisch, randlos auf Marineblau —
// Google und Apple schneiden das Logo kreisförmig zu.
const svg = (await readFile('public/favicon.svg', 'utf8')).replace('rx="9"', 'rx="0"');
const logo = await sharp(Buffer.from(svg), { density: 1600 })
  .resize(720, 720)
  .flatten({ background: '#0a1d30' })
  .png()
  .toFile(join(ZIEL, '02-logo-720.png'));
zeilen.splice(1, 0, `02-logo-720.png  (${logo.width} × ${logo.height})\n    Logo — Bildmarke der Website, quadratisch`);

await writeFile(
  join(ZIEL, 'LIESMICH.txt'),
  [
    'MS Wohldorf — Bilder für Unternehmensprofile und Location-Portale',
    `Erzeugt mit „npm run profilbilder“ am ${new Date().toLocaleDateString('de-DE')}. Anleitung: PROFILE.md im Website-Repo.`,
    '',
    'Bildnachweis: Fotos Andrea Klick (03–12); Standbilder aus eigenen Videos (01, 13); Logo: Bildmarke der Website.',
    'Vor dem Hochladen klären: Deckt die Vereinbarung mit Andrea Klick die Nutzung in Google, Bing, Apple und Portalen ab?',
    '',
    ...zeilen,
    '',
  ].join('\n'),
);

console.log(`${FOTOS.length + 1} Bilder in ${ZIEL}/`);
