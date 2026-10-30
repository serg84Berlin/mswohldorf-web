// Übernahme der bisherigen Website www.mswohldorf.de.
//
// Quelle der Wahrheit ist der Ordner quelle/alte-seite/ (im Repo):
//   quelle/alte-seite/index.html      Original-HTML der alten Seite
//   quelle/alte-seite/dateien/…       alle dort referenzierten Dateien mit ihren
//                                     Originalpfaden (images/…, pdf/…, favicon/…)
//
// Das Skript liest die HTML, findet ALLE Galerien (lightGallery: data-src,
// href, img src; auch die Schreibweise „galerie//03_innen"; Vorschauen
// „thumb_…" und „thumb-…" → großes Bild) und schreibt daraus:
//   src/data/galerie.json             Katalog: Datei, Galerie, Alt-Text, Größe
//   src/data/presse.json              Presse (PDFs + Online-Artikel)
//   public/pdf/…, public/alt/…        PDFs und alte Favicons (müssen öffentlich liegen)
//   quelle/alte-seite/texte.md        alle Textblöcke + Prüfliste
// Die Bilder selbst bleiben in quelle/alte-seite/dateien/ und werden von dort
// direkt in den Build eingebunden (src/data/bilder.ts) — keine Kopien.
//
// Aufruf:
//   npm run alte-seite                                  lokal, offline (Standard)
//   npm run alte-seite -- --quelle=https://www.mswohldorf.de/   (alte Seite spiegeln; Hosting ist gekündigt)
//   npm run alte-seite -- --trocken                     nur anzeigen
// Hinter einem Proxy: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=<CA-Bundle>.
//
// Von Hand gepflegte Felder bleiben erhalten (alt, titel in galerie.json/presse.json).
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJEKT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ALT = join(PROJEKT, 'quelle/alte-seite');
const DATEIEN = join(ALT, 'dateien');
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, '').split('=');
    return [k, v.length ? v.join('=') : true];
  }),
);
const QUELLE = typeof args.quelle === 'string' ? args.quelle : DATEIEN;
const ONLINE = /^https?:\/\//.test(QUELLE);
const TROCKEN = Boolean(args.trocken);

const GALERIEN = {
  'galerie/01_umbau': { kategorie: 'umbau', titel: 'Der Umbau 2016' },
  'galerie/02_ueberfahrt': { kategorie: 'ueberfahrt', titel: 'Einzug in den Sandtorhafen in Hamburg 2017' },
  'galerie/03_innen': { kategorie: 'innen', titel: 'Die MS Wohldorf von innen' },
  'galerie/04_aussenbereich': { kategorie: 'aussen', titel: 'Aussenbereich' },
  'galerie-startseite': { kategorie: 'startseite', titel: 'Galerie der Startseite' },
};

