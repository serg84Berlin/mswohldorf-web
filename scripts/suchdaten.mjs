// Liest Daten aus der Google Search Console — nur lesen, nichts wird geändert.
//
//   npm run suchdaten                 → Zugriff, Sitemaps, Leistung der letzten 28 Tage, Startseite im Index?
//   npm run suchdaten -- --tage 90    → anderer Zeitraum
//
// Zugang: ein Google-Dienstkonto, das in der Search Console als Nutzer mit der Berechtigung
// „Eingeschränkt“ eingetragen ist. Der Schlüssel steht NICHT im Repo und gehört nie in einen Chat:
// Umgebungsvariable GSC_DIENSTKONTO_B64 = base64 der JSON-Schlüsseldatei (eine Zeile, `base64 -w0 datei.json`),
// eingetragen in den Einstellungen der Cloud-Umgebung. Einrichtung: README, „Search Console“.
import { createSign } from 'node:crypto';

const PROPERTY = process.env.GSC_PROPERTY ?? 'sc-domain:mswohldorf.de';
const STARTSEITE = 'https://www.mswohldorf.de/';
const API = 'https://searchconsole.googleapis.com';
const BEREICH = 'https://www.googleapis.com/auth/webmasters.readonly';

const tageArg = process.argv.indexOf('--tage');
const TAGE = tageArg > -1 ? Math.max(1, Number(process.argv[tageArg + 1]) || 28) : 28;

function ende(text) {
  console.error(text);
  process.exit(1);
}

function ladeSchluessel() {
  const roh = (process.env.GSC_DIENSTKONTO_B64 ?? '').trim();
  if (!roh) {
    ende(
      'GSC_DIENSTKONTO_B64 ist nicht gesetzt.\n' +
        'Die Variable in den Einstellungen der Cloud-Umgebung eintragen (base64 der JSON-Schlüsseldatei des Dienstkontos)\n' +
        'und eine neue Sitzung starten. Anleitung: README, Abschnitt „Search Console“.',
    );
  }
  try {
    const k = JSON.parse(Buffer.from(roh, 'base64').toString('utf8'));
    if (!k.client_email || !k.private_key) throw new Error('client_email oder private_key fehlt');
    return k;
  } catch (e) {
    ende(`GSC_DIENSTKONTO_B64 ist kein gültiger Dienstkonto-Schlüssel (${e.message}). Erwartet: base64 der JSON-Datei, eine Zeile.`);
  }
}

const b64url = (x) => Buffer.from(x).toString('base64url');

