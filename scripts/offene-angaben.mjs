// Listet alle sichtbaren Platzhalter (<Platzhalter>…</Platzhalter>) im Quelltext.
//   npm run offen
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const WURZEL = new URL('..', import.meta.url).pathname;
async function dateien(ordner) {
  const liste = [];
  for (const e of await readdir(ordner, { withFileTypes: true })) {
    const p = join(ordner, e.name);
    if (e.isDirectory()) liste.push(...(await dateien(p)));
    else if (/\.(astro|ts)$/.test(e.name) && e.name !== 'Platzhalter.astro') liste.push(p);
  }
  return liste;
}
let zahl = 0;
for (const datei of await dateien(join(WURZEL, 'src'))) {
  const text = await readFile(datei, 'utf8');
  for (const m of text.matchAll(/<Platzhalter\b[^>]*>([\s\S]*?)<\/Platzhalter>/g)) {
    const zeile = text.slice(0, m.index).split('\n').length;
    console.log(`${relative(WURZEL, datei)}:${zeile}  ${m[1].replace(/\s+/g, ' ').trim()}`);
    zahl++;
  }
  // Platzhalter aus Datenlisten (offen: [...]) auf den Anlass-/Geschichtsseiten
  for (const m of text.matchAll(/offen:\s*(\[[\s\S]*?\]|'[^']*')/g)) {
    const zeile = text.slice(0, m.index).split('\n').length;
    console.log(`${relative(WURZEL, datei)}:${zeile}  (Daten) ${m[1].replace(/\s+/g, ' ').trim()}`);
    zahl++;
  }
}
console.log(`\n${zahl} Stellen. Übersicht und Zuständigkeit: OFFENE-ANGABEN.md`);