/* ---------------- kleine HTML-Helfer (statische Seite, kein DOM nötig) ---------------- */
function tags(html, name) {
  const liste = [];
  for (const m of html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))) liste.push({ attrs: attribute(m[1]), index: m.index, ende: m.index + m[0].length });
  return liste;
}
function attribute(text) {
  const a = {};
  for (const m of text.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    const k = m[1].toLowerCase();
    if (!(k in a)) a[k] = entities(m[3] ?? m[4] ?? m[5] ?? ''); // wie im Browser: erstes Attribut gilt
  }
  return a;
}
function entities(t) {
  const tabelle = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß', shy: '', sect: '§', bdquo: '„', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', raquo: '»', laquo: '«' };
  return t.replace(/&(#\d+|[a-zA-Z]+);/g, (g, n) => (n[0] === '#' ? String.fromCodePoint(Number(n.slice(1))) : (tabelle[n] ?? g)));
}
const text = (html) => entities(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim();
/** „images/galerie//03_innen/x.jpg" → „images/galerie/03_innen/x.jpg", ohne ./ und führenden / */
const normal = (p) => decodeURIComponent(p.split(/[?#]/)[0]).replace(/^\.?\//, '').replace(/\/{2,}/g, '/');
const ohneThumb = (p) => p.replace(/(^|\/)thumb[_-]/, '$1');

async function gibtEs(pfad) {
  try {
    await access(pfad);
    return true;
  } catch {
    return false;
  }
}
async function schreibe(ziel, inhalt) {
  if (TROCKEN) return;
  await mkdir(dirname(ziel), { recursive: true });
  await writeFile(ziel, inhalt);
}
async function hole(pfad) {
  const url = new URL(pfad, QUELLE.endsWith('/') ? QUELLE : `${QUELLE}/`);
  const antwort = await fetch(url, { headers: { 'User-Agent': 'mswohldorf-web Übernahme' } });
  if (!antwort.ok) throw new Error(`${url}: HTTP ${antwort.status}`);
  return Buffer.from(await antwort.arrayBuffer());
}
/** Stellt sicher, dass dateien/<pfad> lokal liegt (online: herunterladen). */
async function lokal(pfad) {
  const ziel = join(DATEIEN, pfad);
  if (await gibtEs(ziel)) return ziel;
  if (!ONLINE) return null;
  try {
    await schreibe(ziel, await hole(pfad));
    return ziel;
  } catch (e) {
    console.warn(`  FEHLT ${pfad}: ${e.message}`);
    return null;
  }
}

/* ---------------- HTML laden ---------------- */
let html;
if (ONLINE) {
  console.log(`Quelle: ${QUELLE} (online, spiegelt nach quelle/alte-seite/)${TROCKEN ? '  (Probelauf)' : ''}`);
  html = (await hole('index.html').catch(() => hole(''))).toString('utf8');
  await schreibe(join(ALT, 'index.html'), html);
} else {
  const kandidaten = [join(resolve(QUELLE), 'index.html'), join(resolve(QUELLE), '..', 'index.html')];
  const datei = (await Promise.all(kandidaten.map(async (k) => ((await gibtEs(k)) ? k : null)))).find(Boolean);
  if (!datei) throw new Error(`Keine index.html in ${QUELLE} oder darüber gefunden.`);
  console.log(`Quelle: ${datei} (lokal)${TROCKEN ? '  (Probelauf)' : ''}`);
  html = await readFile(datei, 'utf8');
}

/* ---------------- Galerien ---------------- */
const galerieAlt = JSON.parse(await readFile(join(PROJEKT, 'src/data/galerie.json'), 'utf8'));
const bekannt = new Map(galerieAlt.bilder.map((b) => [b.datei, b]));
const gefunden = new Map();
function galerieVon(pfad) {
  const schluessel = Object.keys(GALERIEN).find((g) => pfad.startsWith(`images/${g}/`));
  return schluessel ? { schluessel, ...GALERIEN[schluessel] } : null;
}
for (const a of tags(html, 'a')) {
  const ziel = a.attrs['data-src'] || a.attrs.href || '';
  const schluss = html.indexOf('</a>', a.ende);
  const img = tags(html.slice(a.ende, schluss), 'img')[0]?.attrs ?? {};
  const kandidaten = [ziel, img.src].filter(Boolean).map(normal);
  const gross = kandidaten.map(ohneThumb).find((p) => galerieVon(p));
  if (!gross || gefunden.has(gross)) continue;
  const groesse = (a.attrs['data-lg-size'] ?? '').split('-').map(Number);
  gefunden.set(gross, { gross, ersatz: img.src ? normal(img.src) : null, alt: (img.alt ?? '').trim(), groesse: groesse.length === 2 ? groesse : null });
}
// Galerie-Bilder ohne Link (nur <img>)
for (const img of tags(html, 'img')) {
  const p = ohneThumb(normal(img.attrs.src ?? ''));
  if (galerieVon(p) && !gefunden.has(p)) gefunden.set(p, { gross: p, ersatz: normal(img.attrs.src), alt: (img.attrs.alt ?? '').trim(), groesse: null });
}

const bilder = [];
const zaehler = {};
for (const b of gefunden.values()) {
  let datei = b.gross;
  let pfad = await lokal(datei);
  if (!pfad && b.ersatz && b.ersatz !== datei) {
    // Großes Bild fehlt (z. B. wohldorf_innen_260.jpg): Vorschau bzw. img-src verwenden
    const ersatz = await lokal(b.ersatz);
    if (ersatz) {
      console.warn(`  ERSATZ ${datei} → ${b.ersatz}`);
      datei = b.ersatz;
      pfad = ersatz;
    }
  }
  if (!pfad) {
    console.warn(`  FEHLT ${datei} (auch keine Vorschau)`);
    continue;
  }
  if (bilder.some((x) => x.datei === datei)) continue;
  const g = galerieVon(b.gross);
  zaehler[g.kategorie] = (zaehler[g.kategorie] ?? 0) + 1;
  const vorher = bekannt.get(datei);
  bilder.push({
    datei,
    kategorie: g.kategorie,
    galerie: g.titel,
    altOriginal: b.alt,
    ...(vorher?.alt ? { alt: vorher.alt } : {}),
    ...(vorher?.titel ? { titel: vorher.titel } : {}),
    ...(b.groesse ? { groesse: b.groesse } : {}),
  });
}
console.log(`  Galerien: ${Object.entries(zaehler).map(([k, n]) => `${k} ${n}`).join(', ')}`);
await schreibe(join(PROJEKT, 'src/data/galerie.json'), JSON.stringify({ hinweis: galerieAlt.hinweis, bilder }, null, 2) + '\n');

/* ---------------- Weitere Bilder in images/ (Presse, TV, Stimmen, Social) ---------------- */
const sonstige = new Set();
for (const t of [...tags(html, 'img'), ...tags(html, 'meta')]) {
  const p = normal(t.attrs.src ?? (t.attrs.property === 'og:image' ? t.attrs.content : '') ?? '');
  if (/^images\/[^/]+\.(jpe?g|png|webp|gif)$/i.test(p)) sonstige.add(p);
}
for (const p of sonstige) if (!(await lokal(p))) console.warn(`  FEHLT ${p}`);
console.log(`  Weitere Bilder: ${sonstige.size}`);

/* ---------------- PDFs und Presse ---------------- */
const presseAlt = JSON.parse(await readFile(join(PROJEKT, 'src/data/presse.json'), 'utf8'));
const presseBekannt = new Map(presseAlt.eintraege.map((e) => [e.datei ?? e.url, e]));
const presse = [];
for (const a of tags(html, 'a')) {
  const href = a.attrs.href ?? '';
  const schluss = html.indexOf('</a>', a.ende);
  const innen = html.slice(a.ende, schluss);
  const bild = tags(innen, 'img').map((i) => normal(i.attrs.src ?? '')).find((s) => /presse_/.test(s));
  if (/\.pdf($|\?)/i.test(href)) {
    const pfad = normal(href);
    const lokalPfad = await lokal(pfad);
    if (!lokalPfad) continue;
    if (!TROCKEN) {
      await mkdir(join(PROJEKT, 'public/pdf'), { recursive: true });
      await copyFile(lokalPfad, join(PROJEKT, 'public/pdf', basename(pfad)));
    }
    const vorher = presseBekannt.get(basename(pfad));
    presse.push({ ...vorher, datei: basename(pfad), titel: vorher?.titel ?? text(innen), ...(bild ? { bild } : {}) });
  } else if (bild && /^https?:/.test(href)) {
    const vorher = presseBekannt.get(href);
    presse.push({ ...vorher, url: href, titel: vorher?.titel ?? text(innen), bild });
  }
}
console.log(`  Presse: ${presse.length} Einträge`);
await schreibe(join(PROJEKT, 'src/data/presse.json'), JSON.stringify({ hinweis: presseAlt.hinweis, eintraege: presse }, null, 2) + '\n');

/* ---------------- Favicons (alt) ---------------- */
let icons = 0;
for (const l of tags(html, 'link')) {
  if (!/icon/i.test(l.attrs.rel ?? '') || !l.attrs.href) continue;
  const p = normal(l.attrs.href);
  const quelle = await lokal(p);
  if (!quelle) continue;
  if (!TROCKEN) {
    await mkdir(join(PROJEKT, 'public/alt'), { recursive: true });
    await copyFile(quelle, join(PROJEKT, 'public/alt', basename(p)));
  }
  icons++;
}
console.log(`  Alte Favicons: ${icons}`);

/* ---------------- Texte & Prüfliste ---------------- */
const koerper = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
const bloecke = [];
for (const m of koerper.matchAll(/<(h[1-6]|p|blockquote|li|address|figcaption|td)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
  const t = text(m[2]);
  if (t) bloecke.push(`- **${m[1].toLowerCase()}**: ${t.replace(/\n/g, ' / ')}`);
}
const rahmen = tags(html, 'iframe').map((f) => `- iframe: ${f.attrs.src}${f.attrs.title ? ` („${f.attrs.title}")` : ''}`);
const links = tags(html, 'a')
  .map((a) => a.attrs.href)
  .filter((h) => h && /^(https?:|mailto:|tel:)/i.test(h))
  .filter((h, i, l) => l.indexOf(h) === i)
  .map((h) => `- Link: ${h}`);
const pruefen = ['1959', '2016', '2017', '35', 'HADAG', 'Sandtorhafen', 'Süderelbe', 'Herrmann', 'matterport', 'TMG', 'Navi', 'Telefon', 'Telefax', 'Impressum', 'barrierefrei']
  .map((w) => `- „${w}": ${koerper.toLowerCase().includes(w.toLowerCase()) ? 'gefunden' : '— nicht gefunden'}`)
  .join('\n');
const bericht = `# Alte Seite — Textblöcke\n\nQuelle: ${ONLINE ? QUELLE : 'quelle/alte-seite/index.html'}\nErzeugt: ${new Date().toISOString()}\n\n## Prüfliste\n\n${pruefen}\n\n## Galerien\n\n${Object.entries(zaehler).map(([k, n]) => `- ${k}: ${n} Bilder`).join('\n')}\n\n## Eingebettetes und Links\n\n${[...rahmen, ...links].join('\n') || '–'}\n\n## Textblöcke in Reihenfolge\n\n${bloecke.join('\n')}\n`;
await schreibe(join(ALT, 'texte.md'), bericht);

console.log(`\nFertig: ${bilder.length} Galerie-Bilder, ${presse.length} Presse-Einträge.${TROCKEN ? ' (Probelauf: nichts geschrieben)' : ''}`);
