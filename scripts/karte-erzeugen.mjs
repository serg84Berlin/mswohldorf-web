// Erzeugt die statische Anfahrtskarte (einmalig, Ergebnis liegt im Repo).
// Kacheln: OpenStreetMap (© OpenStreetMap-Mitwirkende, ODbL) — die Quelle
// steht auf der Seite direkt unter der Karte. Beim Seitenaufruf wird NICHTS
// von OSM geladen; erst nach Klick auf „Karte laden" (Zwei-Klick-Lösung).
//
//   node scripts/karte-erzeugen.mjs [ziel.png]
import sharp from 'sharp';

const ZIEL = process.argv[2] ?? 'src/assets/karte/anfahrt.png';
const BREITE = 53.474464814706096;
const LAENGE = 10.013551864414687;
const Z = 15;
const B = 1200, H = 800;

const n = 2 ** Z;
const px = ((LAENGE + 180) / 360) * n * 256;
const rad = (BREITE * Math.PI) / 180;
const py = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n * 256;
const x0 = px - B / 2, y0 = py - H / 2;
const kx0 = Math.floor(x0 / 256), ky0 = Math.floor(y0 / 256);
const kx1 = Math.floor((x0 + B) / 256), ky1 = Math.floor((y0 + H) / 256);

const teile = [];
for (let kx = kx0; kx <= kx1; kx++) {
  for (let ky = ky0; ky <= ky1; ky++) {
    const url = `https://tile.openstreetmap.org/${Z}/${kx}/${ky}.png`;
    const antwort = await fetch(url, { headers: { 'User-Agent': 'mswohldorf-web Kartenbild (einmalig; info@finanzelot.de)' } });
    if (!antwort.ok) throw new Error(`${url}: ${antwort.status}`);
    teile.push({ input: Buffer.from(await antwort.arrayBuffer()), left: Math.round(kx * 256 - x0), top: Math.round(ky * 256 - y0) });
  }
}

// Kacheln auf eine größere Fläche legen (negative Offsets vermeiden), dann in
// einem zweiten Durchgang zuschneiden (sharp setzt composite immer zuletzt).
const rand = 256;
const flaeche = await sharp({ create: { width: B + 2 * rand, height: H + 2 * rand, channels: 3, background: '#dfe6ea' } })
  .composite(teile.map((t) => ({ ...t, left: t.left + rand, top: t.top + rand })))
  .png()
  .toBuffer();
const roh = await sharp(flaeche).extract({ left: rand, top: rand, width: B, height: H }).png().toBuffer();

// Farbton der Website: entsättigt, kühl getönt, leicht abgedunkelt.
const getoent = await sharp(roh).modulate({ saturation: 0.25, brightness: 0.97 }).tint({ r: 160, g: 190, b: 205 }).png().toBuffer();

const pin = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${B}" height="${H}">
  <circle cx="${B / 2}" cy="${H / 2}" r="46" fill="#c8963e" opacity="0.18"/>
  <circle cx="${B / 2}" cy="${H / 2}" r="26" fill="#c8963e" opacity="0.30"/>
  <g transform="translate(${B / 2} ${H / 2})">
    <path d="M0 0 C -6 -14 -20 -22 -20 -38 a 20 20 0 0 1 40 0 C 20 -22 6 -14 0 0 Z" fill="#0a1d30" stroke="#f3ead8" stroke-width="3"/>
    <circle cx="0" cy="-38" r="7" fill="#d4a95a"/>
  </g>
</svg>`);

await sharp(getoent).composite([{ input: pin }]).png({ compressionLevel: 9 }).toFile(ZIEL);
console.log(`${ZIEL}: ${teile.length} Kacheln, ${B}×${H}`);
