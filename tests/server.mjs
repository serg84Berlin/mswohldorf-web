/**
 * Kleiner statischer Server für Tests: liefert dist/ aus wie Netlify —
 * mit den Headern aus netlify.toml und dist/_headers (inkl. CSP),
 * Verzeichnis-Index, Schrägstrich-Weiterleitung und 404.html.
 *
 *   node tests/server.mjs [ordner=dist] [port=4321]
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TYPEN = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

/** Liest die [[headers]]-Blöcke aus netlify.toml (nur das hier genutzte Format). */
function netlifyHeader(toml) {
  const bloecke = [];
  let aktuell = null;
  for (const zeile of toml.split('\n')) {
    const z = zeile.trim();
    if (z === '[[headers]]') {
      aktuell = { pfad: '', werte: {} };
      bloecke.push(aktuell);
    } else if (z.startsWith('[') && z !== '[headers.values]') aktuell = null;
    else if (aktuell && z.startsWith('for =')) aktuell.pfad = JSON.parse(z.slice(5).trim());
    else if (aktuell && /^[A-Za-z-]+ = "/.test(z)) {
      const i = z.indexOf(' = ');
      aktuell.werte[z.slice(0, i)] = JSON.parse(z.slice(i + 3));
    }
  }
  return bloecke;
}

function passt(muster, pfad) {
  if (muster.endsWith('*')) return pfad.startsWith(muster.slice(0, -1));
  return muster === pfad;
}

export async function starteServer({ ordner = 'dist', port = 4321 } = {}) {
  const wurzel = resolve(ordner);
  const projekt = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const bloecke = netlifyHeader(await readFile(join(projekt, 'netlify.toml'), 'utf8'));
  try {
    const h = await readFile(join(wurzel, '_headers'), 'utf8');
    let pfad = null;
    for (const zeile of h.split('\n')) {
      if (!zeile.trim()) continue;
      if (!zeile.startsWith(' ')) {
        pfad = zeile.trim();
        bloecke.push({ pfad, werte: {} });
      } else {
        const i = zeile.indexOf(':');
        bloecke.at(-1).werte[zeile.slice(0, i).trim()] = zeile.slice(i + 1).trim();
      }
    }
  } catch {
    /* kein _headers */
  }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let pfad = decodeURIComponent(url.pathname);
    for (const b of bloecke) if (passt(b.pfad, pfad)) for (const [k, v] of Object.entries(b.werte)) res.setHeader(k, v);
    res.removeHeader('Strict-Transport-Security');
    let datei = normalize(join(wurzel, pfad));
    if (!datei.startsWith(wurzel)) {
      res.writeHead(403).end();
      return;
    }
    try {
      let s = await stat(datei);
      if (s.isDirectory()) {
        if (!pfad.endsWith('/')) {
          res.writeHead(301, { Location: `${pfad}/${url.search}` }).end();
          return;
        }
        datei = join(datei, 'index.html');
        s = await stat(datei);
      }
      res.writeHead(200, { 'Content-Type': TYPEN[extname(datei)] ?? 'application/octet-stream', 'Content-Length': s.size });
      res.end(await readFile(datei));
    } catch {
      const nf = await readFile(join(wurzel, '404.html')).catch(() => Buffer.from('404'));
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(nf);
    }
  });
  await new Promise((ok) => server.listen(port, '127.0.0.1', ok));
  return { url: `http://127.0.0.1:${port}`, schliesse: () => new Promise((ok) => server.close(ok)) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const s = await starteServer({ ordner: process.argv[2] ?? 'dist', port: Number(process.argv[3] ?? 4321) });
  console.log(`Läuft: ${s.url}`);
}
