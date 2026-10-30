// Übernimmt Inhalte der bisherigen Website www.mswohldorf.de in das Projekt:
//   - Galerie (images/galerie/…, große Bilder statt thumb_-Vorschauen) → src/assets/galerie/
//     und Beschreibungen (alt/title) → src/data/galerie.json
//   - Presse-PDFs (./pdf/…) → public/pdf/ und Linktexte → src/data/presse.json
//   - images/welle.png → src/assets/alt/, Favicons → public/alt/
//   - die Original-HTML und alle Textblöcke → quelle/alte-seite/ (für INHALT.md)
//
// Aufruf:
//   npm run alte-seite                         (von https://www.mswohldorf.de/)
//   npm run alte-seite -- --quelle=<URL|Ordner> (z. B. eine lokale Kopie der alten Seite)
//   npm run alte-seite -- --trocken             (nur anzeigen, nichts schreiben)
//
// Hinter einem Proxy: NODE_USE_ENV_PROXY=1 setzen (Node ≥ 22.21 nutzt dann HTTPS_PROXY).
// Bereits vorhandene Einträge in galerie.json (z. B. zugeordnete Anlässe) bleiben erhalten.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PROJEKT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, '').split('=');
    return [k, v.length ? v.join('=') : true];
  }),
);
const QUELLE = typeof args.quelle === 'string' ? args.quelle : 'https://www.mswohldorf.de/';
const TROCKEN = Boolean(args.trocken);

const basis = /^https?:\/\//.test(QUELLE) ? new URL(QUELLE.endsWith('/') || /\.html?$/.test(QUELLE) ? QUELLE : `${QUELLE}/`) : pathToFileURL(resolve(QUELLE) + (/\.html?$/.test(QUELLE) ? '' : '/'));

async function hole(url) {
  if (url.protocol === 'file:') return readFile(fileURLToPath(url));
  const antwort = await fetch(url, { headers: { 'User-Agent': 'mswohldorf-web Übernahme' } });
  if (!antwort.ok) throw new Error(`${url}: HTTP ${antwort.status}`);
  return Buffer.from(await antwort.arrayBuffer());
}

/** Sehr einfacher Tag-Leser für die statische alte Seite. */
function tags(html, name) {
  const liste = [];
  const re = new RegExp(`<${name}\\b([^>]*)>`, 'gi');
  for (const m of html.matchAll(re)) liste.push({ attrs: attribute(m[1]), index: m.index, ende: m.index + m[0].length });
  return liste;
}
function attribute(text) {
  const a = {};
  for (const m of text.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g)) a[m[1].toLowerCase()] = entities(m[3] ?? m[4] ?? m[5] ?? '');
  return a;
}
function entities(t) {
  return t
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&auml;/g, 'ä')
    .replace(/&ouml;/g, 'ö')
    .replace(/&uuml;/g, 'ü')
    .replace(/&Auml;/g, 'Ä')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&szlig;/g, 'ß')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}
