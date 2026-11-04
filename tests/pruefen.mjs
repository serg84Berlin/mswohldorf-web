/**
 * Prüfungen vor jedem Commit (Playwright + Chromium, ohne Testframework):
 *
 *   npm run build                                       → dist/ (Produktion)
 *   PUBLIC_VORSCHAU=1 PUBLIC_ANFRAGE_URL=https://anfrage.example.test/v1/anfrage \
 *     npx astro build --outDir dist-test                → dist-test/ (Formular verbunden)
 *   PUBLIC_VORSCHAU=1 npx astro build --outDir dist-vorschau
 *   PUBLIC_VORSCHAU=1 PUBLIC_ANFRAGE_URL=https://anfrage.example.test/v1/anfrage PUBLIC_ANFRAGE_ERWEITERT=1 \
 *     npx astro build --outDir dist-erweitert           → dist-erweitert/ (Lead-Quelle an)
 *   npm run pruefen
 *
 * `npm run build` endet mit „LIVEGANG GESPERRT“, solange rechtliche Angaben
 * offen sind (integrationen/livegang-sperre.mjs) — das ist erwartet. Die Sperre
 * greift erst nach dem Schreiben, dist/ ist also vollständig und wird geprüft.
 *
 * Prüft: Konsolenfehler, keine externen Anfragen beim Laden (Abfangen aller
 * Requests), Lightbox per Tastatur, reduzierte Bewegung, Formular (Vorschau,
 * Prüfung, 202/400/429/503/Netzfehler mit gemockter Antwort, JSON-Vertrag),
 * Schnellanfrage + Erstantwort-Hinweis, Lead-Quelle (erweitert), Exposé-PDF,
 * Barrierefreiheit (axe-core, WCAG 2.2 AA), Seitengewicht von „/",
 * Platzhalter (Vorschau: Kästen; Produktion: neutraler Text) und die
 * Livegang-Sperre (eigenes kleines Prüfprojekt tests/livegang-sperre/).
 * Screenshots → screenshots/, Messwerte → screenshots/pruefbericht.json.
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { starteServer } from './server.mjs';
import { seitenPfad, sperrGruende } from '../integrationen/livegang-sperre.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const PROJEKT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BILDER = join(PROJEKT, 'screenshots');
const ANFRAGE_TEST_URL = 'https://anfrage.example.test/v1/anfrage';
await mkdir(BILDER, { recursive: true });

const bericht = { zeit: new Date().toISOString(), pruefungen: [], gewicht: {}, axe: {} };
let fehlgeschlagen = 0;
function pruefe(name, ok, info = '') {
  bericht.pruefungen.push({ name, ok, info });
  if (!ok) fehlgeschlagen++;
  console.log(`${ok ? '✔' : '✘'} ${name}${info ? ` — ${info}` : ''}`);
}

const SEITEN = [
  '/',
  '/anlaesse/firmenevent/',
  '/anlaesse/workshop-seminar/',
  '/anlaesse/film-und-foto/',
  '/anlaesse/lesung-ausstellung/',
  '/anlaesse/private-feier/',
  '/offsite-hamburg/',
  '/haeufige-fragen/',
  '/geschichte/',
  '/galerie/',
  '/anfrage/',
  '/impressum/',
  '/datenschutz/',
  '/gibt-es-nicht/',
];
const GROESSEN = { 1440: { width: 1440, height: 900 }, 390: { width: 390, height: 844 } };

const haupt = await starteServer({ ordner: join(PROJEKT, 'dist'), port: 4400 });
const verbunden = await starteServer({ ordner: join(PROJEKT, 'dist-test'), port: 4401 });
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

/** Neuer Kontext, der jede Anfrage nach außen abfängt (blockiert + protokolliert). */
async function kontext(server, opt = {}, { erlaubt = [] } = {}) {
  const ctx = await browser.newContext({ locale: 'de-DE', timezoneId: 'Europe/Berlin', ...opt });
  const extern = [];
  const fehler = [];
  await ctx.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(server.url) || url.startsWith('data:') || url.startsWith('blob:')) return route.fallback();
    if (erlaubt.some((e) => url.startsWith(e))) return route.fallback();
    extern.push(url);
    return route.abort('blockedbyclient');
  });
  ctx.on('page', (p) => beobachte(p, fehler));
  return { ctx, extern, fehler };
}
function beobachte(seite, fehler) {
  seite.on('console', (m) => {
    if (m.type() === 'error') fehler.push(`console: ${m.text()}`);
  });
  seite.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`));
}
async function durchscrollen(seite) {
  const hoehe = await seite.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < hoehe; y += 450) {
    await seite.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await seite.waitForTimeout(70);
  }
  await seite.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await seite.waitForTimeout(300);
}
const name = (pfad) => (pfad === '/' ? 'start' : pfad.replace(/^\/|\/$/g, '').replace(/\//g, '-'));

/* ------------------------------------------------------------------
   1. Alle Seiten: Konsole sauber, keine externen Anfragen (Laden + Scrollen)
   ------------------------------------------------------------------ */
for (const [breite, viewport] of Object.entries(GROESSEN)) {
  const { ctx, extern, fehler } = await kontext(haupt, { viewport });
  const seite = await ctx.newPage();
  for (const pfad of SEITEN) {
    const vorher = { e: extern.length, f: fehler.length };
    const antwort = await seite.goto(haupt.url + pfad, { waitUntil: 'networkidle' });
    await durchscrollen(seite);
    await seite.waitForLoadState('networkidle');
    const neuExtern = extern.slice(vorher.e);
    // Die 404-Seite meldet ihren eigenen Status in der Konsole — das ist gewollt.
    const neuFehler = fehler.slice(vorher.f).filter((f) => !(pfad === '/gibt-es-nicht/' && f.includes('status of 404')));
    pruefe(`${pfad} @${breite}: Status ${pfad === '/gibt-es-nicht/' ? '404' : '200'}`, antwort.status() === (pfad === '/gibt-es-nicht/' ? 404 : 200), String(antwort.status()));
    pruefe(`${pfad} @${breite}: keine Konsolenfehler`, neuFehler.length === 0, neuFehler.join(' | '));
    pruefe(`${pfad} @${breite}: keine externen Anfragen`, neuExtern.length === 0, neuExtern.join(' | '));
    const horizontal = await seite.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    pruefe(`${pfad} @${breite}: kein waagerechtes Scrollen`, horizontal <= 0, `${horizontal}px`);
  }
  await ctx.close();
}

/* ------------------------------------------------------------------
   2. Screenshots (ganze Seite) — Bewegung an, 3D-Hero geladen
   ------------------------------------------------------------------ */
for (const [breite, viewport] of Object.entries(GROESSEN)) {
  const { ctx } = await kontext(haupt, { viewport, deviceScaleFactor: 1 });
  const seite = await ctx.newPage();
  for (const pfad of ['/', '/anlaesse/firmenevent/', '/galerie/', '/anfrage/', '/geschichte/']) {
    await seite.goto(haupt.url + pfad, { waitUntil: 'networkidle' });
    await durchscrollen(seite);
    if (pfad === '/') await seite.waitForSelector('[data-hero-leinwand][data-bereit]', { timeout: 30000 }).catch(() => {});
    await seite.waitForTimeout(2200);
    // Zusatzseiten als JPEG (sehr lange Seiten wären als PNG viele MB groß)
    const jpeg = pfad === '/geschichte/';
    await seite.screenshot({ path: join(BILDER, `${name(pfad)}-${breite}.${jpeg ? 'jpg' : 'png'}`), fullPage: true, ...(jpeg ? { type: 'jpeg', quality: 80 } : {}) });
  }
  // Hero mit WebGL (Ausschnitt Bildschirm)
  await seite.goto(haupt.url + '/', { waitUntil: 'networkidle' });
  const bereit = await seite.waitForSelector('[data-hero-leinwand][data-bereit]', { timeout: 30000 }).then(() => true, () => false);
  await seite.waitForTimeout(2000);
  pruefe(`3D-Hero @${breite}: WebGL-Szene läuft`, bereit);
  await seite.screenshot({ path: join(BILDER, `hero-webgl-${breite}.png`) });
  // Zeitleiste mitten im Scrollen
  const zl = await seite.evaluate(() => {
    const el = document.querySelector('[data-zeitleiste]');
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, hoehe: r.height };
  });
  await seite.evaluate((z) => window.scrollTo({ top: z.top + (z.hoehe - window.innerHeight) * 0.45, behavior: 'instant' }), zl);
  await seite.waitForTimeout(900);
  await seite.screenshot({ path: join(BILDER, `zeitleiste-scroll-${breite}.png`) });
  const sticky = await seite.evaluate(() => getComputedStyle(document.querySelector('.zl-buehne')).position);
  pruefe(`Zeitleiste @${breite}: angeheftet (sticky) bei Bewegung`, sticky === 'sticky', sticky);
  await ctx.close();
}

/* ------------------------------------------------------------------
   3. Rückfall: reduzierte Bewegung und ohne WebGL → Poster
   ------------------------------------------------------------------ */
{
  const { ctx, fehler } = await kontext(haupt, { viewport: GROESSEN[1440], reducedMotion: 'reduce' });
  const seite = await ctx.newPage();
  const skripte = [];
  seite.on('request', (r) => skripte.push(r.url()));
  await seite.goto(haupt.url + '/', { waitUntil: 'networkidle' });
  await seite.waitForTimeout(3500);
  await seite.screenshot({ path: join(BILDER, 'hero-poster-reduziert-1440.png') });
  const z = await seite.evaluate(() => ({
    bewegung: document.documentElement.dataset.bewegung,
    welle: getComputedStyle(document.querySelector('.welle-spur')).animationDuration,
    poster: getComputedStyle(document.querySelector('.hero-poster img')).animationName,
    buehne: getComputedStyle(document.querySelector('.zl-buehne')).position,
    reveal: getComputedStyle(document.querySelector('[data-reveal]')).opacity,
    leinwand: document.querySelector('[data-hero-leinwand]').dataset.bereit ?? null,
    wort: getComputedStyle(document.querySelector('.wort')).animationDuration,
  }));
  pruefe('Reduzierte Bewegung: <html data-bewegung="aus">', z.bewegung === 'aus', z.bewegung);
  pruefe('Reduzierte Bewegung: Wellen stehen still', parseFloat(z.welle) < 0.01, z.welle);
  pruefe('Reduzierte Bewegung: kein Ken-Burns auf dem Poster', z.poster === 'none', z.poster);
  pruefe('Reduzierte Bewegung: Zeitleiste nicht angeheftet', z.buehne !== 'sticky', z.buehne);
  pruefe('Reduzierte Bewegung: Inhalte sofort sichtbar', z.reveal === '1', z.reveal);
  pruefe('Reduzierte Bewegung: Überschrift ohne Animation', parseFloat(z.wort) < 0.01, z.wort);
  pruefe('Reduzierte Bewegung: three.js wird nicht geladen', !skripte.some((u) => /szene\./.test(u)) && z.leinwand === null, skripte.filter((u) => /szene\./.test(u)).join(' '));
  pruefe('Reduzierte Bewegung: keine Konsolenfehler', fehler.length === 0, fehler.join(' | '));
  await ctx.close();

  const { ctx: ctx390 } = await kontext(haupt, { viewport: GROESSEN[390], reducedMotion: 'reduce' });
  const s390 = await ctx390.newPage();
  await s390.goto(haupt.url + '/', { waitUntil: 'networkidle' });
  await s390.waitForTimeout(1500);
  await s390.screenshot({ path: join(BILDER, 'hero-poster-reduziert-390.png') });
  await ctx390.close();
}
{
  const ohneGl = await chromium.launch({ args: ['--disable-3d-apis', '--disable-webgl', '--disable-gpu'] });
  const ctx = await ohneGl.newContext({ viewport: GROESSEN[1440], locale: 'de-DE' });
  const seite = await ctx.newPage();
  const skripte = [];
  const fehler = [];
  beobachte(seite, fehler);
  seite.on('request', (r) => skripte.push(r.url()));
  await seite.goto(haupt.url + '/', { waitUntil: 'networkidle' });
  await seite.waitForTimeout(3500);
  await seite.screenshot({ path: join(BILDER, 'hero-poster-ohne-webgl-1440.png') });
  const ken = await seite.evaluate(() => getComputedStyle(document.querySelector('.hero-poster img')).animationName);
  pruefe('Ohne WebGL: Poster mit Ken-Burns, three.js nicht geladen', ken === 'ken-burns' && !skripte.some((u) => /szene\./.test(u)), ken);
  pruefe('Ohne WebGL: keine Konsolenfehler', fehler.length === 0, fehler.join(' | '));
  await ohneGl.close();
}

/* ------------------------------------------------------------------
   4. Schalter „Bewegung reduzieren" (Footer, localStorage)
   ------------------------------------------------------------------ */
{
  const { ctx } = await kontext(haupt, { viewport: GROESSEN[1440] });
  const seite = await ctx.newPage();
  await seite.goto(haupt.url + '/geschichte/', { waitUntil: 'networkidle' });
  await seite.click('[data-bewegung-schalter]');
  const nachKlick = await seite.evaluate(() => ({
    b: document.documentElement.dataset.bewegung,
    p: document.querySelector('[data-bewegung-schalter]').getAttribute('aria-pressed'),
    s: localStorage.getItem('mswohldorf-bewegung'),
  }));
  await seite.reload({ waitUntil: 'networkidle' });
  const nachLaden = await seite.evaluate(() => document.documentElement.dataset.bewegung);
  pruefe('Footer-Schalter: schaltet Bewegung aus und merkt es sich', nachKlick.b === 'aus' && nachKlick.p === 'true' && nachKlick.s === 'aus' && nachLaden === 'aus', JSON.stringify({ ...nachKlick, nachLaden }));
  await ctx.close();
}

/* ------------------------------------------------------------------
   5. Lightbox und Karussell per Tastatur
   ------------------------------------------------------------------ */
{
  const { ctx, fehler } = await kontext(haupt, { viewport: GROESSEN[1440] });
  const seite = await ctx.newPage();
  await seite.goto(haupt.url + '/galerie/', { waitUntil: 'networkidle' });
  // Karussell
  await seite.focus('[data-k-buehne]');
  const vor = await seite.textContent('[data-k-zaehler]');
  await seite.keyboard.press('ArrowRight');
  await seite.waitForTimeout(900);
  const nach = await seite.textContent('[data-k-zaehler]');
  pruefe('Karussell: Pfeiltaste dreht weiter', vor !== nach, `${vor} → ${nach}`);
  await seite.screenshot({ path: join(BILDER, 'galerie-karussell-1440.png') });
  // Raster + Lightbox
  await seite.click('[data-ansicht="raster"]');
  await durchscrollen(seite);
  await seite.waitForTimeout(800);
  await seite.screenshot({ path: join(BILDER, 'galerie-alle-1440.jpg'), fullPage: true, type: 'jpeg', quality: 80 });
  const kachel = seite.locator('[data-ansicht-flaeche="raster"] [data-lightbox-bild]').first();
  await kachel.focus();
  await seite.keyboard.press('Enter');
  await seite.waitForSelector('dialog[data-lightbox][open]');
  const z1 = await seite.textContent('[data-lb-zaehler]');
  await seite.keyboard.press('ArrowRight');
  await seite.waitForTimeout(500);
  const z2 = await seite.textContent('[data-lb-zaehler]');
  await seite.waitForTimeout(300);
  await seite.screenshot({ path: join(BILDER, 'lightbox-1440.png') });
  await seite.keyboard.press('ArrowLeft');
  await seite.waitForTimeout(500);
  const z3 = await seite.textContent('[data-lb-zaehler]');
  await seite.keyboard.press('Escape');
  await seite.waitForTimeout(200);
  const zu = await seite.evaluate(() => !document.querySelector('dialog[data-lightbox]').open);
  const fokus = await seite.evaluate(() => document.activeElement?.matches('[data-ansicht-flaeche="raster"] li:first-child [data-lightbox-bild]'));
  pruefe('Lightbox: Enter öffnet, → / ← blättern', /^Bild 1 von \d+$/.test(z1) && /^Bild 2 von/.test(z2) && /^Bild 1 von/.test(z3), `${z1} → ${z2} → ${z3}`);
  pruefe('Lightbox: Esc schließt, Fokus zurück auf die Kachel', zu && fokus);
  pruefe('Galerie: keine Konsolenfehler', fehler.length === 0, fehler.join(' | '));
  await ctx.close();
}

/* ------------------------------------------------------------------
   5b. Navigation per Tastatur (Desktop-Aufklappmenü, Mobilmenü)
   ------------------------------------------------------------------ */
{
  const { ctx } = await kontext(haupt, { viewport: GROESSEN[1440] });
  const seite = await ctx.newPage();
  await seite.goto(haupt.url + '/impressum/', { waitUntil: 'networkidle' });
  await seite.focus('[data-aufklapp-knopf]');
  await seite.keyboard.press('Enter');
  const offen = await seite.getAttribute('[data-aufklapp-knopf]', 'aria-expanded');
  await seite.waitForTimeout(50);
  await seite.keyboard.press('Tab');
  const ziel = await seite.evaluate(() => document.activeElement?.getAttribute('href'));
  await seite.keyboard.press('Escape');
  const zu = await seite.getAttribute('[data-aufklapp-knopf]', 'aria-expanded');
  const fokus = await seite.evaluate(() => document.activeElement?.hasAttribute('data-aufklapp-knopf'));
  pruefe('Menü „Anlässe": Enter öffnet, Tab in die Liste, Esc schließt mit Fokus zurück', offen === 'true' && ziel === '/anlaesse/firmenevent/' && zu === 'false' && fokus, `${offen} ${ziel} ${zu} ${fokus}`);
  await ctx.close();

  const m = await kontext(haupt, { viewport: GROESSEN[390] });
  const s = await m.ctx.newPage();
  await s.goto(haupt.url + '/', { waitUntil: 'networkidle' });
  await s.focus('[data-menue-knopf]');
  await s.keyboard.press('Enter');
  await s.waitForTimeout(700);
  const z = await s.evaluate(() => ({
    offen: !document.querySelector('[data-mobil-menue]').hidden,
    fokusImMenue: document.querySelector('[data-mobil-menue]').contains(document.activeElement),
    hauptInert: document.querySelector('main').inert,
  }));
  await s.screenshot({ path: join(BILDER, 'menue-mobil-390.png') });
  await s.keyboard.press('Escape');
  const danach = await s.evaluate(() => ({ zu: document.querySelector('[data-mobil-menue]').hidden, fokus: document.activeElement?.hasAttribute('data-menue-knopf'), inert: document.querySelector('main').inert }));
  pruefe('Mobilmenü: öffnet per Tastatur, Fokus im Menü, Rest inert; Esc schließt', z.offen && z.fokusImMenue && z.hauptInert && danach.zu && danach.fokus && !danach.inert, JSON.stringify({ ...z, ...danach }));
  await m.ctx.close();
}

/* ------------------------------------------------------------------
   6. Formular — ohne Ziel-URL (Vorschau) und mit gemocktem Server
   ------------------------------------------------------------------ */
async function fuelle(seite, id) {
  await seite.selectOption(`#${id}-anlass`, 'Firmenevent');
  await seite.fill(`#${id}-gaeste`, '24');
  await seite.fill(`#${id}-datum`, '2027-06-12');
  await seite.fill(`#${id}-ausweichdatum`, '2027-06-19');
  await seite.fill(`#${id}-name`, 'Erika Mustermann');
  await seite.fill(`#${id}-email`, 'erika@example.org');
  await seite.fill(`#${id}-telefon`, '+49 40 123456');
  await seite.fill(`#${id}-nachricht`, 'Sommerfest für unser Team, gern ab 18 Uhr.');
  await seite.check(`#${id}-einwilligung`);
}
{
  const { ctx, extern, fehler } = await kontext(haupt, { viewport: GROESSEN[390] });
  const seite = await ctx.newPage();
  await seite.goto(haupt.url + '/anfrage/?anlass=film-und-foto', { waitUntil: 'networkidle' });
  pruefe('Formular: Vorauswahl aus ?anlass=', (await seite.inputValue('#anfrage-seite-anlass')) === 'Film & Foto');
  pruefe('Formular ohne URL: Vorschau-Hinweis sichtbar', await seite.isVisible('[data-vorschau-hinweis]'));
  await seite.selectOption('#anfrage-seite-anlass', '');
  await seite.click('#anfrage-seite [data-senden]');
  const pruefung = await seite.evaluate(() => ({
    liste: !document.querySelector('#anfrage-seite [data-fehlerliste]').hidden,
    fokus: document.activeElement?.hasAttribute('data-fehlerliste'),
    ungueltig: document.querySelectorAll('#anfrage-seite [aria-invalid="true"]').length,
    text: document.querySelector('#anfrage-seite-email-fehler').textContent,
  }));
  pruefe('Formular: Prüfung zeigt Fehlerliste, Fokus darauf, Felder markiert', pruefung.liste && pruefung.fokus && pruefung.ungueltig >= 5, JSON.stringify(pruefung));
  await seite.screenshot({ path: join(BILDER, 'formular-fehler-390.png'), fullPage: false });
  await fuelle(seite, 'anfrage-seite');
  await seite.fill('#anfrage-seite-gaeste', '40');
  await seite.click('#anfrage-seite [data-senden]');
  pruefe('Formular: Gäste > 35 wird abgelehnt', (await seite.textContent('#anfrage-seite-gaeste-fehler')).includes('zwischen 1 und 35'));
  await seite.fill('#anfrage-seite-gaeste', '24');
  await seite.click('#anfrage-seite [data-senden]');
  const status = await seite.textContent('#anfrage-seite [data-status]');
  const mailto = await seite.getAttribute('#anfrage-seite [data-status] a', 'href');
  pruefe('Formular ohne URL: Vorschau-Meldung + Mail-Ersatz', status.includes('Vorschau: Das Formular ist noch nicht verbunden') && status.includes('info@finanzelot.de') && mailto?.startsWith('mailto:info@finanzelot.de?subject='), status.slice(0, 90));
  pruefe('Formular ohne URL: keine Anfrage nach außen', extern.length === 0, extern.join(' '));
  pruefe('Formular ohne URL: keine Konsolenfehler', fehler.length === 0, fehler.join(' | '));
  await ctx.close();
}
{
  const faelle = [
    { name: '202', antwort: { status: 202, body: { ok: true } }, erwartet: 'Danke! Ihre Anfrage ist angekommen.' },
    { name: '400', antwort: { status: 400, body: { fehler: 'feld', feld: 'email', satz: 'Diese Adresse nimmt keine E-Mails an.' } }, erwartet: 'Diese Adresse nimmt keine E-Mails an.' },
    { name: '429', antwort: { status: 429, body: { fehler: 'zu_viele' } }, erwartet: 'sehr viele Anfragen' },
    { name: '503', antwort: { status: 503, body: { fehler: 'aus' } }, erwartet: 'abgeschaltet' },
    { name: 'Netzfehler', antwort: null, erwartet: 'nicht erreichen' },
  ];
  for (const fall of faelle) {
    const { ctx, extern, fehler } = await kontext(verbunden, { viewport: GROESSEN[1440] }, { erlaubt: [ANFRAGE_TEST_URL] });
    let gesendet = null;
    let kopf = null;
    await ctx.route(ANFRAGE_TEST_URL, async (route) => {
      const r = route.request();
      if (r.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST' } });
      gesendet = JSON.parse(r.postData() ?? 'null');
      kopf = r.headers()['content-type'];
      if (!fall.antwort) return route.abort('connectionrefused');
      return route.fulfill({ status: fall.antwort.status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(fall.antwort.body) });
    });
    const seite = await ctx.newPage();
    await seite.goto(verbunden.url + '/anfrage/', { waitUntil: 'networkidle' });
    pruefe(`Formular verbunden (${fall.name}): kein Vorschau-Hinweis`, !(await seite.isVisible('[data-vorschau-hinweis]')));
    await seite.waitForTimeout(400);
    await fuelle(seite, 'anfrage-seite');
    await seite.click('#anfrage-seite [data-senden]');
    await seite.waitForTimeout(800);
    const sichtbar = await seite.evaluate(() => document.body.innerText);
    pruefe(`Formular verbunden (${fall.name}): Meldung „${fall.erwartet}"`, sichtbar.includes(fall.erwartet));
    if (fall.name === '202') {
      const schluessel = ['quelle', 'anlass', 'datum', 'ausweichdatum', 'gaeste', 'name', 'email', 'telefon', 'nachricht', 'einwilligung', 'website', 'dauerMs'];
      const g = gesendet ?? {};
      const vertrag =
        JSON.stringify(Object.keys(g).sort()) === JSON.stringify([...schluessel].sort()) &&
        g.quelle === 'mswohldorf' &&
        g.anlass === 'Firmenevent' &&
        g.datum === '2027-06-12' &&
        g.ausweichdatum === '2027-06-19' &&
        g.gaeste === 24 &&
        g.name === 'Erika Mustermann' &&
        g.email === 'erika@example.org' &&
        g.telefon === '+49 40 123456' &&
        typeof g.nachricht === 'string' &&
        g.einwilligung === true &&
        g.website === '' &&
        typeof g.dauerMs === 'number' &&
        g.dauerMs > 0;
      pruefe('Formular verbunden: JSON entspricht dem Vertrag', vertrag && kopf?.startsWith('application/json'), JSON.stringify(g));
      pruefe('Erfolg ohne „erstantwort“: kein Hinweis auf automatische E-Mail, aber Exposé/Anruf/Rundgang angeboten', !(await seite.isVisible('[data-erfolg="anfrage-seite"] [data-erstantwort-hinweis]')) && (await seite.isVisible('[data-erfolg="anfrage-seite"] a[href="/pdf/ms-wohldorf-expose.pdf"]')) && (await seite.isVisible('[data-erfolg="anfrage-seite"] a[href^="tel:"]')));
      bericht.beispielAnfrage = g;
      await seite.screenshot({ path: join(BILDER, 'formular-erfolg-1440.png') });
    }
    if (fall.name === '400') pruefe('Formular verbunden (400): Feld E-Mail markiert', (await seite.getAttribute('#anfrage-seite-email', 'aria-invalid')) === 'true');
    pruefe(`Formular verbunden (${fall.name}): sonst keine externen Anfragen`, extern.length === 0, extern.join(' '));
    const echteFehler = fehler.filter((f) => !/Failed to load resource|net::ERR_|status of (400|429|503)/.test(f));
    pruefe(`Formular verbunden (${fall.name}): keine Skriptfehler`, echteFehler.length === 0, echteFehler.join(' | '));
    await ctx.close();
  }
  // Leere Felder bleiben null
  const { ctx } = await kontext(verbunden, { viewport: GROESSEN[1440] }, { erlaubt: [ANFRAGE_TEST_URL] });
  let gesendet = null;
  await ctx.route(ANFRAGE_TEST_URL, (route) => {
    gesendet = JSON.parse(route.request().postData() ?? 'null');
    return route.fulfill({ status: 202, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":true}' });
  });
  const seite = await ctx.newPage();
  await seite.goto(verbunden.url + '/', { waitUntil: 'networkidle' });
  await seite.selectOption('#anfrage-start-anlass', 'Sonstiges');
  await seite.fill('#anfrage-start-name', 'Max Muster');
  await seite.fill('#anfrage-start-email', 'max@example.org');
  await seite.fill('#anfrage-start-nachricht', 'Kurze Frage zur Verfügbarkeit im Mai.');
  await seite.check('#anfrage-start-einwilligung');
  await seite.click('#anfrage-start [data-senden]');
  await seite.waitForTimeout(600);
  const g = gesendet ?? {};
  pruefe('Kompaktformular (Start): leere Felder werden null', g.datum === null && g.ausweichdatum === null && g.gaeste === null && g.telefon === null && g.anlass === 'Sonstiges', JSON.stringify(g));
  await ctx.close();
}

/* ------------------------------------------------------------------
   6b. Schnellanfrage + automatische Erstantwort (gleicher Vertrag)
   ------------------------------------------------------------------ */
{
  const { ctx, extern, fehler } = await kontext(verbunden, { viewport: GROESSEN[390] }, { erlaubt: [ANFRAGE_TEST_URL] });
  let gesendet = null;
  await ctx.route(ANFRAGE_TEST_URL, (route) => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST' } });
    gesendet = JSON.parse(route.request().postData() ?? 'null');
    return route.fulfill({ status: 202, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":true,"erstantwort":true}' });
  });
  const seite = await ctx.newPage();
  await seite.goto(verbunden.url + '/offsite-hamburg/', { waitUntil: 'networkidle' });
  const id = 'schnell-offsite';
  pruefe('Schnellanfrage (Offsite): Anlass vorausgewählt, kein Nachrichten-Pflichtfeld', (await seite.inputValue(`#${id}-anlass`)) === 'Workshop/Seminar' && (await seite.locator(`#${id} [name="nachricht"]`).count()) === 0);
  await seite.click(`#${id} [data-senden]`);
  const fehlerZahl = await seite.locator(`#${id} [aria-invalid="true"]`).count();
  pruefe('Schnellanfrage: Prüfung greift (Name, E-Mail, Einwilligung)', fehlerZahl === 3, String(fehlerZahl));
  await seite.fill(`#${id}-gaeste`, '18');
  await seite.fill(`#${id}-datum`, '2027-03-04');
  await seite.fill(`#${id}-name`, 'Team Lead Berlin');
  await seite.fill(`#${id}-email`, 'team@example.org');
  await seite.check(`#${id}-einwilligung`);
  await seite.click(`#${id} [data-senden]`);
  await seite.waitForTimeout(800);
  const g = gesendet ?? {};
  const schluessel = ['quelle', 'anlass', 'datum', 'ausweichdatum', 'gaeste', 'name', 'email', 'telefon', 'nachricht', 'einwilligung', 'website', 'dauerMs'];
  pruefe(
    'Schnellanfrage: gleicher JSON-Vertrag, Nachricht aus der Vorlage',
    JSON.stringify(Object.keys(g).sort()) === JSON.stringify([...schluessel].sort()) && g.anlass === 'Workshop/Seminar' && g.gaeste === 18 && g.datum === '2027-03-04' && g.telefon === null && g.ausweichdatum === null && typeof g.nachricht === 'string' && g.nachricht.startsWith('Schnellanfrage über die Website (/offsite-hamburg/)'),
    JSON.stringify(g),
  );
  pruefe('Erfolg mit „erstantwort: true“: E-Mail wird angekündigt', await seite.isVisible(`[data-erfolg="${id}"] [data-erstantwort-hinweis]`));
  pruefe('Schnellanfrage: keine externen Anfragen außer dem Anfrage-Ziel, keine Skriptfehler', extern.length === 0 && fehler.length === 0, [...extern, ...fehler].join(' | '));
  await seite.screenshot({ path: join(BILDER, 'schnellanfrage-erfolg-390.png') });
  await ctx.close();
}

/* ------------------------------------------------------------------
   6c. Lead-Quelle (nur mit PUBLIC_ANFRAGE_ERWEITERT=1 → dist-erweitert/)
   ------------------------------------------------------------------ */
{
  const erweitert = await starteServer({ ordner: join(PROJEKT, 'dist-erweitert'), port: 4403 });
  const { ctx } = await kontext(erweitert, { viewport: GROESSEN[1440] }, { erlaubt: [ANFRAGE_TEST_URL] });
  let gesendet = null;
  await ctx.route(ANFRAGE_TEST_URL, (route) => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST' } });
    gesendet = JSON.parse(route.request().postData() ?? 'null');
    return route.fulfill({ status: 202, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":true}' });
  });
  const seite = await ctx.newPage();
  await seite.goto(erweitert.url + '/', { waitUntil: 'networkidle' });
  await seite.goto(erweitert.url + '/offsite-hamburg/?utm_source=linkedin&utm_campaign=offsite-berlin', { waitUntil: 'networkidle', referer: erweitert.url + '/' });
  const id = 'schnell-offsite';
  await seite.fill(`#${id}-name`, 'Team Lead Berlin');
  await seite.fill(`#${id}-email`, 'team@example.org');
  await seite.check(`#${id}-einwilligung`);
  await seite.click(`#${id} [data-senden]`);
  await seite.waitForTimeout(800);
  const g = gesendet ?? {};
  const h = g.herkunft ?? {};
  pruefe(
    'Lead-Quelle (erweitert): art + herkunft mit Seite, vorheriger Seite und utm',
    g.art === 'schnell' && h.seite === '/offsite-hamburg/' && h.zuvor === '/' && h.extern === null && h.utm?.source === 'linkedin' && h.utm?.campaign === 'offsite-berlin',
    JSON.stringify({ art: g.art, herkunft: h }),
  );
  const speicher = await seite.evaluate(() => ({ lokal: localStorage.length, sitzung: sessionStorage.length, kekse: document.cookie }));
  pruefe('Lead-Quelle: nichts auf dem Gerät gespeichert', speicher.lokal === 0 && speicher.sitzung === 0 && speicher.kekse === '', JSON.stringify(speicher));
  await seite.goto(erweitert.url + '/datenschutz/', { waitUntil: 'networkidle' });
  pruefe('Lead-Quelle: Absatz in der Datenschutzerklärung (nur erweitert)', (await seite.textContent('main')).includes('wie Sie auf uns aufmerksam geworden sind'));
  await ctx.close();
  await erweitert.schliesse();
  const normal = await readFile(join(PROJEKT, 'dist/datenschutz/index.html'), 'utf8');
  pruefe('Ohne Schalter: kein Lead-Quellen-Absatz in der Datenschutzerklärung', !normal.includes('wie Sie auf uns aufmerksam geworden sind'));
}

/* ------------------------------------------------------------------
   6d. Exposé (Lead-Magnet)
   ------------------------------------------------------------------ */
{
  const pdf = await readFile(join(PROJEKT, 'dist/pdf/ms-wohldorf-expose.pdf'));
  const seiten = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  pruefe('Exposé: PDF in dist/, 4 Seiten, unter 3 MB', pdf.subarray(0, 5).toString() === '%PDF-' && seiten === 4 && pdf.length < 3 * 1024 * 1024, `${seiten} Seiten, ${(pdf.length / 1024 / 1024).toFixed(1)} MB`);
  const druck = await readFile(join(PROJEKT, 'dist/expose/index.html'), 'utf8');
  const karte = await readFile(join(PROJEKT, 'dist/sitemap-0.xml'), 'utf8');
  pruefe('Exposé-Druckseite: noindex, nicht in der Sitemap, keine Skripte', druck.includes('noindex') && !karte.includes('/expose/') && !druck.includes('<script'));
  const mitKnopf = [];
  for (const pfad of ['/', '/anfrage/', '/haeufige-fragen/', '/offsite-hamburg/', '/anlaesse/firmenevent/']) {
    const html = await readFile(join(PROJEKT, 'dist', pfad, 'index.html'), 'utf8');
    if (html.includes('href="/pdf/ms-wohldorf-expose.pdf"') && html.includes('data-expose-knopf')) mitKnopf.push(pfad);
  }
  pruefe('Exposé-Download auf Start, Anfrage, Fragen, Offsite und Anlass-Seiten', mitKnopf.length === 5, mitKnopf.join(', '));
}

/* ------------------------------------------------------------------
   7. Barrierefreiheit (axe-core, WCAG 2.2 A/AA)
   ------------------------------------------------------------------ */
{
  const axe = await readFile(require.resolve('axe-core/axe.min.js', { paths: [PROJEKT] }), 'utf8');
  for (const [breite, viewport] of Object.entries(GROESSEN)) {
    const ctx = await browser.newContext({ viewport, bypassCSP: true, locale: 'de-DE', reducedMotion: 'reduce' });
    await ctx.route('**/*', (r) => (r.request().url().startsWith(haupt.url) ? r.fallback() : r.abort()));
    const seite = await ctx.newPage();
    for (const pfad of SEITEN) {
      await seite.goto(haupt.url + pfad, { waitUntil: 'networkidle' });
      await seite.addScriptTag({ content: axe });
      const r = await seite.evaluate(async () => {
        const e = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
        return e.violations.map((v) => ({ id: v.id, wirkung: v.impact, anzahl: v.nodes.length, beispiel: v.nodes[0]?.target?.join(' ') }));
      });
      bericht.axe[`${pfad}@${breite}`] = r;
      pruefe(`axe ${pfad} @${breite}: keine WCAG-2.2-AA-Verstöße`, r.length === 0, r.map((v) => `${v.id}×${v.anzahl} (${v.beispiel})`).join(' | '));
    }
    await ctx.close();
  }
}

/* ------------------------------------------------------------------
   8. Seitengewicht „/" (erster Aufruf, ohne Scrollen)
   ------------------------------------------------------------------ */
for (const [breite, viewport] of Object.entries(GROESSEN)) {
  const ctx = await browser.newContext({ viewport, locale: 'de-DE' });
  const seite = await ctx.newPage();
  const posten = [];
  seite.on('response', async (res) => {
    try {
      const body = await res.body();
      const url = res.url();
      const typ = res.request().resourceType();
      const text = /^(document|stylesheet|script)$/.test(typ) || url.endsWith('.svg');
      posten.push({ url: url.replace(haupt.url, ''), typ, roh: body.length, gzip: text ? gzipSync(body, { level: 9 }).length : body.length, zeit: Date.now() });
    } catch {
      /* Weiterleitungen ohne Inhalt */
    }
  });
  const t0 = Date.now();
  await seite.goto(haupt.url + '/', { waitUntil: 'load' });
  const ladeEnde = Date.now();
  // LCP: alle Kandidaten 4 s lang sammeln, der letzte zählt.
  const lcp = await seite.evaluate(
    () =>
      new Promise((ok) => {
        let letzte = null;
        new PerformanceObserver((l) => {
          letzte = l.getEntries().at(-1);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        setTimeout(() => {
          const e = letzte;
          ok(e ? { ms: Math.round(e.startTime), element: e.element?.tagName + (e.element?.className ? `.${String(e.element.className).split(' ')[0]}` : ''), url: e.url?.replace(location.origin, '') } : null);
        }, 4000);
      }),
  );
  await seite.waitForTimeout(6000); // Leerlauf: 3D-Bühne lädt nach
  const beimLaden = posten.filter((p) => p.zeit <= ladeEnde + 50);
  const spaeter = posten.filter((p) => p.zeit > ladeEnde + 50);
  const summe = (liste, f = (p) => p.gzip) => liste.reduce((s, p) => s + f(p), 0);
  const nachTyp = {};
  for (const p of beimLaden) nachTyp[p.typ] = (nachTyp[p.typ] ?? 0) + p.gzip;
  bericht.gewicht[breite] = {
    lcp,
    ladezeitMsLokal: ladeEnde - t0,
    beimLadenKB: Math.round(summe(beimLaden) / 1024),
    nachTypKB: Object.fromEntries(Object.entries(nachTyp).map(([k, v]) => [k, Math.round(v / 1024)])),
    beimLaden: beimLaden.map((p) => `${p.typ} ${Math.round(p.gzip / 1024)} kB ${p.url}`),
    nachgeladen3D: spaeter.map((p) => `${p.typ} ${Math.round(p.gzip / 1024)} kB ${p.url}`),
    nachgeladen3DKB: Math.round(summe(spaeter) / 1024),
  };
  console.log(`Seitengewicht / @${breite}: ${bericht.gewicht[breite].beimLadenKB} kB beim Laden (gzip), 3D danach: ${bericht.gewicht[breite].nachgeladen3DKB} kB; LCP ${lcp?.ms} ms (${lcp?.element} ${lcp?.url ?? ''})`);
  await ctx.close();
}

/* ------------------------------------------------------------------
   9. Statische Prüfungen: SEO-Grundlagen, Vorschau-Build
   ------------------------------------------------------------------ */
{
  const html = await readFile(join(PROJEKT, 'dist/index.html'), 'utf8');
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const ort = ld.flat().find((x) => Array.isArray(x['@type']) && x['@type'].includes('EventVenue'));
  pruefe('JSON-LD: EventVenue/LocalBusiness mit Geo und 35 Gästen', ort?.maximumAttendeeCapacity === 35 && ort?.geo?.latitude > 53 && ort['@type'].includes('LocalBusiness'));
  pruefe('Kanonische URL auf www.mswohldorf.de', html.includes('<link rel="canonical" href="https://www.mswohldorf.de/">'));
  pruefe('Produktiv-Build ohne noindex (dist/ aus „npm run build“, nicht mit PUBLIC_VORSCHAU=1)', !html.includes('noindex'));
  const sitemap = await readFile(join(PROJEKT, 'dist/sitemap-0.xml'), 'utf8');
  const seitenOhne404 = SEITEN.filter((p) => p !== '/gibt-es-nicht/');
  const fehlen = seitenOhne404.filter((p) => !sitemap.includes(`<loc>https://www.mswohldorf.de${p}</loc>`));
  pruefe(`Sitemap enthält alle ${seitenOhne404.length} Seiten, ohne 404`, (sitemap.match(/<loc>/g) ?? []).length === seitenOhne404.length && fehlen.length === 0 && !sitemap.includes('404'), `${(sitemap.match(/<loc>/g) ?? []).length} Einträge, fehlen: ${fehlen.join(', ') || '–'}`);
  const faqHtml = await readFile(join(PROJEKT, 'dist/haeufige-fragen/index.html'), 'utf8');
  const faq = [...faqHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])).flat().find((x) => x['@type'] === 'FAQPage');
  const sichtbareFragen = (faqHtml.match(/<details class="frage/g) ?? []).length;
  pruefe('FAQPage-Schema: jede sichtbare Frage auch im Schema', faq?.mainEntity?.length > 0 && faq.mainEntity.length === sichtbareFragen && faq.mainEntity.every((q) => q.name && q.acceptedAnswer?.text), `${faq?.mainEntity?.length} im Schema, ${sichtbareFragen} sichtbar`);
  const llms = await readFile(join(PROJEKT, 'dist/llms.txt'), 'utf8');
  pruefe('llms.txt: Titel, Eckdaten, Fragen und Links auf www.mswohldorf.de', llms.startsWith('# MS Wohldorf') && llms.includes('bis zu 35 Personen') && llms.includes('## Häufige Fragen') && llms.includes('https://www.mswohldorf.de/offsite-hamburg/'));
  const robots = await readFile(join(PROJEKT, 'dist/robots.txt'), 'utf8');
  pruefe('robots.txt verweist auf Sitemap', robots.includes('Sitemap: https://www.mswohldorf.de/sitemap-index.xml'));
  const vorschau = [];
  const sammle = async (o) => {
    for (const e of await readdir(o, { withFileTypes: true })) {
      if (e.isDirectory()) await sammle(join(o, e.name));
      // Die Exposé-Druckseite ist nur Vorlage fürs PDF (immer noindex, ohne Band)
      else if (e.name.endsWith('.html') && !join(o, e.name).includes(`${'/'}expose${'/'}`)) vorschau.push(await readFile(join(o, e.name), 'utf8'));
    }
  };
  await sammle(join(PROJEKT, 'dist-vorschau'));
  pruefe('Vorschau-Build: jede Seite noindex,nofollow + Band', vorschau.length >= 12 && vorschau.every((h) => h.includes('<meta name="robots" content="noindex,nofollow">') && h.includes('vorschau-band')), `${vorschau.length} Seiten`);
  const kopf = await readFile(join(PROJEKT, 'dist-test/_headers'), 'utf8');
  pruefe('CSP (verbunden): connect-src enthält das Anfrage-Ziel', kopf.includes("connect-src 'self' https://anfrage.example.test"));
}

/* ------------------------------------------------------------------
   10. Platzhalter und Livegang-Sperre
       a) Vorschau (dist-vorschau): offene Angaben als gestrichelte Kästen
       b) Produktion (dist): „Angabe folgt“/„bitte von Uli ergänzen“ nur noch
          in rechtlichen Kästen — und jeder davon sperrt den Build; die
          offen-Listen der Anlässe sind EIN Satz mit Anfrage-Link
       c) Prüfprojekt tests/livegang-sperre/ (unabhängig vom Stand der Website):
          Produktion ohne rechtlichen Rest läuft durch und zeigt neutralen Text,
          mit rechtlichem Rest scheitert sie mit Seite + Text, Vorschau läuft durch
   ------------------------------------------------------------------ */
{
  const zaehle = (text, teil) => text.split(teil).length - 1;
  const klartext = (html) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  async function htmlSeiten(ordner) {
    const seiten = new Map();
    const sammle = async (o) => {
      for (const e of await readdir(o, { withFileTypes: true })) {
        if (e.isDirectory()) await sammle(join(o, e.name));
        else if (e.name.endsWith('.html')) seiten.set(seitenPfad(relative(ordner, join(o, e.name))), await readFile(join(o, e.name), 'utf8'));
      }
    };
    await sammle(ordner);
    return seiten;
  }
  const vorschauSeiten = await htmlSeiten(join(PROJEKT, 'dist-vorschau'));
  const produktion = await htmlSeiten(join(PROJEKT, 'dist'));

  // a) Vorschau: Kästen sichtbar, gestrichelt, mit „Angabe folgt — bitte von Uli ergänzen“
  const vorschau = await starteServer({ ordner: join(PROJEKT, 'dist-vorschau'), port: 4402 });
  const { ctx } = await kontext(vorschau, { viewport: GROESSEN[1440], reducedMotion: 'reduce' });
  const seite = await ctx.newPage();
  let kaestenGesamt = 0;
  for (const pfad of SEITEN.filter((p) => p !== '/gibt-es-nicht/')) {
    await seite.goto(vorschau.url + pfad, { waitUntil: 'networkidle' });
    const z = await seite.evaluate(() => {
      const k = [...document.querySelectorAll('[data-platzhalter]')];
      return {
        kaesten: k.length,
        pflicht: k.filter((e) => e.dataset.platzhalter === 'pflicht').length,
        sichtbar: k.every((e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'),
        gestrichelt: k.every((e) => getComputedStyle(e).borderTopStyle === 'dashed'),
        text: k.every((e) => e.textContent.includes('Angabe folgt') && e.textContent.includes('bitte von Uli ergänzen')),
        ersatz: document.querySelectorAll('[data-platzhalter-ersatz]').length,
        sperre: document.querySelectorAll('[data-livegang-sperre]').length,
      };
    });
    kaestenGesamt += z.kaesten;
    if (z.kaesten + z.ersatz + z.sperre > 0) {
      pruefe(`Vorschau ${pfad}: ${z.kaesten} Platzhalter als gestrichelte Kästen (${z.pflicht} rechtlich), kein Ersatztext, keine Sperre`, z.sichtbar && z.gestrichelt && z.text && z.ersatz === 0 && z.sperre === 0, JSON.stringify(z));
    }
    if (pfad === '/anlaesse/firmenevent/' && z.kaesten > 0) await seite.locator('.offen-kasten').screenshot({ path: join(BILDER, 'platzhalter-vorschau-1440.png') });
  }
  console.log(`ℹ Vorschau: ${kaestenGesamt} Platzhalter-Kästen auf allen Seiten zusammen.`);
  await ctx.close();
  await vorschau.schliesse();

  // b) Produktion: Platzhaltertext nur in rechtlichen Kästen, jeder davon sperrt den Build
  const livegang = [];
  const inhaltKasten = [];
  const fremderText = [];
  const ohneSperre = [];
  for (const [pfad, html] of produktion) {
    const pflicht = zaehle(html, 'data-platzhalter="pflicht"');
    const entwurf = (html.match(/\sdata-entwurf-hinweis[\s>]/g) ?? []).length;
    const gruende = sperrGruende(html);
    livegang.push(...gruende.map((grund) => ({ seite: pfad, grund })));
    if (zaehle(html, 'data-platzhalter="inhalt"') > 0) inhaltKasten.push(pfad);
    // Jeder rechtliche Kasten enthält beide Wendungen genau einmal — mehr Treffer = Platzhaltertext außerhalb.
    if (zaehle(html, 'Angabe folgt') !== pflicht || zaehle(html, 'bitte von Uli ergänzen') !== pflicht) fremderText.push(pfad);
    if (gruende.length !== pflicht + entwurf) ohneSperre.push(`${pfad} (${gruende.length} Sperren für ${pflicht} Kästen + ${entwurf} Entwurf)`);
  }
  pruefe(`Produktion: keine inhaltlichen Platzhalter-Kästen (${produktion.size} Seiten)`, inhaltKasten.length === 0, inhaltKasten.join(' '));
  pruefe('Produktion: „Angabe folgt“/„bitte von Uli ergänzen“ nur in rechtlichen Kästen, Seiten ohne rechtlichen Rest ganz ohne', fremderText.length === 0, fremderText.join(' '));
  pruefe('Produktion: jeder rechtliche Rest (Platzhalter, Entwurf-Hinweis) sperrt den Build', ohneSperre.length === 0, ohneSperre.join(' | '));
  for (const pfad of SEITEN.filter((p) => p.startsWith('/anlaesse/'))) {
    const slug = pfad.split('/')[2];
    const offen = zaehle(vorschauSeiten.get(pfad) ?? '', 'data-platzhalter="inhalt"');
    const html = produktion.get(pfad) ?? '';
    const saetze = [...html.matchAll(/<p\b[^>]*\sdata-platzhalter-ersatz\b[^>]*>([\s\S]*?)<\/p>/g)];
    const satz = saetze.length === 1 ? klartext(saetze[0][1]) : '';
    const ok =
      offen === 0
        ? saetze.length === 0
        : saetze.length === 1 &&
          /^[A-ZÄÖÜ].+ stimmen wir individuell mit Ihnen ab — sprechen Sie uns an\.$/.test(satz) &&
          !/\s[.,;:]|\s{2}/.test(satz) &&
          saetze[0][1].includes(`href="/anfrage/?anlass=${slug}"`) &&
          !html.includes('Diese Details klären wir gern persönlich');
    pruefe(`Produktion ${pfad}: ${offen} offene Punkte → ein Satz mit Anfrage-Link`, ok, satz || `${saetze.length} Sätze`);
  }
  {
    const { ctx: p } = await kontext(haupt, { viewport: GROESSEN[1440], reducedMotion: 'reduce' });
    const s = await p.newPage();
    await s.goto(haupt.url + '/anlaesse/firmenevent/', { waitUntil: 'networkidle' });
    await s.locator('.offen-kasten').screenshot({ path: join(BILDER, 'platzhalter-produktion-1440.png') });
    await p.close();
  }
  bericht.livegang = { gesperrt: livegang.length > 0, stellen: livegang };
  console.log(
    livegang.length
      ? `ℹ Livegang gesperrt (erwartet, solange rechtliche Angaben offen sind): ${livegang.length} Stelle(n) in dist/ — „npm run build“ bricht ab:\n${livegang.map((f) => `    ${f.seite}  ${f.grund}`).join('\n')}`
      : 'ℹ Keine rechtlichen Reste in dist/ — der Produktions-Build läuft durch.',
  );

  // c) Prüfprojekt: echte Komponente + echte Sperre, eigene Seiten
  const ASTRO = join(PROJEKT, 'node_modules/astro/bin/astro.mjs');
  async function baue(fall, zusatz) {
    const ausgabe = join(PROJEKT, 'test-ergebnisse/livegang-sperre', fall);
    await rm(ausgabe, { recursive: true, force: true });
    const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', PRUEF_AUSGABE: ausgabe };
    for (const k of ['PUBLIC_VORSCHAU', 'PUBLIC_ANFRAGE_URL', 'PRUEF_MIT_PFLICHT']) delete env[k];
    const r = spawnSync(process.execPath, [ASTRO, 'build', '--root', join(PROJEKT, 'tests/livegang-sperre')], { cwd: PROJEKT, env: { ...env, ...zusatz }, encoding: 'utf8', timeout: 180000 });
    const lies = (datei) => readFile(join(ausgabe, datei), 'utf8').catch(() => '');
    return { code: r.status, log: `${r.stdout ?? ''}${r.stderr ?? ''}`.replace(/\x1b\[[0-9;]*m/g, ''), start: await lies('index.html'), pflicht: await lies('pflicht/index.html') };
  }
  const absatz = (html, id) => klartext(html.match(new RegExp(`<(p|div) id="${id}">([\\s\\S]*?)</\\1>`))?.[2] ?? '');

  const a = await baue('produktion-ohne-pflicht', {});
  pruefe('Sperre (Prüfprojekt): Produktion nur mit inhaltlichen Platzhaltern läuft durch', a.code === 0 && a.log.includes('Livegang frei'), `Exit ${a.code}`);
  const erwartet = {
    'inline-standard': 'Der Preis für den Abend ist auf Anfrage.',
    'inline-ersatz': 'Feiern können Sie bis nach Absprache.',
    'block-standard': 'Details dazu stimmen wir gern persönlich mit Ihnen ab — fragen Sie einfach an.',
    'block-anfrage': 'Details dazu stimmen wir gern persönlich mit Ihnen ab — fragen Sie einfach an.',
    'block-ersatz': 'Die Bestuhlung richten wir nach Ihrem Wunsch.',
    'block-leer': '',
  };
  const abweichung = Object.entries(erwartet)
    .filter(([id, satz]) => absatz(a.start, id) !== satz)
    .map(([id]) => `${id}: „${absatz(a.start, id)}“`);
  pruefe(
    'Platzhalter in Produktion: neutraler Text je Spielart (inline „auf Anfrage“, Block mit Anfrage-Link, eigener Ersatz, leer)',
    abweichung.length === 0 && a.start.includes('href="/anfrage/"') && a.start.includes('href="/anfrage/?anlass=private-feier"'),
    abweichung.join(' | '),
  );
  pruefe('Platzhalter in Produktion: kein „Angabe folgt“, kein „bitte von Uli ergänzen“, kein Kasten', a.start.length > 0 && !/Angabe folgt|bitte von Uli ergänzen|data-platzhalter=|data-livegang-sperre/.test(a.start));

  const b = await baue('produktion-mit-pflicht', { PRUEF_MIT_PFLICHT: '1' });
  const nennt = ['LIVEGANG GESPERRT', '3 rechtliche Angabe(n)', '/pflicht/', 'Prüf-Löschfrist für Anfragen festlegen', 'Prüf-Impressum: Firma & Sitz der Komplementärin „angeben“', 'Entwurf-Hinweis ist an', 'PUBLIC_VORSCHAU=1'];
  const fehlt = nennt.filter((t) => !b.log.includes(t));
  pruefe('Sperre (Prüfprojekt): Produktion mit rechtlichem Platzhalter + Entwurf-Hinweis scheitert und nennt Seite und Text', typeof b.code === 'number' && b.code !== 0 && fehlt.length === 0, `Exit ${b.code}${fehlt.length ? `; fehlt in der Meldung: ${fehlt.join(', ')}` : ''}`);

  const c = await baue('vorschau-mit-pflicht', { PRUEF_MIT_PFLICHT: '1', PUBLIC_VORSCHAU: '1' });
  const cz = {
    exit: c.code,
    inhalt: zaehle(c.start, 'data-platzhalter="inhalt"'),
    pflicht: zaehle(c.pflicht, 'data-platzhalter="pflicht"'),
    entwurf: c.pflicht.includes('data-entwurf-hinweis'),
    sperre: zaehle(c.start + c.pflicht, 'data-livegang-sperre'),
    ersatz: zaehle(c.start, 'data-platzhalter-ersatz'),
    uli: zaehle(c.start + c.pflicht, 'bitte von Uli ergänzen'),
  };
  pruefe(
    'Sperre (Prüfprojekt): Vorschau mit rechtlichem Rest läuft durch und zeigt alle Kästen',
    c.code === 0 && cz.inhalt === 6 && cz.pflicht === 2 && cz.entwurf && cz.sperre === 0 && cz.ersatz === 0 && cz.uli === 8 && c.log.includes('Vorschau-Build: 3 rechtliche Stelle(n)'),
    JSON.stringify(cz),
  );
}

await browser.close();
await haupt.schliesse();
await verbunden.schliesse();
bericht.ergebnis = { gesamt: bericht.pruefungen.length, fehlgeschlagen };
await writeFile(join(BILDER, 'pruefbericht.json'), JSON.stringify(bericht, null, 2) + '\n');
console.log(`\n${bericht.pruefungen.length - fehlgeschlagen}/${bericht.pruefungen.length} Prüfungen bestanden.`);
process.exit(fehlgeschlagen ? 1 : 0);
