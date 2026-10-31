// Listet alle offenen Angaben im Quelltext, getrennt nach Art:
//   1. Pflicht (rechtlich): <Platzhalter pflicht> und der Schalter
//      ENTWURF_HINWEIS_ANZEIGEN — sperren den Produktions-Build.
//   2. Inhaltlich: <Platzhalter> ohne pflicht und die Datenlisten `offen`
//      (Anlässe, Geschichte) — im Produktions-Build neutraler Text.
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
  return liste.sort();
}
const zeileVon = (text, index) => text.slice(0, index).split('\n').length;
const kurz = (s) => s.replace(/\s+/g, ' ').trim();

const pflicht = [];
const inhaltlich = [];
for (const datei of await dateien(join(WURZEL, 'src'))) {
  const text = await readFile(datei, 'utf8');
  const ort = (index) => `${relative(WURZEL, datei)}:${zeileVon(text, index)}`;
  // Platzhalter-Tags; Attribute dürfen Anführungszeichen enthalten (ersatz="…").
  for (const m of text.matchAll(/<Platzhalter\b((?:[^>"]|"[^"]*")*)>([\s\S]*?)<\/Platzhalter>/g)) {
    const inhalt = kurz(m[2]);
    // Reine Vorlagen ({o}, {s.offen}) überspringen — deren Inhalte stehen in den Datenlisten unten.
    if (/^\{[^{}]*\}$/.test(inhalt)) continue;
    (/\spflicht\b/.test(m[1]) ? pflicht : inhaltlich).push(`${ort(m.index)}  ${inhalt}`);
  }
  // Datenlisten (offen: [...] bzw. offen: '…') auf den Anlass-/Geschichtsseiten
  for (const m of text.matchAll(/\boffen:\s*(\[[\s\S]*?\]|'[^']*')/g)) inhaltlich.push(`${ort(m.index)}  (Daten) ${kurz(m[1])}`);
  // Schalter für den Entwurf-Hinweis der Datenschutzerklärung
  for (const m of text.matchAll(/export const ENTWURF_HINWEIS_ANZEIGEN\s*=\s*true\b/g)) {
    pflicht.push(`${ort(m.index)}  ENTWURF_HINWEIS_ANZEIGEN = true — Datenschutzerklärung ist noch Entwurf (nach rechtlicher Prüfung auf false)`);
  }
}

console.log(`PFLICHT (rechtlich) — sperren den Produktions-Build, solange sie offen sind: ${pflicht.length}`);
for (const z of pflicht) console.log(`  ${z}`);
if (pflicht.length === 0) console.log('  — keine —');
console.log(`\nINHALTLICH — dürfen beim Livegang offen sein (Produktion zeigt neutralen Text): ${inhaltlich.length}`);
for (const z of inhaltlich) console.log(`  ${z}`);
if (inhaltlich.length === 0) console.log('  — keine —');
console.log(`\n${pflicht.length} Pflicht, ${inhaltlich.length} inhaltlich. Übersicht und Zuständigkeit: OFFENE-ANGABEN.md`);