const text = (html) => entities(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim();

async function speichere(ziel, inhalt) {
  if (TROCKEN) return;
  await mkdir(dirname(ziel), { recursive: true });
  await writeFile(ziel, inhalt);
}
async function gibtEs(pfad) {
  try {
    await access(pfad);
    return true;
  } catch {
    return false;
  }
}

const seite = new URL(basis.protocol === 'file:' && !basis.pathname.endsWith('.html') ? 'index.html' : '', basis);
console.log(`Quelle: ${seite.href}${TROCKEN ? '  (Probelauf)' : ''}`);
const html = (await hole(seite)).toString('utf8');
await speichere(join(PROJEKT, 'quelle/alte-seite/index.html'), html);

/* ---------------- Galerie ---------------- */
const galerieAlt = JSON.parse(await readFile(join(PROJEKT, 'src/data/galerie.json'), 'utf8'));
const bekannt = new Map(galerieAlt.bilder.map((b) => [b.datei, b]));
const bilder = [];
const gesehen = new Set();
for (const a of tags(html, 'a')) {
  const href = a.attrs.href ?? '';
  if (!/images\/galerie\/.+\.(jpe?g|png|webp|gif)$/i.test(href)) continue;
  const schluss = html.indexOf('</a>', a.ende);
  const innen = html.slice(a.ende, schluss);
  const img = tags(innen, 'img')[0]?.attrs ?? {};
  let gross = href;
  if (/(^|\/)thumb_/.test(basename(gross))) gross = gross.replace(/thumb_/, '');
  const url = new URL(gross, seite);
  const datei = decodeURIComponent(url.pathname.split('/images/galerie/')[1] ?? basename(url.pathname));
  if (gesehen.has(datei)) continue;
  gesehen.add(datei);
  bilder.push({
    url,
    datei,
    alt: (img.alt || a.attrs.title || a.attrs['data-title'] || '').trim(),
    titel: (a.attrs.title || a.attrs['data-title'] || img.title || '').trim(),
  });
}
// Vorschaubilder ohne Link: thumb_ entfernen
for (const img of tags(html, 'img')) {
  const src = img.attrs.src ?? '';
  if (!/images\/galerie\/.*thumb_/i.test(src)) continue;
  const url = new URL(src.replace('thumb_', ''), seite);
  const datei = decodeURIComponent(url.pathname.split('/images/galerie/')[1] ?? basename(url.pathname));
  if (gesehen.has(datei)) continue;
  gesehen.add(datei);
  bilder.push({ url, datei, alt: (img.attrs.alt ?? '').trim(), titel: (img.attrs.title ?? '').trim() });
}
const neueEintraege = [];
for (const b of bilder) {
  try {
    const daten = await hole(b.url);
    await speichere(join(PROJEKT, 'src/assets/galerie', b.datei), daten);
    const alt = bekannt.get(b.datei);
    neueEintraege.push({ datei: b.datei, alt: alt?.alt || b.alt, titel: alt?.titel || b.titel || undefined, anlaesse: alt?.anlaesse ?? [] });
    console.log(`  Bild  ${b.datei} (${Math.round(daten.length / 1024)} kB)${b.alt ? '' : '  ⚠ ohne Alt-Text'}`);
  } catch (e) {
    console.warn(`  FEHLT ${b.datei}: ${e.message}`);
  }
}
await speichere(join(PROJEKT, 'src/data/galerie.json'), JSON.stringify({ ...galerieAlt, bilder: neueEintraege }, null, 2) + '\n');

/* ---------------- PDFs ---------------- */
const presseAlt = JSON.parse(await readFile(join(PROJEKT, 'src/data/presse.json'), 'utf8'));
const pdfs = [];
for (const a of tags(html, 'a')) {
  const href = a.attrs.href ?? '';
  if (!/\.pdf($|\?)/i.test(href)) continue;
  const url = new URL(href, seite);
  const datei = decodeURIComponent(basename(url.pathname));
  if (pdfs.some((p) => p.datei === datei)) continue;
  const schluss = html.indexOf('</a>', a.ende);
  pdfs.push({ url, datei, titel: text(html.slice(a.ende, schluss)) || a.attrs.title || datei });
}
const presse = [];
for (const p of pdfs) {
  try {
    const daten = await hole(p.url);
    await speichere(join(PROJEKT, 'public/pdf', p.datei), daten);
    presse.push({ datei: p.datei, titel: p.titel });
    console.log(`  PDF   ${p.datei} — „${p.titel}"`);
  } catch (e) {
    console.warn(`  FEHLT ${p.datei}: ${e.message}`);
  }
}
await speichere(join(PROJEKT, 'src/data/presse.json'), JSON.stringify({ ...presseAlt, eintraege: presse }, null, 2) + '\n');

/* ---------------- Welle, Favicons ---------------- */
for (const pfad of ['images/welle.png']) {
  try {
    await speichere(join(PROJEKT, 'src/assets/alt', basename(pfad)), await hole(new URL(pfad, seite)));
    console.log(`  Grafik ${pfad}`);
  } catch (e) {
    console.warn(`  FEHLT ${pfad}: ${e.message}`);
  }
}
for (const l of tags(html, 'link')) {
  if (!/icon/i.test(l.attrs.rel ?? '') || !l.attrs.href) continue;
  const url = new URL(l.attrs.href, seite);
  try {
    await speichere(join(PROJEKT, 'public/alt', basename(url.pathname)), await hole(url));
    console.log(`  Icon  ${basename(url.pathname)} (${l.attrs.rel})`);
  } catch (e) {
    console.warn(`  FEHLT ${url.pathname}: ${e.message}`);
  }
}

/* ---------------- Texte & Prüfliste ---------------- */
const koerper = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
const bloecke = [];
for (const m of koerper.matchAll(/<(h[1-6]|p|blockquote|li|address|figcaption|td)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
  const t = text(m[2]);
  if (t) bloecke.push(`- **${m[1].toLowerCase()}**: ${t.replace(/\n/g, ' / ')}`);
}
const rahmen = tags(html, 'iframe').map((f) => `- iframe: ${f.attrs.src}`);
const links = tags(html, 'a')
  .map((a) => a.attrs.href)
  .filter((h) => h && /youtu|matterport|maps|mailto:|tel:/i.test(h))
  .map((h) => `- Link: ${h}`);
const pruefen = ['1959', '2016', '2017', '35', 'HADAG', 'Sandtorhafen', 'Boris', 'Herrmann', 'Matterport', 'TMG', 'Navi', 'Telefon', 'Fax', 'Impressum']
  .map((w) => `- „${w}": ${koerper.includes(w) ? 'gefunden' : '— nicht gefunden'}`)
  .join('\n');
const bericht = `# Alte Seite — Textblöcke\n\nQuelle: ${seite.href}\nAbgerufen: ${new Date().toISOString()}\n\n## Prüfliste (Fakten im Auftrag)\n\n${pruefen}\n\n## Eingebettetes und Links\n\n${[...rahmen, ...links].join('\n') || '–'}\n\n## Textblöcke in Reihenfolge\n\n${bloecke.join('\n')}\n`;
await speichere(join(PROJEKT, 'quelle/alte-seite/texte.md'), bericht);

console.log(`\nFertig: ${neueEintraege.length} Galerie-Bilder, ${presse.length} PDFs.${TROCKEN ? ' (Probelauf: nichts geschrieben)' : ''}`);
console.log('Nächste Schritte: quelle/alte-seite/texte.md lesen → Impressum, Telefon/Fax, Stimmen übernehmen; galerie.json → anlaesse zuordnen; npm run build.');
if (!(await gibtEs(join(PROJEKT, 'src/assets/galerie')))) console.log('Hinweis: Keine Galerie-Bilder gefunden — Struktur der alten Seite prüfen.');
