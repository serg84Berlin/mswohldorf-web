// Stellt die MS Wohldorf aus dem Standbild des eigenen Videos „MS Wohldorf 2024"
// (YouTube, Kanal Finanzelot, Vorschaubild 1280×720) frei — mit einer von Hand
// gezeichneten Maske (Polygone in Bildkoordinaten). Ergebnis: WebP mit Alpha
// für die 3D-Bühne im Hero.
//
//   node scripts/schiff-freistellen.mjs <quelle.jpg> <ziel.webp>
//
// Die Maske passt nur zu genau diesem Bild. Kommt ein besseres Foto, neue
// Polygone zeichnen (oder ein freigestelltes PNG direkt ablegen).
import sharp from 'sharp';

const [quelle, ziel] = process.argv.slice(2);
if (!quelle || !ziel) {
  console.error('Aufruf: node scripts/schiff-freistellen.mjs <quelle.jpg> <ziel.webp>');
  process.exit(1);
}

const MASKE = {
  rumpf: [[212.5,360],[217.5,328.8],[222.5,291.3],[233.1,260],[242.5,246.3],[261.3,236.3],[305,230],[386.3,227.5],[430,238.1],[464.4,258.8],[472.5,247.5],[480,242.5],[522.5,242.5],[522.5,141.3],[480,140],[480,133.8],[522.5,133.8],[522.5,88],[525.5,85.5],[528.5,88],[528.5,133.8],[567.5,133.8],[567.5,140],[528.5,140],[528.5,242.5],[553.8,242.5],[556.3,247.5],[557.5,271.3],[611.3,278.8],[633.1,288.1],[639.4,300.6],[667.5,325.6],[670.6,375.6],[658.1,380],[673.8,394.4],[705,406.9],[723.8,428.8],[733.1,460],[735,491.3],[764.4,497.5],[783.1,522.5],[795.6,560],[793.8,610],[791.3,641.3],[783.1,669.4],[773.8,691.3],[755,692.5],[711.3,677.5],[617.5,644.4],[523.8,603.8],[430,560],[367.5,528.8],[305,491.3],[261.3,450.6],[230,410],[214.4,381.9]],
  flaggeRot: [[490,153.8],[558.1,167.5],[559.4,186.9],[500.6,189.4]],
  flaggeWeiss: [[565.6,150.6],[592.5,166.3],[611.3,200.6],[605,206.9],[580,194.4],[564.4,192.5]],
};

const meta = await sharp(quelle).metadata();
const B = meta.width, H = meta.height;
const poly = (p) => `<polygon points="${p.map(([x, y]) => `${x},${y}`).join(' ')}" fill="#fff"/>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${B}" height="${H}"><rect width="100%" height="100%" fill="#000"/>${Object.values(MASKE).map(poly).join('')}</svg>`;

// Weiche Kante: Maske leicht weichzeichnen, dann als Alpha-Kanal nutzen.
const maske = await sharp(Buffer.from(svg)).blur(0.9).greyscale().raw().toBuffer();
const rgb = await sharp(quelle).removeAlpha().raw().toBuffer();
const rgba = Buffer.alloc(B * H * 4);
for (let i = 0; i < B * H; i++) {
  rgba[i * 4] = rgb[i * 3];
  rgba[i * 4 + 1] = rgb[i * 3 + 1];
  rgba[i * 4 + 2] = rgb[i * 3 + 2];
  rgba[i * 4 + 3] = maske[i];
}

// Auf den Umriss zuschneiden (mit etwas Rand).
const xs = Object.values(MASKE).flat().map((p) => p[0]);
const ys = Object.values(MASKE).flat().map((p) => p[1]);
const rand = 6;
const links = Math.max(0, Math.floor(Math.min(...xs)) - rand);
const oben = Math.max(0, Math.floor(Math.min(...ys)) - rand);
const breite = Math.min(B - links, Math.ceil(Math.max(...xs)) + rand - links);
const hoehe = Math.min(H - oben, Math.ceil(Math.max(...ys)) + rand - oben);

await sharp(rgba, { raw: { width: B, height: H, channels: 4 } })
  .extract({ left: links, top: oben, width: breite, height: hoehe })
  .webp({ quality: 88, alphaQuality: 100, effort: 6 })
  .toFile(ziel);
console.log(`${ziel}: ${breite}×${hoehe} (Ausschnitt ab ${links},${oben})`);
