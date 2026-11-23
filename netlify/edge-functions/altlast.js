/**
 * Altlast der alten Website: Spam-Adressen melden „410 Gone“.
 *
 * Die alte Seite (alter Webspace, bis 05.11.2026) war mit einem Spam-Shop verseucht. Google kennt davon
 * rund 177 000 Adressen (Search Console, 23.11.2026), vor allem
 *   /?shop/detail/S1398444424.html   (Suchteil direkt an der Startseite)
 *   /shop/pg/1270033
 * Die Suchteil-Variante lieferte bei uns die Startseite mit 200 — Google behandelte Zehntausende davon als
 * „Duplikat“ der Startseite und rechnete ihr damit auch deren Spam-Verweise zu. Jetzt antworten sie mit 410:
 * Google nimmt sie aus dem Index und holt sie seltener ab.
 *
 * Erkennung: Der erste Parametername enthält einen Schrägstrich („shop/detail/…“). Echte Parameter
 * (utm_source, fbclid, gclid, anlass …) haben das nie. Läuft nur auf „/“ und „/shop/*“.
 */

/** @param {URL} url */
export function istAltlast(url) {
  if (url.pathname === '/shop' || url.pathname.startsWith('/shop/')) return true;
  if (url.pathname !== '/' || url.search.length < 2) return false;
  const ersterName = decodeURIComponent(url.search.slice(1).split(/[=&]/)[0] ?? '').toLowerCase();
  return ersterName.includes('/') || ersterName.endsWith('.html') || ersterName.endsWith('.php');
}

const SEITE = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Diese Seite gibt es nicht mehr | MS Wohldorf</title>
<style>body{font:1rem/1.6 system-ui,sans-serif;margin:0;min-height:100vh;display:grid;place-items:center;background:#0a1d30;color:#faf7f0;text-align:center;padding:1.5rem}a{color:#e0b872}</style>
</head><body><main><h1>Diese Seite gibt es nicht mehr.</h1><p><a href="/">Zur Startseite der MS Wohldorf</a></p></main></body></html>`;

/** @param {Request} request */
export default function altlast(request) {
  if (!istAltlast(new URL(request.url))) return; // weiter zur normalen Seite
  return new Response(SEITE, {
    status: 410,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex',
      'cache-control': 'public, max-age=86400',
      'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'",
      'referrer-policy': 'no-referrer',
      'x-content-type-options': 'nosniff',
    },
  });
}

export const config = { path: ['/', '/shop', '/shop/*'] };