/** Dienstkonto → kurzlebiges Zugriffstoken (JWT-Bearer-Verfahren, nur Lesebereich). */
async function holeToken(k) {
  const jetzt = Math.floor(Date.now() / 1000);
  const ziel = k.token_uri ?? 'https://oauth2.googleapis.com/token';
  const kopf = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const inhalt = b64url(JSON.stringify({ iss: k.client_email, scope: BEREICH, aud: ziel, iat: jetzt, exp: jetzt + 600 }));
  const signatur = createSign('RSA-SHA256').update(`${kopf}.${inhalt}`).sign(k.private_key).toString('base64url');
  let antwort;
  try {
    antwort = await fetch(ziel, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${kopf}.${inhalt}.${signatur}` }),
    });
  } catch (e) {
    ende(`Google ist nicht erreichbar (${e.cause?.code ?? e.message}). Hinter einem Proxy: NODE_USE_ENV_PROXY=1 setzen.`);
  }
  const daten = await antwort.json().catch(() => ({}));
  if (!antwort.ok || !daten.access_token) {
    ende(
      `Google hat den Schlüssel abgelehnt (${antwort.status}: ${daten.error ?? '?'} — ${daten.error_description ?? ''}).\n` +
        'Prüfen: Ist der Schlüssel in der Google Cloud noch aktiv? Ist die Variable vollständig (eine Zeile)?',
    );
  }
  return daten.access_token;
}

async function api(token, pfad, body) {
  const antwort = await fetch(`${API}${pfad}`, {
    method: body ? 'POST' : 'GET',
    headers: { authorization: `Bearer ${token}`, ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const daten = await antwort.json().catch(() => ({}));
  return { ok: antwort.ok, status: antwort.status, daten, fehler: daten.error?.message };
}

const datum = (d) => d.toISOString().slice(0, 10);
const prozent = (x) => `${(x * 100).toFixed(1).replace('.', ',')} %`;
const zahl = (x) => x.toFixed(1).replace('.', ',');

function tabelle(zeilen, kopf) {
  if (!zeilen.length) return '  (noch keine Daten)';
  const breit = Math.min(64, Math.max(kopf.length, ...zeilen.map((z) => z.schluessel.length)));
  const zeile = (a, k, i, c, p) => `  ${a.padEnd(breit)}  ${String(k).padStart(6)}  ${String(i).padStart(8)}  ${c.padStart(7)}  ${p.padStart(8)}`;
  return [
    zeile(kopf, 'Klicks', 'Impress.', 'CTR', 'Position'),
    ...zeilen.map((z) => zeile(z.schluessel.slice(0, breit), z.clicks, z.impressions, prozent(z.ctr), zahl(z.position))),
  ].join('\n');
}

const schluessel = ladeSchluessel();
const token = await holeToken(schluessel);
const prop = encodeURIComponent(PROPERTY);

console.log(`Search Console — ${PROPERTY}\nDienstkonto: ${schluessel.client_email}\n`);

// 1. Zugriff
const seiten = await api(token, '/webmasters/v3/sites');
const eintraege = seiten.daten.siteEntry ?? [];
const meine = eintraege.find((e) => e.siteUrl === PROPERTY);
if (!meine) {
  ende(
    `Kein Zugriff auf ${PROPERTY}.\n` +
      (eintraege.length ? `Sichtbar sind: ${eintraege.map((e) => e.siteUrl).join(', ')}\n` : 'Das Dienstkonto sieht keine Property.\n') +
      `In der Search Console: Einstellungen → Nutzer und Berechtigungen → Nutzer hinzufügen → ${schluessel.client_email} (Eingeschränkt).`,
  );
}
console.log(`Zugriff: ${meine.permissionLevel}\n`);

// 2. Sitemaps
const sitemaps = await api(token, `/webmasters/v3/sites/${prop}/sitemaps`);
console.log('Sitemaps');
if (!sitemaps.ok) console.log(`  nicht lesbar (${sitemaps.status}: ${sitemaps.fehler})`);
else if (!(sitemaps.daten.sitemap ?? []).length) console.log('  keine eingereicht');
for (const s of sitemaps.daten.sitemap ?? []) {
  const inhalt = (s.contents ?? []).map((c) => `${c.submitted} eingereicht`).join(', ');
  console.log(`  ${s.path}\n    zuletzt gelesen: ${s.lastDownloaded ?? '—'} · Fehler: ${s.errors ?? 0} · Warnungen: ${s.warnings ?? 0}${inhalt ? ` · ${inhalt}` : ''}${s.isPending ? ' · in Arbeit' : ''}`);
}

// 3. Leistung
const bis = new Date();
const von = new Date(bis.getTime() - TAGE * 86400000);
const abfrage = (dimensions, rowLimit = 25) => api(token, `/webmasters/v3/sites/${prop}/searchAnalytics/query`, { startDate: datum(von), endDate: datum(bis), dimensions, rowLimit });
const mitSchluessel = (r) => (r.daten.rows ?? []).map((z) => ({ ...z, schluessel: z.keys?.[0] ?? '' }));

const gesamt = await abfrage([], 1);
console.log(`\nLeistung ${datum(von)} bis ${datum(bis)} (${TAGE} Tage; Google liefert Daten mit 2–3 Tagen Verzug)`);
if (!gesamt.ok) console.log(`  nicht lesbar (${gesamt.status}: ${gesamt.fehler})`);
else {
  const g = gesamt.daten.rows?.[0];
  console.log(g ? `  Klicks ${g.clicks} · Impressionen ${g.impressions} · CTR ${prozent(g.ctr)} · mittlere Position ${zahl(g.position)}` : '  (noch keine Daten)');
  console.log('\nSuchanfragen');
  console.log(tabelle(mitSchluessel(await abfrage(['query'])), 'Suchanfrage'));
  console.log('\nSeiten');
  console.log(tabelle(mitSchluessel(await abfrage(['page'])).map((z) => ({ ...z, schluessel: z.schluessel.replace('https://www.mswohldorf.de', '') || '/' })), 'Seite'));
  console.log('\nLänder');
  console.log(tabelle(mitSchluessel(await abfrage(['country'], 8)), 'Land'));
}

// 4. Ist die Startseite im Index?
const pruefung = await api(token, '/v1/urlInspection/index:inspect', { inspectionUrl: STARTSEITE, siteUrl: PROPERTY, languageCode: 'de-DE' });
console.log(`\nIndex-Status ${STARTSEITE}`);
if (!pruefung.ok) console.log(`  nicht lesbar (${pruefung.status}: ${pruefung.fehler})`);
else {
  const i = pruefung.daten.inspectionResult?.indexStatusResult ?? {};
  console.log(`  ${i.verdict ?? '?'} — ${i.coverageState ?? '?'}\n  zuletzt gecrawlt: ${i.lastCrawlTime ?? '—'} · kanonisch laut Google: ${i.googleCanonical ?? '—'}`);
}
