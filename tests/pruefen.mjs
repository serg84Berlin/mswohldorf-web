/**
 * Prüfungen vor jedem Commit (Playwright + Chromium, ohne Testframework):
 *
 *   npm run build                                       → dist/
 *   PUBLIC_ANFRAGE_URL=https://anfrage.example.test/v1/anfrage \
 *     npx astro build --outDir dist-test                → dist-test/ (Formular verbunden)
 *   PUBLIC_VORSCHAU=1 npx astro build --outDir dist-vorschau
 *   npm run pruefen
 *
 * Prüft: Konsolenfehler, keine externen Anfragen beim Laden (Abfangen aller
 * Requests), Lightbox per Tastatur, reduzierte Bewegung, Formular (Vorschau,
 * Prüfung, 202/400/429/503/Netzfehler mit gemockter Antwort, JSON-Vertrag),
 * Barrierefreiheit (axe-core, WCAG 2.2 AA), Seitengewicht von „/".
 * Screenshots → screenshots/, Messwerte → screenshots/pruefbericht.json.
 */
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { starteServer } from './server.mjs';

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
  pruefe('Produktiv-Build ohne noindex', !html.includes('noindex'));
  const sitemap = await readFile(join(PROJEKT, 'dist/sitemap-0.xml'), 'utf8');
  pruefe('Sitemap enthält alle 11 Seiten, ohne 404', (sitemap.match(/<loc>/g) ?? []).length === 11 && !sitemap.includes('404'), String((sitemap.match(/<loc>/g) ?? []).length));
  const robots = await readFile(join(PROJEKT, 'dist/robots.txt'), 'utf8');
  pruefe('robots.txt verweist auf Sitemap', robots.includes('Sitemap: https://www.mswohldorf.de/sitemap-index.xml'));
  const vorschau = [];
  const sammle = async (o) => {
    for (const e of await readdir(o, { withFileTypes: true })) {
      if (e.isDirectory()) await sammle(join(o, e.name));
      else if (e.name.endsWith('.html')) vorschau.push(await readFile(join(o, e.name), 'utf8'));
    }
  };
  await sammle(join(PROJEKT, 'dist-vorschau'));
  pruefe('Vorschau-Build: jede Seite noindex,nofollow + Band', vorschau.length >= 12 && vorschau.every((h) => h.includes('<meta name="robots" content="noindex,nofollow">') && h.includes('vorschau-band')), `${vorschau.length} Seiten`);
  const kopf = await readFile(join(PROJEKT, 'dist-test/_headers'), 'utf8');
  pruefe('CSP (verbunden): connect-src enthält das Anfrage-Ziel', kopf.includes("connect-src 'self' https://anfrage.example.test"));
}

await browser.close();
await haupt.schliesse();
await verbunden.schliesse();
bericht.ergebnis = { gesamt: bericht.pruefungen.length, fehlgeschlagen };
await writeFile(join(BILDER, 'pruefbericht.json'), JSON.stringify(bericht, null, 2) + '\n');
console.log(`\n${bericht.pruefungen.length - fehlgeschlagen}/${bericht.pruefungen.length} Prüfungen bestanden.`);
process.exit(fehlgeschlagen ? 1 : 0);
